// Runs tools/promo.py with the project venv (falls back to system Python).
//   npm run tools -- <command> [...args]     e.g. npm run tools -- doctor
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const tools = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "tools");
const venv = path.join(tools, ".venv", process.platform === "win32" ? "Scripts/python.exe" : "bin/python");
const python = fs.existsSync(venv) ? venv : process.platform === "win32" ? "py" : "python3";
const res = spawnSync(python, [path.join(tools, "promo.py"), ...process.argv.slice(2)], { stdio: "inherit" });
process.exit(res.status ?? 1);
