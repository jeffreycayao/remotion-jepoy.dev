// Plugin manager for the catalog in plugins.json.
//   npm run plugins -- list                       show everything with install status
//   npm run plugins -- ensure                     install missing packages from "auto" groups
//   npm run plugins -- install <group|pkg> [...]  e.g. install cloud-render   /   install @remotion/gsap
//   npm run plugins -- remove <pkg> [...]
// Installs go through `npx remotion add`, which pins every package to the project's Remotion version.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { c, run, STUDIO } from "./_platform.mjs";

const catalog = JSON.parse(fs.readFileSync(path.join(STUDIO, "plugins.json"), "utf8"));
const allPackages = catalog.groups.flatMap((g) => g.packages.map((p) => ({ ...p, group: g.id })));

export const installedSet = () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(STUDIO, "package.json"), "utf8"));
  return new Set(Object.keys({ ...pkg.dependencies, ...pkg.devDependencies }));
};

/** Expand group ids and package names into a list of package names. */
const resolve = (items) => {
  const out = new Set();
  for (const item of items) {
    const group = catalog.groups.find((g) => g.id === item);
    if (group) group.packages.forEach((p) => out.add(p.name));
    else if (catalog.excluded.some((e) => e.name === item)) {
      console.log(c.yellow(`  ! ${item} skipped: ${catalog.excluded.find((e) => e.name === item).reason}`));
    } else out.add(item);
  }
  return [...out];
};

export const list = () => {
  const have = installedSet();
  for (const g of catalog.groups) {
    const n = g.packages.filter((p) => have.has(p.name)).length;
    console.log(`\n  ${c.bold(g.title)} ${c.dim(`[${g.id}] ${n}/${g.packages.length}`)}`);
    for (const p of g.packages) {
      const mark = have.has(p.name) ? c.green("●") : c.dim("○");
      console.log(`    ${mark} ${p.name.padEnd(32)} ${c.dim(p.desc)}`);
    }
  }
  console.log(c.dim(`\n  ● installed  ○ available   Not offered: ${catalog.excluded.map((e) => e.name).join(", ")}`));
};

export const install = (items) => {
  const have = installedSet();
  const wanted = resolve(items).filter((p) => !have.has(p));
  if (!wanted.length) {
    console.log(c.green("  ✓ Already installed."));
    return true;
  }
  console.log(`  Installing ${wanted.length} package(s): ${wanted.join(", ")}`);
  const ok = run("npx", ["remotion", "add", ...wanted]).ok;
  console.log(ok ? c.green("  ✓ Installed.") : c.red("  ✗ Install failed — see errors above."));
  const needsConfig = allPackages.filter((p) => wanted.includes(p.name) && p.group === "styling");
  for (const p of needsConfig) console.log(c.yellow(`  ! ${p.name}: ${p.desc}`));
  return ok;
};

export const ensure = () => install(catalog.groups.filter((g) => g.auto).map((g) => g.id));

export const remove = (items) => {
  const core = new Set(catalog.groups.find((g) => g.id === "core").packages.map((p) => p.name));
  const blocked = items.filter((p) => core.has(p));
  if (blocked.length) console.log(c.yellow(`  ! Not removing core package(s): ${blocked.join(", ")}`));
  const targets = items.filter((p) => !core.has(p) && installedSet().has(p));
  if (!targets.length) return true;
  return run("npm", ["uninstall", ...targets]).ok;
};

export const groups = catalog.groups;

// CLI
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [cmd, ...rest] = process.argv.slice(2);
  const ok =
    cmd === "install" ? install(rest) : cmd === "remove" ? remove(rest) : cmd === "ensure" ? ensure() : (list(), true);
  process.exit(ok ? 0 : 1);
}
