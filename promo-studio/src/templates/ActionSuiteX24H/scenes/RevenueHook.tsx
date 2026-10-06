import React from "react";
import { AbsoluteFill, Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COPY, MATH } from "../content";
import { MetricBadge } from "../MetricBadge";
import { C, clamp, FONT, peso, T, useFrameLayout } from "../tokens";
import { Chip, SceneHeadline } from "../ui";

/** A field of contact dots that light up as the idle-lead counter climbs, then go dim. */
const ContactField: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, u, vertical } = useFrameLayout();
  const cols = vertical ? 22 : 44;
  const rows = vertical ? 40 : 22;
  const gx = width / cols;
  const gy = height / rows;
  const lit = interpolate(frame, [6, T.math - 10], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const fade = interpolate(frame, [T.math, T.math + 30], [1, 0.35], clamp);
  return (
    <svg width={width} height={height} style={{ position: "absolute", inset: 0, opacity: fade }}>
      {Array.from({ length: cols * rows }, (_, i) => {
        const r = random(`dot-${i}`);
        const on = r < lit;
        // Idle contacts "breathe" faintly — alive, but nobody is talking to them.
        const breathe = 0.5 + 0.5 * Math.sin(frame / 18 + r * 20);
        return (
          <circle
            key={i}
            cx={(i % cols) * gx + gx / 2}
            cy={Math.floor(i / cols) * gy + gy / 2}
            r={2.6 * u}
            fill={r > 0.985 ? C.blue : C.cream}
            opacity={on ? 0.1 + 0.18 * breathe : 0.03}
          />
        );
      })}
    </svg>
  );
};

const Term: React.FC<{ at: number; children: React.ReactNode; color?: string }> = ({ at, children, color = C.cream }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - at, fps, config: { damping: 11, stiffness: 160 } });
  return <span style={{ display: "inline-block", opacity: p, scale: `${0.4 + 0.6 * p}`, translate: `0px ${(1 - p) * 30}px`, color }}>{children}</span>;
};

/** Scene 1A + 1B (frames 0–255): 100,000 idle leads → 100,000 × 5% × ₱999 = ₱4,995,000. */
export const RevenueHook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u, vertical } = useFrameLayout();
  const total = MATH.contacts * MATH.rate * MATH.price;

  // 1A counter hands over to the formula at T.math.
  const counterOut = interpolate(frame, [T.math - 8, T.math + 6], [1, 0], clamp);
  const counterIn = spring({ frame: frame - 2, fps, config: { damping: 200 } });
  // Camera punch-in on the result at T.punch, then a slow push while it pulses.
  const punch = spring({ frame: frame - T.punch, fps, config: { damping: 13, stiffness: 120 } });
  const drift = interpolate(frame, [T.punch, T.outbound], [0, 0.06], clamp);
  const pulse = frame >= T.punch ? 1 + 0.035 * Math.sin((frame - T.punch) / 4.5) : 1;
  const glow = frame >= T.punch ? 0.45 + 0.25 * Math.sin((frame - T.punch) / 4.5) : 0;
  const resultAt = T.punch - 14;
  const formulaSize = (vertical ? 66 : 84) * u;

  return (
    <AbsoluteFill>
      <ContactField />

      {/* 1A — 100,000 idle leads */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: counterOut, gap: 18 * u }}>
        <Chip tone="dark" size={22} style={{ opacity: counterIn }}>
          OMNI INBOX · STATUS: IDLE
        </Chip>
        <MetricBadge
          from={0}
          to={MATH.contacts}
          delay={6}
          duration={85}
          jitter={2 * u}
          style={{ fontSize: (vertical ? 168 : 190) * u, color: C.cream, letterSpacing: -4 * u, lineHeight: 1 }}
        />
        <div style={{ fontFamily: FONT.body, fontWeight: 600, fontSize: (vertical ? 44 : 40) * u, color: C.blue, opacity: counterIn }}>{COPY.idleLabel}</div>
      </AbsoluteFill>
      <AbsoluteFill style={{ opacity: counterOut }}>
        <SceneHeadline text={COPY.idleHeadline} delay={30} align="bottom" />
      </AbsoluteFill>

      {/* 1B — the math */}
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          gap: 20 * u,
          transformOrigin: "50% 62%",
          scale: `${1 + 0.18 * punch + drift}`,
        }}
      >
        <div style={{ fontFamily: FONT.mono, fontWeight: 600, fontSize: formulaSize, color: C.cream, opacity: 1 - punch * 0.45, whiteSpace: "nowrap" }}>
          <Term at={T.math}>100,000</Term> <Term at={T.math + 14}>×</Term> <Term at={T.math + 18}>5%</Term> <Term at={T.math + 32}>×</Term>{" "}
          <Term at={T.math + 36}>{peso(MATH.price)}</Term>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 24 * u, whiteSpace: "nowrap" }}>
          <Term at={resultAt} color={C.lime}>
            <span style={{ fontFamily: FONT.mono, fontWeight: 600, fontSize: formulaSize }}>=</span>
          </Term>
          <Term at={resultAt} color={C.lime}>
            <span style={{ display: "inline-block", scale: `${pulse}`, textShadow: `0 0 ${60 * u}px rgba(213,250,0,${glow})` }}>
              <MetricBadge
                from={0}
                to={total}
                delay={resultAt}
                duration={16}
                prefix="₱"
                style={{ fontSize: (vertical ? 118 : 150) * u, letterSpacing: -3 * u, color: C.lime, lineHeight: 1 }}
              />
            </span>
          </Term>
        </div>
        <div
          style={{
            fontFamily: FONT.body,
            fontWeight: 500,
            fontSize: (vertical ? 38 : 34) * u,
            color: C.blue,
            opacity: interpolate(frame, [T.punch + 12, T.punch + 26], [0, 1], clamp),
          }}
        >
          {COPY.mathCaption}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
