// Create a new promo project.
//   npm run new -- <slug> ["App Name"]
// Creates projects/<slug>/brief.json, public/projects/<slug>/{screens,audio}, and 00_INBOX/<slug>/.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const [slug, appName] = process.argv.slice(2);

if (!slug || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
  console.error('Usage: npm run new -- <slug> ["App Name"]   (slug: kebab-case, e.g. "fit-tracker")');
  process.exit(1);
}

const projectDir = path.join(root, "projects", slug);
if (fs.existsSync(projectDir)) {
  console.error(`✗ projects/${slug} already exists.`);
  process.exit(1);
}

const brief = JSON.parse(fs.readFileSync(path.join(root, "projects", "_template", "brief.json"), "utf8"));
brief.props.appName = appName ?? slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

fs.mkdirSync(projectDir, { recursive: true });
fs.writeFileSync(path.join(projectDir, "brief.json"), JSON.stringify(brief, null, 2) + "\n");
for (const sub of ["screens", "audio"]) {
  fs.mkdirSync(path.join(root, "public", "projects", slug, sub), { recursive: true });
}
fs.mkdirSync(path.resolve(root, "..", "00_INBOX", slug), { recursive: true });

execFileSync(process.execPath, [path.join(root, "scripts", "sync-projects.mjs")], { stdio: "inherit" });

console.log(`
✓ Created "${brief.props.appName}" — the brief holds [placeholder] text until you fill it in.
  Fill it (any one):
    • Chat with Claude:            launcher c  (or npm run chat -- ${slug})
    • Autopilot from your files:   drop screenshots + logo in 00_INBOX/${slug}/, then launcher w
    • AI brief (API key):          npm run ai -- brief ${slug}
    • By hand:                     promo-studio/projects/${slug}/brief.json
  Then preview (npm run dev → Projects/${slug}) and render (npm run draft -- ${slug}).
`);
