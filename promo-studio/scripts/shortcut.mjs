// Creates a desktop / app-menu shortcut that opens Studio straight into the app window.
// PROMO_SHORTCUT_DIR overrides the target folder (default: the user's Desktop).
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { c, IS_MAC, IS_WIN, ROOT, run, STUDIO } from "./_platform.mjs";

const ICON_PNG = path.join(STUDIO, "assets", "app-icon.png");
const ICON_ICO = path.join(STUDIO, "assets", "app-icon.ico");

export const createShortcut = () => {
  if (IS_WIN) {
    // Resolve the real Desktop (may be redirected to OneDrive) and write a .lnk via WScript.Shell.
    const ps = `
      $desk = if ($env:PROMO_SHORTCUT_DIR) { $env:PROMO_SHORTCUT_DIR } else { [Environment]::GetFolderPath('Desktop') }
      $lnk = Join-Path $desk 'Promo Studio.lnk'
      $s = (New-Object -ComObject WScript.Shell).CreateShortcut($lnk)
      $s.TargetPath = '${path.join(ROOT, "PROMO STUDIO.bat").replace(/'/g, "''")}'
      $s.Arguments = 'studio'
      $s.WorkingDirectory = '${ROOT.replace(/'/g, "''")}'
      $s.WindowStyle = 7
      $s.IconLocation = '${ICON_ICO.replace(/'/g, "''")}'
      $s.Description = 'Promo Studio - Remotion app window'
      $s.Save()
      Write-Output $lnk`;
    const r = run("powershell", ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", ps], { quiet: true });
    if (!r.ok) return console.log(c.red(`  ✗ Could not create shortcut: ${r.stderr.trim()}`));
    return console.log(c.green(`  ✓ Shortcut created: ${r.stdout.trim()}  (starts minimized, opens the app window)`));
  }

  if (IS_MAC) {
    const target = path.join(process.env.PROMO_SHORTCUT_DIR ?? path.join(os.homedir(), "Desktop"), "Promo Studio (App).command");
    fs.writeFileSync(target, `#!/usr/bin/env bash\ncd "${ROOT}" && exec ./promo-studio.sh studio\n`);
    fs.chmodSync(target, 0o755);
    return console.log(c.green(`  ✓ Shortcut created: ${target}`));
  }

  // Linux: freedesktop .desktop entry (app menu + Desktop if it exists).
  const entry = [
    "[Desktop Entry]",
    "Type=Application",
    "Name=Promo Studio",
    "Comment=Remotion promo video studio",
    `Exec=bash -lc 'cd "${ROOT}" && ./promo-studio.sh studio'`,
    `Icon=${ICON_PNG}`,
    "Terminal=true",
    "Categories=AudioVideo;Video;",
    "",
  ].join("\n");
  const appsDir = path.join(os.homedir(), ".local", "share", "applications");
  fs.mkdirSync(appsDir, { recursive: true });
  const targets = [path.join(appsDir, "promo-studio.desktop")];
  const desk = process.env.PROMO_SHORTCUT_DIR ?? path.join(os.homedir(), "Desktop");
  if (fs.existsSync(desk)) targets.push(path.join(desk, "promo-studio.desktop"));
  for (const t of targets) {
    fs.writeFileSync(t, entry);
    fs.chmodSync(t, 0o755);
  }
  console.log(c.green(`  ✓ Shortcut created: ${targets.join(", ")}`));
};
