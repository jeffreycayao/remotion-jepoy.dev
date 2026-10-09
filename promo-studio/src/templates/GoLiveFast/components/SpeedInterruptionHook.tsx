import React from "react";
import { AbsoluteFill, Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CONTENT } from "../content";
import { C, clamp, FONT, useLayout } from "../design";
import { Icon } from "../Icons";

// Local frames (scene starts at 0). Voice: 0.00 "Bakit aabutin…" · 3.42 "Sa kahit anong niche—" · 4.82 "…mag-Go-LIVE agad".
export const COUNT_END = 48; // day counter decelerates and stalls (tape-stop)
export const STRIKE_AT = 108; // strikethrough + glitch
export const BADGE_AT = 147; // lime GO-LIVE badge snaps in

const STALL_DAYS = 21;
const FILL_AT_STALL = 0.58;

/** Scene 1 (0–199): a DIY setup meter races, stalls at 3+ weeks, gets struck out, lime badge snaps in. */
export const SpeedInterruptionHook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { w, kind, pick } = useLayout();

  const slam = spring({ frame, fps, config: { damping: 9, stiffness: 220 } });
  const progress = interpolate(frame, [4, COUNT_END], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const days = Math.round(progress * STALL_DAYS);
  const stalled = frame >= COUNT_END;
  const stallPop = spring({ frame: frame - COUNT_END - 2, fps, config: { damping: 10, stiffness: 200 } });
  // Small shudder while stalled, killed by the strike.
  const shake = stalled && frame < STRIKE_AT ? (random(`s${frame}`) - 0.5) * 7 : 0;
  const strike = interpolate(frame, [STRIKE_AT, STRIKE_AT + 7], [0, 1], { ...clamp, easing: Easing.out(Easing.quad) });
  const glitch = frame >= STRIKE_AT && frame < STRIKE_AT + 9 ? (random(`g${frame}`) - 0.5) * 26 : 0;
  const dim = interpolate(frame, [STRIKE_AT + 4, STRIKE_AT + 20], [1, 0.32], clamp);
  const badge = spring({ frame: frame - BADGE_AT, fps, config: { damping: 8, stiffness: 190 } });
  const lift = interpolate(badge, [0, 1], [0, 1], clamp);

  const S = pick({
    wide: { head: 104, count: 210, meterW: 1100, label: 30, pill: 34, badge: 56, gap: 34 },
    square: { head: 84, count: 160, meterW: 880, label: 26, pill: 28, badge: 40, gap: 22 },
    portrait: { head: 92, count: 180, meterW: 900, label: 28, pill: 30, badge: 42, gap: 30 },
    vertical: { head: 104, count: 220, meterW: 920, label: 30, pill: 34, badge: 44, gap: 46 },
  });
  const meterColor = stalled ? C.red : C.cream;
  const speedLines = frame < COUNT_END + 4;

  return (
    <AbsoluteFill style={{ background: C.charcoal, overflow: "hidden" }}>
      {/* Glow: red while stalled, lime once the badge lands. */}
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 50%, rgba(229,83,75,${stalled ? 0.22 * (1 - lift) : 0}), transparent 55%)` }} />
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 62%, rgba(213,250,0,${0.2 * lift}), transparent 50%)` }} />

      {/* High-speed streaks while the counter races. */}
      {speedLines &&
        new Array(14).fill(0).map((_, i) => {
          const y = random(`y${i}`) * 100;
          const len = 160 + random(`l${i}`) * 380;
          const x = ((random(`x${i}`) * w + frame * (60 + random(`v${i}`) * 60)) % (w + len)) - len;
          return <div key={i} style={{ position: "absolute", top: `${y}%`, left: x, width: len, height: 3, background: C.olive, opacity: 0.55 * (1 - progress * 0.6), borderRadius: 3 }} />;
        })}

      <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: S.gap }}>
        <div style={{ fontFamily: FONT.head, fontWeight: 800, fontSize: S.head, lineHeight: 1.05, letterSpacing: -2, color: C.cream, textAlign: "center", transform: `scale(${1.6 - 0.6 * slam})`, opacity: Math.min(1, slam * 1.5) * dim }}>
          {CONTENT.hook.question}
        </div>

        <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: S.gap * 0.6, transform: `translate(${shake + glitch}px, ${shake * 0.4}px)`, opacity: dim }}>
          <div style={{ fontFamily: FONT.mono, fontWeight: 600, fontSize: S.label, letterSpacing: 3, color: C.muted, display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ width: 14, height: 14, borderRadius: 7, background: meterColor, boxShadow: `0 0 16px ${meterColor}` }} />
            {CONTENT.hook.meterLabel}
          </div>
          <div style={{ fontFamily: FONT.mono, fontWeight: 600, fontSize: S.count, lineHeight: 1, color: meterColor, letterSpacing: -4, fontVariantNumeric: "tabular-nums" }}>
            DAY {String(days).padStart(2, "0")}
            {stalled ? "+" : ""}
          </div>
          <div style={{ width: S.meterW, height: 30, borderRadius: 15, background: C.panel, border: `2px solid ${C.olive}`, overflow: "hidden", position: "relative" }}>
            <div style={{ position: "absolute", inset: 0, width: `${progress * FILL_AT_STALL * 100}%`, background: meterColor, borderRadius: 15 }} />
          </div>
          <div style={{ height: S.pill * 1.9, display: "flex", alignItems: "center" }}>
            <div style={{ fontFamily: FONT.mono, fontWeight: 600, fontSize: S.pill, color: C.white, background: C.red, borderRadius: 999, padding: `${S.pill * 0.3}px ${S.pill * 0.8}px`, transform: `scale(${stallPop})`, opacity: stallPop, whiteSpace: "nowrap" }}>
              {CONTENT.hook.stalled}
            </div>
          </div>

          {/* Strikethrough slashing the stalled meter. */}
          <div style={{ position: "absolute", left: "-6%", top: "52%", width: `${112 * strike}%`, height: 16, background: C.red, borderRadius: 8, transform: "rotate(-7deg)", transformOrigin: "0% 50%", boxShadow: `0 0 26px ${C.red}` }} />
        </div>
      </AbsoluteFill>

      {/* The answer: lime GO-LIVE badge snaps over the dimmed meter. */}
      <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: S.badge * 0.4,
            background: C.lime,
            color: C.ink,
            borderRadius: 999,
            padding: `${S.badge * 0.42}px ${S.badge * 0.8}px`,
            fontFamily: FONT.body,
            fontWeight: 700,
            fontSize: S.badge,
            whiteSpace: "nowrap",
            transform: `scale(${badge}) rotate(${(1 - badge) * -6}deg)`,
            opacity: Math.min(1, badge * 2),
            boxShadow: `0 0 ${60 * lift}px rgba(213,250,0,0.55), 0 24px 50px rgba(0,0,0,0.45)`,
            maxWidth: kind === "wide" ? undefined : w - 80,
          }}
        >
          <Icon name="bolt" size={S.badge * 1.1} color={C.ink} />
          {CONTENT.hook.badge}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
