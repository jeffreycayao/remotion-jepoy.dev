// Interactive Claude Code session from the launcher terminal, primed as a promo co-pilot.
//
//   npm run chat                 general session (Claude asks what you want to build)
//   npm run chat -- <slug>       focused on one project (brief, inbox, assets)
//
// You are at the keyboard, so Claude asks before anything risky. Only brief edits and the
// validating npm scripts are pre-approved (the same allowlist the unattended "ask" uses).
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { c, INBOX, listProjects, resolveCommand, ROOT, STUDIO } from "../_platform.mjs";

/** Formats straight from src/lib/layout.ts so the prompt never drifts from the template. */
const formats = () => {
  const src = fs.readFileSync(path.join(STUDIO, "src", "lib", "layout.ts"), "utf8");
  return [...src.matchAll(/"(\w+)":\s*\{\s*width:\s*(\d+),\s*height:\s*(\d+),\s*label:\s*"([^"]+)"/g)].map(
    ([, key, w, h, label]) => `${key} = ${w}×${h} (${label})`,
  );
};

const listDir = (dir) => (fs.existsSync(dir) ? fs.readdirSync(dir).filter((n) => !n.startsWith(".")) : []);

const GUIDE = () => `
You are the Promo Studio co-pilot, chatting with the owner in their launcher terminal. They make app promo
videos with Remotion and want help building the pieces: brief.json content, brand colours/fonts, formats
(screen sizes), assets and copy. Be practical, explain briefly, and make the change when they agree.

Project facts (CLAUDE.md has the full rules):
- A project = promo-studio/projects/<slug>/brief.json. "props" must match src/templates/AppPromo/schema.ts —
  read it before writing. Text in [square brackets] is starter placeholder copy from \`npm run new\` — replace
  all of it (final renders refuse briefs that still contain any). Raw client files live in promo-studio/inbox/<slug>/ (read-only); prepared assets go in
  promo-studio/public/projects/<slug>/ via \`npm run tools -- prep-screens|prep-logo|prep-audio <slug> … --apply\`.
- New project: \`npm run new -- <slug> "<App Name>"\` (from promo-studio/).
- Formats (the "formats" array in brief.json): ${formats().join("; ")}.
- Brand: brand.primary/secondary/background/text are hex colours, brand.font is one of the fonts in the
  schema. Take colours from the logo/screenshots (\`npm run tools -- palette <file>\` measures them) and keep
  text/background contrast readable (WCAG AA). Headline ≤ 6 words, feature descriptions ≤ 12 words.
  Never invent stats or claims — ask the owner for real numbers.
- After editing a brief run \`npm run lint\` (from promo-studio/) and show a preview with
  \`npm run frames -- <slug> 9x16 60,150,300\` (stills in promo-studio/out/frames/ — read them to check the look).
- File placement (CLAUDE.md "Where every file goes"): copy the owner's original files into promo-studio/inbox/<slug>/ first;
  videos only via \`npm run draft|render\` (→ promo-studio/out/renders), never \`npx remotion render\`. A bespoke design is a template in
  src/templates/<Name>/ + an entry in src/templates/registry.ts + its own project brief {"template": "<Name>"} —
  never hard-coded <Composition>s in Root.tsx.
- Never touch promo-studio/out/renders/, promo-studio/out/delivery/, or promo-studio/out/archive/ by hand; only render finals when asked.
- The owner may not be a developer: ask one question at a time, offer sensible defaults, and summarise what
  you changed at the end.`;

const projectContext = (slug) => {
  const brief = path.join(STUDIO, "projects", slug, "brief.json");
  const inbox = listDir(path.join(INBOX, slug));
  const assets = listDir(path.join(STUDIO, "public", "projects", slug));
  return `
Current focus: project "${slug}".
- Brief: promo-studio/projects/${slug}/brief.json ${fs.existsSync(brief) ? "(exists)" : "(missing — offer to create it)"}
- Inbox promo-studio/inbox/${slug}/: ${inbox.length ? inbox.join(", ") : "empty"}
- Prepared assets: ${assets.length ? assets.join(", ") : "none yet"}`;
};

export const chatAvailable = () => Boolean(resolveCommand("claude"));

/** Claude Code arguments for a session focused on `slug` (a project, a new app name, or nothing). */
export const chatArgs = (slug) => {
  const known = slug && listProjects().includes(slug);
  const opener = known
    ? `I'm working on the "${slug}" promo. Look at its brief and inbox, tell me in a few lines what's there and what's missing or weak (copy, brand, formats, assets), then ask what I'd like to do.`
    : slug
      ? `I want to start a promo for "${slug}". Help me set it up: create the project, then walk me through brand, formats and copy.`
      : "Hi! Briefly list my projects and ask what I'd like to build today (a new brief, brand colours, formats, copy, assets…).";
  return [
    "--append-system-prompt",
    GUIDE() + (known ? projectContext(slug) : `\nExisting projects: ${listProjects().join(", ") || "none"}.`),
    "--name",
    `Promo Studio${slug ? ` · ${slug}` : ""}`,
    // Pre-approved: brief edits + the validating scripts. Everything else asks you first.
    "--allowedTools",
    "Read",
    "Edit(promo-studio/projects/**)",
    "Bash(npm run lint)",
    "Bash(npm run sync)",
    "Bash(npm run frames:*)",
    "Bash(npm run draft:*)",
    "Bash(npm run tools -- palette:*)",
    "--",
    opener,
  ];
};

/** Opens Claude Code in this terminal; returns when the user exits it (/exit or Ctrl+D). */
export const chat = (slug) => {
  const claude = resolveCommand("claude");
  if (!claude) {
    console.log(c.yellow("  Claude Code is not installed. Install: npm install -g @anthropic-ai/claude-code"));
    console.log(c.dim("  Then sign in once by running `claude` and following the prompts."));
    return false;
  }
  const args = chatArgs(slug);
  console.log(c.dim(`  Starting Claude Code${slug ? ` for ${slug}` : ""} — type /exit (or Ctrl+D twice) to come back to the menu.\n`));
  const r = spawnSync(claude.file, [...claude.prefix, ...args], { cwd: ROOT, stdio: "inherit" });
  return r.status === 0;
};

// CLI: npm run chat [-- <slug>]
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = chat(process.argv[2]) ? 0 : 1;
}
