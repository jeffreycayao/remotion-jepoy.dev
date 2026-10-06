# Bug hunt scorecard — 2026-10-05

Scope: everything in `promo-studio/scripts/` (launcher, setup, render, autopilot, AI providers), `tools/promo.py`, and the AppPromo template.
Method: full code read, then a reproduction test for each suspected bug before and after the fix.

## Scores (out of 10)

| Area | Before | After | Notes |
|---|:-:|:-:|---|
| Render pipeline | 6 | 9 | Bad briefs/formats no longer leave broken versions; honest exit status |
| Studio / template | 6 | 7.5 | One bad brief no longer breaks every project; captions now driven by voiceover.json (H5 fixed) |
| Inbox autopilot | 5 | 9 | No takeover of hand-made projects, no folder clashes, no retry loops |
| Asset prep & delivery | 6 | 8.5 | No stale screenshots; unreadable images skipped |
| Security | 8 | 9 | Shell injection and agent permissions fixed earlier today |
| Cross-platform | 8 | 8 | Windows + Linux tested; macOS shares the Linux code path but is untested |
| **Overall** | **6.5** | **8.5** | |

Critical issues found: **0**. High: **6** (5 fixed, 1 needs your decision). Medium: **6** (5 fixed).

## Findings

| ID | Sev. | Area | Problem | Status | How it was verified |
|---|---|---|---|---|---|
| H1 | High | Studio / render | One invalid `brief.json` (bad value, unknown format, or broken JSON) crashed Studio and blocked rendering for **every** project. | **Fixed** — `Root.tsx` skips invalid briefs with a warning; `sync-projects` skips broken JSON; new `scripts/brief-check.mjs` gives render/frames a clear per-project error. | Broken projects next to demo-app: Studio lists all 4 demo-app comps; `render zz-bad` → `✗ props.features: Too small…`; demo-app still renders. |
| H2 | High | Autopilot | An inbox folder whose name matched an existing hand-made project (e.g. "Demo App" → `demo-app`) took it over and would overwrite its brief. Two inbox folders with the same slug overwrote each other. | **Fixed** — refuses unless the project was made by the autopilot or is an untouched "New project"; launcher `w → 3` can still force it. Slug clashes are refused. | "Demo App" refused, demo-app brief unchanged; `npm run new` project correctly claimed; "Fresh One" vs `fresh-one` refused, owner kept. |
| H3 | High | Autopilot | If processing a folder crashed, watch mode retried it every ~20 s forever (could keep spending AI quota). | **Fixed** — crashes are reported and the folder is marked done until its files change; inbox state moved to `.autopilot/inbox.json` so a refused folder never touches another project. | Corrupt brief in watch mode: processed **once** in 14 s, with a clear error. |
| H4 | High | Asset prep | Re-dropping fewer screenshots left old `screen-NN.png` files, so the AI and the video used screenshots that were no longer in the inbox. | **Fixed** — previous set is cleared before writing. | 2 images then 1 image → only `screen-01.png` remains. |
| H5 | High | Template | The demo "Moving Pill Captions" element (added in Studio) sits in the shared AppPromo template with hard-coded sample text. It covers the hook headline and overflows the frame in **every** project (flagged by Visual QA). | **Fixed** — sample text removed; captions now come from each project's `voiceover.json` (timed to the template's scenes, brand-coloured pill, lower third inside the safe area). No voiceover → no captions; `"captions": false` in brief.json turns them off; a voiceover written for a different scene count is ignored with a warning. | 9x16 + 16x9 frames: hook clear, captions under the copy; demo-app (no voiceover) clean. |
| M1 | Medium | Render | `--formats` with no matching format created an empty version folder; a crashed render left a half-written `v###` that "deliver latest" would pick. | **Fixed** — validated before creating folders; failed renders renamed `v###-failed`. | `--formats 2x3` → error, folder count unchanged, exit 1. |
| M2 | Medium | Asset prep | One unreadable image (e.g. iPhone HEIC without a decoder) aborted all screenshot prep. | **Fixed** — skipped with a "convert to PNG/JPG" message. | Fake `.heic` skipped, the rest processed. |
| M3 | Medium | Template | A transition as long as a 1-second scene could swallow the scene (schema allows 30-frame transitions with 1 s scenes). | **Fixed** — transitions capped one frame below the shortest scene (template and QA/voiceover timing agree). | demo-app duration unchanged (525 frames); lint/typecheck pass. |
| M4 | Medium | Render | `--stills` created a real `v###` folder with only thumbnails, which deliver would then treat as the latest version. | **Fixed** — stills go to `_stills/`. | — |
| M5 | Medium | Render | "✓ Done" was printed even when projects failed. | **Fixed** — prints "Finished with errors" and exits 1. | Exit code 1 on bad format. |
| M6 | Medium | Autopilot | Report said "music: yes" even when music prep failed (FFmpeg missing). | **Fixed** — reports the failure and points to Doctor. | — |
| M7 | Medium | Setup | Re-running setup after moving OS runs `npm ci`, which fails on Windows if Studio is still open (files locked). | Open — close Studio before setup. | Reasoned, not reproduced. |
| S1 | High | Security | The new `brief-check.mjs` (run by `npm run draft`/`frames`, which the unattended agent may run) imports `src/…/schema.ts` in Node, and the agent could edit `src/**` — an edit to the schema could run code outside the render browser. | **Fixed** — `schema.ts` added to the agent's edit denylist; CLAUDE.md requires the same for any future Node import from `src`. | Live test: agent denied on `schema.ts`, still allowed on `src/lib/layout.ts`. |
| L1 | Low | Template | CTA can break after a hyphen ("14-" / "day"), flagged by Visual QA. | Open | Visual QA |
| L2 | Low | AI | Claude **API** features (launcher `a → 1–4`) were only tested against a mock server — no API key on this machine. | Open — first real run is the test. | Mock end-to-end |
| L3 | Low | Brief history | Two AI rewrites in the same second would share one history filename. | Open | Reasoned |

## Checked and found OK

- Setup marker survives `npm install` (plugins), so no surprise reinstall.
- No `shell: true` left anywhere; prompts with `"&`, `%PATH%`, `^|` reach tools literally.
- Unattended Claude Code can only edit `projects/**` and `src/**`.
- Autopilot never re-processes an unchanged folder; hand-edited briefs stay protected.
- Lint + TypeScript pass after all fixes.
