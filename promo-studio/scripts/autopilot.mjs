// Inbox autopilot: drop an app's files into a sub-folder of inbox and pre-production runs by itself.
//
//   npm run autopilot                      watch inbox (Ctrl+C to stop)
//   npm run autopilot -- --once            process every new/changed folder once, then exit
//   npm run autopilot -- "<folder>" [--force]   process one inbox folder now (--force also redoes a hand-edited brief)
//
// Per folder: create project → prep screenshots/logo/music → measure logo colors → AI brief →
// hook variants → voiceover script → vertical draft render → AI visual QA → autopilot-report.md.
// AI steps use your subscriptions in the order set in autopilot.config.json (Claude Code → Codex → GLM).
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { c, INBOX, RENDERS, run, STUDIO } from "./_platform.mjs";

// PROMO_AUTOPILOT_CONFIG points at an alternative settings file (e.g. a "brief only" profile).
const config = JSON.parse(fs.readFileSync(process.env.PROMO_AUTOPILOT_CONFIG || path.join(STUDIO, "autopilot.config.json"), "utf8"));
const { runJSON, PROVIDERS, isAvailable } = await import("./ai/providers.mjs");
const briefMod = await import("./ai/brief.mjs");
const hooksMod = await import("./ai/hooks.mjs");
const voMod = await import("./ai/voiceover.mjs");
const qaMod = await import("./ai/qa.mjs");
const { readBrief, writeBrief } = await import("./ai/core.mjs");

const IMAGE = /\.(png|jpe?g|webp|heic)$/i;
const AUDIO = /\.(mp3|wav|m4a|aac|flac|ogg)$/i;
const time = () => new Date().toLocaleTimeString();
const log = (msg) => console.log(`${c.dim(time())}  ${msg}`);
const sha = (s) => crypto.createHash("sha1").update(s).digest("hex").slice(0, 12);

// ── inbox scanning ───────────────────────────────────────────────────────
const inboxFolders = () =>
  fs.existsSync(INBOX)
    ? fs.readdirSync(INBOX, { withFileTypes: true }).filter((d) => d.isDirectory() && !/^[_.]/.test(d.name)).map((d) => d.name)
    : [];

/** Changes when any file is added, removed, resized or re-saved (one level of sub-folders deep). */
const fingerprint = (dir) => {
  const parts = [];
  const walk = (d, depth) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      if (e.name.startsWith(".")) continue;
      const p = path.join(d, e.name);
      if (e.isDirectory()) depth < 1 && walk(p, depth + 1);
      else {
        const st = fs.statSync(p);
        parts.push(`${path.relative(dir, p)}|${st.size}|${Math.floor(st.mtimeMs)}`);
      }
    }
  };
  walk(dir, 0);
  return parts.length ? sha(parts.sort().join("\n")) : null;
};

/** "Fit Tracker v2" → "fit-tracker-v2" (project names must be kebab-case). */
const slugFor = (folder) => folder.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || `project-${sha(folder).slice(0, 6)}`;

const stateFile = (slug) => path.join(STUDIO, "projects", slug, "autopilot.json");
const readState = (slug) => {
  try {
    return JSON.parse(fs.readFileSync(stateFile(slug), "utf8"));
  } catch {
    return {};
  }
};
const saveState = (slug, s) => fs.writeFileSync(stateFile(slug), JSON.stringify(s, null, 2) + "\n");

// ── project bootstrap ─────────────────────────────────────────────────────
const ensureProject = (slug, folder) => {
  const dir = path.join(STUDIO, "projects", slug);
  if (fs.existsSync(path.join(dir, "brief.json"))) return false;
  const brief = JSON.parse(fs.readFileSync(path.join(STUDIO, "projects", "_template", "brief.json"), "utf8"));
  brief.props.appName = folder.replace(/[-_]+/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "brief.json"), JSON.stringify(brief, null, 2) + "\n");
  for (const sub of ["screens", "audio"]) fs.mkdirSync(path.join(STUDIO, "public", "projects", slug, sub), { recursive: true });
  run("node", [path.join(STUDIO, "scripts", "sync-projects.mjs")], { quiet: true });
  return true;
};

const py = (...args) => run("node", [path.join(STUDIO, "scripts", "py.mjs"), ...args], { quiet: true });

/** True when a project's brief is still the untouched template (made with "New project", nothing written yet). */
const isPristine = (slug) => {
  try {
    // Only the name differs in a fresh "New project"; anything else (logo, copy, colors) means real work.
    const strip = (b) => JSON.stringify({ ...b, props: { ...b.props, appName: "" } });
    const tpl = JSON.parse(fs.readFileSync(path.join(STUDIO, "projects", "_template", "brief.json"), "utf8"));
    return strip(readBrief(slug)) === strip(tpl);
  } catch {
    return false;
  }
};

