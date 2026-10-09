import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { loadFont as loadSora } from "@remotion/google-fonts/Sora";

const opts = { subsets: ["latin" as const, "latin-ext" as const] };

export const FONT = {
  head: loadSora("normal", { ...opts, weights: ["700", "800"] }).fontFamily,
  body: loadInter("normal", { ...opts, weights: ["500", "600"] }).fontFamily,
  mono: loadMono("normal", { ...opts, weights: ["500", "600"] }).fontFamily,
};

export const C = {
  canvas: "#27231B", // charcoal — dominant backdrop
  panel: "#1F1C16",
  cream: "#F6F1E6", // cards, panels, badges
  white: "#FFFFFF",
  lime: "#D5FA00", // partner badge, active pipeline lines, primary CTA
  olive: "#687323", // flow paths, brackets, training nodes
  blue: "#BFD0EF", // integration chips
  border: "#3A342A",
  line: "#E4DDCD",
  ink: "#27231B",
  inkMuted: "#7A7264",
  muted: "rgba(246,241,230,0.62)",
  error: "#E5534B", // Scene 1 "broken setup" states only
};

/**
 * Scene boundaries (absolute frames @ 30 fps), measured from the recorded voiceover
 * (public/projects/automatika-pancake-partner/audio/automatika_pancake.mp3, 30.56 s) by its
 * phrase pauses. Each cut lands ~4 frames before its phrase. Re-measure if the voice changes:
 *   ffmpeg -i automatika_pancake.mp3 -af silencedetect=noise=-35dB:d=0.1 -f null -
 */
export const T = {
  headache: 0, // 0.79 s "Gusto mong mag-Pancake CRM pero walang oras … mag-train ng team?"
  partner: 147, // 5.02 s "Kami ang bahala." · 6.53 s "As an Official Partner…" · 10.76 s "Pancake CRM,"…
  proof: 466, // 15.66 s "We train your team…" · 18.99 s "Mahigit ninety businesses…" · 21.95 s "ecomm, jewelry…"
  cta: 753, // 25.24 s "End-to-end solution…" · 27.70 s "Chat us now or click the link…"
  total: 960, // voice ends 30.35 s; ~1.6 s hold on the CTA
};

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
