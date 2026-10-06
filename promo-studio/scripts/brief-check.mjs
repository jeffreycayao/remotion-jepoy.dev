// Validates a project's brief.json against the template schema, so one broken brief produces a
// clear message for that project instead of breaking renders for every project.
import fs from "node:fs";
import path from "node:path";
import { STUDIO } from "./_platform.mjs";

const { appPromoSchema } = await import("../src/templates/AppPromo/schema.ts");
const FORMATS = ["16x9", "9x16", "1x1", "4x5"]; // mirrors src/lib/layout.ts

/** @returns {{ ok: true, brief: object } | { ok: false, error: string }} */
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
  const parsed = appPromoSchema.safeParse(brief.props);
  if (!parsed.success) {
    const i = parsed.error.issues[0];
    return { ok: false, error: `props.${i.path.join(".")}: ${i.message}` };
  }
  return { ok: true, brief };
};

export { FORMATS };
