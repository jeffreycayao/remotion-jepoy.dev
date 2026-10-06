// Coding agents that run on the user's own subscription (no API key):
//   Claude Code (`claude`)  — reads CLAUDE.md + .claude/skills
//   OpenAI Codex (`codex`)  — reads AGENTS.md (ChatGPT plan)
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import { c, resolveCommand, ROOT } from "../_platform.mjs";
import { ENV_FILE } from "./core.mjs";

const AGENTS = {
  claude: {
    name: "Claude Code",
    install: "npm install -g @anthropic-ai/claude-code   (or see https://claude.com/claude-code)",
    // Unattended mode: file edits are auto-accepted, but only these exact verification commands may
    // run — no interpreter-wide grants (node, npm run *), so the agent can't add and run arbitrary code.
    // Files that those allowed commands themselves execute in Node are protected from edits
    // (Edit rules cover every file-editing tool), so an edit can't turn into code execution.
    headless: (prompt) => [
      "-p",
      prompt,
      // Default mode + an edit ALLOWLIST: only briefs and template/scene code may change. Any other
      // edit needs approval, which a headless run can't give — so it's refused. (Edit rules cover
      // every file-editing tool.) The deny list below is a second layer for the riskiest files.
      "--permission-mode",
      "default",
      "--allowedTools",
      "Edit(promo-studio/projects/**)",
      "Edit(promo-studio/src/**)",
      // Rendering only via protected scripts that validate their arguments (no raw `npx remotion`,
      // whose flags such as --browser-executable could point at an agent-written file).
      "Bash(npm run lint)",
      "Bash(npm run sync)",
      "Bash(npm run draft:*)",
      "Bash(npm run frames:*)",
      "--disallowedTools",
      // src/** is otherwise editable because templates only run in the render browser — except the
      // schema, which Node imports (brief-check.mjs via draft/frames, autopilot, AI commands).
      "Edit(promo-studio/src/**/schema.ts)",
      // executed by the allowed commands
      "Edit(promo-studio/package.json)",
      "Edit(promo-studio/package-lock.json)",
      "Edit(promo-studio/scripts/**)",
      "Edit(promo-studio/node_modules/**)",
      "Edit(promo-studio/eslint.config.mjs)",
      "Edit(promo-studio/remotion.config.ts)",
      "Edit(promo-studio/.npmrc)",
      "Edit(.npmrc)",
      // agent permissions/hooks and launchers that run on the user's machine
      "Edit(.claude/**)",
      "Edit(promo-studio/.claude/**)",
      "Edit(tools/**)",
      "Edit(**/*.sh)",
      "Edit(**/*.bat)",
      "Edit(**/*.command)",
      // secrets
      "Edit(promo-studio/.env)",
      "Edit(.env)",
    ],
    interactive: [],
  },
  codex: {
    name: "OpenAI Codex (ChatGPT)",
    install: "npm install -g @openai/codex   (sign in with your ChatGPT account)",
    headless: (prompt) => ["exec", "-C", ROOT, "-s", "workspace-write", "--skip-git-repo-check", prompt],
    interactive: ["-C", ROOT],
  },
};

/** Spawn without a shell (keeps the prompt intact); fall back to a shell for npm .cmd shims on Windows. */
const spawnAgent = (cmd, args) => {
  const resolved = resolveCommand(cmd);
  if (!resolved) return { status: 1 };
  return spawnSync(resolved.file, [...resolved.prefix, ...args], { cwd: ROOT, stdio: "inherit" });
};

export const agentAvailable = (id) => {
  const resolved = resolveCommand(id);
  if (!resolved) return null;
  const r = spawnSync(resolved.file, [...resolved.prefix, "--version"], { encoding: "utf8" });
  return r.status === 0 ? (r.stdout || "").trim().split("\n")[0] : null;
};

export const askAgent = (id, prompt) => {
  const a = AGENTS[id];
  if (!agentAvailable(id)) {
    console.log(c.yellow(`  ${a.name} is not installed. Install: ${a.install}`));
    return false;
  }
  console.log(c.dim(`  ${a.name} is working in ${ROOT} …\n`));
  const r = spawnAgent(id, prompt ? a.headless(prompt) : a.interactive);
  return r.status === 0;
};

/** Save the API key to promo-studio/.env (git-ignored), replacing any previous one. */
export const saveApiKey = (key) => {
  key = key.trim();
  if (!/^sk-ant-[\w-]{20,}$/.test(key)) {
    console.log(c.red("  ✗ That doesn't look like an Anthropic API key (it starts with sk-ant-)."));
    return false;
  }
  const lines = fs.existsSync(ENV_FILE) ? fs.readFileSync(ENV_FILE, "utf8").split(/\r?\n/).filter((l) => l && !l.startsWith("ANTHROPIC_API_KEY=")) : [];
  lines.push(`ANTHROPIC_API_KEY=${key}`);
  fs.writeFileSync(ENV_FILE, lines.join("\n") + "\n", { mode: 0o600 });
  console.log(c.green(`  ✓ Saved key ${key.slice(0, 10)}…${key.slice(-4)} to promo-studio/.env (git-ignored).`));
  return true;
};
