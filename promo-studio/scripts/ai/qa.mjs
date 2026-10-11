// AI visual QA: renders a still from the middle of every scene in every format, then has the AI
// review them like a senior motion designer would before a client delivery.
//   npm run ai -- qa <slug> [--formats 9x16,1x1]
// Output: out/renders/<slug>/_qa/<timestamp>/  (frames + report.md)
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import { c, chooseRendererPort, RENDERS, STUDIO } from "../_platform.mjs";
import { imageBlock, readBrief, sceneList, structured, textBlock } from "./core.mjs";

export const qaSchema = z.object({
  score: z.number().describe("Overall delivery-readiness from 1 (unusable) to 10 (ship it)"),
  verdict: z.string().describe('Exactly "ship" or "fix-first"'),
  issues: z.array(
    z.object({
      severity: z.string().describe('Exactly "high", "medium" or "low"'),
      format: z.string().describe("Format key, or 'all'"),
      scene: z.string().describe("Scene key, or 'all'"),
      problem: z.string(),
      fix: z.string().describe("Concrete change: which brief.json field to edit and how, or what to change in the template"),
    }),
  ),
  strengths: z.array(z.string()).describe("2-4 things that work well"),
});

export const QA_SYSTEM = `You are a senior motion designer doing final QA on an app-promo video before it goes to a client and onto social platforms. You are shown one still frame from the middle of each scene, in each delivery format.

Check for: text that is cut off, overflowing, overlapping or too small to read on a phone; poor contrast; layouts that feel cramped or unbalanced; content inside the platform UI danger zones on vertical (9x16) video (roughly the top 12% and bottom 18%); screenshots that look blurry, stretched or irrelevant to the feature text; typos and awkward copy; inconsistent branding between scenes.

Be specific and practical. Rank by severity: "high" means it must be fixed before delivery. Do not report the soft drifting color blobs in the background as an issue — they are intentional. If everything is fine, say so with few or no issues.`;

/** Renders one still per scene × format (after entrances settle). Returns the folder and labelled frames. */
export const renderQaFrames = async (slug, brief, formats) => {
  const fmts = brief.formats.filter((f) => !formats || formats.includes(f));
  const scenes = sceneList(brief.props);
  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const outDir = path.join(RENDERS, slug, "_qa", stamp);
  fs.mkdirSync(outDir, { recursive: true });

  console.log(c.dim(`  Rendering ${fmts.length * scenes.length} QA frames…`));
  const serveUrl = await bundle({ entryPoint: path.join(STUDIO, "src", "index.ts"), publicDir: path.join(STUDIO, "public") });
  const port = await chooseRendererPort();
  const frames = [];
  for (const fmt of fmts) {
    const composition = await selectComposition({ serveUrl, id: `${brief.compositionIdPrefix ?? slug}-${fmt}`, inputProps: brief.props, port });
    for (const s of scenes) {
      const frame = Math.min(composition.durationInFrames - 1, s.start + Math.round(s.frames * 0.7));
      const file = path.join(outDir, `${fmt}_${s.key}.jpg`);
      await renderStill({ serveUrl, composition, inputProps: brief.props, output: file, frame, imageFormat: "jpeg", jpegQuality: 85, scale: 0.5, port });
      frames.push({ file, label: `Format ${fmt}, scene "${s.key}" (frame ${frame})` });
    }
    process.stdout.write(c.dim(`    ✓ ${fmt}\n`));
  }
  return { outDir, frames };
};

export const qaReferenceText = (brief) =>
  [
    `Brief copy for reference:\n${JSON.stringify({ hook: brief.props.hook, features: brief.props.features.map((f) => ({ title: f.title, description: f.description })), cta: brief.props.cta }, null, 2)}`,
    // Keeps suggested fixes actionable: the model must not invent brief fields.
    "brief.json has ONLY these editable fields: appName, tagline, logo, brand.primary/secondary/background/text/font, hook.headline/subheadline, features[].title/description/icon/screenshot, stats[].value/prefix/suffix/label, cta.headline/button/url, audio.music/volume, timing.hookSeconds/featureSeconds/statsSeconds/ctaSeconds/transitionFrames. If a fix needs anything else, say it is a template change and name the scene (HookScene, FeatureScene, StatsScene, CtaScene) or component.",
    "Review these frames.",
  ].join("\n\n");

/** Normalises the answer, prints it, writes report.md next to the frames. */
export const writeQa = (brief, qa, outDir) => {
  qa.verdict = /ship/i.test(qa.verdict) && !/fix/i.test(qa.verdict) ? "ship" : "fix-first";
  for (const i of qa.issues) i.severity = ["high", "medium", "low"].find((s) => String(i.severity).toLowerCase().includes(s)) ?? "medium";
  const order = { high: 0, medium: 1, low: 2 };
  qa.issues.sort((a, b) => order[a.severity] - order[b.severity]);
  const color = { high: c.red, medium: c.yellow, low: c.dim };
  console.log(`\n  Score ${c.bold(`${qa.score}/10`)} — ${qa.verdict === "ship" ? c.green("ready to ship") : c.yellow("fix first")}`);
  for (const i of qa.issues) {
    console.log(`  ${color[i.severity](i.severity.toUpperCase().padEnd(6))} ${c.dim(`[${i.format} · ${i.scene}]`)} ${i.problem}\n         ${c.dim("→ " + i.fix)}`);
  }
  if (!qa.issues.length) console.log(c.green("  No issues found."));

  const md = [
    `# Visual QA — ${brief.props.appName}`,
    "",
    `**Score:** ${qa.score}/10 · **Verdict:** ${qa.verdict} · ${new Date().toLocaleString()}`,
    "",
    "## Issues",
    ...(qa.issues.length ? qa.issues.map((i) => `- **${i.severity}** [${i.format} · ${i.scene}] ${i.problem}\n  - Fix: ${i.fix}`) : ["None."]),
    "",
    "## Strengths",
    ...qa.strengths.map((s) => `- ${s}`),
    "",
    "Frames reviewed are in this folder.",
  ];
  fs.writeFileSync(path.join(outDir, "report.md"), md.join("\n") + "\n");
  console.log(c.green(`\n  ✓ Report: ${path.relative(STUDIO, path.join(outDir, "report.md"))}`));
  return qa;
};

/** Claude API version (launcher a → 4). */
export const visualQa = async (slug, { formats } = {}) => {
  const brief = readBrief(slug);
  const { outDir, frames } = await renderQaFrames(slug, brief, formats);
  const content = frames.flatMap((f) => [textBlock(`${f.label}:`), imageBlock(f.file)]);
  content.push(textBlock(qaReferenceText(brief)));
  const qa = await structured({ label: "Visual QA", slug, system: QA_SYSTEM, content, schema: qaSchema });
  return { ...writeQa(brief, qa, outDir), outDir };
};
