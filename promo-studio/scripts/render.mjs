// Production renderer.
//
//   npm run render -- <slug>                       all formats in brief.json → new version folder
//   npm run render -- <slug> --formats 9x16,1x1    only some formats
//   npm run render -- <slug> --draft               half-res quick preview → _drafts/
//   npm run render -- <slug> --stills              thumbnails only
//   npm run render -- --all                        every project
//
// Output: out/renders/<slug>/v###/<slug>_<format>_v###.mp4 (+ thumbs/, brief.snapshot.json, render-log.json)
import { bundle } from "@remotion/bundler";
import {
  renderMedia,
  renderStill,
  selectComposition,
} from "@remotion/renderer";
import fs from "node:fs";
import path from "node:path";
import { checkBrief, placeholderHelp } from "./brief-check.mjs";
import { RENDERS, STUDIO } from "./_platform.mjs";

// ── args ────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const opt = (name) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};
const draft = flag("draft");
const stillsOnly = flag("stills");
const onlyFormats = opt("formats")
  ?.split(",")
  .map((s) => s.trim());

const allSlugs = fs
  .readdirSync(path.join(STUDIO, "projects"), { withFileTypes: true })
  .filter((d) => d.isDirectory() && !d.name.startsWith("_"))
  .map((d) => d.name);

const slugs = flag("all")
  ? allSlugs
  : args.filter((a) => !a.startsWith("--") && a !== opt("formats"));
if (slugs.length === 0) {
  console.log(
    `Usage: npm run render -- <slug> [--formats 16x9,9x16] [--draft] [--stills]\nProjects: ${allSlugs.join(", ")}`,
  );
  process.exit(1);
}

// ── helpers ─────────────────────────────────────────────────────────────
const nextVersionDir = (slug) => {
  const base = path.join(RENDERS, slug);
  if (draft) return { dir: path.join(base, "_drafts"), tag: "draft" };
  // Thumbnails-only runs are not deliverable versions — keep them out of the v### sequence.
  if (stillsOnly) return { dir: path.join(base, "_stills"), tag: "stills" };
  fs.mkdirSync(base, { recursive: true });
  const versionNumbers = (dir) => fs.existsSync(dir)
    ? fs.readdirSync(dir).map((n) => /^v(\d{3})$/.exec(n)?.[1]).filter(Boolean).map(Number)
    : [];
  const nums = versionNumbers(base);
  const tag = `v${String((nums.length ? Math.max(...nums) : 0) + 1).padStart(3, "0")}`;
  return { dir: path.join(base, tag), tag };
};

const bar = (p) =>
  `${"█".repeat(Math.round(p * 24)).padEnd(24, "░")} ${(p * 100).toFixed(0).padStart(3)}%`;

// ── run ─────────────────────────────────────────────────────────────────
console.log("▸ Bundling project…");
const serveUrl = await bundle({
  entryPoint: path.join(STUDIO, "src", "index.ts"),
  publicDir: path.join(STUDIO, "public"),
});

