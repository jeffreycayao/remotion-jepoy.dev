// AI auto-brief: screenshots + logo + notes (+ optional website) → a complete brief.json.
//   npm run ai -- brief <slug> [--url https://app.site] [--notes "extra context"] [--dry-run]
// The pieces (inputs, prompt, schema, merge) are exported so the inbox autopilot can reuse them
// with Claude Code / Codex / GLM instead of the Claude API.
import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import { c, ROOT, run, STUDIO } from "../_platform.mjs";
import { imageBlock, inboxNotes, readBrief, structured, textBlock, writeBrief } from "./core.mjs";

const { appPromoSchema, fontChoices, statSchema } = await import("../../src/templates/AppPromo/schema.ts");

const hex = z.string().describe("Hex color like #7C5CFF");

// What the AI fills in. Timing, formats, audio and logo path stay under human control.
export const aiBriefSchema = z.object({
  appName: z.string(),
  tagline: z.string().describe("3-6 words"),
  brand: z.object({
    primary: hex.describe("Main accent color, taken from the logo/UI"),
    secondary: hex.describe("Second accent that pairs with primary"),
    background: hex.describe("Dark or light base; text must have >= 4.5:1 contrast on it"),
    text: hex,
    // Plain string + normalisation in mergeAiBrief: enums are only sent as a hint by the SDK,
    // so an off-list answer would otherwise fail validation and waste the whole call.
    font: z.string().describe(`Exactly one of: ${fontChoices.join(", ")}`),
  }),
  hook: z.object({
    headline: z.string().describe("Max 6 words. The scroll-stopping first line."),
    subheadline: z.string().describe("Max 8 words."),
  }),
  features: z
    .array(
      z.object({
        title: z.string().describe("Max 4 words"),
        description: z.string().describe("Max 12 words, benefit-led"),
        icon: z.string().describe("A single emoji"),
        screenshot: z.string().describe("Exact filename from the provided list that best shows this feature, or empty string"),
      }),
    )
    .describe("3 to 5 features, in the order that tells the best story"),
  stats: z.array(statSchema).describe("ONLY numbers stated in the provided sources. Empty array if none."),
  cta: z.object({
    headline: z.string().describe("Max 6 words"),
    button: z.string().describe("Max 3 words"),
    url: z.string().describe("Domain or store name from the sources, or empty string"),
  }),
  notesForEditor: z.string().describe("Assumptions made and anything the human should verify before rendering"),
});

export const SYSTEM = `You are a senior performance-marketing copywriter and motion designer creating a 15-25 second promotional video for a mobile/web app.

You fill in a brief for a fixed video template: a hook scene (logo + headline), 3-5 feature scenes (each shows one app screenshot in a phone frame beside a short title and description), an optional stats scene, and a call-to-action scene.

Write for people scrolling a social feed with the sound off: concrete, benefit-led, plain words, no buzzwords, no exclamation-mark spam. Each feature should show a different, real capability visible in the screenshots or described in the sources. Pick for each feature the screenshot that shows it best; use each screenshot at most once.

Choose brand colors from the logo and app UI. Background and text must be highly legible together (contrast of at least 4.5:1); dark backgrounds usually look best in this template. Choose the font that best matches the brand's personality.

Accuracy matters more than persuasion: this is real advertising. Never invent statistics, ratings, user counts, awards or claims. Only include a stat if the exact number appears in the provided sources; otherwise return an empty stats list. If something is uncertain, keep the copy general and mention it in notesForEditor.`;

const IMAGE = /\.(png|jpe?g|webp|heic)$/i;

/**
 * Prepare inbox material into public/ (same helpers as the menu's "Prep assets") and collect inputs.
 * `inboxDir` defaults to 00_INBOX/<slug>; the autopilot passes the folder the user actually dropped.
 */
export const prepareInputs = (slug, { inboxDir, notes, force = false } = {}) => {
  const inbox = inboxDir ?? path.join(ROOT, "00_INBOX", slug);
  const brief = readBrief(slug);
  const screensDir = path.join(STUDIO, "public", "projects", slug, "screens");
  const py = (...args) => run("node", [path.join(STUDIO, "scripts", "py.mjs"), ...args], { quiet: true });

  const inboxFiles = fs.existsSync(inbox) ? fs.readdirSync(inbox) : [];
  const listScreens = () => (fs.existsSync(screensDir) ? fs.readdirSync(screensDir).filter((f) => /\.(png|jpe?g|webp)$/i.test(f)).sort() : []);
  if ((force || !listScreens().length) && inboxFiles.some((f) => IMAGE.test(f) && !/logo/i.test(f))) {
    console.log(c.dim("  Preparing screenshots from the inbox…"));
    py("prep-screens", slug, "--src", inbox);
  }
  const logoInInbox = inboxFiles.find((f) => /logo/i.test(f) && /\.(png|jpe?g|webp|svg)$/i.test(f));
  if ((force || !brief.props.logo) && logoInInbox) {
    py("prep-logo", slug, path.join(inbox, logoInInbox), "--apply");
  }
  const fresh = readBrief(slug);
  const logoFile = fresh.props.logo ? path.join(STUDIO, "public", fresh.props.logo) : null;
  const sources = [inboxNotes(inbox), notes ? `--- notes from the editor ---\n${notes}` : ""].filter(Boolean).join("\n\n");
  return {
    brief: fresh,
    inbox,
    screens: listScreens(),
    screensDir,
    logoFile: logoFile && fs.existsSync(logoFile) ? logoFile : null,
    sources,
  };
};

