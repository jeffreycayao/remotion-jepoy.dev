import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CARD_A, CARD_B, COPY, type Metric } from "../content";
import { MetricBadge } from "../MetricBadge";
import { RevealText } from "../RevealText";
import { C, FONT } from "../tokens";
import { Backdrop, Chip, Shimmer, useFormat, usePick } from "../ui";
import { Logo } from "./Logos";

// Frames within Scene 3 (132 long — one 4 s voice line), so the six figures land fast and overlap.
export const CARD_A_AT = 6;
export const CARD_B_AT = 28;
export const COUNT_FRAMES = 34;
export const metricAt = (card: "A" | "B", i: number) => (card === "A" ? CARD_A_AT + 6 + i * 10 : CARD_B_AT + 8 + i * 14);

type Box = { x: number; y: number; w: number; h: number };

/** One Pancake analytics tile: label, counting value, growth pill, note. */
const MetricTile: React.FC<{ m: Metric; at: number; fs: number }> = ({ m, at, fs }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const done = frame >= at + COUNT_FRAMES;
  const pill = spring({ frame: frame - at - COUNT_FRAMES + 4, fps, config: { damping: 10, stiffness: 180 } });
  const down = m.change < 0;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: fs * 0.22, minWidth: 0 }}>
      <div style={{ fontFamily: FONT.body, fontWeight: 600, fontSize: fs * 0.36, color: C.inkMuted, whiteSpace: "nowrap" }}>{m.label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: fs * 0.25, flexWrap: "wrap" }}>
        <MetricBadge from={0} to={m.value} delay={at} duration={COUNT_FRAMES} prefix={m.prefix} style={{ fontSize: fs, fontWeight: 700, color: C.ink, letterSpacing: -fs * 0.03, lineHeight: 1 }} />
        <span style={{ display: "inline-block", opacity: pill, scale: `${0.5 + 0.5 * pill}`, transformOrigin: "0% 50%" }}>
          <span style={{ fontFamily: FONT.mono, fontWeight: 700, fontSize: fs * 0.38, color: C.ink, background: C.lime, borderRadius: fs * 0.18, padding: `${fs * 0.06}px ${fs * 0.18}px`, whiteSpace: "nowrap" }}>
            {down ? "↓" : "↑"} {Math.abs(m.change).toFixed(2)}%
          </span>
        </span>
      </div>
      {m.note && <div style={{ fontFamily: FONT.body, fontWeight: 500, fontSize: fs * 0.32, color: done ? C.olive : C.inkMuted }}>{m.note}</div>}
    </div>
  );
};

/** White Pancake analytics card that springs in from below. */
const Card: React.FC<{ box: Box; at: number; title: string; children: React.ReactNode; fs: number }> = ({ box, at, title, children, fs }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - at, fps, config: { damping: 14, stiffness: 110 } });
  return (
    <div
      style={{
        position: "absolute",
        left: box.x,
        top: box.y,
        width: box.w,
        height: box.h,
        background: C.white,
        borderRadius: 26,
        boxShadow: "0 40px 90px rgba(0,0,0,0.5)",
        padding: fs * 0.55,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: fs * 0.4,
        opacity: Math.min(1, p * 1.4),
        translate: `0px ${(1 - p) * 120}px`,
        rotate: `${(1 - p) * 3}deg`,
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, borderBottom: `2px solid ${C.line}`, paddingBottom: fs * 0.3 }}>
        <Logo name="pancake" h={fs * 0.5} />
        <span style={{ fontFamily: FONT.body, fontWeight: 600, fontSize: fs * 0.36, color: C.ink, flex: 1 }}>{title}</span>
        <Chip size={fs * 0.28}>Verified</Chip>
      </div>
      {children}
      <Shimmer start={at + 12} duration={26} strength={0.5} />
    </div>
  );
};

/** Grid of tiles with olive hairline dividers. */
const Tiles: React.FC<{ cols: number; children: React.ReactNode; gap: number }> = ({ cols, children, gap }) => (
  <div style={{ flex: 1, display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap, alignContent: "space-evenly" }}>{children}</div>
);

/** Scene 3 (450–720): two real Pancake dashboards spring in; every number counts up. */
export const SalesCards: React.FC = () => {
  const { lh, safeBottom } = useFormat();
  const pick = usePick();
  const L = pick<{ head: { y: number; fs: number }; a: Box; b: Box; aCols: number; bCols: number; fsA: number; fsB: number }>({
    wide: { head: { y: 60, fs: 62 }, a: { x: 100, y: 230, w: 640, h: 760 }, b: { x: 780, y: 230, w: 1040, h: 760 }, aCols: 1, bCols: 2, fsA: 76, fsB: 62 },
    square: { head: { y: 40, fs: 48 }, a: { x: 50, y: 160, w: 980, h: 260 }, b: { x: 50, y: 440, w: 980, h: 600 }, aCols: 2, bCols: 2, fsA: 56, fsB: 50 },
    portrait: { head: { y: 50, fs: 56 }, a: { x: 50, y: 200, w: 980, h: 300 }, b: { x: 50, y: 530, w: 980, h: lh - 530 - safeBottom }, aCols: 2, bCols: 2, fsA: 58, fsB: 54 },
    vertical: { head: { y: 150, fs: 68 }, a: { x: 50, y: 360, w: 980, h: 360 }, b: { x: 50, y: 750, w: 980, h: lh - 750 - safeBottom }, aCols: 2, bCols: 1, fsA: 60, fsB: 66 },
  });

  return (
    <AbsoluteFill>
      <Backdrop tone="dark" />
      <div style={{ position: "absolute", left: 60, right: 60, top: L.head.y, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <RevealText text={COPY.proofHeadline} delay={0} accent={["results."]} style={{ fontFamily: FONT.head, fontWeight: 800, fontSize: L.head.fs, lineHeight: 1.05, color: C.cream, textAlign: "center" }} />
        <Chip size={L.head.fs * 0.3}>[{COPY.proofSub}]</Chip>
      </div>

      <Card box={L.a} at={CARD_A_AT} title={CARD_A.title} fs={L.fsA}>
        <Tiles cols={L.aCols} gap={L.fsA * 0.4}>
          {CARD_A.metrics.map((m, i) => (
            <MetricTile key={m.label} m={m} at={metricAt("A", i)} fs={L.fsA} />
          ))}
        </Tiles>
      </Card>
      <Card box={L.b} at={CARD_B_AT} title={CARD_B.title} fs={L.fsB}>
        <Tiles cols={L.bCols} gap={L.fsB * 0.4}>
          {CARD_B.metrics.map((m, i) => (
            <MetricTile key={m.label} m={m} at={metricAt("B", i)} fs={L.fsB} />
          ))}
        </Tiles>
      </Card>
    </AbsoluteFill>
  );
};
