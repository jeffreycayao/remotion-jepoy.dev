// On-screen copy for the Automatika sales-proof ad ("ATMT BC Promotionals").
// Dashboard figures are real, verified client results supplied by Automatika — do not edit them
// without a new source. Chat lines are illustrative.

/** Looked up in public/ in order; the first that exists is played (missing = silent, renders still work). */
export const VOICEOVER_FILES = ["projects/atmt-bc-promotionals/audio/automatika_sales_ad.mp3", "projects/atmt-bc-promotionals/audio/voiceover.mp3"];

export const BRAND = { name: "Automatika", url: "automatika.ph" };

/** Cleaned logos (transparent PNGs, tight crops). */
export const LOGOS = {
  automatika: { src: "projects/atmt-bc-promotionals/logos/automatika-logo.png", aspect: 1542 / 1220 }, // white wordmark: dark surfaces only
  automatikaMark: { src: "projects/atmt-bc-promotionals/logos/automatika-mark.png", aspect: 1060 / 854 },
  pancake: { src: "projects/atmt-bc-promotionals/logos/pancake-logo.png", aspect: 1608 / 1448 },
};

export const COPY = {
  hookHeadline: "A chatbot that actually closes.",
  setupHeadline: "Kami na ang bahala.",
  setupSub: "Your entire Pancake setup — done for you.",
  proofHeadline: "Real Pancake results.",
  proofSub: "Actual client dashboards",
  ctaHeadline: "Pagaanin ang negosyo mo ngayon.",
  ctaButton: "Comment “HELP”",
  ctaNote: "para matulungan ka namin agad!",
};

// ── Scene 1: the closing bot ─────────────────────────────────────────────────
export const CHAT = {
  shop: "Your Shop",
  ask: "Available pa po?",
  reply: "Yes! ✨ Claim your exclusive bundle today.",
  latency: "0.2s",
  yes: "Sige po, order na ako! 🙌",
  closed: "STATUS: CLIENT CLOSED",
  stages: ["New inquiry", "Engaged", "Closed"],
};

// ── Scene 2: the four setup pillars ─────────────────────────────────────────
export const PILLARS = [
  { title: "Pancake CRM", tag: "Inbox & pipeline" },
  { title: "Botcake AI", tag: "Closing chatbot" },
  { title: "Webcake", tag: "Sales pages" },
  { title: "POS", tag: "Orders & stock" },
];
export const UPTIME = "24/7 UPTIME";
export const LATENCY = "RESPONSE LATENCY: 0.4s";

// ── Scene 3: real client dashboards ─────────────────────────────────────────
export type Metric = { label: string; value: number; prefix?: string; suffix?: string; change: number; note?: string };

export const CARD_A: { title: string; metrics: Metric[] } = {
  title: "Pancake · Confirmed Sales",
  metrics: [
    { label: "Total Confirmed Products", value: 1769076, prefix: "₱", change: 23.88 },
    { label: "Quantity Sold", value: 1830, change: 4.99 },
  ],
};

export const CARD_B: { title: string; metrics: Metric[] } = {
  title: "Pancake · Scaled Store Operations",
  metrics: [
    { label: "Confirmed Products", value: 6988404, prefix: "₱", change: 29.49, note: "15,417 items" },
    { label: "Net Revenue", value: 5549239, prefix: "₱", change: 38.51, note: "5,216 successful orders" },
    { label: "Profit", value: 2373934, prefix: "₱", change: 37.83, note: "42.78% margin" },
    { label: "Returns", value: 295821, prefix: "₱", change: -35.42, note: "Returns dropped" },
  ],
};
