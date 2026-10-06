// One-time (and re-runnable) setup for Windows, macOS and Linux.
//   node promo-studio/scripts/setup.mjs [--force]
// Safe to run again any time: it only redoes what is missing or was installed for another OS.
import fs from "node:fs";
import path from "node:path";
import {
  c,
  findSystemPython,
  installHint,
  IS_WIN,
  MARKER,
  PLATFORM_ID,
  ROOT,
  run,
  STUDIO,
  TOOLS,
  VENV_PY,
  version,
} from "./_platform.mjs";

const force = process.argv.includes("--force");
const problems = [];
const step = (n, title) => console.log(`\n${c.cyan(`[${n}/9]`)} ${c.bold(title)}`);
const ok = (msg) => console.log(`  ${c.green("✓")} ${msg}`);
const warn = (msg, hint) => {
  console.log(`  ${c.yellow("!")} ${msg}${hint ? `\n    ${c.dim("→ " + hint)}` : ""}`);
  problems.push(msg);
};

const { actionHeader } = await import("./brand.mjs");
actionHeader(`Setup · ${PLATFORM_ID}`);

// 1 ── Node ────────────────────────────────────────────────────────────────
step(1, "Node.js");
const major = Number(process.versions.node.split(".")[0]);
if (major < 18) {
  console.log(c.red(`  ✗ Node ${process.versions.node} is too old (need 18+). Install: ${installHint("node")}`));
  process.exit(1);
}
ok(`Node ${process.versions.node}, npm ${version("npm", "-v") ?? "?"}`);

// 2 ── npm packages ────────────────────────────────────────────────────────
step(2, "Node packages");
const installedFor = fs.existsSync(MARKER) ? fs.readFileSync(MARKER, "utf8").trim() : null;
const hasModules = fs.existsSync(path.join(STUDIO, "node_modules"));
if (force || !hasModules || installedFor !== PLATFORM_ID) {
  if (hasModules && installedFor && installedFor !== PLATFORM_ID) {
    console.log(`  node_modules was installed for ${installedFor}; reinstalling native binaries for ${PLATFORM_ID}…`);
  }
  // `npm ci` = clean install exactly from package-lock.json (which lists binaries for every OS).
  const r = run("npm", ["ci", "--no-audit", "--no-fund"]);
  if (!r.ok) {
    console.log(c.red("  ✗ npm ci failed — see errors above."));
    process.exit(1);
  }
  fs.writeFileSync(MARKER, PLATFORM_ID);
  ok("Installed from package-lock.json");
} else {
  ok(`Already installed for ${PLATFORM_ID}`);
}

// 3 ── Production plugins (catalog in plugins.json) ──────────────────────────
step(3, "Production plugins");
{
  const { ensure } = await import("./plugins.mjs");
  if (ensure()) ok("Core + production pack installed (more: launcher → p. Plugins)");
  else warn("Some plugins failed to install", "npm run plugins -- ensure");
}

// 4 ── Headless Chrome (Remotion renders frames with it) ─────────────────────
step(4, "Rendering browser");
if (run("npx", ["remotion", "browser", "ensure"], { quiet: true }).ok) {
  ok("Chrome Headless Shell ready");
} else {
  warn(
    "Could not prepare the headless browser",
    process.platform === "linux"
      ? "sudo apt install libnss3 libdbus-1-3 libatk1.0-0 libgbm-dev libasound2 libxrandr2 libxkbcommon-dev libxfixes3 libxcomposite1 libxdamage1 libatk-bridge2.0-0 libpango-1.0-0 libcairo2 libcups2"
      : "Check your internet connection, then rerun setup.",
  );
}

// 5 ── Python venv for tools/promo.py ───────────────────────────────────────
step(5, "Python helpers");
const venvDir = path.join(TOOLS, ".venv");
if (fs.existsSync(venvDir) && (force || !fs.existsSync(VENV_PY))) {
  // A venv is OS-specific (Scripts\python.exe vs bin/python) — rebuild if it came from another OS.
  console.log("  Rebuilding venv for this OS…");
  fs.rmSync(venvDir, { recursive: true, force: true });
}
if (!fs.existsSync(VENV_PY)) {
  const py = findSystemPython();
  if (!py) {
    warn("Python 3.9+ not found (needed only for prep/deliver helpers)", installHint("python"));
  } else if (!run(py.cmd, [...py.pre, "-m", "venv", venvDir], { quiet: true }).ok) {
    warn("Could not create venv", IS_WIN ? "Reinstall Python with the 'pip' option" : "sudo apt install python3-venv");
  }
}
if (fs.existsSync(VENV_PY)) {
  run(VENV_PY, ["-m", "pip", "install", "-q", "--upgrade", "pip"], { quiet: true });
  const r = run(VENV_PY, ["-m", "pip", "install", "-q", "-r", path.join(TOOLS, "requirements.txt")], { quiet: true });
  if (r.ok) ok(`venv ready (${version(VENV_PY)})`);
  else warn("pip install failed", r.stderr.split("\n").slice(-3).join(" "));
}

