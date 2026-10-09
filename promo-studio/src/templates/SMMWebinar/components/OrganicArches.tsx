import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { C, clamp, useLayout } from "../tokens";

/** A rounded-top arch as an SVG path: x/y = bottom-left corner. */
const archPath = (x: number, y: number, w: number, h: number) => {
  const r = w / 2;
  return `M ${x} ${y} L ${x} ${y - h + r} A ${r} ${r} 0 0 1 ${x + w} ${y - h + r} L ${x + w} ${y} Z`;
};

type Arch = { x: number; w: number; h: number; fill: string; delay: number; drift: number };

/**
 * Soft sand arches that slide up from the bottom edge and breathe slowly for the whole video.
 * Positions are fractions of the frame so the composition holds in every aspect ratio.
 */
export const OrganicArches: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, landscape } = useLayout();

  const arches: Arch[] = landscape
    ? [
        { x: -0.04, w: 0.22, h: 0.78, fill: C.sand, delay: 0, drift: 1 },
        { x: 0.7, w: 0.26, h: 0.92, fill: C.peach, delay: 6, drift: -1 },
        { x: 0.86, w: 0.18, h: 0.55, fill: C.sand, delay: 12, drift: 1 },
      ]
    : [
        { x: -0.12, w: 0.5, h: 0.46, fill: C.sand, delay: 0, drift: 1 },
        { x: 0.58, w: 0.56, h: 0.62, fill: C.peach, delay: 6, drift: -1 },
        { x: 0.3, w: 0.4, h: 0.28, fill: C.sand, delay: 12, drift: 1 },
      ];

  return (
    <AbsoluteFill style={{ backgroundColor: C.canvas }}>
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        {arches.map((a, i) => {
          const rise = interpolate(frame, [a.delay, a.delay + 40], [1, 0], {
            ...clamp,
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          });
          const breathe = Math.sin((frame + i * 40) / 70) * 0.012 * a.drift;
          const w = a.w * width;
          const h = a.h * height * (1 + breathe);
          return (
            <path
              key={i}
              d={archPath(a.x * width, height + rise * h, w, h)}
              fill={a.fill}
              opacity={0.85}
            />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
