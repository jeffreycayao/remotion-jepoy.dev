import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { loadFont as loadSora } from "@remotion/google-fonts/Sora";

// latin-ext carries the peso sign (₱).
const opts = { subsets: ["latin" as const, "latin-ext" as const] };

export const FONT = {
  head: loadSora("normal", { ...opts, weights: ["700", "800"] }).fontFamily,
  body: loadInter("normal", { ...opts, weights: ["500", "600"] }).fontFamily,
  mono: loadMono("normal", { ...opts, weights: ["600", "700"] }).fontFamily,
};

export const C = {
  canvas: "#27231B", // charcoal — dominant backdrop
  panel: "#1F1C16",
  cream: "#F6F1E6", // cards, panels
  white: "#FFFFFF", // dashboard card surfaces
  lime: "#D5FA00", // positive %, 24/7 pills, HELP CTA
  olive: "#687323", // lines, dividers, chart borders
  blue: "#BFD0EF", // badges & tags
  border: "#3A342A",
  line: "#E4DDCD",
  ink: "#27231B",
  inkMuted: "#7A7264",
  muted: "rgba(246,241,230,0.62)",
};

/**
 * Scene boundaries (absolute frames @ 30 fps), measured from the recorded voiceover
 * (public/projects/atmt-bc-promotionals/audio/automatika_sales_ad.mp3, 23.36 s) by its phrase
 * pauses. Each cut lands ~4 frames before its phrase. Re-measure if the voice changes:
 *   ffmpeg -i automatika_sales_ad.mp3 -af silencedetect=noise=-35dB:d=0.1 -f null -
 */
export const T = {
  hook: 0, // 0.00 s "Chatbot na kayang mag-close ng client ba ang hanap mo?" · 3.08 s "Tara na!"
  setup: 118, // 4.06 s "Dito sa Automatika," · 5.54 s "kami na ang bahala…" · 11.11 s "gumagana 24/7," · 12.80 s "mabilis mag-reply."
  proof: 435, // 14.62 s "Madami na kaming mga business owners na natulungan…"
  cta: 567, // 19.02 s "Kaya ano pang hinihintay mo?" · 20.65 s "Comment ka na ng 'HELP'" · 21.85 s "para matulungan…"
  total: 780, // voice ends 23.24 s; ~2.5 s hold so viewers can act on the CTA
};

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
