// Render a few still frames for a quick visual check (used by people and by AI agents).
//   npm run frames -- <slug> [format=9x16] [frames=60,150,300]
// Output: promo-studio/out/frames/<slug>-<format>/frame-<n>.jpg
// Arguments are validated so this can be safely allow-listed for unattended agents.
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import fs from "node:fs";
import path from "node:path";
import { checkBrief } from "./brief-check.mjs";
import { c, listProjects, STUDIO } from "./_platform.mjs";

const [slug, format = "9x16", framesArg = "60,150,300"] = process.argv.slice(2);
const FORMATS = ["16x9", "9x16", "1x1", "4x5"];

if (!slug || !listProjects().includes(slug) || !FORMATS.includes(format) || !/^\d+(,\d+){0,11}$/.test(framesArg)) {
  console.log(`Usage: npm run frames -- <slug> [${FORMATS.join("|")}] [comma-separated frame numbers, max 12]`);
  console.log(`Projects: ${listProjects().join(", ")}`);
  process.exit(1);
}

const check = checkBrief(slug);
if (!check.ok || !check.brief.formats.includes(format)) {
  console.log(c.red(`  ✗ ${slug}: ${check.ok ? `format ${format} is not in this brief (${check.brief.formats.join(", ")})` : check.error}`));
  process.exit(1);
}
const brief = check.brief;
const outDir = path.join(STUDIO, "out", "frames", `${slug}-${format}`);
fs.mkdirSync(outDir, { recursive: true });

const serveUrl = await bundle({ entryPoint: path.join(STUDIO, "src", "index.ts") });
const composition = await selectComposition({ serveUrl, id: `${slug}-${format}`, inputProps: brief.props });
for (const n of framesArg.split(",").map(Number)) {
  const frame = Math.min(n, composition.durationInFrames - 1);
  const output = path.join(outDir, `frame-${frame}.jpg`);
  await renderStill({ serveUrl, composition, inputProps: brief.props, output, frame, imageFormat: "jpeg", jpegQuality: 85, scale: 0.5 });
  console.log(c.green(`  ✓ ${path.relative(STUDIO, output)}`));
}
