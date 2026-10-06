// AI command line.
//   npm run ai -- brief <slug> [--url URL] [--notes "…"] [--dry-run]     screenshots + notes → brief.json
//   npm run ai -- hooks <slug> [--count 5] [--create] [--formats 9x16]   A/B hook variants
//   npm run ai -- voiceover <slug> [--tone "…"]                           timed narration script
//   npm run ai -- qa <slug> [--formats 9x16]                              visual review of rendered frames
//   npm run ai -- ask "<request>" [--codex]                               hand a task to Claude Code / Codex
//   npm run ai -- status                                                  what's configured
// API features use Claude (default model claude-opus-5-5; override with PROMO_AI_MODEL / PROMO_AI_EFFORT).
import { c } from "../_platform.mjs";
import { agentAvailable, askAgent } from "./agents.mjs";
import { EFFORT, hasCredentials, MODEL, requireCredentials } from "./core.mjs";

const [cmd, ...rest] = process.argv.slice(2);
const opt = (name) => {
  const i = rest.indexOf(`--${name}`);
  return i >= 0 ? rest[i + 1] : undefined;
};
const flag = (name) => rest.includes(`--${name}`);
const positional = rest.filter((a, i) => !a.startsWith("--") && !rest[i - 1]?.match(/^--(url|notes|count|formats|tone)$/));
const slug = positional[0];

const needSlug = () => {
  if (!slug) {
    console.log(`Usage: npm run ai -- ${cmd} <project-slug>`);
    process.exit(1);
  }
};

try {
  switch (cmd) {
    case "brief": {
      needSlug();
      requireCredentials();
      const { autoBrief } = await import("./brief.mjs");
      await autoBrief(slug, { url: opt("url"), notes: opt("notes"), dryRun: flag("dry-run") });
      break;
    }
    case "hooks": {
      needSlug();
      requireCredentials();
      const { hookVariants } = await import("./hooks.mjs");
      await hookVariants(slug, { count: Number(opt("count") ?? 5), create: flag("create"), formats: opt("formats")?.split(",") });
      break;
    }
    case "voiceover": {
      needSlug();
      requireCredentials();
      const { voiceover } = await import("./voiceover.mjs");
      await voiceover(slug, { tone: opt("tone") });
      break;
    }
    case "qa": {
      needSlug();
      requireCredentials();
      const { visualQa } = await import("./qa.mjs");
      await visualQa(slug, { formats: opt("formats")?.split(",") });
      break;
    }
    case "ask": {
      const prompt = positional.join(" ");
      process.exit(askAgent(flag("codex") ? "codex" : "claude", prompt || undefined) ? 0 : 1);
      break;
    }
    case "status":
    default: {
      if (cmd && cmd !== "status") console.log(c.yellow(`Unknown AI command "${cmd}".`));
      console.log(`  Claude API (brief, hooks, voiceover, qa): ${hasCredentials() ? c.green("key found") : c.yellow("no key — set one in launcher → a. AI")}  ${c.dim(`model ${MODEL}, effort ${EFFORT}`)}`);
      console.log(`  Claude Code (ask):                         ${agentAvailable("claude") ?? c.yellow("not installed")}`);
      console.log(`  OpenAI Codex / ChatGPT (ask --codex):      ${agentAvailable("codex") ?? c.yellow("not installed")}`);
    }
  }
} catch (err) {
  console.log(c.red(`\n  ✗ ${err.message}`));
  process.exit(1);
}