// 6 ── FFmpeg (system copy, used by the Python delivery helpers) ─────────────
step(6, "FFmpeg");
// Remotion ships its own FFmpeg for rendering; this one is for deliver/gif/contact-sheet/prep-audio.
const ff = version("ffmpeg", "-version");
const fp = version("ffprobe", "-version");
if (ff && fp) ok(ff.slice(0, 60));
else warn("ffmpeg/ffprobe not on PATH (rendering still works; delivery helpers need it)", installHint("ffmpeg"));

// 7 ── Agent skills + launchers ────────────────────────────────────────────
step(7, "Remotion agent skills & launchers");
if (!fs.existsSync(path.join(ROOT, ".claude", "skills", "remotion-best-practices"))) {
  // Restore the exact skill versions pinned in skills-lock.json from GitHub.
  const r = run("npx", ["-y", "skills", "experimental_install"], { cwd: ROOT, quiet: true });
  r.ok ? ok("Installed skills from skills-lock.json") : warn("Could not install skills (offline?)", "npx skills add remotion-dev/skills");
} else {
  ok("Skills present (.claude/skills)");
}
if (!IS_WIN) {
  // Files copied from Windows/zip lose the executable bit.
  for (const f of ["promo-studio.sh", "setup.sh", "Promo Studio.command"]) {
    const p = path.join(ROOT, f);
    if (fs.existsSync(p)) fs.chmodSync(p, 0o755);
  }
  ok("Launchers marked executable");
}
for (const d of ["00_INBOX", "20_RENDERS", "30_DELIVERY", "90_ARCHIVE"]) {
  fs.mkdirSync(path.join(ROOT, d), { recursive: true });
}
ok("Pipeline folders ready (00_INBOX, 20_RENDERS, 30_DELIVERY, 90_ARCHIVE)");
run("node", [path.join(STUDIO, "scripts", "sync-projects.mjs")], { quiet: true });

// 8 ── App window browser ──────────────────────────────────────────────────
step(8, "App window");
{
  const { findBrowser } = await import("./app-window.mjs");
  const b = findBrowser();
  if (b) ok(`Studio will open as an app window using ${path.basename(b)}`);
  else
    warn(
      "No Chrome/Edge/Brave/Chromium found — Studio will open in a normal browser tab",
      { win32: "winget install Google.Chrome", darwin: "brew install --cask google-chrome" }[process.platform] ??
        "sudo apt install chromium   (or set PROMO_BROWSER=/path/to/browser)",
    );
}

// 9 ── AI assistants (all optional) ───────────────────────────────────────
step(9, "AI assistants (optional)");
{
  const { hasCredentials } = await import("./ai/core.mjs");
  const { agentAvailable } = await import("./ai/agents.mjs");
  hasCredentials()
    ? ok("Claude API key found — auto-brief, hooks, voiceover and QA are ready")
    : console.log(`  ${c.dim("○")} No Claude API key yet ${c.dim("(launcher → a. AI → k. Set API key)")}`);
  const cc = agentAvailable("claude");
  const cx = agentAvailable("codex");
  console.log(`  ${cc ? c.green("✓") : c.dim("○")} Claude Code ${cc ?? c.dim("not installed — npm install -g @anthropic-ai/claude-code")}`);
  console.log(`  ${cx ? c.green("✓") : c.dim("○")} OpenAI Codex ${cx ?? c.dim("not installed — npm install -g @openai/codex")}`);
}

// ── summary ───────────────────────────────────────────────────────────────
console.log("");
if (problems.length) {
  console.log(c.yellow(`Setup finished with ${problems.length} warning(s). Core video rendering works; fix the above for the rest.`));
} else {
  console.log(c.green("✓ Setup complete."));
}
console.log(`Start the app: ${c.bold(IS_WIN ? '"PROMO STUDIO.bat"' : "./promo-studio.sh")}${process.platform === "darwin" ? '  (or double-click "Promo Studio.command")' : ""}\n`);