// ── the pipeline for one inbox folder ─────────────────────────────────────────
const processFolder = async (folder, { force = false } = {}) => {
  const inbox = path.join(INBOX, folder);
  const slug = slugFor(folder);
  const order = config.providers.filter((id) => PROVIDERS[id]);
  const models = config.models ?? {};
  const t0 = Date.now();
  const report = { folder, slug, startedAt: new Date().toISOString(), steps: [] };
  const step = (name, status, detail = "") => {
    report.steps.push({ name, status, detail });
    const mark = { done: c.green("✓"), skipped: c.dim("○"), failed: c.red("✗") }[status];
    log(`  ${mark} ${name}${detail ? c.dim(` — ${detail}`) : ""}`);
  };

  console.log("");
  log(c.bold(`▶ ${folder}`) + c.dim(`  →  project "${slug}"`));
  const existing = readState(slug);
  // Never take over a project that belongs to another inbox folder ("Fit Tracker" vs "fit-tracker")…
  if (existing.inboxFolder && existing.inboxFolder !== folder) {
    step("Project", "failed", `"${slug}" already belongs to inbox folder "${existing.inboxFolder}". Rename this folder.`);
    return report;
  }
  // …or a project someone built by hand (unless it's still an untouched "New project" or you forced it).
  const projectExists = fs.existsSync(path.join(STUDIO, "projects", slug, "brief.json"));
  if (projectExists && !existing.inboxFolder && !force && !isPristine(slug)) {
    step("Project", "failed", `project "${slug}" already exists and wasn't made by the autopilot. Rename this folder, or use launcher w → 3 to let the autopilot take it over.`);
    return report;
  }
  const created = ensureProject(slug, folder);
  step("Project", "done", created ? "created" : existing.inboxFolder ? "exists" : "taking over an empty project");
  const state = { ...existing, inboxFolder: folder };
  // Detect hand edits BEFORE asset prep — prep itself rewrites brief.json (logo/music paths).
  const briefPath = path.join(STUDIO, "projects", slug, "brief.json");
  const handEdited = Boolean(state.briefHash) && sha(fs.readFileSync(briefPath, "utf8")) !== state.briefHash;

  // 1. Assets
  const inputs = briefMod.prepareInputs(slug, { inboxDir: inbox, force: true });
  const audioFile = fs.readdirSync(inbox).find((f) => AUDIO.test(f));
  const music = !audioFile ? "no" : py("prep-audio", slug, path.join(inbox, audioFile), "--apply").ok ? "yes" : "failed (is FFmpeg installed? run launcher 9)";
  step("Assets", "done", `${inputs.screens.length} screenshot(s), logo: ${inputs.logoFile ? "yes" : "no"}, music: ${music}, notes: ${inputs.sources ? "yes" : "no"}`);
  // Asset prep's own brief changes are ours, not the user's.
  if (!handEdited && state.briefHash) state.briefHash = sha(fs.readFileSync(briefPath, "utf8"));

  // 2. Logo colors (no AI) — gives every provider, including text-only GLM, the real brand palette.
  let palette = [];
  if (inputs.logoFile) {
    const r = run("node", [path.join(STUDIO, "scripts", "py.mjs"), "palette", inputs.logoFile], { quiet: true });
    try {
      palette = JSON.parse(r.stdout.trim().split("\n").pop());
    } catch {
      /* palette is a hint only */
    }
  }
  if (palette.length) step("Logo colors", "done", palette.join(" "));

  // 3. Brief
  if (!config.steps.brief) step("Brief", "skipped", "disabled in config");
  else if (handEdited && !force) step("Brief", "skipped", "brief.json was edited by hand since the last run — use --force to replace it");
  else if (!inputs.screens.length && !inputs.sources && !inputs.logoFile) {
    step("Brief", "skipped", "nothing to work from yet (add screenshots, a logo or notes.txt)");
    return finish(slug, state, report, t0, folder);
  } else {
    try {
      const images = [inputs.logoFile && !/\.svg$/i.test(inputs.logoFile) ? inputs.logoFile : null, ...inputs.screens.map((s) => path.join(inputs.screensDir, s))].filter(Boolean);
      const { data, provider } = await runJSON({
        label: "Brief",
        system: briefMod.SYSTEM,
        schema: briefMod.aiBriefSchema,
        images,
        order,
        models,
        prompt: ({ vision }) => briefMod.briefTask({ ...inputs, slug, palette, canSeeImages: vision }),
      });
      const checked = briefMod.mergeAiBrief(slug, inputs.brief, data, inputs.screens);
      writeBrief(slug, { ...inputs.brief, props: checked });
      state.briefHash = sha(fs.readFileSync(briefPath, "utf8"));
      run("node", [path.join(STUDIO, "scripts", "sync-projects.mjs")], { quiet: true });
      report.notesForEditor = data.notesForEditor;
      report.brief = { appName: checked.appName, hook: checked.hook, features: checked.features.length };
      step("Brief", "done", `by ${PROVIDERS[provider].name}: "${checked.hook.headline}"`);
    } catch (err) {
      step("Brief", "failed", err.message);
      return finish(slug, state, report, t0, folder);
    }
  }
  const brief = readBrief(slug);

  // 4. Hook variants
  if (config.steps.hooks) {
    try {
      const { data, provider } = await runJSON({ label: "Hooks", system: hooksMod.HOOKS_SYSTEM, schema: hooksMod.hooksSchema, order, models, prompt: hooksMod.hooksTask(brief, inputs.sources, config.hookCount ?? 3) });
      hooksMod.writeHooks(slug, brief, data.variants);
      step("Hook variants", "done", `${data.variants.length} by ${PROVIDERS[provider].name} → hooks.md`);
    } catch (err) {
      step("Hook variants", "failed", err.message);
    }
  }

  // 5. Voiceover script
  if (config.steps.voiceover) {
    try {
      const { data, provider } = await runJSON({ label: "Voiceover", system: voMod.VO_SYSTEM, schema: voMod.voSchema, order, models, prompt: voMod.voTask(brief, inputs.sources) });
      const over = voMod.writeVoiceover(slug, brief, data);
      step("Voiceover", "done", `by ${PROVIDERS[provider].name} → voiceover.md${over ? ` (${over} line(s) run long)` : ""}`);
    } catch (err) {
      step("Voiceover", "failed", err.message);
    }
  }

  // 6. Draft render
  const formats = (config.draftFormats ?? ["9x16"]).filter((f) => brief.formats.includes(f));
  if (config.steps.draft && formats.length) {
    log(c.dim(`    Rendering ${formats.join(", ")} draft…`));
    const r = run("node", ["--disable-warning=MODULE_TYPELESS_PACKAGE_JSON", path.join(STUDIO, "scripts", "render.mjs"), slug, "--draft", "--formats", formats.join(",")], { quiet: true });
    if (r.ok) {
      report.draft = path.relative(STUDIO, path.join(RENDERS, slug, "_drafts")).split(path.sep).join("/");
      step("Draft render", "done", `${formats.join(", ")} → ${report.draft}`);
    } else step("Draft render", "failed", (r.stderr || r.stdout).trim().split("\n").pop());
  }

  // 7. Visual QA (needs a provider that can see images)
  if (config.steps.qa && formats.length) {
    try {
      const { outDir, frames } = await qaMod.renderQaFrames(slug, brief, formats);
      const { data, provider } = await runJSON({
        label: "Visual QA",
        system: qaMod.QA_SYSTEM,
        schema: qaMod.qaSchema,
        images: frames.map((f) => f.file),
        needsVision: true,
        order,
        models,
        prompt: `Frames, in order:\n${frames.map((f, i) => `${i + 1}. ${f.label} — ${path.basename(f.file)}`).join("\n")}\n\n${qaMod.qaReferenceText(brief)}`,
      });
      const qa = qaMod.writeQa(brief, data, outDir);
      report.qa = { score: qa.score, verdict: qa.verdict, high: qa.issues.filter((i) => i.severity === "high").map((i) => i.problem), report: path.relative(STUDIO, path.join(outDir, "report.md")).split(path.sep).join("/") };
      step("Visual QA", "done", `${qa.score}/10, ${qa.verdict} — by ${PROVIDERS[provider].name}`);
    } catch (err) {
      step("Visual QA", "failed", err.message);
    }
  }

  return finish(slug, state, report, t0, folder);
};

