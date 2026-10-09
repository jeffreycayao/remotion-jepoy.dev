import React from "react";
import { AbsoluteFill, Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COPY, USER } from "../content";
import { RevealText } from "../RevealText";
import { C, clamp, FONT } from "../tokens";
import { Chip, useFormat } from "../ui";

// Frames within the scene (307 long). Beats follow the recorded voiceover.
export const PANEL_IN = 0; // "May magandang balita kami!"
export const PROFILE_IN = 64; // "Para sa lahat ng ating Paid at Pro users"
export const UNLOCK = 144; // "…100% FREE na…"

/** Padlock whose shackle lifts and swings open at `open` 0→1. */
const Padlock: React.FC<{ open: number; size: number }> = ({ open, size }) => (
  <svg width={size} height={size * 1.15} viewBox="0 0 40 46">
    <g style={{ translate: `0px ${-open * 6}px`, rotate: `${open * -28}deg`, transformOrigin: "30px 20px" }}>
      <path d="M11 20 V13 a9 9 0 0 1 18 0 V20" fill="none" stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
    </g>
    <rect x={5} y={19} width={30} height={25} rx={6} fill={C.ink} />
    <circle cx={20} cy={30} r={3.5} fill={C.lime} />
    <rect x={18.5} y={31} width={3} height={7} rx={1.5} fill={C.lime} />
  </svg>
);

