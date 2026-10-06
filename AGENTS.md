# AGENTS.md

Instructions for AI coding agents (OpenAI Codex, and others that read AGENTS.md).

**Read `CLAUDE.md` in this folder — it is the canonical guide for this project** (workflow, folder rules,
cross-platform rules, how to create/render/deliver promos). Everything there applies to you too.

Short version:
- Remotion app lives in `promo-studio/`. Each promo's content is `promo-studio/projects/<slug>/brief.json`.
- Never edit or delete anything in `00_INBOX/`, `20_RENDERS/`, `30_DELIVERY/`, `90_ARCHIVE/`.
- File placement: see "Where every file goes" in `CLAUDE.md` — originals are copied into `00_INBOX/<slug>/` first, videos are made only with `npm run draft|render` (→ `20_RENDERS/`), and a bespoke design is a template registered in `promo-studio/src/templates/registry.ts` plus its own project brief (`"template": "<Name>"`), never hard-coded `<Composition>`s in `Root.tsx`.
- Animations are frame-driven (`useCurrentFrame` / `interpolate` / `spring`), never CSS transitions.
- Remotion guidance lives in `.claude/skills/remotion-*/SKILL.md` — read the relevant one before writing Remotion code.
- Verify changes with `cd promo-studio && npm run lint`, and visually with `npm run frames -- <slug> 9x16 60,150,300`
  (stills land in `promo-studio/out/frames/`).
