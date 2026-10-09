import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { loadFont as loadSora } from "@remotion/google-fonts/Sora";
import { useVideoConfig } from "remotion";

// latin-ext carries the peso sign (₱) used in the sample chats.
const opts = { subsets: ["latin" as const, "latin-ext" as const] };

export const FONT = {
  head: loadSora("normal", { ...opts, weights: ["700", "800"] }).fontFamily,
  body: loadInter("normal", { ...opts, weights: ["500", "600"] }).fontFamily,
  mono: loadMono("normal", { ...opts, weights: ["500", "600"] }).fontFamily,
};

export const C = {
  canvas: "#27231B", // warm charcoal
  panel: "#1F1C16",
  cream: "#F6F1E6",
  white: "#FFFFFF",
  lime: "#D5FA00",
  olive: "#687323",
  blue: "#BFD0EF",
  border: "#3A342A",
  card: "rgba(45, 41, 35, 0.95)",
  line: "#E4DDCD", // hairlines on cream/white surfaces
  ink: "#27231B", // text on light surfaces
  inkMuted: "#7A7264",
  muted: "rgba(246,241,230,0.62)",
  error: "#E5534B", // the "robotic bot" failure state only
};

/**
 * Scene boundaries (absolute frames @ 30 fps), measured from the recorded voiceover
 * (public/projects/atmt-botcake-qa/audio/voiceover.mp3, 33.36 s) by its phrase pauses.
 * Each cut lands ~4 frames before its phrase so the picture leads the word.
 * Re-measure if the voiceover changes:
 *   ffmpeg -i voiceover.mp3 -af silencedetect=noise=-35dB:d=0.12 -f null -
 */
export const T = {
  robotic: 0, // 0.00 s "Robot ba sumagot ang botcake AI mo? … nawawala ang benta."
  qa: 164, // 5.59 s "Gamit ang ActionSuite, … 4-minute automated run."
  matrix: 524, // 17.60 s "Auto-test 300+ prompts" · 20.15 s "Taglish, complaints…" · 23.68 s "Zero hallucination…"
  cta: 795, // 26.62 s "Build better prompts." · 28.12 s "Ship with confidence." · 29.84 s "Bisitahin…"
  total: 1040, // voice ends 33.20 s; ~1.4 s hold on the URL
};

export type Mode = "wide" | "tall";

/**
 * Format-aware layout. `u` = 1 on a 1080px short side. `mode` picks the scene arrangement:
 * 16:9 lays panels side by side ("wide"); 1:1, 4:5 and 9:16 stack them ("tall").
 * `safe` is the content box after platform safe zones (9:16 keeps 120px clear top and bottom).
 */
export const useFrameLayout = () => {
  const { width, height } = useVideoConfig();
  const u = Math.min(width, height) / 1080;
  const aspect = width / height;
  const mode: Mode = aspect > 1.2 ? "wide" : "tall";
  const vertical = aspect < 0.7;
  const padX = Math.max(48 * u, width * 0.05);
  const padTop = vertical ? Math.max(120, height * 0.07) : Math.max(44 * u, height * 0.055);
  const padBottom = vertical ? Math.max(120, height * 0.07) : Math.max(44 * u, height * 0.055);
  return {
    width,
    height,
    u,
    aspect,
    mode,
    vertical,
    square: aspect > 0.9 && aspect < 1.1,
    safe: { x: padX, y: padTop, w: width - padX * 2, h: height - padTop - padBottom },
  };
};

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
