import { useVideoConfig } from "remotion";

// Delivery formats. Keys are used in composition ids and output filenames.
export const FORMATS = {
  "16x9": { width: 1920, height: 1080, label: "Landscape — YouTube, web, LinkedIn" },
  "9x16": { width: 1080, height: 1920, label: "Vertical — Reels, TikTok, Shorts, Stories" },
  "1x1": { width: 1080, height: 1080, label: "Square — feed posts" },
  "4x5": { width: 1080, height: 1350, label: "Portrait — Instagram/Facebook feed ads" },
} as const;

export type FormatKey = keyof typeof FORMATS;
export const FORMAT_KEYS = Object.keys(FORMATS) as FormatKey[];

export const FPS = 30;

/**
 * Responsive helpers so one template works in every aspect ratio.
 * `u` is a scale unit: 1 on a 1080px short side, so `48 * u` is 48px at 1080p.
 */
export const useLayout = () => {
  const { width, height } = useVideoConfig();
  const u = Math.min(width, height) / 1080;
  const aspect = width / height;
  return {
    u,
    width,
    height,
    isLandscape: aspect > 1.2,
    isVertical: aspect < 0.7,
    // Keep content out of platform UI overlays (captions, buttons) on vertical video.
    safeTop: aspect < 0.7 ? height * 0.12 : height * 0.06,
    safeBottom: aspect < 0.7 ? height * 0.18 : height * 0.06,
  };
};
