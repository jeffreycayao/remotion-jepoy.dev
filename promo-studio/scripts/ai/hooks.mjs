// AI hook variants for A/B testing ads.
//   npm run ai -- hooks <slug> [--count 5] [--create] [--formats 9x16]
// Always writes projects/<slug>/hooks.md. With --create, also makes one project per variant
// (<slug>-hook-1, -2, …) that reuses the original's assets, ready for a draft render.
import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import { c, run, STUDIO } from "../_platform.mjs";
import { inboxNotes, readBrief, structured, textBlock } from "./core.mjs";

export const hooksSchema = z.object({
  variants: z.array(
    z.object({
      angle: z.string().describe("Short name of the psychological angle, e.g. 'pain point', 'outcome', 'curiosity'"),
      headline: z.string().describe("Max 6 words"),
      subheadline: z.string().describe("Max 8 words"),
      rationale: z.string().describe("One sentence: who this angle should win with and why"),
    }),
  ),
});

export const HOOKS_SYSTEM = `You write opening hooks for short app-promo video ads. The hook is the first 3 seconds: a headline (max 6 words) and subheadline (max 8 words) shown over the app logo, with the sound off.

Produce genuinely different angles so an A/B test teaches something — for example: pain point, desired outcome, curiosity gap, speed/effort, identity ("for people who…"), contrast with the old way, and social proof (only if the brief contains real stats). Do not write near-duplicates. Never invent numbers or claims that are not in the brief or sources.`;

/** Task text shared by the Claude API path and the inbox autopilot. */
export const hooksTask = (brief, notes, count) => {
  const p = brief.props;
  const summary = {
    appName: p.appName,
    tagline: p.tagline,
    currentHook: p.hook,
    features: p.features.map((f) => `${f.title}: ${f.description}`),
    stats: p.stats.map((s) => `${s.prefix}${s.value}${s.suffix} ${s.label}`),
    cta: p.cta,
  };
  return [`Brief:\n${JSON.stringify(summary, null, 2)}`, notes ? `Sources:\n${notes}` : "", `Write ${count} hook variants, each with a different angle.`]
    .filter(Boolean)
    .join("\n\n");
};

/** Writes projects/<slug>/hooks.md and prints the variants. */
export const writeHooks = (slug, brief, variants) => {
  const p = brief.props;
  const lines = [`# Hook variants — ${p.appName}`, "", `Generated ${new Date().toLocaleString()}. Current hook: **${p.hook.headline}** / ${p.hook.subheadline}`, ""];
  variants.forEach((v, i) => {
    lines.push(`## ${i + 1}. ${v.angle}`, `**${v.headline}**  `, `${v.subheadline}  `, `_${v.rationale}_`, "");
    console.log(`  ${c.bold(String(i + 1))}. ${c.cyan(v.angle.padEnd(16))} ${c.bold(v.headline)} ${c.dim("/ " + v.subheadline)}`);
  });
  fs.writeFileSync(path.join(STUDIO, "projects", slug, "hooks.md"), lines.join("\n"));
  console.log(c.green(`\n  ✓ Saved projects/${slug}/hooks.md`));
};

export const hookVariants = async (slug, { count = 5, create = false, formats } = {}) => {
  const brief = readBrief(slug);
  const p = brief.props;
  const { variants } = await structured({
    label: "Hook variants",
    slug,
    system: HOOKS_SYSTEM,
    content: [textBlock(hooksTask(brief, inboxNotes(slug), count))],
    schema: hooksSchema,
  });
  writeHooks(slug, brief, variants);

  if (!create) {
    console.log(c.dim("  Add --create to make a renderable project per variant."));
    return variants;
  }
  const created = [];
  variants.forEach((v, i) => {
    const vSlug = `${slug}-hook-${i + 1}`;
    const dir = path.join(STUDIO, "projects", vSlug);
    fs.mkdirSync(dir, { recursive: true });
    const vBrief = {
      ...brief,
      formats: formats ?? ["9x16"], // ads are usually vertical; change with --formats
      variantOf: slug,
      props: { ...p, hook: { headline: v.headline, subheadline: v.subheadline } },
    };
    fs.writeFileSync(path.join(dir, "brief.json"), JSON.stringify(vBrief, null, 2) + "\n");
    created.push(vSlug);
  });
  run("node", [path.join(STUDIO, "scripts", "sync-projects.mjs")], { quiet: true });
  console.log(c.green(`  ✓ Created ${created.length} variant projects: ${created.join(", ")}`));
  console.log(c.dim(`  Render them: ${created.map((s) => `npm run draft -- ${s}`).join("  ·  ")}`));
  return variants;
};
