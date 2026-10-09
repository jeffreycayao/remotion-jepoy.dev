// On-screen copy for the Automatika × Pancake Philippines partner commercial.
// Positioning rule: setup, deployment and training only — never ads / media buying.

/** Looked up in public/ in order; the first that exists is played (missing = silent, renders still work). */
export const VOICEOVER_FILES = ["projects/automatika-pancake-partner/audio/automatika_pancake.mp3", "projects/automatika-pancake-partner/audio/voiceover.mp3"];

export const BRAND = { name: "Automatika", url: "automatika.ph" };

/** Cleaned logos (transparent PNGs, tight crops) — see public/projects/automatika-pancake-partner/logos/. */
export const LOGOS = {
  automatika: { src: "projects/automatika-pancake-partner/logos/automatika-logo.png", aspect: 1542 / 1220 }, // white wordmark: dark surfaces only
  automatikaMark: { src: "projects/automatika-pancake-partner/logos/automatika-mark.png", aspect: 1060 / 854 },
  pancake: { src: "projects/automatika-pancake-partner/logos/pancake-logo.png", aspect: 1608 / 1448 },
};
export const PARTNER_BADGE = "OFFICIAL PARTNER: PANCAKE PHILIPPINES";

export const COPY = {
  headacheHeadline: "No time to set up Pancake — or train your team?",
  timeLostLabel: "Time Lost",
  partnerHeadline: "Kami na bahala.",
  partnerSub: "We deploy your full Pancake setup — end to end.",
  proofHeadline: "Your team + AI, working hand-in-hand.",
  ctaHeadline: ["Complete Deployment.", "Zero Guesswork."],
  ctaSub: "End-to-end, from setup to training.",
  chat: "💬 Chat Us Now",
  book: "📅 Book Your On-boarding",
};

// ── Scene 1: the half-finished setup ─────────────────────────────────────────
export const BROKEN = [
  { label: "Unlinked CRM", status: "0 of 4 channels connected" },
  { label: "Draft Webcake", status: "Not published · no form" },
  { label: "Broken Botcake", status: "Flow error · reply loop" },
  { label: "Unsynced POS", status: "Stock mismatch · 37 SKUs" },
];

// ── Scene 2: the four turnkey pillars ────────────────────────────────────────
export const PILLARS = [
  { n: 1, title: "Pancake CRM", chip: "Pancake CRM", desc: "Multi-channel inbox, lead routing & customer pipelines" },
  { n: 2, title: "Webcake", chip: "Webcake", desc: "High-converting sales funnels & landing pages" },
  { n: 3, title: "Botcake AI", chip: "Botcake", desc: "Chatbot flows with NLP & sales triggers" },
  { n: 4, title: "POS Integration", chip: "POS Sync", desc: "Real-time inventory, checkout & order sync" },
];

// ── Scene 3: training + proof ────────────────────────────────────────────────
export const TRAINING_STEPS = ["Onboarding", "Playbooks", "Live coaching"];
export const BUSINESSES = 90;
export const INDUSTRIES = ["E-commerce", "Jewelry", "Solar Energy", "Education"];
