// Subscription AI providers for the inbox autopilot: drives the CLIs you already pay for,
// in order, until one returns valid JSON for the task.
//
//   claude   → Claude Code  (`claude -p --json-schema`)       sees images (via its Read tool)
//   codex    → OpenAI Codex (`codex exec --output-schema -i`)  sees images (attached)
//   opencode → GLM via Z.ai Coding Plan (`opencode run`)       text only
//
// Every run is read-only: Claude Code gets only the Read tool, Codex runs in its read-only sandbox,
// opencode runs the "plan" agent with edit/bash/webfetch denied and your MCP servers disabled.
import { spawnSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { z } from "zod";
import { c, resolveCommand, STUDIO } from "../_platform.mjs";
import { agentAvailable } from "./agents.mjs";

const TIMEOUT_MS = 8 * 60 * 1000;
const WORK = path.join(STUDIO, ".autopilot", "work");

export const PROVIDERS = {
  claude: { name: "Claude Code", vision: true },
  codex: { name: "Codex (ChatGPT)", vision: true },
  opencode: { name: "GLM (opencode)", vision: false },
};

/** Zod → strict JSON Schema (every object closed, every field required), as both CLIs expect. */
const strictSchema = (schema) => {
  const js = z.toJSONSchema(schema);
  delete js.$schema;
  const walk = (n) => {
    if (!n || typeof n !== "object") return;
    if (n.type === "object" && n.properties) {
      n.additionalProperties = false;
      n.required = Object.keys(n.properties);
      Object.values(n.properties).forEach(walk);
    }
    if (n.items) walk(n.items);
    (n.anyOf ?? []).forEach(walk);
  };
  walk(js);
  return js;
};

/** Pull a JSON object out of free text (GLM answers in plain text). */
const extractJson = (text) => {
  const clean = text.replace(/\x1b\[[0-9;]*m/g, "");
  const fenced = /```(?:json)?\s*([\s\S]*?)```/.exec(clean);
  const body = fenced ? fenced[1] : clean.slice(clean.indexOf("{"), clean.lastIndexOf("}") + 1);
  return JSON.parse(body);
};

// Never via a shell: prompts contain text from inbox notes, which cmd.exe would interpret.
const spawnCli = (cmd, args, opts) => {
  const resolved = resolveCommand(cmd);
  if (!resolved) throw new Error(`${cmd} not found`);
  const r = spawnSync(resolved.file, [...resolved.prefix, ...args], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024, timeout: TIMEOUT_MS, ...opts });
  if (r.error?.code === "ETIMEDOUT") throw new Error(`timed out after ${TIMEOUT_MS / 60000} min`);
  if (r.error) throw r.error;
  return r;
};

// ── per-provider runners: each returns the parsed JSON object (unvalidated) ─────────
const runners = {
  claude({ system, prompt, schemaJson, images, model, dir }) {
    const imageDirs = [...new Set(images.map((f) => path.dirname(f)))];
    const text = images.length ? `${prompt}\n\nImages to examine (open each with the Read tool):\n${images.map((f) => `- ${f}`).join("\n")}` : prompt;
    const args = [
      "-p",
      text,
      "--output-format",
      "json",
      "--json-schema",
      JSON.stringify(schemaJson),
      "--append-system-prompt",
      system,
      // Lean + read-only: no user settings/plugins/MCP/skills, and only the Read tool when images exist.
      "--tools",
      images.length ? "Read" : "",
      "--strict-mcp-config",
      "--setting-sources",
      "",
      "--disable-slash-commands",
      "--no-session-persistence",
      ...(model ? ["--model", model] : []),
      ...imageDirs.flatMap((d) => ["--add-dir", d]),
    ];
    const r = spawnCli("claude", args, { cwd: dir });
    let out;
    try {
      out = JSON.parse(r.stdout);
    } catch {
      throw new Error(`unexpected output: ${(r.stderr || r.stdout).trim().slice(0, 200)}`);
    }
    if (out.is_error) throw new Error(out.result || out.subtype || "Claude Code reported an error");
    return { data: out.structured_output ?? extractJson(out.result ?? ""), cost: out.total_cost_usd };
  },

  codex({ system, prompt, schemaJson, images, model, dir }) {
    const schemaFile = path.join(dir, "schema.json");
    const outFile = path.join(dir, "answer.json");
    fs.writeFileSync(schemaFile, JSON.stringify(schemaJson));
    // Attached images arrive without file names — say which is which so answers can cite them.
    const order = images.length ? `\n\nAttached images, in order:\n${images.map((f, i) => `${i + 1}. ${path.basename(f)}`).join("\n")}` : "";
    const args = [
      "exec",
      `${system}\n\n${prompt}${order}\n\nAnswer with the JSON object only.`,
      "-s",
      "read-only",
      "--skip-git-repo-check",
      "-C",
      dir,
      "--output-schema",
      schemaFile,
      "-o",
      outFile,
      ...(model ? ["-m", model] : []),
      ...images.flatMap((f) => ["-i", f]),
    ];
    const r = spawnCli("codex", args, { cwd: dir });
    if (!fs.existsSync(outFile)) throw new Error(`no answer (exit ${r.status}): ${(r.stderr || "").trim().slice(-200)}`);
    return { data: extractJson(fs.readFileSync(outFile, "utf8")) };
  },

  opencode({ system, prompt, schemaJson, model, dir }) {
    // Prompt goes in an attached file (no shell-quoting of long text on Windows).
    const promptFile = path.join(dir, "task.md");
    fs.writeFileSync(
      promptFile,
      `${system}\n\n${prompt}\n\nReply with ONE JSON object and nothing else. It must match this JSON Schema exactly:\n${JSON.stringify(schemaJson, null, 2)}\n`,
    );
    const env = { ...process.env, OPENCODE_CONFIG_CONTENT: JSON.stringify(lockedOpencodeConfig()) };
    const args = [
      "run",
      "Complete the task in the attached file. Output only the JSON object.",
      "--pure",
      "--agent",
      "plan",
      "-m",
      model || "zai-coding-plan/glm-5.3",
      "--dir",
      dir,
      "-f",
      promptFile,
    ];
    const r = spawnCli("opencode", args, { cwd: dir, env });
    if (r.status !== 0 && !r.stdout) throw new Error(`exit ${r.status}: ${(r.stderr || "").trim().slice(-200)}`);
    return { data: extractJson(r.stdout) };
  },
};

/** opencode config overlay: every tool off, risky permissions denied, the user's MCP servers disabled. */
const lockedOpencodeConfig = () => {
  const cfg = { $schema: "https://opencode.ai/config.json", tools: { "*": false }, permission: { edit: "deny", bash: "deny", webfetch: "deny" }, mcp: {} };
  try {
    const user = JSON.parse(fs.readFileSync(path.join(os.homedir(), ".config", "opencode", "opencode.json"), "utf8"));
    for (const [name, def] of Object.entries(user.mcp ?? {})) cfg.mcp[name] = { ...def, enabled: false };
  } catch {
    /* no user config — nothing to disable */
  }
  return cfg;
};

const availability = new Map();
export const isAvailable = (id) => {
  if (!availability.has(id)) availability.set(id, Boolean(agentAvailable(id)));
  return availability.get(id);
};

/**
 * Run one task through the provider chain. `prompt` may be a function of the provider
 * (so text-only providers get a version that doesn't assume they can see the images).
 * Returns { data, provider } where data has passed the Zod schema.
 */
export const runJSON = async ({ label, system, prompt, schema, images = [], order, models = {}, needsVision = false }) => {
  const schemaJson = strictSchema(schema);
  const errors = [];
  for (const id of order) {
    const p = PROVIDERS[id];
    if (!p) continue;
    if (needsVision && !p.vision) {
      errors.push(`${p.name}: skipped (can't see images)`);
      continue;
    }
    if (!isAvailable(id)) {
      errors.push(`${p.name}: not installed`);
      continue;
    }
    const dir = path.join(WORK, `${Date.now()}-${crypto.randomBytes(3).toString("hex")}`);
    fs.mkdirSync(dir, { recursive: true });
    const t0 = Date.now();
    process.stdout.write(c.dim(`    ${label} → ${p.name}… `));
    try {
      const text = typeof prompt === "function" ? prompt({ id, vision: p.vision }) : prompt;
      const { data, cost } = runners[id]({ system, prompt: text, schemaJson, images: p.vision ? images : [], model: models[id], dir });
      const parsed = schema.safeParse(data);
      if (!parsed.success) throw new Error(`answer didn't match the format (${parsed.error.issues[0]?.path.join(".")}: ${parsed.error.issues[0]?.message})`);
      const secs = ((Date.now() - t0) / 1000).toFixed(0);
      process.stdout.write(c.green(`done in ${secs}s`) + (cost ? c.dim(` (≈$${cost.toFixed(3)} list price, billed to your plan)`) : "") + "\n");
      return { data: parsed.data, provider: id, seconds: Number(secs) };
    } catch (err) {
      process.stdout.write(c.yellow(`failed: ${err.message}`) + "\n");
      errors.push(`${p.name}: ${err.message}`);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  }
  throw new Error(`No provider could complete "${label}".\n      ${errors.join("\n      ")}`);
};
