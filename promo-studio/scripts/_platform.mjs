// Cross-platform helpers shared by setup.mjs and launcher.mjs (Windows, macOS, Linux).
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const IS_WIN = process.platform === "win32";
export const IS_MAC = process.platform === "darwin";
export const STUDIO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const ROOT = path.resolve(STUDIO, "..");
export const TOOLS = path.join(ROOT, "tools");
export const VENV_PY = path.join(TOOLS, ".venv", IS_WIN ? "Scripts/python.exe" : "bin/python");

/** Identifies the OS/CPU that node_modules + venv were installed for. */
export const PLATFORM_ID = `${process.platform}-${os.arch()}`;
export const MARKER = path.join(STUDIO, "node_modules", ".promo-platform");

export const c = {
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
};

/**
 * Find the real program behind a command name, so it can be spawned WITHOUT a shell.
 * On Windows, npm-installed CLIs are .cmd shims; cmd.exe would interpret %VAR%, &, | and
 * quotes inside arguments (e.g. prompt text built from inbox notes), so we never go through it:
 *   - foo.exe / foo.com on PATH        → run directly
 *   - foo.cmd → "%dp0%\…\foo.exe"       → run that exe
 *   - foo.cmd → "%dp0%\…\foo.js"        → run it with this Node
 *   - npm / npx                         → Node's bundled npm-cli.js / npx-cli.js
 * Returns { file, prefix } or null when nothing safe was found.
 */
export const resolveCommand = (cmd) => {
  if (!IS_WIN) return { file: cmd, prefix: [] };
  if (cmd === "node") return { file: process.execPath, prefix: [] };
  if (cmd === "npm" || cmd === "npx") {
    const cli = path.join(path.dirname(process.execPath), "node_modules", "npm", "bin", `${cmd}-cli.js`);
    if (fs.existsSync(cli)) return { file: process.execPath, prefix: [cli] };
  }
  for (const dir of (process.env.PATH ?? "").split(path.delimiter).filter(Boolean)) {
    for (const ext of [".exe", ".com"]) {
      const p = path.join(dir, cmd + ext);
      if (fs.existsSync(p)) return { file: p, prefix: [] };
    }
    const shim = path.join(dir, `${cmd}.cmd`);
    if (fs.existsSync(shim)) {
      // Shims can mention several paths (e.g. an optional bundled node.exe); take the first that exists,
      // skipping node.exe itself — a .js target is run with this Node instead.
      const targets = [...fs.readFileSync(shim, "utf8").matchAll(/"%~?dp0%?\\([^"%]+?\.(exe|js|cjs|mjs))"/gi)]
        .map((m) => path.join(dir, m[1]))
        .filter((t) => !/[\\/]node\.exe$/i.test(t) && fs.existsSync(t));
      const target = targets[0];
      if (target) return /\.exe$/i.test(target) ? { file: target, prefix: [] } : { file: process.execPath, prefix: [target] };
    }
  }
  return null;
};

/** Run a command with inherited stdio — never through a shell (see resolveCommand). */
export const run = (cmd, args = [], { cwd = STUDIO, quiet = false, env } = {}) => {
  const resolved = resolveCommand(cmd);
  if (!resolved) return { ok: false, status: null, stdout: "", stderr: `${cmd}: not found` };
  const res = spawnSync(resolved.file, [...resolved.prefix, ...args], { cwd, env, stdio: quiet ? "pipe" : "inherit", encoding: "utf8" });
  return { ok: res.status === 0, status: res.status, stdout: res.stdout ?? "", stderr: res.stderr ?? (res.error ? String(res.error.message) : "") };
};

/** Returns the first line of `<cmd> <versionFlag>`, or null if the command is missing. */
export const version = (cmd, flag = "--version") => {
  const r = run(cmd, [flag], { quiet: true });
  return r.ok ? (r.stdout || r.stderr).split(/\r?\n/)[0].trim() : null;
};

/** Open a folder/file in Explorer / Finder / the Linux file manager. */
export const openPath = (p) => {
  fs.mkdirSync(p, { recursive: true });
  const [cmd, args] = IS_WIN ? ["explorer", [p]] : IS_MAC ? ["open", [p]] : ["xdg-open", [p]];
  spawnSync(cmd, args, { stdio: "ignore", detached: true });
};

/** Python used by tools/promo.py: the venv if present, else the system interpreter. */
export const findSystemPython = () => {
  const candidates = IS_WIN ? [["py", ["-3"]], ["python", []]] : [["python3", []], ["python", []]];
  for (const [cmd, pre] of candidates) {
    const r = run(cmd, [...pre, "-c", "import sys; print(sys.version_info >= (3, 9))"], { quiet: true });
    if (r.ok && r.stdout.trim() === "True") return { cmd, pre };
  }
  return null;
};

export const listProjects = () =>
  fs
    .readdirSync(path.join(STUDIO, "projects"), { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith("_"))
    .map((d) => d.name)
    .sort();

/** OS-specific one-liners shown when a dependency is missing. */
export const installHint = (tool) => {
  const hints = {
    node: {
      win32: "winget install OpenJS.NodeJS.LTS",
      darwin: "brew install node",
      linux: "https://nodejs.org/en/download (or: curl -fsSL https://fnm.vercel.app/install | bash && fnm install --lts)",
    },
    python: {
      win32: "winget install Python.Python.3.13",
      darwin: "brew install python",
      linux: "sudo apt install python3 python3-venv   (Fedora: sudo dnf install python3)",
    },
    ffmpeg: {
      win32: "winget install Gyan.FFmpeg",
      darwin: "brew install ffmpeg",
      linux: "sudo apt install ffmpeg   (Fedora: sudo dnf install ffmpeg)",
    },
  };
  return hints[tool]?.[process.platform] ?? hints[tool]?.linux;
};

/** True while Remotion Studio from this project is running (Windows locks its files, so installs must wait). */
export const studioRunning = () => {
  const needle = path.join(STUDIO, "node_modules", "@remotion", "cli");
  if (IS_WIN) {
    const ps = `@(Get-CimInstance Win32_Process -Filter "Name='node.exe'" | Where-Object { $_.CommandLine -like '*${needle.replace(/'/g, "''")}*' -and $_.CommandLine -like '* studio*' }).Count`;
    return Number(spawnSync("powershell", ["-NoProfile", "-Command", ps], { encoding: "utf8" }).stdout.trim()) > 0;
  }
  return spawnSync("ps", ["-axww", "-o", "command="], { encoding: "utf8" }).stdout.split("\n").some((l) => l.includes(needle) && / studio\b/.test(l));
};
