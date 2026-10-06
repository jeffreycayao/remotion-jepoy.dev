// Update checks and safe Remotion upgrades (launcher → u).
//
//   npm run updates                    installed vs latest Remotion (cached 12 h)
//   npm run updates -- check --fresh   ask the npm registry now
//   npm run updates -- verify          run the health checks only
//   npm run updates -- upgrade [--to 4.0.540] [--yes]
//   npm run updates -- skills          refresh the Remotion agent skills from GitHub
//
// Upgrade = back up package.json + lock → `remotion upgrade` (all @remotion/* together, --skip-skills)
// → health checks → automatic rollback (restore + npm ci) if any check fails.
import { bundle } from "@remotion/bundler";
import { getCompositions, renderStill } from "@remotion/renderer";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { c, IS_WIN, listProjects, MARKER, PLATFORM_ID, ROOT, run, STUDIO } from "./_platform.mjs";

const CACHE_DIR = path.join(STUDIO, ".cache");
const CACHE = path.join(CACHE_DIR, "updates.json");
const TTL_MS = 12 * 60 * 60 * 1000;

const readJson = (p, fallback) => {
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return fallback;
  }
};
const newer = (a, b) => {
  // true when version a > b (x.y.z)
  const pa = String(a).split(".").map(Number);
  const pb = String(b).split(".").map(Number);
  for (let i = 0; i < 3; i++) if ((pa[i] ?? 0) !== (pb[i] ?? 0)) return (pa[i] ?? 0) > (pb[i] ?? 0);
  return false;
};

export const installedVersion = () => readJson(path.join(STUDIO, "node_modules", "remotion", "package.json"), {}).version ?? "?";

/** Latest published Remotion version, straight from the npm registry (small /latest document). */
const fetchLatest = async () => {
  const registry = (process.env.npm_config_registry || "https://registry.npmjs.org/").replace(/\/?$/, "/");
  const res = await fetch(`${registry}remotion/latest`, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`registry answered ${res.status}`);
  return (await res.json()).version;
};

/** Cached view for the home screen — never touches the network. */
export const cachedUpdate = () => {
  const cache = readJson(CACHE, null);
  const current = installedVersion();
  return cache ? { current, latest: cache.latest, checkedAt: cache.checkedAt, available: newer(cache.latest, current) } : { current, latest: null, available: false };
};

/** Refresh the cache when it's older than 12 h (or always with fresh). Safe to call without awaiting. */
export const checkUpdates = async ({ fresh = false } = {}) => {
  const cache = readJson(CACHE, null);
  if (!fresh && cache && Date.now() - Date.parse(cache.checkedAt) < TTL_MS) return cachedUpdate();
  try {
    const latest = await fetchLatest();
    fs.mkdirSync(CACHE_DIR, { recursive: true });
    fs.writeFileSync(CACHE, JSON.stringify({ latest, checkedAt: new Date().toISOString() }, null, 2));
  } catch (err) {
    if (fresh) throw new Error(`Couldn't reach the npm registry (${err.message}). Check your internet connection.`);
  }
  return cachedUpdate();
};

// ── health checks ─────────────────────────────────────────────────────────
const remotionDeps = () => {
  const pkg = readJson(path.join(STUDIO, "package.json"), {});
  const all = { ...pkg.dependencies, ...pkg.devDependencies };
  return Object.keys(all).filter((k) => k === "remotion" || k.startsWith("@remotion/"));
};

/** Is a Studio for this project running? (npm can't replace files it has open on Windows.) */
const studioRunning = () => {
  const needle = path.join(STUDIO, "node_modules", "@remotion", "cli");
  if (IS_WIN) {
    const ps = `@(Get-CimInstance Win32_Process -Filter "Name='node.exe'" | Where-Object { $_.CommandLine -like '*${needle.replace(/'/g, "''")}*' -and $_.CommandLine -like '* studio*' }).Count`;
    return Number(spawnSync("powershell", ["-NoProfile", "-Command", ps], { encoding: "utf8" }).stdout.trim()) > 0;
  }
  return spawnSync("ps", ["-axww", "-o", "command="], { encoding: "utf8" }).stdout.split("\n").some((l) => l.includes(needle) && / studio\b/.test(l));
};