/** The task text shared by every provider (images are attached separately per provider). */
export const briefTask = ({ slug, brief, screens, sources, url, palette, canSeeImages = true }) =>
  [
    `Project: ${slug}. Current app name in the brief: "${brief.props.appName}".`,
    screens.length
      ? `Screenshot files available: ${screens.join(", ")}${canSeeImages ? "" : " (you cannot see them — infer what each shows from its file name and the notes)"}`
      : "No screenshots were provided — leave every feature's screenshot empty (the template draws a branded placeholder).",
    palette?.length ? `Dominant colors measured from the logo (most common first): ${palette.join(", ")}` : "",
    url ? `App website / store page: ${url}` : "",
    sources ? `Sources from the client:\n${sources}` : "No written notes were provided.",
    "Fill in the brief.",
  ]
    .filter(Boolean)
    .join("\n\n");

/** Merge the AI's answer into the brief and validate it with the template's own schema. */
export const mergeAiBrief = (slug, brief, ai, screens) => {
  const old = brief.props;
  const valid = (h, fallback) => (/^#[0-9a-f]{6}$/i.test(h ?? "") ? h : fallback);
  const font = fontChoices.find((f) => f.toLowerCase() === String(ai.brand.font).trim().toLowerCase()) ?? old.brand.font;
  return appPromoSchema.parse({
    ...old,
    appName: ai.appName,
    tagline: ai.tagline,
    brand: {
      primary: valid(ai.brand.primary, old.brand.primary),
      secondary: valid(ai.brand.secondary, old.brand.secondary),
      background: valid(ai.brand.background, old.brand.background),
      text: valid(ai.brand.text, old.brand.text),
      font,
    },
    hook: ai.hook,
    features: ai.features.slice(0, 6).map((f) => ({
      ...f,
      screenshot: screens.includes(f.screenshot) ? `projects/${slug}/screens/${f.screenshot}` : "",
    })),
    stats: ai.stats.slice(0, 4),
    cta: ai.cta,
  });
};

export const printBrief = (checked, notesForEditor) => {
  console.log(`\n  ${c.bold(checked.appName)} — ${checked.tagline}`);
  console.log(`  Hook:     ${checked.hook.headline}  ${c.dim("/ " + checked.hook.subheadline)}`);
  checked.features.forEach((f, i) => console.log(`  Feature ${i + 1}: ${f.icon} ${f.title} — ${f.description} ${c.dim(f.screenshot ? path.basename(f.screenshot) : "(placeholder)")}`));
  if (checked.stats.length) console.log(`  Stats:    ${checked.stats.map((s) => `${s.prefix}${s.value}${s.suffix} ${s.label}`).join(" · ")}`);
  console.log(`  CTA:      ${checked.cta.headline} [${checked.cta.button}] ${checked.cta.url}`);
  console.log(`  Colors:   ${checked.brand.primary} ${checked.brand.secondary} on ${checked.brand.background}, ${checked.brand.font}`);
  if (notesForEditor) console.log(c.yellow(`\n  Check before rendering: ${notesForEditor}\n`));
};

/** Claude API version (launcher a → 1). */
export const autoBrief = async (slug, { url, notes, dryRun } = {}) => {
  const inputs = prepareInputs(slug, { notes });
  const { brief, screens, screensDir, logoFile, sources } = inputs;

  const content = [];
  const logoBlock = logoFile ? imageBlock(logoFile) : null; // SVG is skipped (not an image type)
  if (logoBlock) content.push(textBlock("App logo:"), logoBlock);
  for (const s of screens) {
    const block = imageBlock(path.join(screensDir, s));
    if (block) content.push(textBlock(`Screenshot file: ${s}`), block);
  }
  content.push(textBlock(briefTask({ slug, brief, screens, sources, url: url ? `${url} (read it with the web_fetch tool)` : "" })));
  if (!screens.length && !sources && !url && !logoBlock) {
    throw new Error(`Nothing to work from. Add screenshots/logo/notes.txt to 00_INBOX/${slug}/ or pass --url / --notes.`);
  }
  console.log(c.dim(`  Inputs: ${screens.length} screenshot(s), logo: ${logoBlock ? "yes" : "no"}, notes: ${sources ? "yes" : "no"}, website: ${url ?? "no"}`));

  const ai = await structured({
    label: "Auto-brief",
    slug,
    system: SYSTEM,
    content,
    schema: aiBriefSchema,
    tools: url ? [{ type: "web_fetch_20260209", name: "web_fetch", max_uses: 3 }] : undefined,
  });

  const checked = mergeAiBrief(slug, brief, ai, screens);
  printBrief(checked, ai.notesForEditor);
  if (dryRun) return console.log(c.dim("  --dry-run: brief not saved."));
  writeBrief(slug, { ...brief, props: checked });
  run("node", [path.join(STUDIO, "scripts", "sync-projects.mjs")], { quiet: true });
  console.log(c.dim(`  Next: preview in Studio (menu 1) or draft-render (menu 3).`));
};
