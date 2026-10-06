import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { useLayout } from "../../../lib/layout";
import { useEnter } from "../components";
import type { AppPromoProps, Stat } from "../schema";

export const StatsScene: React.FC<{ props: AppPromoProps }> = ({ props }) => {
  const { u, isLandscape, safeTop, safeBottom } = useLayout();
  // Card width: all in one row on landscape, two per row otherwise (odd one centered).
  const perRow = isLandscape ? props.stats.length : Math.min(2, props.stats.length);
  const cardWidth = ((isLandscape ? 1700 : 960) * u - (perRow - 1) * 48 * u) / perRow;

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        paddingTop: safeTop,
        paddingBottom: safeBottom,
        paddingLeft: 80 * u,
        paddingRight: 80 * u,
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 48 * u,
          width: "100%",
          maxWidth: (isLandscape ? 1700 : 960) * u,
        }}
      >
        {props.stats.map((stat, i) => (
          <StatCard key={i} stat={stat} delay={i * 6} color={props.brand.primary} width={cardWidth} />
        ))}
      </div>
    </AbsoluteFill>
  );
};

const StatCard: React.FC<{ stat: Stat; delay: number; color: string; width: number }> = ({
  stat,
  delay,
  color,
  width,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u } = useLayout();
  const enter = useEnter(delay);
  const count = interpolate(frame - delay, [0, 1.2 * fps], [0, stat.value], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: (t) => 1 - Math.pow(1 - t, 3),
  });
  const decimals = Number.isInteger(stat.value) ? 0 : 1;

  return (
    <div
      style={{
        width,
        opacity: enter,
        scale: String(interpolate(enter, [0, 1], [0.85, 1])),
        background: "rgba(255,255,255,0.07)",
        border: "1px solid rgba(255,255,255,0.14)",
        borderRadius: 36 * u,
        padding: `${48 * u}px ${32 * u}px`,
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        gap: 12 * u,
      }}
    >
      <div style={{ fontSize: 96 * u, fontWeight: 800, color, letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>
        {stat.prefix}
        {count.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
        {stat.suffix}
      </div>
      <div style={{ fontSize: 34 * u, opacity: 0.75 }}>{stat.label}</div>
    </div>
  );
};