/** Scene 2 (194–501): charcoal panel springs in; the Pro gift badge unlocks; profile shows PRO. */
export const Scene2Gift: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const panel = spring({ frame: frame - PANEL_IN, fps, config: { damping: 16, stiffness: 110 } });
  const profile = spring({ frame: frame - PROFILE_IN, fps, config: { damping: 14 } });
  const unlock = interpolate(frame, [UNLOCK, UNLOCK + 14], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2)) });
  const badgeIn = spring({ frame: frame - UNLOCK - 8, fps, config: { damping: 10, stiffness: 160 } });
  const glow = frame >= UNLOCK ? 0.45 + 0.2 * Math.sin((frame - UNLOCK) / 6) : 0;
  const burst = interpolate(frame, [UNLOCK, UNLOCK + 30], [0, 1], clamp);
  const proPulse = frame >= PROFILE_IN + 14 ? 1 + 0.06 * Math.max(0, Math.sin((frame - PROFILE_IN - 14) / 5)) * interpolate(frame, [PROFILE_IN + 14, PROFILE_IN + 60], [1, 0], clamp) : 1;
  const unlocked = frame >= UNLOCK + 10;

  // 16:9: announcement left, profile card right. Other formats: one centred column.
  const { mode, lw, lh, vertical, safeTop, safeBottom } = useFormat();
  const stacked = mode !== "wide";
  const z = mode === "wide" ? { head: 86, sub: 40, lock: 120, chip: 30, name: 32 } : vertical ? { head: 80, sub: 38, lock: 110, chip: 25, name: 32 } : mode === "tall" ? { head: 70, sub: 34, lock: 100, chip: 24, name: 30 } : { head: 58, sub: 30, lock: 88, chip: 21, name: 26 };

  return (
    <AbsoluteFill style={{ background: C.cream }}>
      {/* Charcoal panel springs open from the centre to full-bleed */}
      <AbsoluteFill
        style={{
          background: C.canvas,
          scale: `${0.25 + 0.75 * panel}`,
          borderRadius: (1 - panel) * 80,
          overflow: "hidden",
        }}
      >
        <AbsoluteFill style={{ backgroundImage: "radial-gradient(rgba(246,241,230,0.07) 1.4px, transparent 1.6px)", backgroundSize: "36px 36px" }} />
        <div style={{ position: "absolute", left: lw * 0.2, top: lh * 0.56, width: 1300, height: 1300, translate: "-50% -50%", borderRadius: "50%", background: `radial-gradient(circle, rgba(213,250,0,${0.18 * burst}) 0%, rgba(0,0,0,0) 60%)` }} />
      </AbsoluteFill>

      <AbsoluteFill style={{ opacity: interpolate(panel, [0.6, 1], [0, 1], clamp) }}>
        <div
          style={
            stacked
              ? { position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: mode === "square" ? 34 : 56, padding: `${safeTop + 20}px 60px ${safeBottom + 20}px`, boxSizing: "border-box" }
              : { position: "absolute", inset: 0 }
          }
        >
        {/* The announcement */}
        <div style={{ position: stacked ? "relative" : "absolute", left: stacked ? 0 : 140, top: stacked ? 0 : 200, width: stacked ? lw - 120 : 980, display: "flex", flexDirection: "column", gap: mode === "square" ? 18 : 26 }}>
          <div>
            <Chip size={20}>✦ {COPY.giftKicker}</Chip>
          </div>
          <RevealText text={COPY.giftHeadline} delay={14} style={{ fontFamily: FONT.head, fontWeight: 800, fontSize: z.head, lineHeight: 1.05, color: C.cream }} />
          <RevealText text={COPY.giftSub} delay={UNLOCK + 4} stagger={2} accent={["100%", "FREE"]} style={{ fontFamily: FONT.body, fontWeight: 600, fontSize: z.sub, lineHeight: 1.3, color: C.cream }} />

          {/* Gift badge */}
          <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 22, marginTop: 16 }}>
            <div style={{ width: z.lock, height: z.lock, borderRadius: z.lock / 4, flexShrink: 0, background: C.lime, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 ${80 * glow}px rgba(213,250,0,${glow})`, scale: `${1 + 0.08 * Math.sin(Math.min(1, burst) * Math.PI)}`, position: "relative" }}>
              <Padlock open={unlock} size={z.lock * 0.53} />
              {/* Sparks */}
              {frame >= UNLOCK &&
                Array.from({ length: 14 }, (_, i) => {
                  const a = (i / 14) * Math.PI * 2 + random(`sp-${i}`) * 0.4;
                  const d = 70 + burst * (90 + random(`sd-${i}`) * 80);
                  return <span key={i} style={{ position: "absolute", left: z.lock / 2 + Math.cos(a) * d - 5, top: z.lock / 2 + Math.sin(a) * d - 5, width: 10, height: 10, borderRadius: 99, background: i % 3 === 0 ? C.blue : C.lime, opacity: 1 - burst }} />;
                })}
            </div>
            <div style={{ opacity: badgeIn, scale: `${0.6 + 0.4 * badgeIn}`, transformOrigin: "0% 50%" }}>
              <Chip tone="lime" size={z.chip} style={{ padding: `${z.chip * 0.46}px ${z.chip * 0.8}px`, borderRadius: 16, boxShadow: `0 0 ${50 * glow}px rgba(213,250,0,${glow * 0.8})` }}>
                [{COPY.giftBadge}]
              </Chip>
            </div>
          </div>
        </div>

        {/* The user's profile card */}
        <div
          style={{
            position: stacked ? "relative" : "absolute",
            left: stacked ? 0 : 1240,
            top: stacked ? 0 : 300,
            width: stacked ? lw - 120 : 540,
            flexShrink: 0,
            background: C.white,
            borderRadius: 28,
            padding: mode === "square" ? 26 : 36,
            boxSizing: "border-box",
            boxShadow: "0 40px 90px rgba(0,0,0,0.45)",
            opacity: profile,
            translate: `${(1 - profile) * 120}px 0px`,
            rotate: `${(1 - profile) * 4}deg`,
            display: "flex",
            flexDirection: "column",
            gap: mode === "square" ? 14 : 24,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ width: 84, height: 84, borderRadius: 99, background: C.blue, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT.head, fontWeight: 800, fontSize: 32, color: C.ink }}>{USER.initials}</div>
            <div>
              <div style={{ fontFamily: FONT.head, fontWeight: 800, fontSize: z.name, color: C.ink }}>{USER.name}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6 }}>
                <span style={{ display: "inline-block", scale: `${proPulse}` }}>
                  <Chip tone="lime" size={18}>
                    ● PRO
                  </Chip>
                </span>
                <span style={{ fontFamily: FONT.body, fontWeight: 500, fontSize: 18, color: C.inkMuted }}>Active plan</span>
              </div>
            </div>
          </div>
          <div style={{ height: 2, background: C.line }} />
          {[
            { name: "X24H Outbound", on: true },
            { name: "TagPilot™", on: true },
            { name: "AI Agent Instructions Builder", on: unlocked, isNew: true },
          ].map((row) => (
            <div key={row.name} style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ fontFamily: FONT.body, fontWeight: 600, fontSize: 21, color: C.ink, flex: 1 }}>{row.name}</span>
              {row.isNew && !row.on && <Chip size={15}>🔒 Locked</Chip>}
              {row.on && (
                <Chip tone={row.isNew ? "lime" : "blue"} size={15} style={row.isNew ? { scale: `${0.7 + 0.3 * badgeIn}` } : undefined}>
                  {row.isNew ? "✓ Unlocked · FREE" : "✓ Active"}
                </Chip>
              )}
            </div>
          ))}
        </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
