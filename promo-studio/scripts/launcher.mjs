// Promo Studio launcher — interactive menu, same on Windows, macOS and Linux.
//
//   node promo-studio/scripts/launcher.mjs                 interactive menu
//   node promo-studio/scripts/launcher.mjs studio          open Studio in the app window
//   node promo-studio/scripts/launcher.mjs render <slug>   (also: browser, draft, deliver, new, plugins, shortcut, doctor, setup)
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline/promises";
import { ARCHIVE, c, DELIVERY, INBOX, installId, listProjects, MARKER, openPath, PLATFORM_ID, RENDERS, resolveCommand, run, STUDIO } from "./_platform.mjs";
import { openStudio } from "./app-window.mjs";
import { chat } from "./ai/chat.mjs";
import { actionHeader, goodbye, renderHome, ui } from "./brand.mjs";
import * as plugins from "./plugins.mjs";
import { createShortcut } from "./shortcut.mjs";
import * as updates from "./upgrade.mjs";

// Mirrors FORMATS in src/lib/layout.ts (shown as a hint only).
const FORMAT_KEYS = ["16x9", "9x16", "1x1", "4x5"];

const DIR = {
  inbox: INBOX,
  renders: RENDERS,
  delivery: DELIVERY,
  archive: ARCHIVE,
  briefs: path.join(STUDIO, "projects"),
};

// Child processes (Studio, renders) get Ctrl+C; the launcher ignores it and returns to the menu.
process.on("SIGINT", () => {});

const ask = async (q) => {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.on("SIGINT", () => {
    rl.close();
    goodbye(); // restore the terminal's own colours before leaving
    process.exit(0);
  });
  const a = await rl.question(q);
  rl.close();
  return a.trim();
};

const pause = () => ask(c.dim("\n  Press Enter to return to the menu…"));
const npm = (...args) => run("npm", ["run", "-s", ...args]);