const finish = (slug, state, report, t0, folder) => {
  report.seconds = Math.round((Date.now() - t0) / 1000);
  const md = [
    `# Autopilot report — ${report.brief?.appName ?? slug}`,
    "",
    `Inbox folder \`inbox/${folder}\` → project \`${slug}\` · ${new Date().toLocaleString()} · ${report.seconds}s`,
    "",
    "| Step | Result | Detail |",
    "|---|---|---|",
    ...report.steps.map((s) => `| ${s.name} | ${s.status} | ${String(s.detail).replace(/\|/g, "/").replace(/\n/g, " ")} |`),
    "",
    report.notesForEditor ? `## Check before rendering\n\n${report.notesForEditor}\n` : "",
    report.qa?.high?.length ? `## Must fix (Visual QA)\n\n${report.qa.high.map((h) => `- ${h}`).join("\n")}\n\nFull report: \`${report.qa.report}\`\n` : "",
    "## Next",
    "",
    "1. Review `brief.json`, `hooks.md` and `voiceover.md` in this folder.",
    `2. Watch the draft in \`${report.draft ?? `out/renders/${slug}/_drafts`}\` or open Studio (launcher 1).`,
    `3. When it's right: final render (launcher 4) and deliver (launcher 5).`,
  ].filter((l) => l !== "");
  fs.writeFileSync(path.join(STUDIO, "projects", slug, "autopilot-report.md"), md.join("\n") + "\n");
  state.inboxFolder = folder;
  state.lastRun = new Date().toISOString();
  state.lastResult = report.steps.map((s) => `${s.name}:${s.status}`);
  saveState(slug, state);
  const failed = report.steps.filter((s) => s.status === "failed").length;
  log((failed ? c.yellow(`■ ${slug} finished with ${failed} failed step(s)`) : c.green(`■ ${slug} ready for review`)) + c.dim(` in ${report.seconds}s → projects/${slug}/autopilot-report.md`));
  return report;
};

