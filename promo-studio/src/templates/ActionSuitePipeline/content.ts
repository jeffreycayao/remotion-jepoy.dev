// All on-screen copy and graph data for the ActionSuite pipeline promo.

export const COPY = {
  chaosHeadline: "Your business isn't slow. Your pipeline is scattered.",
  chaosSub: "When inquiries flood in from everywhere, high-value leads slip through the cracks.",
  routeHeadline: "Every lead sorted. Every conversation routed. Instantly.",
  resultHeadline: "Automate the mundane. Intervene where it matters.",
  ctaHeadline: ["Stop managing chaos.", "Start orchestrating growth."],
  brand: "ActionSuite",
  url: "actionsuite.automatika.ph",
};

export const TOASTS = [
  { tag: "VIP Routing", tone: "lime" as const, text: "Closed {$1,250} bundle via WhatsApp — {0m} delay" },
  { tag: "Human Escalation", tone: "blue" as const, text: "{10.8%} passed to team with full context" },
];

// Act 1 — incoming alerts.
export const CHAOS_PLATFORMS = ["Messenger", "WhatsApp", "Instagram DM", "Shopee", "TikTok Shop", "Lazada"];
export const CHAOS_MESSAGES = [
  "Available pa po?",
  "How much for 2?",
  "Hello?? Still there?",
  "Pa-reserve po!",
  "COD available?",
  "Where's my order?",
  "Can I get a discount?",
  "Size chart please",
  "Nag-order na ako",
  "Reply naman po 🙏",
  "Shipping to Cebu?",
  "Is this legit?",
];

// Act 2 — the routing graph.
export const SOURCES = [
  { id: "facebook", label: "Facebook", count: "4K" },
  { id: "instagram", label: "Instagram", count: "38" },
  { id: "shopee", label: "Shopee", count: "32" },
  { id: "lazada", label: "Lazada", count: "30" },
  { id: "tiktok", label: "TikTok", count: "31" },
  { id: "whatsapp", label: "WhatsApp", count: "25" },
  { id: "webchat", label: "Webchat", count: "38" },
];

export const CLASSES = [
  { id: "new", label: "NEW LEADS", count: 149 },
  { id: "returning", label: "RETURNING", count: 45 },
  { id: "vip", label: "VIP", count: 23 },
  { id: "dormant", label: "DORMANT", count: 23 },
];

export const ACTIONS = [
  { id: "convert", label: "CONVERT NOW", pct: 4.9 },
  { id: "bundle", label: "BUNDLE OFFER", pct: 23.8 },
  { id: "nurture", label: "NURTURE", pct: 27.4 },
  { id: "pass", label: "PASS", pct: 33.2 },
  { id: "human", label: "HUMAN REVIEW", pct: 10.8 },
];

/** Nodes the Act 3 camera pushes toward. */
export const FOCUS_ACTIONS = ["convert", "human"];

/** [from, to, particles on this edge] */
export const SOURCE_EDGES: [string, string, number][] = [
  ["facebook", "new", 3],
  ["facebook", "returning", 2],
  ["facebook", "vip", 2],
  ["instagram", "new", 2],
  ["instagram", "returning", 1],
  ["shopee", "new", 2],
  ["shopee", "dormant", 1],
  ["lazada", "returning", 1],
  ["lazada", "dormant", 1],
  ["tiktok", "new", 2],
  ["tiktok", "vip", 1],
  ["whatsapp", "vip", 2],
  ["whatsapp", "returning", 1],
  ["webchat", "new", 2],
  ["webchat", "dormant", 1],
];

export const DECISION_EDGES: [string, string, number][] = [
  ["new", "convert", 2],
  ["new", "nurture", 3],
  ["new", "pass", 3],
  ["new", "human", 1],
  ["returning", "bundle", 3],
  ["returning", "convert", 1],
  ["vip", "convert", 2],
  ["vip", "bundle", 2],
  ["vip", "human", 2],
  ["dormant", "nurture", 2],
  ["dormant", "pass", 3],
];
