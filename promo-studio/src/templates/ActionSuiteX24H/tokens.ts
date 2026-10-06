import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { loadFont as loadSora } from "@remotion/google-fonts/Sora";
import { useVideoConfig } from "remotion";

// latin-ext carries the peso sign (₱, U+20B1) — without it "₱999" falls back to a system font.
const opts = { subsets: ["latin" as const, "latin-ext" as const] };

export const FONT = {
  head: loadSora("normal", { ...opts, weights: ["700", "800"] }).fontFamily,
  body: loadInter("normal", { ...opts, weights: ["400", "500", "600"] }).fontFamily,
  mono: loadMono("normal", { ...opts, weights: ["500", "600"] }).fontFamily,
};

export const C = {
  canvas: "#27231B", // charcoal
  panel: "#1F1C16", // deeper charcoal for terminals / wells
  cream: "#F6F1E6",
  white: "#FFFFFF",
  lime: "#D5FA00",
  olive: "#687323",
  blue: "#BFD0EF",
  border: "#3A342A",
  card: "rgba(45, 41, 35, 0.95)",
  muted: "rgba(246,241,230,0.6)",
  error: "#F0524A", // TagPilot "broken automation" state only
};

/** Scene boundaries in absolute frames (30 fps, 1050 frames). Mirrors the voiceover script. */
export const T = {
  idle: 0, // 1A — 100,000 idle leads
  math: 120, // 1B — 100,000 × 5% × ₱999
  punch: 180, // camera punch-in on = ₱4,995,000
  outbound: 255, // 2A — X24H Outbound, 1 engine
  extreme: 360, // 2B — 14 parallel engines
  tagpilot: 570, // 3A
  mcp: 675, // 3B
  offer: 795, // 4A — ₱499
  cta: 915, // 4B
  total: 1050,
};

export const useFrameLayout = () => {
  const { width, height } = useVideoConfig();
  const u = Math.min(width, height) / 1080;
  const vertical = height / width > 1.4;
  // t: text scale for UI cards — phone viewers see 9:16 full-screen, so card text needs to be larger.
  return { width, height, u, vertical, t: vertical ? 1.3 : 1, safeTop: vertical ? height * 0.12 : 70 * u, safeBottom: vertical ? height * 0.18 : 70 * u };
};

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const peso = (n: number) => `₱${Math.round(n).toLocaleString("en-US")}`;