/** Strip quotes/escapes that terminals add when a file is dragged in. */
const cleanPath = (p) => p.replace(/^['"]|['"]$/g, "").replace(/\\ /g, " ").replace(/^& /, "");

const pickProject = async ({ allowAll = false } = {}) => {
  const projects = listProjects();
  if (!projects.length) {
    console.log(c.yellow("  No projects yet — create one first."));
    return null;
  }
  projects.forEach((p, i) => console.log(`    ${c.bold(String(i + 1).padStart(2))}. ${p}`));
  if (allowAll) console.log(`    ${c.bold(" a")}. all projects`);
  const a = await ask("  Project: ");
  if (allowAll && a.toLowerCase() === "a") return "--all";
  return projects[Number(a) - 1] ?? (projects.includes(a) ? a : null);
};

const pickFormats = async () => {
  const a = await ask(`  Formats ${c.dim(`(Enter = all from brief, or e.g. ${FORMAT_KEYS.slice(1, 3).join(",")})`)}: `);
  return a ? ["--formats", a.replace(/\s/g, "")] : [];
};

const pickVersion = (slug) => {
  const dir = path.join(DIR.renders, slug);
  return fs.existsSync(dir) ? fs.readdirSync(dir).filter((n) => /^v\d{3}$/.test(n)).sort() : [];
};

// ── actions ────────────────────────────────────────────────────────────────
const actions = {
  async studio() {
    await openStudio({ mode: "app" });
  },
  async browser() {
    await openStudio({ mode: "browser" });
  },
  async plugins(cmd, ...rest) {
    const split = (s) => s.split(/[\s,]+/).filter(Boolean);
    if (cmd) return cmd === "list" ? plugins.list() : cmd === "ensure" ? plugins.ensure() : plugins[cmd]?.(rest);
    plugins.list();
    console.log(`\n    a. Verify / repair all catalog plugins`);
    console.log(`    b. Install group(s)   ${c.dim(plugins.groups.map((g) => g.id).join(", "))}`);
    console.log(`    c. Install packages by name`);
    console.log(`    d. Remove packages`);
    const k = (await ask("  Choose (Enter = back): ")).toLowerCase();
    if (k === "a") plugins.ensure();
    if (k === "b") plugins.install(split(await ask("  Group id(s): ")));
    if (k === "c") plugins.install(split(await ask("  Package name(s): ")));
    if (k === "d") plugins.remove(split(await ask("  Package name(s): ")));
  },
  async shortcut() {
    createShortcut();
  },
  async autopilot(...rest) {
    const ap = (...args) => run("node", ["--disable-warning=MODULE_TYPELESS_PACKAGE_JSON", path.join(STUDIO, "scripts", "autopilot.mjs"), ...args]);
    if (rest.length) return ap(...rest);
    console.log(`
    Drop each app's files into its own folder in ${c.bold("inbox")} — screenshots (named in feature order),
    a file with "logo" in its name, optional music and a notes.txt. The autopilot then preps the assets,
    writes the brief, hooks and voiceover, renders a vertical draft and runs a visual check.

    1. Watch the inbox  ${c.dim("(keeps running — Ctrl+C to stop)")}
    2. Process new folders once, then come back
    3. Re-run one folder ${c.dim("(also replaces a hand-edited brief)")}
    4. Edit settings     ${c.dim("(AI order, steps, draft formats)")}`);
    const k = await ask("\n  Choose (Enter = back): ");
    if (k === "1") {
      openPath(DIR.inbox);
      ap();
    }
    if (k === "2") ap("--once");
    if (k === "3") {
      const folders = fs.readdirSync(DIR.inbox, { withFileTypes: true }).filter((d) => d.isDirectory() && !/^[_.]/.test(d.name)).map((d) => d.name);
      folders.forEach((f, i) => console.log(`    ${c.bold(String(i + 1).padStart(2))}. ${f}`));
      const pick = folders[Number(await ask("  Folder: ")) - 1];
      if (pick) ap(pick, "--force");
    }
    if (k === "4") openPath(path.join(STUDIO, "autopilot.config.json"));
  },
  async ai(cmd, ...rest) {
    const ai = (...args) => run("node", ["--disable-warning=MODULE_TYPELESS_PACKAGE_JSON", path.join(STUDIO, "scripts", "ai", "cli.mjs"), ...args]);
    if (cmd) return ai(cmd, ...rest);
    ai("status");
    console.log(`
    ${c.bold("Claude API")} ${c.dim("(needs an API key · ~$0.05–0.30 per run)")}
    1. Auto-brief        screenshots + logo + notes in inbox → brief.json
    2. Hook variants     5 opening lines for A/B tests (optionally as projects)
    3. Voiceover script  narration timed to each scene
    4. Visual QA         renders every scene/format and reviews it
    k. Set API key

    ${c.bold("Agents")} ${c.dim("(use your Claude / ChatGPT subscription · no API key)")}
    5. Ask Claude Code   describe a change, it edits the project
    6. Ask Codex         same, with OpenAI Codex (ChatGPT)
    7. Open Claude Code here (interactive)`);
    const k = (await ask("\n  Choose (Enter = back): ")).toLowerCase();
    if (["1", "2", "3", "4"].includes(k)) {
      const slug = await pickProject();
      if (!slug) return;
      if (k === "1") {
        const url = await ask(`  App website or store URL ${c.dim("(optional)")}: `);
        const notes = await ask(`  Extra notes for the copywriter ${c.dim("(optional)")}: `);
        ai("brief", slug, ...(url ? ["--url", url] : []), ...(notes ? ["--notes", notes] : []));
      }
      if (k === "2") {
        const make = (await ask("  Also create a renderable project per variant? (y/N): ")).toLowerCase() === "y";
        ai("hooks", slug, ...(make ? ["--create"] : []));
      }
      if (k === "3") {
        const tone = await ask(`  Tone ${c.dim("(Enter = warm, confident)")}: `);
        ai("voiceover", slug, ...(tone ? ["--tone", tone] : []));
      }
      if (k === "4") {
        const fmts = await ask(`  Formats ${c.dim("(Enter = all)")}: `);
        if (ai("qa", slug, ...(fmts ? ["--formats", fmts.replace(/\s/g, "")] : [])).ok) openPath(path.join(DIR.renders, slug, "_qa"));
      }
    }
    if (k === "k") {
      const { saveApiKey } = await import("./ai/agents.mjs");
      console.log(c.dim("  Get a key at https://console.anthropic.com/settings/keys"));
      saveApiKey(await ask("  Paste your API key: "));
    }
    if (k === "5" || k === "6") {
      const req = await ask(`  What should ${k === "5" ? "Claude" : "Codex"} do? `);
      if (req) ai("ask", req, ...(k === "6" ? ["--codex"] : []));
    }
    if (k === "7") chat();
  },
  async chat(slug) {
    if (!slug) {
      const projects = listProjects().filter((p) => !p.startsWith("_"));
      console.log(`  Claude opens right here in this window, knows this studio, and asks before risky changes.
  Ask it to write a brief, pick brand colours from your logo, choose formats, tighten copy…\n`);
      projects.forEach((p, i) => console.log(`    ${c.bold(String(i + 1).padStart(2))}. ${p}`));
      console.log(`    ${c.bold(" n")}. a new app`);
      const a = await ask(`  Work on ${c.dim("(number, n, or Enter = just chat)")}: `);
      if (a.toLowerCase() === "n") slug = (await ask("  App name: ")) || undefined;
      else slug = projects[Number(a) - 1] ?? (projects.includes(a) ? a : undefined);
    }
    chat(slug);
  },
  async new(slug, ...nameParts) {
    slug ??= (await ask("  Project slug (kebab-case, e.g. fit-tracker): ")).toLowerCase();
    const name = nameParts.join(" ") || (await ask("  App name (e.g. Fit Tracker): "));
    if (!npm("new", "--", slug, ...(name ? [name] : [])).ok) return;
    console.log(`    1. Fill it now with Claude  ${c.dim("(chat — describe the app, paste a link, ask for colours…)")}
    2. I'll drop files in the inbox  ${c.dim("(opens the folder; then press w for the autopilot)")}`);
    const k = await ask("  Choose (Enter = later): ");
    if (k === "1") chat(slug);
    if (k === "2") openPath(path.join(DIR.inbox, slug));
  },
  async draft(slug, ...rest) {
    slug ??= await pickProject();
    if (!slug) return;
    const fmts = rest.length ? rest : await pickFormats();
    if (npm("draft", "--", slug, ...fmts).ok) openPath(path.join(DIR.renders, slug, "_drafts"));
  },
  async render(slug, ...rest) {
    slug ??= await pickProject({ allowAll: true });
    if (!slug) return;
    const fmts = rest.length ? rest : await pickFormats();
    if (npm("render", "--", slug, ...fmts).ok) openPath(slug === "--all" ? DIR.renders : path.join(DIR.renders, slug));
  },
  async deliver(slug, ...rest) {
    slug ??= await pickProject();
    if (!slug) return;
    let args = rest;
    if (!rest.length) {
      const versions = pickVersion(slug);
      if (!versions.length) return console.log(c.yellow(`  No renders for ${slug} yet — render first.`));
      const v = await ask(`  Version ${c.dim(`(${versions.join(", ")}; Enter = ${versions.at(-1)})`)}: `);
      args = v ? ["--version", v] : [];
    }
    if (npm("deliver", "--", slug, ...args).ok) openPath(path.join(DIR.delivery, slug));
  },
  async prep() {
    const slug = await pickProject();
    if (!slug) return;
    console.log(`    a. Screenshots from inbox/${slug}/ (assigned to features in name order)\n    b. Logo file\n    c. Music file`);
    const k = (await ask("  Choose: ")).toLowerCase();
    if (k === "a") return npm("tools", "--", "prep-screens", slug, "--apply");
    const kind = { b: "prep-logo", c: "prep-audio" }[k];
    if (!kind) return;
    const file = cleanPath(await ask("  Drag the file into this window, then press Enter: "));
    npm("tools", "--", kind, slug, file, "--apply");
  },
  async archive(slug) {
    slug ??= await pickProject();
    if (slug) npm("tools", "--", "archive", slug);
  },
  async open() {
    const keys = Object.keys(DIR);
    keys.forEach((k, i) => console.log(`    ${i + 1}. ${path.relative(STUDIO, DIR[k])}`));
    const k = keys[Number(await ask("  Folder: ")) - 1];
    if (k) openPath(DIR[k]);
  },
  async doctor() {
    npm("tools", "--", "doctor");
  },
  async skills() {
    console.log("  Updating Remotion agent skills from github.com/remotion-dev/skills …");
    updates.updateSkills();
  },
  async updates(cmd) {
    if (cmd === "upgrade") return updates.upgrade({ ask });
    if (cmd === "verify") return updates.verify();
    console.log(c.dim("  Checking the npm registry…"));
    let u;
    try {
      u = await updates.checkUpdates({ fresh: true });
    } catch (err) {
      console.log(c.yellow(`  ! ${err.message}`));
      u = updates.cachedUpdate();
    }
    console.log(`\n  Remotion installed   ${c.bold(u.current)}`);
    console.log(`  Latest available     ${c.bold(u.latest ?? "unknown")}  ${u.available ? c.yellow("● update available") : c.green("✓ up to date")}`);
    if (u.available) console.log(c.dim(`  What changed: https://github.com/remotion-dev/remotion/releases/tag/v${u.latest}`));
    console.log(`
    1. ${u.available ? `Upgrade to ${u.latest} safely` : "Reinstall / upgrade (nothing newer)"}  ${c.dim("(backup → upgrade → checks → auto-rollback)")}
    2. Run health checks only   ${c.dim("(is everything still working?)")}
    3. Update Remotion agent skills from GitHub`);
    const k = await ask("\n  Choose (Enter = back): ");
    if (k === "1") await updates.upgrade({ ask });
    if (k === "2") await updates.verify();
    if (k === "3") updates.updateSkills();
  },
  async setup() {
    run("node", [path.join(STUDIO, "scripts", "setup.mjs")]);
  },
};

// Grouped by what you're doing. [key, action, label]
const GROUPS = [
  {
    title: "Create",
    items: [
      ["1", "studio", "Open Studio"],
      ["b", "browser", "Studio in browser"],
      ["2", "new", "New project"],
      ["6", "prep", "Prep assets"],
      ["8", "open", "Open a folder"],
    ],
  },
  {
    title: "Produce",
    items: [
      ["w", "autopilot", "Autopilot (inbox)"],
      ["3", "draft", "Draft render"],
      ["4", "render", "Final render"],
      ["5", "deliver", "Deliver"],
      ["7", "archive", "Archive project"],
    ],
  },
  {
    title: "AI & System",
    items: [
      ["c", "chat", "Chat with Claude"],
      ["a", "ai", "AI assistant"],
      ["p", "plugins", "Plugins"],
      ["9", "doctor", "Doctor"],
      ["d", "shortcut", "Desktop shortcut"],
      ["u", "updates", "Updates"],
      ["s", "setup", "Re-run setup"],
    ],
  },
];
const MENU = [...GROUPS.flatMap((g) => g.items), ["0", null, "Exit"]];

// Update status comes from a cache refreshed in the background, so the menu never waits on the network.
const updateLine = () => {
  const u = updates.cachedUpdate();
  if (u.available) return `${ui.bold(`Remotion ${u.latest} available`)}  ${ui.muted(`(you have ${u.current}) — press u`)}`;
  return ui.muted(`Remotion ${u.current}${u.latest ? " · up to date" : ""}`);
};
updates.checkUpdates().catch(() => {});

const VERSION = JSON.parse(fs.readFileSync(path.join(STUDIO, "package.json"), "utf8")).version;

const homeStatus = () => {
  const projects = listProjects().filter((p) => !/-hook-\d+$/.test(p));
  const inbox = fs.existsSync(DIR.inbox) ? fs.readdirSync(DIR.inbox, { withFileTypes: true }).filter((d) => d.isDirectory() && !/^[_.]/.test(d.name)).length : 0;
  // PATH lookup only (instant) — no need to start each CLI just to draw the menu.
  const ai = [["claude", "Claude"], ["codex", "ChatGPT"], ["opencode", "GLM"]]
    .map(([id, name]) => (resolveCommand(id) ? `${ui.bold("●")} ${name}` : ui.muted(`○ ${name}`)))
    .join("   ");
  const shown = projects.slice(0, 5).join(", ") + (projects.length > 5 ? ui.muted(` +${projects.length - 5} more`) : "");
  return [
    ["Projects", projects.length ? `${ui.bold(String(projects.length))}  ${ui.muted(shown)}` : ui.muted("none yet — press 2, or drop a folder in inbox and press w")],
    ["Inbox", inbox ? `${ui.bold(String(inbox))} ${ui.muted(inbox === 1 ? "folder in inbox" : "folders in inbox")}` : ui.muted("empty")],
    ["AI", ai],
    ["Updates", updateLine()],
  ];
};

const banner = () => renderHome({ groups: GROUPS, status: homeStatus(), meta: { version: VERSION, platform: PLATFORM_ID } });

// First run (or folder copied from another OS) → run setup before anything else.
const installedFor = fs.existsSync(MARKER) ? fs.readFileSync(MARKER, "utf8").trim() : null;
if (installedFor !== installId()) {
  console.log(c.yellow(`\n  First run or package change on ${PLATFORM_ID} — running setup…`));
  if (!run("node", [path.join(STUDIO, "scripts", "setup.mjs")]).ok) process.exit(1);
}

const [cmd, ...rest] = process.argv.slice(2);
if (cmd) {
  const fn = actions[cmd];
  if (!fn) {
    console.log(`Unknown command "${cmd}". Available: ${Object.keys(actions).join(", ")}`);
    process.exit(1);
  }
  await fn(...rest);
  process.exit(0);
}

for (;;) {
  banner();
  const choice = (await ask(ui.prompt())).toLowerCase();
  const entry = MENU.find(([k, name]) => k === choice || name === choice);
  if (!entry) continue;
  if (!entry[1]) break;
  actionHeader(entry[2]); // switches back to the terminal's colours so tool output stays readable
  await actions[entry[1]]();
  await pause();
}
goodbye();
