# AGENTS.md

Instructions for AI coding agents (OpenAI Codex, and others that read AGENTS.md).

**Read `CLAUDE.md` in this folder — it is the canonical guide for this project** (workflow, folder rules,
cross-platform rules, how to create/render/deliver promos). Everything there applies to you too.

Short version:
- Remotion app lives in `promo-studio/`. Every promo has `promo-studio/projects/<slug>/brief.json` for template, formats, and props; bespoke templates may also keep copy in `promo-studio/src/templates/<Name>/`.
- Keep original media in `promo-studio/inbox/<slug>/` and never edit it. Do not edit or delete the historical workspace-root `00_INBOX/`, `20_RENDERS/`, `30_DELIVERY/`, or `90_ARCHIVE/` folders.
- File placement: see "Where every file goes" in `CLAUDE.md` — videos are made only with `npm run draft|render` (→ `promo-studio/out/renders/<slug>/`), delivery goes to `promo-studio/out/delivery/`, and archives go to `promo-studio/out/archive/`. A bespoke design is a template registered in `promo-studio/src/templates/registry.ts` plus its own project brief (`"template": "<Name>"`), never hard-coded `<Composition>`s in `Root.tsx`.
- Animations are frame-driven (`useCurrentFrame` / `interpolate` / `spring`), never CSS transitions.
- Remotion guidance lives in `.claude/skills/remotion-*/SKILL.md` — read the relevant one before writing Remotion code.
- Verify changes with `cd promo-studio && npm run lint`, and visually with `npm run frames -- <slug> 9x16 60,150,300`
  (stills land in `promo-studio/out/frames/`).
