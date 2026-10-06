import React from "react";
import { AbsoluteFill, Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CHAOS_MESSAGES, CHAOS_PLATFORMS, COPY } from "./content";
import { MetricBadge } from "./MetricBadge";
import { RevealText } from "./RevealText";
import { C, clamp, FONT, T, useFrameLayout } from "./tokens";

const ALERTS = 28;

/** One incoming message alert: platform pill, message preview, unread bubble. */
const Alert: React.FC<{ i: number; x: number; y: number; u: number; cx: number; cy: number }> = ({ i, x, y, u, cx, cy }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const r = (k: string) => random(`chaos-${i}-${k}`);
  // Arrivals accelerate: sparse at first, then a flood.
  const delay = Math.round(150 * Math.pow(i / ALERTS, 1.6));
  const pop = spring({ frame: frame - delay, fps, config: { damping: 9, stiffness: 180 } });
  // Vibration grows with the pressure; each card buzzes at its own rate.
  const amp = interpolate(frame, [0, 170], [0.5, 5], clamp) * u;
  const buzz = (axis: string) => Math.sin(frame * (1.6 + r(axis) * 1.4) + r(`${axis}p`) * 6) * amp;
  // End of Act 1: everything gets pulled toward the centre — into the pipeline.
  const pull = interpolate(frame, [T.chaosOut - 20, T.chaosOut + 15], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const unread = 1 + Math.floor(r("n") * 9) + Math.floor(Math.max(0, frame - delay) / (20 + r("speed") * 25));

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 330 * u,
        padding: `${14 * u}px ${16 * u}px`,
        borderRadius: 18 * u,
        background: C.card,
        border: `${1.5 * u}px solid ${C.border}`,
        boxShadow: `0 ${10 * u}px ${30 * u}px rgba(0,0,0,0.45)`,
        display: "flex",
        alignItems: "center",
        gap: 12 * u,
        opacity: pop * (1 - pull),
        scale: `${pop * (1 - 0.7 * pull)}`,
        rotate: `${(r("rot") - 0.5) * 14}deg`,
        translate: `${buzz("x") + pull * (cx - 165 * u - x) * 0.8}px ${buzz("y") + pull * (cy - 40 * u - y) * 0.8}px`,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "inline-block",
            fontFamily: FONT.body,
            fontWeight: 600,
            fontSize: 15 * u,
            color: C.canvas,
            background: C.blue,
            borderRadius: 999,
            padding: `${3 * u}px ${10 * u}px`,
            marginBottom: 6 * u,
          }}
        >
          {CHAOS_PLATFORMS[i % CHAOS_PLATFORMS.length]}
        </div>
        <div style={{ fontFamily: FONT.body, fontWeight: 500, fontSize: 21 * u, color: C.cream, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {CHAOS_MESSAGES[(i * 7) % CHAOS_MESSAGES.length]}
        </div>
      </div>
      <div
        style={{
          minWidth: 40 * u,
          height: 40 * u,
          borderRadius: 999,
          background: C.lime,
          color: C.canvas,
          fontFamily: FONT.mono,
          fontWeight: 600,
          fontSize: 19 * u,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: `0 ${8 * u}px`,
        }}
      >
        {unread}
      </div>
    </div>
  );
};

/** Pressure counters above the headline. */
const Pressure: React.FC<{ delay: number; u: number; children: React.ReactNode; tone?: "lime" | "blue" | "cold" }> = ({ delay, u, children, tone = "lime" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: frame - delay, fps, config: { damping: 12 } });
  const color = tone === "lime" ? C.lime : tone === "blue" ? C.blue : C.cream;
  // "Lead gone cold" flickers like a dying neon sign.
  const flicker = tone === "cold" ? (Math.floor(frame / 3) % 5 === 0 ? 0.35 : 1) : 1;
  return (
    <div
      style={{
        fontFamily: FONT.mono,
        fontWeight: 600,
        fontSize: 30 * u,
        color,
        border: `${2 * u}px solid ${tone === "cold" ? C.border : color}`,
        background: "rgba(39,35,27,0.9)",
        borderRadius: 999,
        padding: `${10 * u}px ${24 * u}px`,
        opacity: enter * flicker,
        scale: `${0.6 + 0.4 * enter}`,
        textDecoration: tone === "cold" ? "line-through" : undefined,
        textDecorationColor: C.lime,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </div>
  );
};

export const NotificationChaos: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, u, vertical } = useFrameLayout();

  // Alerts sit on a jittered grid so they cover the frame without stacking into one blob.
  const cols = vertical ? 3 : 5;
  const rows = Math.ceil(ALERTS / cols);
  const cellW = width / cols;
  const cellH = height / rows;
  const alerts = Array.from({ length: ALERTS }, (_, i) => {
    const slot = (i * 11) % ALERTS; // scatter arrival order across the grid
    const col = slot % cols;
    const row = Math.floor(slot / cols);
    const x = col * cellW + random(`ax-${i}`) * Math.max(0, cellW - 330 * u) - 20 * u;
    const y = row * cellH + random(`ay-${i}`) * Math.max(0, cellH - 90 * u);
    return { i, x, y };
  });

  const out = interpolate(frame, [T.chaosOut, T.chaosOut + 25], [1, 0], clamp);
  const scrim = interpolate(frame, [30, 70], [0, 1], clamp);

  return (
    <AbsoluteFill style={{ opacity: out }}>
      {alerts.map((a) => (
        <Alert key={a.i} {...a} u={u} cx={width / 2} cy={height / 2} />
      ))}
      {/* Darken the centre so the headline reads over the noise. */}
      <AbsoluteFill
        style={{
          opacity: scrim,
          background: `radial-gradient(ellipse ${vertical ? "95% 45%" : "60% 55%"} at 50% 50%, rgba(39,35,27,0.97) 35%, rgba(39,35,27,0) 100%)`,
        }}
      />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: `0 ${(vertical ? 60 : 200) * u}px`, gap: 34 * u }}>
        <div style={{ display: "flex", flexDirection: vertical ? "column" : "row", alignItems: "center", gap: 16 * u }}>
          <Pressure delay={20} u={u}>
            <MetricBadge from={0} to={149} delay={20} duration={130} prefix="+" suffix=" unread" jitter={3 * u} />
          </Pressure>
          <Pressure delay={50} u={u} tone="blue">
            Customer waiting <MetricBadge from={1} to={42} delay={50} duration={120} suffix="m..." />
          </Pressure>
          <Pressure delay={115} u={u} tone="cold">
            Lead gone cold
          </Pressure>
        </div>
        <RevealText
          text={COPY.chaosHeadline}
          delay={45}
          style={{ fontFamily: FONT.head, fontWeight: 800, fontSize: (vertical ? 80 : 78) * u, lineHeight: 1.08, color: C.cream, textAlign: "center", maxWidth: (vertical ? 960 : 1120) * u }}
          accent={["scattered."]}
        />
        <RevealText
          text={COPY.chaosSub}
          delay={85}
          stagger={1.5}
          style={{ fontFamily: FONT.body, fontWeight: 500, fontSize: (vertical ? 38 : 34) * u, lineHeight: 1.35, color: C.blue, textAlign: "center", maxWidth: (vertical ? 900 : 1100) * u }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
