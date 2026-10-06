// On-screen copy for the ActionSuite X24H promo. Voiceover lines live in the script, not here.

/** Looked up in public/ in this order; the first one that exists is played. */
export const VOICEOVER_FILES = ["voiceover.mp3", "projects/atmt-action-suite/audio/voiceover.mp3"];
export const LOGO = "projects/atmt-action-suite/logo.png";

export const MATH = { contacts: 100000, rate: 0.05, price: 999 }; // = ₱4,995,000

export const COPY = {
  idleLabel: "Idle leads",
  idleHeadline: "Sitting in your Omni Inbox. Doing nothing.",
  mathCaption: "in sales, asleep in your inbox",
  outboundHeadline: "X24H Outbound. Outreach on autopilot.",
  extremeHeadline: "Up to 14 engines. All firing at once.",
  tagpilotHeadline: "Tag automations that never break.",
  mcpHeadline: "Landing pages and ads, in seconds.",
  offerHeadline: "Your first month for just",
  offerPrice: 499,
  offerIncludes: ["X24H Outbound + X24H Extreme", "TagPilot™", "MCP Library"],
  ctaHeadline: "Wake up your idle leads.",
  brand: "Automatika ActionSuite",
  url: "actionsuite.automatika.ph",
};

/** Channel chips that the engines dispatch to (cycled across the 14 lanes). */
export const CHANNELS = ["Messenger", "Instagram", "WhatsApp", "Shopee", "TikTok", "Lazada", "Webchat"];

/** Outreach queue rows in the Omni Inbox dashboard (Scene 2A). Names are masked on purpose. */
export const QUEUE_ROWS = [
  { name: "Ma*** S.", channel: "Messenger", tag: "Dormant 94d" },
  { name: "Jo*** R.", channel: "Instagram", tag: "Dormant 61d" },
  { name: "An*** C.", channel: "WhatsApp", tag: "Dormant 120d" },
  { name: "Ri*** D.", channel: "Shopee", tag: "Dormant 45d" },
  { name: "Ka*** L.", channel: "TikTok", tag: "Dormant 77d" },
  { name: "Be*** T.", channel: "Messenger", tag: "Dormant 152d" },
  { name: "Pa*** G.", channel: "Lazada", tag: "Dormant 38d" },
];

export const TAGPILOT = {
  broken: "⚠ Tag conflict: rule loop",
  fixed: ["VIP-Reactivated", "Omni-Synced"],
};

export const MCP = {
  command: "mcp run webcake.deploy --page promo-499",
  deploy: "Deploy Webcake Page...",
  result: "Live (1.2s)",
  sliders: [
    { label: "Budget allocation", from: 0.3, to: 0.72 },
    { label: "Audience match", from: 0.45, to: 0.88 },
    { label: "Creative rotation", from: 0.6, to: 0.35 },
  ],
};
