// Validates a project's brief.json against the template schema, so one broken brief produces a
// clear message for that project instead of breaking renders for every project.
import fs from "node:fs";
import path from "node:path";
import { STUDIO } from "./_platform.mjs";

const { appPromoSchema } = await import("../src/templates/AppPromo/schema.ts");
const FORMATS = ["16x9", "9x16", "1x1", "4x5"]; // mirrors src/lib/layout.ts

/** Text fields still holding starter placeholders ("[Your tagline]") — i.e. the brief was never filled in. */
export const placeholderFields = (props, at = "props") =>
  Object.entries(props ?? {}).flatMap(([k, v]) =>
    typeof v === "string" ? (/^\[.*\]$/.test(v.trim()) ? [`${at}.${k}`] : []) : v && typeof v === "object" ? placeholderFields(v, `${at}.${k}`) : [],
  );

export const placeholderHelp = (slug, fields) =>
  `"${slug}" still has starter placeholders (${fields.length}: ${fields.slice(0, 3).join(", ")}${fields.length > 3 ? ", …" : ""}).
` +
  `    Fill the brief first: launcher c (chat with Claude), drop files in 00_INBOX/${slug} and press w (autopilot),
` +
  `    launcher a → 1 (AI brief), or edit projects/${slug}/brief.json.`;

/** @returns {{ ok: true, brief: object, placeholders: string[] } | { ok: false, error: string }} */
export const checkBrief = (slug) => {
  const file = path.join(STUDIO, "projects", slug, "brief.json");
  if (!fs.existsSync(file)) return { ok: false, error: `no project "${slug}" (projects/${slug}/brief.json is missing)` };
  let brief;
  try {
    brief = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (err) {
    return { ok: false, error: `projects/${slug}/brief.json is not valid JSON (${err.message})` };
  }
  const bad = (brief.formats ?? []).filter((f) => !FORMATS.includes(f));
  if (!Array.isArray(brief.formats) || !brief.formats.length || bad.length) {
    return { ok: false, error: `"formats" must list some of ${FORMATS.join(", ")}${bad.length ? ` (unknown: ${bad.join(", ")})` : ""}` };
  }
  // Bespoke template: its copy lives in src/templates/<Name>/, so there are no brief props to validate.
  if (brief.template && brief.template !== "AppPromo") {
    const registry = fs.readFileSync(path.join(STUDIO, "src", "templates", "registry.ts"), "utf8");
    if (!/^\w+$/.test(brief.template) || !new RegExp(String.raw`^\s*${brief.template}:\s*\{`, "m").test(registry)) {
      return { ok: false, error: `unknown template "${brief.template}" — register it in src/templates/registry.ts` };
    }
    return { ok: true, brief, placeholders: [] };
  }
  const parsed = appPromoSchema.safeParse(brief.props);
  if (!parsed.success) {
    const i = parsed.error.issues[0];
    return { ok: false, error: `props.${i.path.join(".")}: ${i.message}` };
  }
  return { ok: true, brief, placeholders: placeholderFields(brief.props) };
};

export { FORMATS };
