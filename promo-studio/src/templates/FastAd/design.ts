import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { loadFont as loadSora } from "@remotion/google-fonts/Sora";
import { useVideoConfig } from "remotion";

const subset = { subsets: ["latin" as const, "latin-ext" as const] };

export const FONT = {
  head: loadSora("normal", { ...subset, weights: ["700", "800"] }).fontFamily,
  body: loadInter("normal", { ...subset, weights: ["500", "600", "700"] }).fontFamily,
  mono: loadMono("normal", { ...subset, weights: ["500", "600", "700"] }).fontFamily,
} as const;

export const C = {
  charcoal: "#27231B",
  panel: "#343027",
  cream: "#F6F1E6",
  lime: "#D5FA00",
  olive: "#687323",
  blue: "#BFD0EF",
  white: "#FFFFFF",
  red: "#E85B50",
  muted: "#AFA99A",
} as const;

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const useLayout = () => {
  const { width: w, height: h } = useVideoConfig();
  const ratio = w / h;
  const vertical = ratio < 0.7;
  const wide = ratio > 1.35;
  const square = ratio >= 0.9 && ratio <= 1.35;
  const scale = Math.min(w, h) / 1080;
  const side = (wide ? 100 : 68) * scale;
  const safeTop = (vertical ? 120 : wide ? 68 : 76) * scale;
  const safeBottom = (vertical ? 120 : wide ? 68 : 76) * scale;
  return { w, h, ratio, vertical, wide, square, scale, side, safeTop, safeBottom };
};