/** Every check is what an upgrade could plausibly break in this project. */
export const verify = async ({ log = console.log } = {}) => {
  const results = [];
  const check = async (name, fn) => {
    process.stdout.write(c.dim(`    ${name}… `));
    try {
      const detail = (await fn()) ?? "";
      results.push({ name, ok: true, detail });
      process.stdout.write(c.green("ok") + c.dim(detail ? ` — ${detail}` : "") + "\n");
    } catch (err) {
      results.push({ name, ok: false, detail: err.message });
      process.stdout.write(c.red("FAILED") + ` — ${err.message}\n`);
    }
  };
  const target = installedVersion();

  await check("All Remotion packages on one version", () => {
    const off = remotionDeps().filter((k) => readJson(path.join(STUDIO, "node_modules", k, "package.json"), {}).version !== target);
    if (off.length) throw new Error(`not on ${target}: ${off.join(", ")}`);
    const r = run("npx", ["remotion", "versions"], { quiet: true });
    if (!/correct version/i.test(r.stdout)) throw new Error("`remotion versions` reports a mismatch");
    return `${remotionDeps().length} packages on ${target}`;
  });
  await check("TypeScript + lint", () => {
    const r = run("npm", ["run", "-s", "lint"], { quiet: true });
    if (!r.ok) throw new Error((r.stdout + r.stderr).trim().split("\n").slice(-3).join(" "));
  });
  await check("Briefs match the template schema", async () => {
    const { checkBrief } = await import("./brief-check.mjs");
    const bad = listProjects().map((s) => [s, checkBrief(s)]).filter(([, r]) => !r.ok);
    if (bad.length) throw new Error(bad.map(([s, r]) => `${s}: ${r.error}`).join("; "));
    return `${listProjects().length} project(s)`;
  });
  await check("Compositions bundle and render (every format)", async () => {
    const serveUrl = await bundle({ entryPoint: path.join(STUDIO, "src", "index.ts") });
    const comps = await getCompositions(serveUrl);
    const sample = [comps.find((x) => x.id === "AppPromo-Template"), ...comps.filter((x) => x.id.startsWith(`${listProjects()[0]}-`))].filter(Boolean);
    if (!sample.length) throw new Error("no compositions found");
    const out = path.join(CACHE_DIR, "smoke");
    fs.mkdirSync(out, { recursive: true });
    for (const comp of sample) {
      await renderStill({ serveUrl, composition: comp, output: path.join(out, `${comp.id}.jpg`), frame: Math.min(45, comp.durationInFrames - 1), imageFormat: "jpeg", scale: 0.25, inputProps: comp.props });
    }
    return `${comps.length} compositions, rendered ${sample.length}`;
  });
  await check("Studio starts and the app window can find it", async () => {
    const { startStudioServer } = await import("./app-window.mjs");
    const s = await startStudioServer({ echo: false });
    s.stop();
    if (!s.ok) throw new Error("Studio's startup message changed or it didn't answer — the app window would not open");
    return s.reused ? `found the running Studio at ${s.url}` : `started at ${s.url}`;
  });
  await check("Rendering browser", () => {
    if (!run("npx", ["remotion", "browser", "ensure"], { quiet: true }).ok) throw new Error("`remotion browser ensure` failed");
  });
  // Lets you rehearse the rollback path safely: PROMO_UPGRADE_SIMULATE_FAILURE=1 npm run updates -- upgrade --to <version>
  if (process.env.PROMO_UPGRADE_SIMULATE_FAILURE) {
    await check("Simulated failure (PROMO_UPGRADE_SIMULATE_FAILURE)", () => {
      throw new Error("forced failure to test the rollback");
    });
  }

  const failed = results.filter((r) => !r.ok);
  log(failed.length ? c.red(`\n  ✗ ${failed.length} check(s) failed.`) : c.green(`\n  ✓ All ${results.length} checks passed on Remotion ${target}.`));
  return { ok: failed.length === 0, results };
};