// ── entry ────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const force = args.includes("--force");
const once = args.includes("--once");
const named = args.filter((a) => !a.startsWith("--"));

const header = () => {
  const chain = config.providers.map((id) => `${PROVIDERS[id]?.name ?? id}${isAvailable(id) ? "" : c.yellow(" (not installed)")}`).join(c.dim(" → "));
  console.log(c.bold("\n  Promo Studio · Inbox autopilot"));
  console.log(c.dim(`  AI order: `) + chain);
  console.log(c.dim(`  Steps: ${Object.entries(config.steps).filter(([, v]) => v).map(([k]) => k).join(", ")} · settings in promo-studio/autopilot.config.json`));
};

// Inbox fingerprints are kept per inbox folder (not per project), so a refused or failed folder
// never touches another project's state, and nothing reruns until its files change.
const INBOX_STATE = path.join(STUDIO, ".autopilot", "inbox.json");
const inboxState = () => {
  try {
    return JSON.parse(fs.readFileSync(INBOX_STATE, "utf8"));
  } catch {
    return {};
  }
};
function due(folder) {
  const fp = fingerprint(path.join(INBOX, folder));
  return fp && fp !== inboxState()[folder] ? fp : null;
}
function markDone(folder, fp) {
  fs.mkdirSync(path.dirname(INBOX_STATE), { recursive: true });
  fs.writeFileSync(INBOX_STATE, JSON.stringify({ ...inboxState(), [folder]: fp }, null, 2));
}
/** Process one folder; a crash is reported and the folder is still marked done, so it can't loop. */
const safeProcess = async (folder, opts) => {
  try {
    await processFolder(folder, opts);
  } catch (err) {
    log(c.red(`✗ ${folder}: ${err.message}`) + c.dim(" — fix the files, then save/drop again to retry"));
  }
  markDone(folder, fingerprint(path.join(INBOX, folder)));
};

if (named.length) {
  header();
  for (const folder of named) {
    if (!fs.existsSync(path.join(INBOX, folder))) {
      console.log(c.red(`  ✗ No folder inbox/${folder}`));
      continue;
    }
    await safeProcess(folder, { force });
  }
  process.exit(0);
}

header();
if (once) {
  const todo = inboxFolders().filter((f) => due(f));
  if (!todo.length) log("Nothing new in inbox.");
  for (const folder of todo) await safeProcess(folder, { force });
  process.exit(0);
}

// Watch mode: a folder runs once its contents stop changing for settleSeconds (so copies finish first).
console.log(c.dim(`  Watching ${INBOX}  — drop a folder per app. Ctrl+C to stop.
`));
const settleMs = (Number(config.settleSeconds) || 15) * 1000;
const pending = new Map(); // folder → { fp, since }
let busy = false;
const tick = async () => {
  if (busy) return;
  busy = true;
  try {
    for (const folder of inboxFolders()) {
      const fp = due(folder);
      if (!fp) {
        pending.delete(folder);
        continue;
      }
      const seen = pending.get(folder);
      if (!seen || seen.fp !== fp) {
        if (!seen) log(c.cyan(`● ${folder}`) + c.dim(` — new files, waiting ${settleMs / 1000}s for copying to finish…`));
        pending.set(folder, { fp, since: Date.now() });
        continue;
      }
      if (Date.now() - seen.since < settleMs) continue;
      pending.delete(folder);
      await safeProcess(folder, {});
    }
  } catch (err) {
    log(c.red(`✗ ${err.message}`));
  } finally {
    busy = false;
  }
};
await tick();
setInterval(tick, (Number(config.pollSeconds) || 5) * 1000);
