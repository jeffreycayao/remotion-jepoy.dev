import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { loadFont as loadSora } from "@remotion/google-fonts/Sora";

const opts = { subsets: ["latin" as const, "latin-ext" as const] };

export const FONT = {
  head: loadSora("normal", { ...opts, weights: ["700", "800"] }).fontFamily,
  body: loadInter("normal", { ...opts, weights: ["400", "500", "600"] }).fontFamily,
  mono: loadMono("normal", { ...opts, weights: ["500", "600"] }).fontFamily,
};

export const C = {
  canvas: "#27231B", // warm charcoal — sidebar, impact panels
  panel: "#1F1C16",
  cream: "#F6F1E6", // light workspace
  white: "#FFFFFF",
  lime: "#D5FA00",
  olive: "#687323",
  blue: "#BFD0EF",
  border: "#3A342A", // on charcoal
  line: "#E4DDCD", // hairlines on cream/white
  ink: "#27231B",
  inkMuted: "#7A7264",
  muted: "rgba(246,241,230,0.62)",
  error: "#E5534B", // Scene 1 strikethroughs only
};

/** The whole video is authored on a 1920×1080 canvas (see Canvas in ui.tsx). */
export const W = 1920;
export const H = 1080;

/**
 * Scene boundaries (absolute frames @ 30 fps), measured from the recorded voiceover
 * (public/projects/atmt-agent-builder/audio/announcement_vo.mp3, 42.4 s) by its phrase pauses.
 * Each cut lands ~4 frames before its phrase so the picture leads the word. Re-measure if it changes:
 *   ffmpeg -i announcement_vo.mp3 -af silencedetect=noise=-35dB:d=0.12 -f null -
 */
export const T = {
  pain: 0, // 0.00 s "Pagod ka na bang mag-mano-mano … dalawang oras?"
  gift: 194, // 6.59 s "May magandang balita kami!" · 8.70 s "Para sa … Pro users:" · 11.31 s "one hundred percent FREE…"
  demo: 501, // 16.83 s "May negosyo ka man sa Product, Services, o Hybrid…"
  speed: 884, // 29.60 s "Walang hulaan." · 30.94 s "Kumpleto sa rules," · 32.15 s "behavior, at one-click validation…"
  cta: 1067, // 35.71 s "Available na sa dashboard mo." · 37.71 s "Mag-login na sa…"
  total: 1315, // voice ends 42.23 s; ~1.6 s hold on the login pill
};

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
