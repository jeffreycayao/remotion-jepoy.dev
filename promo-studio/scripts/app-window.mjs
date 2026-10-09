// Runs Remotion Studio inside a chromeless "app mode" window (Edge / Chrome / Brave / Chromium).
// Lifecycle: start Studio server → open app window → when the window closes, stop the server.
import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { c, IS_MAC, IS_WIN, run, STUDIO, STUDIO_PORT } from "./_platform.mjs";

// Separate profile = separate browser process, so we can tell when the window closes,
// and Studio never mixes with the user's normal tabs/extensions.
const PROFILE = path.join(STUDIO, ".app-profile");
const CLI = path.join(STUDIO, "node_modules", "@remotion", "cli", "remotion-cli.js");

/** First installed Chromium-family browser. Override with PROMO_BROWSER=/path/to/browser. */
export const findBrowser = () => {
  if (process.env.PROMO_BROWSER && fs.existsSync(process.env.PROMO_BROWSER)) return process.env.PROMO_BROWSER;
  if (IS_WIN) {
    const roots = [process.env["ProgramFiles(x86)"], process.env.ProgramFiles, process.env.LOCALAPPDATA].filter(Boolean);
    const rel = [
      "Microsoft/Edge/Application/msedge.exe",
      "Google/Chrome/Application/chrome.exe",
      "BraveSoftware/Brave-Browser/Application/brave.exe",
      "Chromium/Application/chrome.exe",
    ];
    for (const r of rel) for (const root of roots) if (fs.existsSync(path.join(root, r))) return path.join(root, r);
    return null;
  }
  if (IS_MAC) {
    const apps = ["Google Chrome", "Microsoft Edge", "Brave Browser", "Chromium", "Arc"];
    for (const dir of ["/Applications", path.join(os.homedir(), "Applications")]) {
      for (const a of apps) {
        const p = path.join(dir, `${a}.app/Contents/MacOS/${a}`);
        if (fs.existsSync(p)) return p;
      }
    }
    return null;
  }
  for (const bin of ["google-chrome", "google-chrome-stable", "chromium", "chromium-browser", "microsoft-edge", "brave-browser"]) {
    const r = spawnSync("which", [bin], { encoding: "utf8" });
    if (r.status === 0) return r.stdout.trim();
  }
  return null;
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const waitFor = async (check, timeoutMs) => {
  const end = Date.now() + timeoutMs;
  while (Date.now() < end) {
    if (check()) return true;
    await sleep(500);
  }
  return false;
};

/** Is any browser process running with our dedicated Studio profile? */
const profileInUse = () => {
  if (IS_WIN) {
    const ps = `@(Get-CimInstance Win32_Process -Filter "CommandLine like '%--user-data-dir=%'" | Where-Object { $_.CommandLine -like '*${PROFILE.replace(/'/g, "''").replace(/[[\]]/g, "`$&")}*' }).Count`;
    const r = spawnSync("powershell", ["-NoProfile", "-Command", ps], { encoding: "utf8" });
    return Number(r.stdout.trim()) > 0;
  }
  const r = spawnSync("ps", ["-axww", "-o", "command="], { encoding: "utf8" });
  return r.stdout.includes(`--user-data-dir=${PROFILE}`);
};

const waitForHttp = async (url, timeoutMs = 120_000) => {
  const end = Date.now() + timeoutMs;
  while (Date.now() < end) {
    try {
      if ((await fetch(url)).ok) return true;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  return false;
};

/** Kill a process and everything it spawned. */
const killTree = (child) => {
  if (!child || child.exitCode !== null) return;
  if (IS_WIN) spawnSync("taskkill", ["/pid", String(child.pid), "/T", "/F"], { stdio: "ignore" });
  else {
    try {
      process.kill(-child.pid, "SIGTERM"); // negative pid = whole process group (spawned detached)
    } catch {
      child.kill("SIGTERM");
    }
  }
};

/**
 * Start Studio (or reuse a running one) and show it.
 * @param {{ mode: "app" | "browser" }} opts
 */
/**
 * Start Studio (or find the one already running for this project) and wait for its URL.
 * Shared with the upgrade checks, which test exactly this — it relies on Studio's console output.
 */
export const startStudioServer = async ({ echo = true } = {}) => {
  const server = spawn(process.execPath, [CLI, "studio", "--no-open", "--port", String(STUDIO_PORT)], {
    cwd: STUDIO,
    stdio: ["ignore", "pipe", "pipe"],
    detached: !IS_WIN,
  });
  // Studio prints its URL; if one is already running it prints "Already running at …" and exits.
  const { url, reused } = await new Promise((resolve) => {
    let buf = "";
    const onData = (d) => {
      const s = d.toString();
      buf += s;
      if (echo) process.stdout.write(c.dim(s.replace(/^(?=.)/gm, "    ")));
      const m = /https?:\/\/(?:localhost|127\.0\.0\.1):(\d+)/.exec(buf);
      if (m) resolve({ url: `http://localhost:${m[1]}`, reused: /already running/i.test(buf) });
    };
    server.stdout.on("data", onData);
    server.stderr.on("data", onData);
    server.on("exit", () => resolve({ url: /localhost:(\d+)/.test(buf) ? `http://localhost:${/localhost:(\d+)/.exec(buf)[1]}` : null, reused: true }));
    setTimeout(() => resolve({ url: null, reused: false }), 120_000);
  });
  const ok = Boolean(url) && (await waitForHttp(url, 60_000));
  return { url, reused, ok, server, stop: () => !reused && killTree(server) };
};

export const openStudio = async ({ mode = "app" } = {}) => {
  run("node", [path.join(STUDIO, "scripts", "sync-projects.mjs")], { quiet: true });

  console.log(c.cyan("  Starting Remotion Studio…"));
  const { url, reused, server } = await startStudioServer();
  if (!url) {
    console.log(c.red("  ✗ Studio did not start. Try: npm run dev   (inside promo-studio/) to see the error."));
    return;
  }
  if (!(await waitForHttp(url))) {
    console.log(c.red(`  ✗ ${url} did not respond.`));
    killTree(server);
    return;
  }

  const browser = mode === "app" ? findBrowser() : null;
  if (mode === "app" && !browser) {
    console.log(c.yellow("  ! No Chrome/Edge/Brave/Chromium found — opening in your default browser instead."));
    console.log(c.dim("    Tip: set PROMO_BROWSER=/path/to/chromium-browser to choose one."));
  }

  if (browser) {
    console.log(c.green(`  ✓ Opening app window (${path.basename(browser)}) → ${url}`));
    console.log(c.dim(reused ? "    Using the Studio that was already running; it keeps running after you close the window." : "    Close the window to stop Studio and return to the menu."));
    const args = [
      `--app=${url}`,
      `--user-data-dir=${PROFILE}`,
      "--window-size=1600,1000",
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-features=Translate",
    ];
    // Chromium refuses to start as root (containers, some Linux setups) without this.
    if (process.platform === "linux" && process.getuid?.() === 0) args.push("--no-sandbox");

    const startedAt = Date.now();
    const win = spawn(browser, args, { stdio: "ignore" });
    const stopAll = () => {
      killTree(win);
      if (!reused) killTree(server);
    };
    process.on("SIGINT", stopAll);
    const code = await new Promise((r) => win.on("exit", r));
    process.off("SIGINT", stopAll);

    // The launched process can exit instantly while the window lives on elsewhere: wrapper
    // scripts (Debian/Snap/Flatpak chromium) or a hand-off to an already-open Studio window.
    // In that case follow the window by its dedicated profile instead of the child process.
    if (Date.now() - startedAt < 4000) {
      const alive = await waitFor(() => profileInUse(), 10_000);
      if (!alive) {
        console.log(c.yellow(`  ! The browser exited (code ${code}) without opening a window.`));
        if (!reused) await waitForCtrlC(server, url);
        return;
      }
      process.on("SIGINT", stopAll);
      while (profileInUse()) await sleep(2000);
      process.off("SIGINT", stopAll);
    }
    if (!reused) killTree(server);
    console.log(c.green("  ✓ Studio closed."));
    return;
  }

  // Plain browser tab: no way to detect the tab closing, so stop with Ctrl+C.
  const opener = IS_WIN ? ["cmd", ["/c", "start", "", url]] : IS_MAC ? ["open", [url]] : ["xdg-open", [url]];
  spawn(opener[0], opener[1], { stdio: "ignore", detached: true }).unref();
  if (reused) return;
  await waitForCtrlC(server, url);
};

/** Keep the server running until Ctrl+C (or until it exits on its own). */
const waitForCtrlC = async (server, url) => {
  console.log(c.green(`  ✓ Studio running at ${url} — press Ctrl+C to stop and return to the menu.`));
  await new Promise((resolve) => {
    const stop = () => {
      killTree(server);
      resolve();
    };
    process.once("SIGINT", stop);
    server.on("exit", () => {
      process.off("SIGINT", stop);
      resolve();
    });
  });
};
