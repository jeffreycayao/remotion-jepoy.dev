# Remotion-with-jepoy.dev

**Promo Studio** — App promo video factory built on [Remotion](https://remotion.dev). One brief → every social format, versioned renders, platform-ready deliveries.

## Start (Windows · macOS · Linux)

| | Windows | macOS | Linux |
|---|---|---|---|
| **Setup** (once per machine) | double-click `SETUP.bat` | `bash setup.sh` | `bash setup.sh` |
| **Launcher** | double-click `PROMO STUDIO.bat` | double-click `Promo Studio.command` or `./promo-studio.sh` | `./promo-studio.sh` |
| **Or, anywhere** | `cd promo-studio && npm start` | same | same |

Only requirement before setup: **Node.js 22.18+** (`winget install OpenJS.NodeJS.LTS` / `brew install node` / nodejs.org).
Setup then installs everything else and tells you the exact command for anything it can't install itself
(Python 3.9+, FFmpeg — both optional, only needed for the prep/deliver helpers; Linux may need Chrome libraries, which setup lists).
Node 22 is the recommended runtime for the full plugin catalog: the pinned Cloud Run dependency
`cloudevents@8.0.3` declares support only through Node 22. Local installation and rendering also passed on Node 24,
but cloud provider integrations have not been exercised there.

**Cloning on Windows:** use `git clone -c core.longpaths=true <repo-url>` (some bundled Remotion skill files have long paths).

**Moving the folder between computers/OSes:** copy the entire folder, including `promo-studio/inbox/` and
`promo-studio/out/`, then run setup again. It detects that `node_modules` and the Python venv were built for
another OS and rebuilds them (native binaries differ per OS), and restores the executable bit on the `.sh` /
`.command` files. A Git clone brings only tracked files; commit any project briefs and prepared assets you need,
then copy ignored originals, renders, deliveries, and archives separately. The full plugin installer has been
verified on Windows 11; the earlier core setup was tested on Debian 12 (Docker). macOS uses the same Node/bash
code path but still needs a clean-machine check with this full plugin catalog.

The launcher also takes direct commands, handy for scripts:
`./promo-studio.sh render <slug>` · `draft <slug> --formats 9x16` · `deliver <slug>` · `studio` · `doctor` · `setup`

All the logic lives in `promo-studio/scripts/launcher.mjs` and `setup.mjs`; the `.bat` / `.sh` / `.command` files are 3-line wrappers.

## Studio as an app window

Menu **1** (or `./promo-studio.sh studio`, `npm run app`) opens Remotion Studio in a chromeless window — no tabs or address
bar, its own taskbar/Dock entry — using Edge, Chrome, Brave or Chromium in "app mode" with a dedicated profile
(`promo-studio/.app-profile`, keeps window size and Studio settings). **Closing the window stops Studio** and returns
to the menu. If Studio was already running, the window attaches to it and leaves it running.

- Menu **b** opens Studio in a normal browser tab instead (stop with Ctrl+C).
- Menu **d** creates a desktop shortcut (Windows `.lnk` with icon, macOS `.command`, Linux `.desktop` entry) that opens straight into the app window.
- No Chromium browser installed → falls back to your default browser. Pick a specific one with `PROMO_BROWSER=/path/to/browser`.

## Autopilot (launcher → w)

Drop a folder per app into `promo-studio/inbox/` (screenshots in feature order, a file with "logo" in its name, optional music and `notes.txt`). The autopilot waits until copying finishes, then runs pre-production on its own:

**assets → logo colors → AI brief → hook variants → voiceover → vertical draft render → AI visual QA → `projects/<app>/autopilot-report.md`**

| | |
|---|---|
| AI used | Your subscriptions, in order: **Claude Code → Codex (ChatGPT) → GLM via opencode (Z.ai Coding Plan)**. If one fails, times out or returns bad output, the next takes over. GLM is text-only, so it never does Visual QA; for the brief it works from notes, file names and the measured logo colors. |
| Safety | Every AI run is read-only: Claude Code gets only its Read tool (no settings, plugins or MCP servers), Codex runs in its read-only sandbox, opencode runs the plan agent with edits/shell/web denied and your MCP servers disabled. Answers must pass the template schema before anything is saved. |
| Your edits win | If you edit a brief by hand, later runs leave it alone (they still refresh assets, hooks and voiceover). Launcher → w → 3 re-runs a folder and replaces it. |
| Settings | `promo-studio/autopilot.config.json`: provider order and models, which steps run, draft formats, how long to wait for copies to finish. |
| Commands | `npm run autopilot` (watch) · `npm run autopilot -- --once` · `npm run autopilot -- "Fit Tracker" --force` |

Typical run: about 2–3 minutes per app with all steps on.

## Chat with Claude (launcher → c)

Opens Claude Code right in the launcher window, already briefed on this studio: the brief schema, the 4 formats and
their pixel sizes, brand rules and how to preview. Pick a project (or **n** for a new app) and just talk:
*"write the brief from my screenshots"*, *"take the brand colours from the logo"*, *"make it vertical only"*, *"shorten the headline"*.

- Uses your Claude subscription (no API key). Type `/exit` to return to the menu.
- Pre-approved: reading files, editing briefs (`projects/**`), `lint`, `sync`, `frames`, `draft` and `palette`. Anything else asks you first.
- Also: `npm run chat` or `npm run chat -- <slug>`. Code: `promo-studio/scripts/ai/chat.mjs`.

## AI (launcher → a)

| Feature | Command | Runs on | Output |
|---|---|---|---|
| **Auto-brief** | `npm run ai -- brief <slug> [--url URL] [--notes "…"] [--dry-run]` | Claude API | `brief.json` written from inbox screenshots, logo, `notes.txt` and (optionally) the app's website. Old version kept in `projects/<slug>/history/`. |
| **Hook variants** | `npm run ai -- hooks <slug> [--count 5] [--create]` | Claude API | `hooks.md`; with `--create`, one renderable project per variant (`<slug>-hook-1…`, vertical by default) |
| **Voiceover script** | `npm run ai -- voiceover <slug> [--tone "…"]` | Claude API | `voiceover.md` / `.json`, one line per scene within its word budget (≈2.5 words/s) |
| **Visual QA** | `npm run ai -- qa <slug> [--formats 9x16]` | Claude API | Renders every scene × format, reviews them; `promo-studio/out/renders/<slug>/_qa/<time>/report.md` |
| **Ask Claude Code** | `npm run ai -- ask "change …"` | Your Claude plan | Claude Code edits the project (reads `CLAUDE.md` + skills) |
| **Ask Codex** | `npm run ai -- ask "change …" --codex` | Your ChatGPT plan | OpenAI Codex edits the project (reads `AGENTS.md`) |

- **API key:** launcher → a → k (saved to `promo-studio/.env`, git-ignored), or set `ANTHROPIC_API_KEY`. Keys: console.anthropic.com.
- **Model:** Claude Opus 5.5 at effort `high` by default. Override with `PROMO_AI_MODEL=claude-sonnet-5-5` (about half the price) and/or `PROMO_AI_EFFORT=medium`.
- **Cost:** each call prints its token count and estimated $ and appends it to `projects/<slug>/ai-log.jsonl`. Typical: $0.05–0.30 per call (QA with 4 formats is the largest).
- **Safety rails:** Claude only writes copy/colors/font/screenshot choices — timing, formats, audio and logo stay yours; everything is validated by the template's own schema before saving; it is told never to invent stats or claims (it explains its assumptions under "Check before rendering").

## Updates (launcher → u)

The home screen shows when a newer Remotion is out (checked in the background, cached 12 h). Press **u** to see installed vs latest and upgrade safely:

1. **Backup** `package.json` + `package-lock.json` → `promo-studio/.cache/upgrade-backups/`
2. **Upgrade** every `@remotion/*` package together with Remotion's own upgrader (never mix versions)
3. **Health checks**: one version everywhere · TypeScript + lint · briefs vs schema · every format renders · Studio starts and the app window finds it · rendering browser
4. **Rollback** automatically (restore + clean reinstall) if any check fails

Close Studio first — Windows can't replace files Studio has open (the upgrade refuses to start while it runs).

```
npm run updates                      # installed vs latest
npm run updates -- verify            # health checks only
npm run updates -- upgrade [--to 4.0.540]
npm run updates -- skills            # refresh Remotion agent skills from GitHub
```

## Plugins (Remotion packages)

The catalog lives in `promo-studio/plugins.json`. Setup installs **all eight supported groups** from the lockfile,
including the packages used by AI, 3D, cloud rendering, styling, integrations, and extra codecs. The Remotion packages
are pinned to one version; their required peer packages are also in `package-lock.json`. Re-run setup after pulling a
lockfile change. Cloud services, API features, and local transcription still need their own credentials or model files
when you use them. Tailwind and SCSS are installed but must be enabled in the Remotion bundler configuration before use.

```
npm run plugins -- list                          # everything, with ● installed / ○ available
npm run plugins -- verify                        # check all catalog packages against the install
npm run plugins -- ensure                        # repair missing catalog packages
npm run plugins -- install <package>            # add a future single package
npm run plugins -- remove @remotion/gsap
```

| Group | Installed by setup | Contents |
|---|---|---|
| `core` | ✓ | renderer, bundler, transitions, google-fonts, media, zod-types, layout-utils, captions |
| `production` | ✓ | animation-utils, fonts, gif, lottie, paths, shapes, noise, motion-blur, media-utils, preload, media-parser, light-leaks, effects, sfx, rough-notation, starburst, mac-cursors, rounded-text-box, animated-emoji, studio, mediabunny |
| `captions-ai` | ✓ | install-whisper-cpp, whisper-webgpu, whisper-web, transformers, openai-whisper, elevenlabs, video-matting |
| `motion-engines` | ✓ | gsap, rive, three, skia |
| `styling` | ✓ | tailwind-v4, enable-scss (enable in the bundler config before use) |
| `cloud-render` | ✓ | lambda, cloudrun, vercel (need cloud accounts) |
| `integration` | ✓ | player, webcodecs, mcp, studio-protocol, licensing |
| `codecs` | ✓ | @mediabunny/prores, ac3, dts (client footage formats) |

Not offered: `@remotion/zod-types-v3` (this project uses Zod 4) and `@remotion/tailwind` (v3 — use `tailwind-v4`).

## Folder map

| Folder | Stage | What goes here |
|---|---|---|
| `promo-studio/inbox/<slug>/` | 1 · Intake | Raw client material: screenshots, logos, music, notes. Never edited. |
| `promo-studio/projects/<slug>/brief.json` | 2 · Brief | **Source of truth**: copy, colors, font, features, stats, CTA, timing, formats. |
| `promo-studio/public/projects/<slug>/` | 2 · Assets | Prepared assets the video uses (`screens/`, `audio/`, `logo.*`). |
| `promo-studio/out/frames/` | 2 · Preview | Scratch stills from `npm run frames`. |
| `promo-studio/out/renders/<slug>/v###/` | 3 · Render | Auto-versioned masters + thumbnails + `brief.snapshot.json` (exact props used). `_drafts/` for quick previews; `_qa/` for visual QA; `_legacy/` for renders made before the pipeline existed. |
| `promo-studio/out/delivery/<slug>/v###_<date>/` | 4 · Deliver | Platform-ready MP4s (-14 LUFS, faststart), GIF previews, contact sheet, `manifest.json`. |
| `promo-studio/out/archive/` | 5 · Archive | Zipped project material (originals + brief + assets + renders + deliveries); use the full workspace to run the app. |
| `tools/` | — | Python helpers (`promo.py`) + venv. |
| `.claude/skills/` | — | Remotion agent skills from `github.com/remotion-dev/skills` (pinned in `skills-lock.json`). |

Everything lives under `promo-studio/`: there are no media folders at the workspace root. (The old `00_INBOX/`, `20_RENDERS/`,
`30_DELIVERY/` and `90_ARCHIVE/` folders were merged into `promo-studio/` and removed.) Files in `_legacy/` are never
picked up by `deliver` or the version counter, which only look at `v###` folders.

**Never render with `npx remotion render` directly.** It drops loose files into `promo-studio/out/`. Use `npm run draft` / `npm run render`.

## Workflow

```
1. New project      npm run new -- fit-tracker "Fit Tracker"      (creates brief + inbox folder)
2. Drop files       promo-studio/inbox/fit-tracker/   (screenshots in feature order, logo, music)
3. Prep assets      npm run tools -- prep-screens fit-tracker --apply
                    npm run tools -- prep-logo  fit-tracker <file> --apply
                    npm run tools -- prep-audio fit-tracker <file> --apply
4. Write the brief  promo-studio/projects/fit-tracker/brief.json
5. Preview          npm run dev  → http://localhost:3100  → Projects/fit-tracker
6. Draft            npm run draft -- fit-tracker             (half-res, → out/renders/fit-tracker/_drafts/)
7. Final            npm run render -- fit-tracker            (→ out/renders/fit-tracker/v001, v002, …)
8. Deliver          npm run deliver -- fit-tracker           (latest version → out/delivery/fit-tracker/)
9. Archive          npm run tools -- archive fit-tracker
```

(Run `npm` commands from `promo-studio/`. The `.bat` menu does all of this for you.)

A new project starts with **[placeholder]** text (no fake stats). Drafts and previews warn while any is left, and final renders refuse until it's filled — by chat (**c**), the autopilot (**w**), the AI brief (**a → 1**) or by hand.

## Formats

| Key | Size | Use |
|---|---|---|
| `16x9` | 1920×1080 | YouTube, website, LinkedIn |
| `9x16` | 1080×1920 | Reels, TikTok, Shorts, Stories (safe zones applied) |
| `1x1` | 1080×1080 | Feed posts |
| `4x5` | 1080×1350 | Instagram/Facebook feed ads |

Pick per project via `"formats"` in the brief, or per render: `npm run render -- <slug> --formats 9x16,1x1`.

## The AppPromo template

Hook (logo + headline) → 1–6 feature scenes (phone mockup + copy) → optional stats (count-up) → CTA.
Length is computed from `timing`. **Captions:** once a project has a `voiceover.json` (AI voiceover / autopilot), its lines appear as moving-pill captions in the brand colour; add `"captions": false` next to `"formats"` in brief.json to hide them. No screenshot? A branded placeholder UI is drawn. No logo? A monogram is drawn.
Fonts: Inter, Poppins, Montserrat, Space Grotesk, DM Sans, Plus Jakarta Sans (add more in `src/lib/fonts.ts`).

## Python helpers — `npm run tools -- <cmd>`

`doctor` · `prep-screens` · `prep-logo` · `prep-audio` · `deliver` · `gif` · `contact-sheet` · `probe` · `archive`

## Licensing

Remotion is free for individuals and companies of up to 3 people; larger companies need a license — see remotion.pro/license.
