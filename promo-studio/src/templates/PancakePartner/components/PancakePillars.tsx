import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COPY, PILLARS } from "../content";
import { RevealText } from "../RevealText";
import { C, clamp, FONT } from "../tokens";
import { Backdrop, Chip, Shimmer, useFormat, usePick } from "../ui";
import { PartnerBadge } from "./PartnerBadge";

// Frames within Scene 2 (319 long), from the recorded voiceover:
//   4 "Kami ang bahala." · 49 "As an Official Partner of Pancake Philippines," · 121 "we deploy your full setup—"
//   176 "Pancake CRM," · 215 "Webcake pages," · 249 "Botcake AI," · 289 "at POS mo."
export const BADGE_AT = 46;
export const PILLAR_AT = [172, 211, 245, 285];

type Box = { x: number; y: number; w: number; h: number };

/** One turnkey module card. Flies in and locks into place at `at`, then shows ✓ Deployed. */
const PillarCard: React.FC<{ i: number; box: Box; at: number; fs: number; compact: boolean }> = ({ i, box, at, fs, compact }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = PILLARS[i];
  const lock = spring({ frame: frame - at, fps, config: { damping: 13, stiffness: 170 } });
  const settled = frame >= at + 10;
  const deployed = spring({ frame: frame - at - 10, fps, config: { damping: 11 } });
  const from = [-1, 1, -1, 1][i];
  return (
    <div
      style={{
        position: "absolute",
        left: box.x,
        top: box.y,
        width: box.w,
        height: box.h,
        background: C.cream,
        borderRadius: 24,
        border: `3px solid ${settled ? C.lime : C.border}`,
        boxShadow: settled ? `0 0 ${36 * deployed}px rgba(213,250,0,0.35), 0 24px 60px rgba(0,0,0,0.4)` : "0 24px 60px rgba(0,0,0,0.4)",
        padding: compact ? "18px 22px" : "26px 28px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: compact ? 8 : 14,
        opacity: Math.min(1, lock * 1.4),
        translate: `${(1 - lock) * from * 140}px ${(1 - lock) * 60}px`,
        rotate: `${(1 - lock) * from * 8}deg`,
        scale: `${0.85 + 0.15 * lock}`,
        overflow: "hidden",
      }}
    >
      <Shimmer start={at + 8} duration={24} strength={0.7} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: FONT.mono, fontWeight: 600, fontSize: fs * 0.8, color: C.olive }}>0{p.n}</span>
        <span style={{ opacity: deployed, scale: `${0.6 + 0.4 * deployed}`, display: "inline-block" }}>
          <Chip tone="lime" size={fs * 0.55}>
            ✓ Deployed
          </Chip>
        </span>
      </div>
      <div style={{ fontFamily: FONT.head, fontWeight: 800, fontSize: fs * 1.15, lineHeight: 1.05, color: C.ink }}>{p.title}</div>
      <div style={{ fontFamily: FONT.body, fontWeight: 500, fontSize: fs * 0.68, lineHeight: 1.35, color: C.inkMuted, flex: 1 }}>{p.desc}</div>
      <div>
        <Chip size={fs * 0.58}>[{p.chip}]</Chip>
      </div>
    </div>
  );
};

/** Scene 2 (210–510): partner badge drops in; the 4 turnkey pillars lock into a connected system. */
export const PancakePillars: React.FC = () => {
  const frame = useCurrentFrame();
  const { lw, lh, safeTop, safeBottom } = useFormat();
  const pick = usePick();

  const L = pick({
    wide: { badgeY: 70, badge: 30, headY: 190, head: 104, sub: 34, area: { x: 120, y: 520, w: 1680, h: 440 }, cols: 4, fs: 36 },
    square: { badgeY: 50, badge: 21, headY: 140, head: 72, sub: 26, area: { x: 50, y: 360, w: 980, h: 680 }, cols: 2, fs: 30 },
    portrait: { badgeY: 50, badge: 21, headY: 150, head: 80, sub: 28, area: { x: 60, y: 400, w: 960, h: lh - 400 - safeBottom }, cols: 2, fs: 32 },
    vertical: { badgeY: safeTop, badge: 22, headY: safeTop + 110, head: 96, sub: 32, area: { x: 60, y: safeTop + 380, w: 960, h: lh - safeTop - 380 - safeBottom }, cols: 1, fs: 30 },
  });
  const rows = Math.ceil(PILLARS.length / L.cols);
  const gap = L.cols === 4 ? 36 : 28;
  const cardW = (L.area.w - (L.cols - 1) * gap) / L.cols;
  const cardH = Math.min(L.cols === 1 ? 250 : 420, (L.area.h - (rows - 1) * gap) / rows);
  const top = L.area.y + (L.area.h - (rows * cardH + (rows - 1) * gap)) / 2;
  const boxes = PILLARS.map((_, i) => ({ x: L.area.x + (i % L.cols) * (cardW + gap), y: top + Math.floor(i / L.cols) * (cardH + gap), w: cardW, h: cardH }));
  const mid = (b: Box) => ({ x: b.x + b.w / 2, y: b.y + b.h / 2 });
  // Pipeline path visiting the cards in order (row / column / 2×2 "U").
  const order = L.cols === 2 ? [0, 1, 3, 2] : [0, 1, 2, 3];
  const pts = order.map((i) => mid(boxes[i]));
  const d = pts.map((p, k) => `${k ? "L" : "M"} ${p.x} ${p.y}`).join(" ") + (L.cols === 2 ? " Z" : "");
  // The line grows as each card locks.
  const grow = interpolate(frame, [PILLAR_AT[0], PILLAR_AT[3] + 14], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });

  return (
    <AbsoluteFill>
      <Backdrop tone="dark" />
      <div style={{ position: "absolute", left: 0, right: 0, top: L.badgeY, display: "flex", justifyContent: "center" }}>
        <PartnerBadge at={BADGE_AT} size={L.badge} />
      </div>
      <div style={{ position: "absolute", left: 60, width: lw - 120, top: L.headY, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        <RevealText text={COPY.partnerHeadline} delay={2} stagger={4} accent={["bahala."]} style={{ fontFamily: FONT.head, fontWeight: 800, fontSize: L.head, lineHeight: 1.05, color: C.cream, textAlign: "center" }} />
        <RevealText text={COPY.partnerSub} delay={120} stagger={2} style={{ fontFamily: FONT.body, fontWeight: 600, fontSize: L.sub, lineHeight: 1.3, color: C.blue, textAlign: "center" }} />
      </div>

      <svg width={lw} height={lh} style={{ position: "absolute", inset: 0 }}>
        <path d={d} fill="none" stroke={C.border} strokeWidth={6} strokeLinejoin="round" opacity={interpolate(frame, [PILLAR_AT[0] - 20, PILLAR_AT[0]], [0, 1], clamp)} />
        <path d={d} fill="none" stroke={C.lime} strokeWidth={6} strokeLinejoin="round" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - grow} style={{ filter: "drop-shadow(0 0 10px rgba(213,250,0,0.6))" }} />
      </svg>
      {PILLARS.map((_, i) => (
        <PillarCard key={i} i={i} box={boxes[i]} at={PILLAR_AT[i]} fs={L.fs} compact={L.cols === 1} />
      ))}
    </AbsoluteFill>
  );
};
