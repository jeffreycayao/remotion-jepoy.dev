import type { Caption } from "@remotion/captions";

/**
 * Turns one spoken line per scene into word-level captions.
 * Each line is spread across its scene (after the incoming transition, before the outgoing one),
 * giving longer words proportionally more time — close enough to real speech for on-screen captions.
 */
export const captionsFromLines = (
  lines: readonly string[],
  scenes: readonly { frames: number }[],
  transitionFrames: number,
  fps: number,
): Caption[] => {
  const captions: Caption[] = [];
  let at = 0;
  scenes.forEach((scene, i) => {
    const start = at;
    at += scene.frames - (i < scenes.length - 1 ? transitionFrames : 0);
    const words = (lines[i] ?? "").split(/\s+/).filter(Boolean);
    if (!words.length) return;
    // Speak inside the part of the scene that isn't overlapped by a transition, with a short lead-in.
    const from = ((start + (i > 0 ? transitionFrames : 0)) / fps) * 1000 + 150;
    const to = ((start + scene.frames - (i < scenes.length - 1 ? transitionFrames : 0)) / fps) * 1000 - 100;
    const weights = words.map((w) => w.length + 2);
    const total = weights.reduce((a, b) => a + b, 0);
    let t = from;
    words.forEach((word, w) => {
      const d = ((to - from) * weights[w]) / total;
      captions.push({
        // A leading space marks a word boundary for createTikTokStyleCaptions (a token without one is
        // glued onto the previous word). Scenes still start a new page because of the time gap.
        text: captions.length === 0 ? word : ` ${word}`,
        startMs: t,
        endMs: t + d,
        timestampMs: t + d / 2,
        confidence: null,
      });
      t += d;
    });
  });
  return captions;
};
