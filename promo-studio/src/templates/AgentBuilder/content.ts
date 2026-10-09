// On-screen copy for the "AI Agent Instructions Builder — now free for Paid/Pro" announcement.
// Sample business, prompt text and document edits are illustrative demo content.

/** Looked up in public/ in order; the first that exists is played (missing = silent, renders still work). */
export const VOICEOVER_FILES = ["projects/atmt-agent-builder/audio/announcement_vo.mp3", "projects/atmt-agent-builder/audio/voiceover.mp3"];
export const LOGO = "projects/atmt-action-suite/logo.png";
export const BOTCAKE_LOGO = "projects/atmt-agent-builder/botcake-logo.svg"; // 109×30, dark wordmark — light surfaces only

export const USER = { name: "Jeffrey Cayao", initials: "JC", plan: "PRO" };

export const COPY = {
  painHeadline: "Prompt engineering shouldn't take 2 hours.",
  painTimerLabel: "hours rewriting Botcake instructions",
  giftKicker: "New in ActionSuite",
  giftHeadline: "AI Agent Instructions Builder",
  giftSub: "Now 100% FREE for all Paid & Pro users.",
  giftBadge: "PRO FEATURE: UNLOCKED • 100% FREE",
  speedHeadline: "No guesswork. Ready to validate.",
  ctaHeadline: ["Stop Guessing Prompts.", "Ship in 5 Minutes."],
  ctaCaption: "Available now in your dashboard",
  url: "actionsuite.automatika.ph/login",
};

// ── Scene 1: the messy prompt doc ───────────────────────────────────────────
/** `~text~` = struck through in red, `+text+` = red inserted edit, `!text` = margin note. */
export const MESSY_DOC = [
  "~You are a helpful assistant.~ +You are Ria, a sales agent…+",
  "~Always answer every question politely and completely.~",
  "+Be friendly pero hindi pushy??+ !too robotic",
  "~Do not mention prices.~ +Mention prices only if asked+",
  "Ask for budget. ~Ask for location.~ +Ask location first?+",
  "~If unsure, say I don't know.~ !bot hallucinated again",
  "+Use Taglish+ ~Use formal English only~",
  "~Reply in 5 paragraphs max~ +Max 3 lines!!+ !revise",
  "Escalate to human when… ~when?~ !rule conflict",
  "+Never invent availability+ ~Always confirm stock~",
  "~Tone: professional~ +Tone: warm+ +Tone: ???+",
  "!v14_final_FINAL_talaga.txt",
];

// ── Scene 3: the builder ─────────────────────────────────────────────────────
export const NAV = ["Dashboard", "X24H Outbound", "TagPilot", "MCP Library"];
export const BUILDERS = ["Product", "Services", "Hybrid"] as const;
export type Builder = (typeof BUILDERS)[number];

/** Preset dropdown: one click sets the builder mode too. */
export const PRESETS: { name: string; builder: Builder }[] = [
  { name: "E-commerce", builder: "Product" },
  { name: "Real Estate", builder: "Product" },
  { name: "Digital Agency", builder: "Services" },
  { name: "SaaS", builder: "Product" },
  { name: "Business Coaching", builder: "Services" },
  { name: "Product + Service (Hybrid)", builder: "Hybrid" },
];
export const SELECTED_PRESET = 1; // Real Estate

export const FORM = {
  business: "Casa Verde Realty",
  description: "Pre-selling condos in Cavite & Laguna. Leads come from FB ads; most ask about price, location and payment terms.",
  sections: ["Role", "Tone", "Behavior", "Rules", "Formatting"],
};

/** The generated system instructions (right-hand preview drawer). */
export const INSTRUCTIONS: { heading: string; lines: string[] }[] = [
  { heading: "ROLE", lines: ["You are Ria, a friendly property consultant for Casa Verde Realty."] },
  { heading: "TONE", lines: ["Warm, confident Taglish. Helpful, never pushy."] },
  { heading: "BEHAVIOR", lines: ["Qualify budget, location and move-in timeline — one question at a time.", "Once qualified, offer a site-viewing schedule."] },
  { heading: "RULES", lines: ["Never invent prices, promos or unit availability.", "Hand off to a human agent for reservations and payments."] },
  { heading: "FORMATTING", lines: ["Max 3 short lines per reply. End with one clear question."] },
];
