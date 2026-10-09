// Shared Claude API plumbing for the AI features (brief, hooks, voiceover, qa).
// Credentials: ANTHROPIC_API_KEY in the environment or in promo-studio/.env (see "AI → Set API key").
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { c, INBOX, ROOT, STUDIO } from "../_platform.mjs";

// ── config ────────────────────────────────────────────────────────────────
for (const envFile of [path.join(STUDIO, ".env"), path.join(ROOT, ".env")]) {
  if (fs.existsSync(envFile)) process.loadEnvFile(envFile);
}

export const MODEL = process.env.PROMO_AI_MODEL || "claude-opus-5-5";
// Opus 5.5 defaults to "medium"; copywriting and visual review benefit from more thought.
export const EFFORT = process.env.PROMO_AI_EFFORT || "high";

// $ per 1M tokens (input, output) for the cost line printed after each call.
const PRICES = {
  "claude-opus-5-5": [4, 20],
  "claude-sonnet-5-5": [2, 10],
  "claude-haiku-4-5": [1, 5],
  "claude-fable-5-1": [10, 50],
};

export const ENV_FILE = path.join(STUDIO, ".env");

export const hasCredentials = () =>
  Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN) ||
  fs.existsSync(path.join(os.homedir(), ".config", "anthropic"));

export const requireCredentials = () => {
  if (hasCredentials()) return;
  console.log(c.yellow("\n  No Claude API credentials found."));
  console.log("  1. Create a key at https://console.anthropic.com/settings/keys");
  console.log('  2. Launcher → a. AI → "Set API key"   (saves it to promo-studio/.env, which is git-ignored)');
  console.log("     or set the ANTHROPIC_API_KEY environment variable.\n");
  process.exit(2);
};

let client;
const getClient = () => (client ??= new Anthropic());

// ── content helpers ─────────────────────────────────────────────────────────
const MEDIA_TYPES = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".gif": "image/gif" };
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/** Image content block from a local file, or null if the format/size isn't supported. */
export const imageBlock = (file) => {
  const media_type = MEDIA_TYPES[path.extname(file).toLowerCase()];
  if (!media_type) return null;
  const data = fs.readFileSync(file);
  if (data.length > MAX_IMAGE_BYTES) {
    console.log(c.yellow(`  ! Skipping ${path.basename(file)} (over 5 MB — run prep-screens to shrink it)`));
    return null;
  }
  return { type: "image", source: { type: "base64", media_type, data: data.toString("base64") } };
};

export const textBlock = (text) => ({ type: "text", text });

// ── the call ─────────────────────────────────────────────────────────────
/**
 * One structured call: returns data matching `schema` (a Zod object).
 * Handles server-tool pauses, refusals (with server-side fallback), truncation and cost logging.
 */
export const structured = async ({ label, slug, system, content, schema, tools, maxTokens = 16000 }) => {
  const anthropic = getClient();
  const messages = [{ role: "user", content }];
  console.log(c.dim(`  ${label} — asking ${MODEL} (effort: ${EFFORT})…`));

  const request = (withTools) =>
    anthropic.beta.messages.parse({
      model: MODEL,
      max_tokens: maxTokens,
      system,
      messages,
      ...(withTools && tools ? { tools } : {}),
      output_config: { effort: EFFORT, format: betaZodOutputFormat(schema) },
      // If a safety classifier declines, the API retries on Anthropic's recommended fallback model.
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
    });

  let response;
  let useTools = Boolean(tools);
  const usage = { input: 0, output: 0 };
  try {
    for (let turn = 0; turn < 5; turn++) {
      try {
        response = await request(useTools);
      } catch (err) {
        // A tool the account/model can't use shouldn't block the whole feature — retry without it.
        if (useTools && err instanceof Anthropic.BadRequestError) {
          console.log(c.yellow(`  ! Web fetch unavailable (${err.message.slice(0, 80)}…) — continuing without it.`));
          useTools = false;
          response = await request(false);
        } else throw err;
      }
      usage.input += response.usage.input_tokens + (response.usage.cache_read_input_tokens ?? 0);
      usage.output += response.usage.output_tokens;
      // Server tools (web fetch) can pause a long turn; resume by sending the partial turn back.
      if (response.stop_reason !== "pause_turn") break;
      messages.push({ role: "assistant", content: response.content });
    }
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) {
      throw new Error("The API key was rejected. Set a valid key (launcher → a. AI → Set API key).");
    } else if (err instanceof Anthropic.RateLimitError) {
      throw new Error("Rate limited by the API — wait a minute and try again.");
    } else if (err instanceof Anthropic.APIConnectionError) {
      throw new Error("Could not reach the Claude API — check your internet connection.");
    } else if (err instanceof Anthropic.APIError) {
      throw new Error(`Claude API error ${err.status}: ${err.message}`);
    }
    throw err;
  }

  logUsage({ slug, label, usage, model: response.model });

  if (response.stop_reason === "refusal") {
    throw new Error(`Claude declined this request (${response.stop_details?.category ?? "no category"}). Adjust the inputs and retry.`);
  }
  if (response.stop_reason === "max_tokens") {
    throw new Error("The answer was cut off (max_tokens). Try fewer inputs.");
  }
  if (!response.parsed_output) {
    throw new Error("Claude's answer did not match the expected format. Please retry.");
  }
  return response.parsed_output;
};

