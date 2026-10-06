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

/**
 * Scene boundaries in absolute frames (30 fps), measured from the recorded voiceover
 * (00_INBOX/atmt-action-suite/ElevenLabs_…mp3, 30.3 s) by its phrase pauses. Each cut lands
 * 4 frames before its phrase so the picture leads the word. Re-measure if the voiceover changes:
 *   ffmpeg -i voiceover.mp3 -af silencedetect=noise=-35dB:d=0.07 -f null -
 */
export const T = {
  idle: 0, // 0.00 s "May one hundred K contacts sa inbox mo?"
  math: 79, // 2.75 s "Five percent conversion lang sa nine-nine-nine pesos offer,"
  punch: 182, // 6.20 s "halos five million pesos na 'yan."
  outbound: 258, // 8.75 s "I-reactivate sila gamit ang X-twenty-four-H Extreme:"
  extreme: 364, // 12.28 s "hanggang fourteen parallel engines … sa Omni Inbox."
  tagpilot: 512, // 17.19 s "Fix tag errors gamit ang Tag-Pilot,"
  mcp: 586, // 19.67 s "at gumawa agad ng Web-cake pages gamit ang M-C-P Library."
  offer: 710, // 23.79 s "Four hundred ninety-nine pesos lang first month mo."
  cta: 798, // 26.75 s "Bisitahin ang action suite dot automatika dot P-H."
  total: 955, // voice ends 30.15 s; ~1.7 s hold on the CTA
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
