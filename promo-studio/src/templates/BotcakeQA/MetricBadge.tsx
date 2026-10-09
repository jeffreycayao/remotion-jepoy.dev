import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { clamp, FONT } from "./tokens";

export const formatNumber = (n: number, decimals = 0) =>
  n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

/**
 * JetBrains Mono number ticker. Counts `from` → `to` between `delay` and `delay + duration`
 * (frames, relative to the enclosing Sequence). Pass `value` instead to show a live number.
 * `jitter` shakes the digits while they spin — used for the "out of control" counters in Act 1.
 */
export const MetricBadge: React.FC<{
  to?: number;
  from?: number;
  value?: number;
  delay?: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  jitter?: number;
  style?: React.CSSProperties;
}> = ({ to = 0, from = 0, value, delay = 0, duration = 30, decimals = 0, prefix = "", suffix = "", jitter = 0, style }) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [delay, delay + duration], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const shown = value ?? from + (to - from) * progress;
  const spinning = value === undefined && progress > 0 && progress < 1;
  const shake = spinning ? Math.sin(frame * 2.3) * jitter : 0;

  return (
    <span
      style={{
        fontFamily: FONT.mono,
        fontWeight: 600,
        fontVariantNumeric: "tabular-nums",
        display: "inline-block",
        translate: `0px ${shake}px`,
        ...style,
      }}
    >
      {prefix}
      {formatNumber(decimals ? shown : Math.round(shown), decimals)}
      {suffix}
    </span>
  );
};
