import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { loadFont as loadSora } from "@remotion/google-fonts/Sora";
import { useVideoConfig } from "remotion";

const opts = { subsets: ["latin" as const, "latin-ext" as const] };

export const FONT = {
  head: loadSora("normal", { ...opts, weights: ["700", "800"] }).fontFamily,
  body: loadInter("normal", { ...opts, weights: ["500", "600", "700"] }).fontFamily,
  mono: loadMono("normal", { ...opts, weights: ["500", "600"] }).fontFamily,
};

export const C = {
  charcoal: "#27231B",
  panel: "#342F25",
  cream: "#F6F1E6",
  lime: "#D5FA00",
  olive: "#687323",
  blue: "#BFD0EF",
  white: "#FFFFFF",
  red: "#E5534B",
  ink: "#27231B",
  muted: "#A9A391",
} as const;

/**
 * Scene cuts (absolute frames @ 30 fps), placed ~4 frames before each voice line of the
 * unedited master voiceover (go_live_fast_voiceover.mp3, 31.44 s). Measured with:
 *   ffmpeg -i go_live_fast_voiceover.mp3 -af silencedetect=noise=-35dB:d=0.12 -f null -
 */
export const T = {
  hook: 0, // 0.00 "Bakit aabutin…" · 3.42 "Sa kahit anong niche—" · 4.82 "gusto mong mag-Go-LIVE agad, di ba?"
  implementor: 199, // 6.78 "Huwag mo nang daanin…" · 9.10 "Sa Automatika," · 10.20 "kami ang certified implementor…"
  niches: 455, // 15.31 "E-commerce, jewelry, solar, clinics…" · 19.46 "kami na ang bahala sa CRM…"
  cta: 734, // 24.61 "Magbenta ka na agad…" · 27.18 "Comment 'LAUNCH'…" (voice ends 31.28)
  total: 1050,
} as const;

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export type Kind = "wide" | "square" | "portrait" | "vertical";

/** Every format has a 1080 short side, so layouts are authored in real pixels. */
export const useLayout = () => {
  const { width: w, height: h } = useVideoConfig();
  const r = w / h;
  const kind: Kind = r > 1.3 ? "wide" : r > 0.95 ? "square" : r > 0.7 ? "portrait" : "vertical";
  const safeY = kind === "vertical" ? 120 : kind === "wide" ? 70 : 56;
  const side = kind === "wide" ? 110 : 60;
  const pick = <V,>(v: Record<Kind, V>): V => v[kind];
  return { w, h, kind, wide: kind === "wide", vertical: kind === "vertical", safeY, side, pick };
};
