// One-time (and re-runnable) setup for Windows, macOS and Linux.
//   node promo-studio/scripts/setup.mjs [--force]
// Safe to run again any time: it only redoes what is missing or was installed for another OS.
import fs from "node:fs";
import path from "node:path";
import {
  ARCHIVE,
  c,
  DELIVERY,
  findSystemPython,
  INBOX,
  installId,
  installHint,
  IS_WIN,
  MARKER,
  PLATFORM_ID,
  RENDERS,
  ROOT,
  run,
  STUDIO,
  studioRunning,
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
const [major, minor] = process.versions.node.split(".").map(Number);
if (major < 22 || (major === 22 && minor < 18)) {
  console.log(c.red(`  ✗ Node ${process.versions.node} is too old (need 22.18.0+). Install: ${installHint("node")}`));
  process.exit(1);
}
ok(`Node ${process.versions.node}, npm ${version("npm", "-v") ?? "?"}`);

// 2 ── npm packages ────────────────────────────────────────────────────────
step(2, "Node packages");
const installedFor = fs.existsSync(MARKER) ? fs.readFileSync(MARKER, "utf8").trim() : null;
const hasModules = fs.existsSync(path.join(STUDIO, "node_modules"));
const declared = JSON.parse(fs.readFileSync(path.join(STUDIO, "package.json"), "utf8"));
const requiredPackages = Object.keys({ ...declared.dependencies, ...declared.devDependencies });
const missingPackages = requiredPackages.filter((name) => !fs.existsSync(path.join(STUDIO, "node_modules", name, "package.json")));
if (force || !hasModules || installedFor !== installId() || missingPackages.length) {
  if (hasModules && installedFor && installedFor !== installId()) {
    console.log("  Platform or package-lock.json changed; reinstalling the locked packages…");
  }
  if (missingPackages.length) {
    console.log(`  Missing installed packages: ${missingPackages.slice(0, 5).join(", ")}${missingPackages.length > 5 ? ` (+${missingPackages.length - 5} more)` : ""}`);
  }
  // npm ci deletes node_modules first; on Windows that fails half-way if Studio still has files open.
  if (hasModules && studioRunning()) {
    console.log(c.red("  ✗ Remotion Studio is running. Close its window (or press Ctrl+C where it runs), then run setup again."));
    process.exit(1);
  }
  // `npm ci` = clean install exactly from package-lock.json (which lists binaries for every OS).
  const r = run("npm", ["ci", "--include=dev", "--no-audit", "--no-fund"]);
  if (!r.ok) {
    console.log(c.red("  ✗ npm ci failed — see errors above."));
    process.exit(1);
  }
  ok("Installed from package-lock.json");
} else {
  ok(`Already installed for ${PLATFORM_ID} and the current lockfile`);
}

// 3 ── All supported plugins (catalog in plugins.json) ───────────────────────
step(3, "Plugin catalog");
{
  const { ensure } = await import("./plugins.mjs");
  if (!ensure()) {
    console.log(c.red("  ✗ Plugin installation is incomplete. Run npm run plugins -- ensure and rerun setup."));
    process.exit(1);
  }
  fs.writeFileSync(MARKER, installId());
  ok("All supported catalog plugins are installed");
}

// 4 ── Headless Chrome (Remotion renders frames with it) ─────────────────────
step(4, "Rendering browser");
if (run("npx", ["remotion", "browser", "ensure"], { quiet: true }).ok) {
  ok("Chrome Headless Shell ready");
} else {
  console.log(c.red("  ✗ Could not prepare the headless rendering browser."));
  console.log(c.dim(process.platform === "linux"
    ? "    Install Chrome's system libraries (see README.md), then rerun setup."
    : "    Check your internet connection, then rerun setup."));
  process.exit(1);
}

// 5 ── Python venv for tools/promo.py ───────────────────────────────────────
step(5, "Python helpers");
const venvDir = path.join(TOOLS, ".venv");
const venvProbe = fs.existsSync(VENV_PY)
  ? run(VENV_PY, ["-c", "import sys; print(sys.prefix)"], { quiet: true })
  : null;
const actualPrefix = venvProbe?.ok ? path.resolve(venvProbe.stdout.trim()) : "";
const expectedPrefix = path.resolve(venvDir);
const prefixMatches = IS_WIN
  ? actualPrefix.toLowerCase() === expectedPrefix.toLowerCase()
  : actualPrefix === expectedPrefix;
const venvUsable = prefixMatches && run(VENV_PY, ["-m", "pip", "--version"], { quiet: true }).ok;
if (fs.existsSync(venvDir) && (force || !venvUsable)) {
  // A copied venv can point to a missing Python installation, even on the same OS.
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
for (const d of [INBOX, RENDERS, DELIVERY, ARCHIVE]) {
  fs.mkdirSync(d, { recursive: true });
}
ok("Pipeline folders ready (inbox, out/renders, out/delivery, out/archive)");
if (!run("node", [path.join(STUDIO, "scripts", "sync-projects.mjs")], { quiet: true }).ok) {
  console.log(c.red("  ✗ Project sync failed. Run npm run sync for details."));
  process.exit(1);
}

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
  console.log(c.yellow(`Setup finished with ${problems.length} warning(s). Review the affected features above before using them.`));
} else {
  console.log(c.green("✓ Setup complete."));
}
console.log(`Start the app: ${c.bold(IS_WIN ? '"PROMO STUDIO.bat"' : "./promo-studio.sh")}${process.platform === "darwin" ? '  (or double-click "Promo Studio.command")' : ""}\n`);
