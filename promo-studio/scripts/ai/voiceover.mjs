// AI voiceover script, timed to the template's scenes.
//   npm run ai -- voiceover <slug> [--tone "warm, confident"]
// Writes projects/<slug>/voiceover.md (for a voice actor / TTS) and voiceover.json (per-scene lines).
import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import { c, run, STUDIO } from "../_platform.mjs";
import { inboxNotes, readBrief, sceneList, structured, textBlock } from "./core.mjs";

const WORDS_PER_SECOND = 2.5; // ~150 wpm: natural ad read with breathing room

export const voSchema = z.object({
  voiceDirection: z.string().describe("One or two sentences of direction for the voice actor / TTS voice"),
  lines: z.array(
    z.object({
      scene: z.string().describe("Scene key exactly as given"),
      text: z.string().describe("What is spoken during this scene; may be empty for a musical beat"),
    }),
  ),
});

export const VO_SYSTEM = `You write voiceover scripts for short app-promo videos. The narration plays over on-screen text, so it should complement the visuals, not read them out word for word. Write natural spoken English: contractions, short sentences, one idea per scene. Respect each scene's word budget strictly — running long breaks the edit. Never add claims, numbers or features that are not in the brief.`;

const budgetFor = (brief) =>
  sceneList(brief.props).map((s) => ({ scene: s.key, seconds: s.seconds, start: s.start / 30, maxWords: Math.floor(s.seconds * WORDS_PER_SECOND) }));

/** Task text shared by the Claude API path and the inbox autopilot. */
export const voTask = (brief, notes, tone) =>
  [
    `Brief:\n${JSON.stringify(brief.props, ["appName", "tagline", "hook", "headline", "subheadline", "features", "title", "description", "stats", "value", "prefix", "suffix", "label", "cta", "button", "url"], 2)}`,
    `Scenes and word budgets (one line per scene, in this order):\n${budgetFor(brief).map((b) => `- ${b.scene}: ${b.seconds}s, max ${b.maxWords} words`).join("\n")}`,
    tone ? `Tone: ${tone}` : "Tone: warm, confident, modern.",
    notes ? `Sources:\n${notes}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

/** Writes voiceover.md/.json, prints the timed script, returns how many lines run long. */
export const writeVoiceover = (slug, brief, vo) => {
  const budget = budgetFor(brief);
  const md = [`# Voiceover — ${brief.props.appName}`, "", `**Direction:** ${vo.voiceDirection}`, "", "| Scene | Time | Line | Words |", "|---|---|---|---|"];
  let over = 0;
  for (const b of budget) {
    const line = vo.lines.find((l) => l.scene === b.scene)?.text ?? "";
    const words = line.split(/\s+/).filter(Boolean).length;
    if (words > b.maxWords) over++;
    md.push(`| ${b.scene} | ${b.start.toFixed(1)}s | ${line || "_(music)_"} | ${words}/${b.maxWords}${words > b.maxWords ? " ⚠" : ""} |`);
    console.log(`  ${c.dim(`${b.start.toFixed(1).padStart(5)}s`)} ${b.scene.padEnd(10)} ${line || c.dim("(music)")} ${words > b.maxWords ? c.yellow(`⚠ ${words}/${b.maxWords} words`) : ""}`);
  }
  md.push("", "## Full script", "", vo.lines.map((l) => l.text).filter(Boolean).join(" "));
  const dir = path.join(STUDIO, "projects", slug);
  fs.writeFileSync(path.join(dir, "voiceover.md"), md.join("\n") + "\n");
  fs.writeFileSync(path.join(dir, "voiceover.json"), JSON.stringify({ ...vo, scenes: budget }, null, 2) + "\n");
  console.log(c.green(`\n  ✓ Saved projects/${slug}/voiceover.md and voiceover.json (also shown as captions)`));
  run("node", [path.join(STUDIO, "scripts", "sync-projects.mjs")], { quiet: true }); // picks up the new captions
  if (over) console.log(c.yellow(`  ! ${over} line(s) exceed their scene's word budget — trim them or lengthen timing in brief.json.`));
  return over;
};

export const voiceover = async (slug, { tone } = {}) => {
  const brief = readBrief(slug);
  const vo = await structured({
    label: "Voiceover",
    slug,
    system: VO_SYSTEM,
    content: [textBlock(voTask(brief, inboxNotes(slug), tone))],
    schema: voSchema,
  });
  writeVoiceover(slug, brief, vo);
  console.log(c.dim("  Record it, or generate audio with ElevenLabs (plugin group captions-ai), then: npm run tools -- prep-audio …"));
  return vo;
};
