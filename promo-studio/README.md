# promo-studio

Remotion app. See `../README.md` and `../CLAUDE.md` for the full production workflow and file placement rules.

All active project files live under this folder:

| Path | Purpose |
|---|---|
| `inbox/<slug>/` | Original client media. Copy it here first; never edit originals. |
| `projects/<slug>/brief.json` | Project content and template selection. |
| `public/projects/<slug>/` | Prepared assets loaded by Remotion. |
| `out/frames/` | Preview stills. |
| `out/renders/<slug>/` | Drafts, versioned finals, and visual QA. |
| `out/delivery/<slug>/` | Upload-ready files. |
| `out/archive/` | Finished project ZIPs. |

The four numbered media folders in the workspace root are historical and must remain untouched. `inbox/` and `out/` are Git ignored, so copy them separately after a Git clone when transferring media between machines.

- `npm run dev` — Studio at `http://localhost:3100` (port 3000 is reserved for Licensya PH v2)
- `npm run new -- <slug> "Name"` — new project
- `npm run draft|render -- <slug> [--formats 9x16,1x1]`
- `npm run deliver -- <slug> [--version v002]`
- `npm run tools -- <cmd>` — Python helpers
