import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { loadFont as loadSora } from "@remotion/google-fonts/Sora";
import { useVideoConfig } from "remotion";

const fontOptions = { subsets: ["latin" as const, "latin-ext" as const] };

export const FONT = {
  sora: loadSora("normal", { ...fontOptions, weights: ["700", "800"] }).fontFamily,
  inter: loadInter("normal", { ...fontOptions, weights: ["500", "600", "700"] }).fontFamily,
  mono: loadMono("normal", { ...fontOptions, weights: ["500", "600"] }).fontFamily,
  head: loadSora("normal", { ...fontOptions, weights: ["700", "800"] }).fontFamily,
  body: loadInter("normal", { ...fontOptions, weights: ["500", "600", "700"] }).fontFamily,
};

export const C = {
  charcoal: "#27231B",
  canvas: "#27231B",
  ink: "#27231B",
  cream: "#F6F1E6",
  lime: "#D5FA00",
  olive: "#687323",
  blue: "#BFD0EF",
  white: "#FFFFFF",
  red: "#E5534B",
  panel: "#342F25",
  muted: "#A9A391",
} as const;

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Shared 1080px design grid with explicit vertical platform-safe edges. */
export const useLayout = () => {
  const { width: w, height: h } = useVideoConfig();
  const ratio = w / h;
  const vertical = ratio < 0.7;
  const wide = ratio > 1.3;
  const square = ratio >= 0.9 && ratio <= 1.3;
  const scale = Math.min(w, h) / 1080;
  const side = (wide ? 100 : 64) * scale;
  const safeTop = (vertical ? 120 : wide ? 66 : 58) * scale;
  const safeBottom = (vertical ? 120 : wide ? 66 : 58) * scale;
  return { w, h, scale, ratio, vertical, wide, square, side, safeTop, safeBottom };
};
