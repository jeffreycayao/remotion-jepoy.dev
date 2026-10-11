# Promo Studio — instructions for Claude

Remotion-based factory for app promo videos. Read `README.md` for the folder map. Remotion skills are in `.claude/skills/` (load `remotion-best-practices` before writing Remotion markup).

## Where every file goes (paths from the workspace root — this file's folder)

| What | Where | How |
|---|---|---|
| Original files from the user (screenshots, logo, music, voiceover, notes) | `promo-studio/inbox/<slug>/` | **Copy them here first**, even when the user gives a path elsewhere. Never edit them. |
| Prepared assets the video loads | `promo-studio/public/projects/<slug>/` | Remotion can only load files from `public/`. Use the prep tools (`npm run tools -- prep-*`), which copy from the inbox. |
| Brief (content + `"template"`) | `promo-studio/projects/<slug>/brief.json` | Every video is a project, including bespoke designs (see below). |
| Preview stills | `promo-studio/out/frames/` | `npm run frames` only — scratch, not deliverables. |
| Videos (drafts, finals) and visual QA | `promo-studio/out/renders/<slug>/` | **Only** `npm run draft` / `npm run render` for videos. Never `npx remotion render`/`still` directly. |
| Platform-ready files | `promo-studio/out/delivery/<slug>/` | Only `npm run deliver`. |
| Zipped projects | `promo-studio/out/archive/` | Only `npm run tools -- archive`. |

Everything lives under `promo-studio/`. The old workspace-root `00_INBOX/`, `20_RENDERS/`, `30_DELIVERY/`, and `90_ARCHIVE/` folders were merged into it and removed — never recreate them. Pre-pipeline renders are kept in `promo-studio/out/renders/<slug>/_legacy/`.
Studio uses port 3100. Check its owner before restarting Studio, and never start this project on port 3000, which is reserved for Licensya PH v2.