/** Prints the cost of a call and appends it to projects/<slug>/ai-log.jsonl for budgeting. */
const logUsage = ({ slug, label, usage, model }) => {
  const [pin, pout] = PRICES[model] ?? PRICES[MODEL] ?? [0, 0];
  const cost = (usage.input * pin + usage.output * pout) / 1e6;
  console.log(c.dim(`  ${usage.input.toLocaleString()} in / ${usage.output.toLocaleString()} out tokens on ${model} ≈ $${cost.toFixed(3)}`));
  if (!slug) return;
  const dir = path.join(STUDIO, "projects", slug);
  if (!fs.existsSync(dir)) return;
  const line = { at: new Date().toISOString(), feature: label, model, ...usage, usd: Number(cost.toFixed(4)) };
  fs.appendFileSync(path.join(dir, "ai-log.jsonl"), JSON.stringify(line) + "\n");
};

// ── project helpers ───────────────────────────────────────────────────────
export const briefPath = (slug) => path.join(STUDIO, "projects", slug, "brief.json");

export const readBrief = (slug) => {
  const p = briefPath(slug);
  if (!fs.existsSync(p)) throw new Error(`No project "${slug}". Create it first: npm run new -- ${slug}`);
  const brief = JSON.parse(fs.readFileSync(p, "utf8"));
  // AI brief/hooks/voiceover/QA write AppPromo fields; a bespoke template keeps its copy in code.
  if (brief.template && brief.template !== "AppPromo") {
    throw new Error(`"${slug}" uses the custom template ${brief.template} — the AI brief tools only work with AppPromo projects. Edit src/templates/${brief.template}/ instead (chat: launcher c).`);
  }
  return brief;
};

/** Writes the brief after saving the previous version to projects/<slug>/history/. */
export const writeBrief = (slug, brief) => {
  const p = briefPath(slug);
  const hist = path.join(path.dirname(p), "history");
  fs.mkdirSync(hist, { recursive: true });
  // Millisecond stamp + counter: two rewrites in the same instant must never share (and lose) a history file.
  const base = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 23);
  let stamp = base;
  for (let n = 2; fs.existsSync(path.join(hist, `brief-${stamp}.json`)); n++) stamp = `${base}-${n}`;
  if (fs.existsSync(p)) fs.copyFileSync(p, path.join(hist, `brief-${stamp}.json`), fs.constants.COPYFILE_EXCL);
  fs.writeFileSync(p, JSON.stringify(brief, null, 2) + "\n");
  console.log(c.green(`  ✓ Saved projects/${slug}/brief.json`) + c.dim(` (previous version in history/brief-${stamp}.json)`));
};

/** Free-text notes the user dropped in the inbox (notes.txt / notes.md / brief.txt / url.txt).
 *  Accepts a project slug (→ inbox/<slug>) or an inbox folder path. */
export const inboxNotes = (slugOrDir) => {
  const dir = path.isAbsolute(slugOrDir) ? slugOrDir : path.join(INBOX, slugOrDir);
  if (!fs.existsSync(dir)) return "";
  return fs
    .readdirSync(dir)
    .filter((f) => /^(notes|brief|copy|url|info)\.(txt|md)$/i.test(f))
    .map((f) => `--- ${f} ---\n${fs.readFileSync(path.join(dir, f), "utf8").trim()}`)
    .join("\n\n");
};

export const sceneList = (props) => {
  const fps = 30;
  const scenes = [
    { key: "hook", frames: Math.round(props.timing.hookSeconds * fps) },
    ...props.features.map((_, i) => ({ key: `feature-${i + 1}`, frames: Math.round(props.timing.featureSeconds * fps) })),
  ];
  if (props.stats.length) scenes.push({ key: "stats", frames: Math.round(props.timing.statsSeconds * fps) });
  scenes.push({ key: "cta", frames: Math.round(props.timing.ctaSeconds * fps) });
  // Same cap as AppPromo.tsx: a transition stays one frame shorter than the shortest scene.
  const t = Math.max(0, Math.min(props.timing.transitionFrames, Math.min(...scenes.map((x) => x.frames)) - 1));
  // Start frame of each scene: transitions overlap neighbours by `t` frames (mirrors AppPromo.tsx).
  let at = 0;
  return scenes.map((s, i) => {
    const start = at;
    at += s.frames - (i < scenes.length - 1 ? t : 0);
    return { ...s, start, seconds: s.frames / fps };
  });
};