// ── upgrade with rollback ─────────────────────────────────────────────────────
export const upgrade = async ({ to, ask } = {}) => {
  const from = installedVersion();
  const target = to || (await checkUpdates({ fresh: true })).latest;
  if (!target) throw new Error("Couldn't find the latest version.");
  if (!newer(target, from) && !to) {
    console.log(c.green(`  ✓ Already on the latest Remotion (${from}).`));
    return true;
  }
  if (studioRunning()) {
    console.log(c.yellow("  ! Remotion Studio is running. Close its window (or the browser tab / Ctrl+C) first —"));
    console.log(c.yellow("    Windows can't replace files that Studio has open."));
    return false;
  }
  if (ask && !/^y/i.test(await ask(`  Upgrade Remotion ${from} → ${target}? Every check runs afterwards and it rolls back on failure. (y/N) `))) return false;

  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const backup = path.join(CACHE_DIR, "upgrade-backups", `${from}-${stamp}`);
  fs.mkdirSync(backup, { recursive: true });
  for (const f of ["package.json", "package-lock.json"]) fs.copyFileSync(path.join(STUDIO, f), path.join(backup, f));
  console.log(c.dim(`  Backup: ${path.relative(ROOT, backup)}`));

  console.log(c.bold(`\n  ▸ Upgrading Remotion ${from} → ${target}`));
  // Remotion's own upgrader moves every @remotion/* package (and helpers like mediabunny) together.
  // Skills are updated separately in the workspace root (step "skills").
  const up = run("npx", ["remotion", "upgrade", "--version", target, "--skip-skills"]);
  let ok = up.ok;
  if (ok) {
    run("npm", ["install", "--no-audit", "--no-fund"], { quiet: true }); // relink bins, settle the lock file
    fs.writeFileSync(MARKER, PLATFORM_ID);
    console.log(c.bold("\n  ▸ Health checks"));
    ok = (await verify()).ok;
  } else {
    console.log(c.red("  ✗ The upgrade command failed."));
  }
  if (ok) {
    console.log(c.green(`\n  ✓ Upgraded to Remotion ${installedVersion()}. Backup of the old versions: ${path.relative(ROOT, backup)}`));
    await checkUpdates({ fresh: true }).catch(() => {});
    return true;
  }

  console.log(c.yellow(`\n  ▸ Rolling back to Remotion ${from}…`));
  for (const f of ["package.json", "package-lock.json"]) fs.copyFileSync(path.join(backup, f), path.join(STUDIO, f));
  const restored = run("npm", ["ci", "--no-audit", "--no-fund"], { quiet: true }).ok;
  fs.writeFileSync(MARKER, PLATFORM_ID);
  console.log(
    restored
      ? c.green(`  ✓ Rolled back — you're on Remotion ${installedVersion()} again, nothing else changed.`)
      : c.red(`  ✗ Rollback install failed. Close every Studio/terminal using the project, then run setup (launcher s).`),
  );
  return false;
};

export const updateSkills = () => run("npx", ["-y", "skills", "update", "-p", "-y"], { cwd: ROOT }).ok;

// ── CLI ───────────────────────────────────────────────────────────────────
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [cmd = "check", ...rest] = process.argv.slice(2);
  const opt = (n) => (rest.includes(`--${n}`) ? rest[rest.indexOf(`--${n}`) + 1] : undefined);
  // Set exitCode instead of process.exit(): exiting while fetch's socket is closing trips a libuv
  // assertion on Windows ("UV_HANDLE_CLOSING").
  try {
    if (cmd === "verify") process.exitCode = (await verify()).ok ? 0 : 1;
    else if (cmd === "upgrade") process.exitCode = (await upgrade({ to: opt("to") })) ? 0 : 1;
    else if (cmd === "skills") process.exitCode = updateSkills() ? 0 : 1;
    else {
      const u = await checkUpdates({ fresh: rest.includes("--fresh") });
      console.log(`  Remotion ${u.current} installed · latest ${u.latest ?? "unknown"}${u.available ? c.yellow("  → update available: npm run updates -- upgrade") : c.green("  ✓ up to date")}`);
    }
  } catch (err) {
    console.log(c.red(`  ✗ ${err.message}`));
    process.exitCode = 1;
  }
}