for (const slug of slugs) {
  const briefPath = path.join(STUDIO, "projects", slug, "brief.json");
  // Validate first, so a bad brief or format never leaves an empty version folder behind.
  const check = checkBrief(slug);
  if (!check.ok) {
    console.error(`✗ ${slug}: ${check.error}`);
    process.exitCode = 1;
    continue;
  }
  const brief = check.brief;
  // A final render of starter text is never what anyone wants; a draft is fine but gets a clear warning.
  if (check.placeholders.length) {
    if (!draft && !flag("allow-placeholders")) {
      console.error(`✗ ${placeholderHelp(slug, check.placeholders)}
    (Render anyway with --allow-placeholders.)`);
      process.exitCode = 1;
      continue;
    }
    console.warn(`⚠ ${placeholderHelp(slug, check.placeholders)}`);
  }
  const formats = brief.formats.filter(
    (f) => !onlyFormats || onlyFormats.includes(f),
  );
  if (!formats.length) {
    console.error(
      `✗ ${slug}: none of --formats ${onlyFormats.join(",")} is in this brief (it has ${brief.formats.join(", ")})`,
    );
    process.exitCode = 1;
    continue;
  }
  const { dir, tag } = nextVersionDir(slug);
  fs.mkdirSync(path.join(dir, "thumbs"), { recursive: true });
  fs.copyFileSync(briefPath, path.join(dir, "brief.snapshot.json"));

  console.log(`\n▸ ${slug} → ${path.relative(STUDIO, dir)}`);
  const log = {
    slug,
    version: tag,
    startedAt: new Date().toISOString(),
    draft,
    files: [],
  };

  try {
    for (const fmt of formats) {
      const id = `${brief.compositionIdPrefix ?? slug}-${fmt}`;
      const composition = await selectComposition({
        serveUrl,
        id,
        inputProps: brief.props,
      });
      const name = `${slug}_${fmt}_${tag}`;

      // Poster frame: end of the hook scene (logo + headline fully visible). Bespoke templates
      // have no timing props, so they use a frame 2 s in.
      const hookSeconds = brief.props?.timing?.hookSeconds ?? 2;
      const posterFrame = Math.max(
        0,
        Math.min(composition.durationInFrames - 1, Math.round(hookSeconds * composition.fps) - 10),
      );
      const thumb = path.join(dir, "thumbs", `${name}.jpg`);
      await renderStill({
        serveUrl,
        composition,
        inputProps: brief.props,
        output: thumb,
        frame: posterFrame,
        imageFormat: "jpeg",
        jpegQuality: 92,
      });
      log.files.push(path.relative(dir, thumb));

      if (stillsOnly) {
        console.log(`  ✓ ${fmt} thumbnail`);
        continue;
      }

      const output = path.join(dir, `${name}.mp4`);
      const t0 = Date.now();
      let lastPct = -1;
      await renderMedia({
        serveUrl,
        composition,
        inputProps: brief.props,
        codec: "h264",
        outputLocation: output,
        crf: draft ? 28 : 18,
        scale: draft ? 0.5 : 1,
        pixelFormat: "yuv420p",
        audioCodec: "aac",
        onProgress: ({ progress }) => {
          const pct = Math.floor(progress * 20) * 5; // redraw every 5% — keeps piped logs readable
          if (pct === lastPct) return;
          lastPct = pct;
          process.stdout.write(
            process.stdout.isTTY
              ? `\r  ${fmt.padEnd(5)} ${bar(progress)}`
              : `  ${fmt} ${pct}%\n`,
          );
        },
      });
      process.stdout.write(
        `\r  ✓ ${fmt.padEnd(5)} ${((Date.now() - t0) / 1000).toFixed(1)}s  ${path.basename(output)}\n`,
      );
      log.files.push(path.basename(output));
    }
  } catch (err) {
    // Mark the version as failed so "deliver" (latest version) never picks up a half-rendered folder.
    console.error(`
✗ ${slug}: render failed — ${err.message}`);
    process.exitCode = 1;
    if (!draft) {
      fs.renameSync(dir, `${dir}-failed`);
      console.error(
        `  Partial output kept in ${path.relative(STUDIO, dir)}-failed`,
      );
    }
    continue;
  }

  log.finishedAt = new Date().toISOString();
  fs.writeFileSync(
    path.join(dir, "render-log.json"),
    JSON.stringify(log, null, 2),
  );
}

if (process.exitCode) {
  console.log(`\n✗ Finished with errors — see the ✗ lines above.`);
} else if (stillsOnly) {
  console.log(`\n✓ Done. Thumbnails are in out/renders/<slug>/_stills/.`);
} else if (draft) {
  console.log(`\n✓ Done. Drafts are in out/renders/<slug>/_drafts/.`);
} else {
  console.log(`\n✓ Done. Renders are in out/renders/. Next: "npm run deliver -- <slug>" to make platform-ready files.`);
}