**Bespoke designs** (a one-off look the AppPromo brief can't express): build it in `promo-studio/src/templates/<Name>/` (export the component and its length in frames), register it in `promo-studio/src/templates/registry.ts`, then create a project for it — `promo-studio/projects/<app>-<piece>/brief.json` with `{"template": "<Name>", "formats": ["16x9", "9x16"], "props": {}}` — and render it with `npm run draft|render -- <app>-<piece>`. Never add hard-coded `<Composition>`s to `Root.tsx`: they can't be rendered, versioned or delivered. The AI brief tools only work on AppPromo projects.

## When asked to "make a promo for <app>"

1. `cd promo-studio && npm run new -- <slug> "<App Name>"` (slug = kebab-case).
2. Use files in `promo-studio/inbox/<slug>/` if present: `npm run tools -- prep-screens <slug> --apply`, `prep-logo`, `prep-audio`.
3. Fill `projects/<slug>/brief.json` → `props` (schema: `src/templates/AppPromo/schema.ts`). Pick brand colors from the logo/screenshots; write punchy copy (headline ≤ 6 words, feature descriptions ≤ 12 words). A new brief is full of `[bracketed]` placeholders — replace every one (final renders refuse briefs that still have any). Ask the user for anything you can't find (real stats, URL, brand colours) instead of inventing it.
4. Verify visually: `npm run frames -- <slug> 9x16 60,150,300` (stills land in `promo-studio/out/frames/`).
5. Only run `npm run render` / `npm run deliver` when the user asks for final output.

Shortcut when an API key is configured: `npm run ai -- brief <slug>` drafts the whole brief from the inbox, then review it and `npm run ai -- qa <slug>`.

## AI features (code in `promo-studio/scripts/ai/`)

- `core.mjs` — Anthropic client, structured calls (`beta.messages.parse` + `betaZodOutputFormat`, `fallbacks: "default"`), refusal/pause handling, cost log. Model via `PROMO_AI_MODEL` (default `claude-opus-5-5`).
- The SDK sends Zod enums only as description hints, so use `z.string()` + normalisation for choice fields.
- AI output must pass `appPromoSchema` (imported from `src/templates/AppPromo/schema.ts`) before it is written. Keep it that way.
- `agents.mjs` — headless Claude Code / Codex for "ask". `AGENTS.md` mirrors these instructions for Codex.
  The unattended Claude Code run uses `--permission-mode default` with an edit ALLOWLIST (`promo-studio/projects/**`, `promo-studio/src/**`) — every other edit is refused because a headless run can't approve it — plus a deny list for the riskiest files as a second layer. `src/**` stays editable because templates only run inside the render browser — but any `src` file that Node imports (today only `src/templates/AppPromo/schema.ts`, via `scripts/brief-check.mjs` and `scripts/ai/brief.mjs`) must be in `--disallowedTools`; if you add another Node import from `src`, add it there too. Its Bash allowlist is only protected npm scripts that validate their args (`lint`, `sync`, `draft`, `frames`); never add `node:*`, `npm run:*`, raw `npx remotion`, or edit access to configs/scripts/`.claude`. Codex runs in its `workspace-write` sandbox.

## Chat (`scripts/ai/chat.mjs`, launcher → c)

Interactive Claude Code started in the launcher terminal with `--append-system-prompt` (studio guide + focused project's brief/inbox/assets; formats are parsed from `src/lib/layout.ts`). The user is present, so it uses normal permission prompts; the pre-approved list stays read/brief edits/validating scripts only — don't widen it.

## Inbox autopilot (`scripts/autopilot.mjs`, `scripts/ai/providers.mjs`)

- Watches `promo-studio/inbox/<folder>/`; slug = kebab-case of the folder name; state in `projects/<slug>/autopilot.json` (inbox fingerprint + brief hash used to protect hand edits).
- Providers are the user's subscription CLIs, tried in `autopilot.config.json` order (default claude → codex → opencode/GLM). Keep every provider run read-only (see the runner comments) and keep validating answers with the Zod schemas before writing.
- Codex gets images via `-i` without names, so the prompt lists their order; GLM (`vision: false`) never receives vision-only tasks.
- Brief/hooks/voiceover/QA prompts and schemas are shared with the Claude API path (`scripts/ai/*.mjs` exports) — change them in one place.

## Rules

- Every project has a `brief.json` for its template, formats, and props. AppPromo copy lives in its brief; bespoke templates can also contain project-specific copy in `src/templates/<Name>/`. Never hand-edit `src/projects.generated.ts` (run `npm run sync`).
- Never overwrite or delete anything in `promo-studio/out/renders/`, `promo-studio/out/delivery/`, or `promo-studio/out/archive/` by hand — renders are auto-versioned.
- `promo-studio/inbox/` is read-only raw material. Original media never goes in `projects/<slug>/` (briefs and notes only).
- Template changes affect every project. For a one-off look, add a bespoke template (see "Where every file goes") rather than forking AppPromo with conditionals.
- Animations must be frame-driven (`useCurrentFrame`, `interpolate`, `spring`) — never CSS transitions/animations.
- Upgrade Remotion only with `npm run updates -- upgrade` (backup → `remotion upgrade --skip-skills` → health checks → rollback). **Never run `npx remotion upgrade --help` to read flags — it ignores `--help` and performs the upgrade.** Read flags from `node_modules/@remotion/cli/dist/` instead. After any dependency change run `npm run updates -- verify`.
- Install `@remotion/*` packages with `npm run plugins -- install <pkg|group>` (wraps `npx remotion add`, version-pinned). New packages worth keeping go into `plugins.json` so other machines get them; production-pack items are auto-installed by setup.
- Studio app window logic: `scripts/app-window.mjs` (dedicated Chromium profile; window lifetime is tracked by profile so wrapper/hand-off launches work).
- Python helpers: `tools/promo.py` (run via `npm run tools -- …` which uses `tools/.venv`).
- Must stay cross-platform (Windows/macOS/Linux): put logic in Node (`scripts/*.mjs`, shared helpers in `scripts/_platform.mjs`) or Python, never in `.bat`/`.sh` wrappers. Use `path.join`, no shell-specific syntax in npm scripts. Keep `.sh`/`.command` LF and `.bat` CRLF (see `.gitattributes`).
