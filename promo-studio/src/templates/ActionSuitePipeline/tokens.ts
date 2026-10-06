import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { loadFont as loadSora } from "@remotion/google-fonts/Sora";
import { useVideoConfig } from "remotion";

// loadFont() blocks rendering until the font is ready, so frames never flash a fallback font.
const opts = { subsets: ["latin" as const] };

export const FONT = {
  head: loadSora("normal", { ...opts, weights: ["700", "800"] }).fontFamily,
  body: loadInter("normal", { ...opts, weights: ["500", "600"] }).fontFamily,
  mono: loadMono("normal", { ...opts, weights: ["500", "600"] }).fontFamily,
};

export const C = {
  canvas: "#27231B",
  cream: "#F6F1E6",
  card: "rgba(45, 41, 35, 0.95)",
  border: "#3A342A",
  lime: "#D5FA00",
  olive: "#687323",
  blue: "#BFD0EF",
};

/** Act boundaries in absolute frames (30 fps, 900 frames). */
export const T = {
  chaosOut: 190, // Act 1 starts dissolving into the graph
  graphIn: 200, // PipelineGraph sequence start
  flow: 300, // particles start travelling
  routeCopy: 330, // "Every lead sorted…"
  zoom: 540, // Act 3 — camera push toward CONVERT NOW / HUMAN REVIEW
  graphOut: 735, // graph dissolves into the CTA
  cta: 750, // Act 4
  total: 900,
};

/** `u` = 1 on a 1080px short side; `vertical` = 9:16-ish. */
export const useFrameLayout = () => {
  const { width, height } = useVideoConfig();
  const u = Math.min(width, height) / 1080;
  const vertical = height / width > 1.4;
  return { width, height, u, vertical, safeTop: vertical ? height * 0.12 : 70 * u, safeBottom: vertical ? height * 0.18 : 70 * u };
};

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
