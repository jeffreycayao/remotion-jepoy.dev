import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { PARTNER_BADGE } from "../content";
import { C, FONT } from "../tokens";
import { Shimmer } from "../ui";
import { Logo } from "./Logos";

/**
 * [OFFICIAL PARTNER: PANCAKE PHILIPPINES] — drops in from above with spring physics at `at`,
 * then breathes a lime border glow. `size` is the label font size (logical px).
 */
export const PartnerBadge: React.FC<{ at: number; size: number; drop?: boolean }> = ({ at, size, drop = true }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - at, fps, config: { damping: 9, stiffness: 120, mass: 0.9 } });
  const glow = frame >= at ? 0.45 + 0.25 * Math.sin((frame - at) / 7) : 0;
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: size * 0.55,
        padding: `${size * 0.55}px ${size * 0.95}px`,
        borderRadius: 999,
        background: C.panel,
        border: `${Math.max(2, size * 0.12)}px solid ${C.lime}`,
        boxShadow: `0 0 ${size * 2.4 * glow}px rgba(213,250,0,${glow}), inset 0 0 ${size}px rgba(213,250,0,0.12)`,
        opacity: Math.min(1, p * 1.5),
        translate: drop ? `0px ${(1 - p) * -size * 8}px` : undefined,
        scale: drop ? undefined : `${0.6 + 0.4 * p}`,
        whiteSpace: "nowrap",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Shimmer start={at + 14} every={75} duration={26} />
      <Logo name="pancake" h={size * 1.45} />
      <span style={{ fontFamily: FONT.mono, fontWeight: 600, fontSize: size, letterSpacing: size * 0.04, color: C.lime }}>[{PARTNER_BADGE}]</span>
    </div>
  );
};
