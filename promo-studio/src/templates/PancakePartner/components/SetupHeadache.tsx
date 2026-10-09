import React from "react";
import { AbsoluteFill, Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BROKEN, COPY } from "../content";
import { MetricBadge } from "../MetricBadge";
import { C, clamp, FONT } from "../tokens";
import { Backdrop, SceneHeadline, useFormat, usePick } from "../ui";
import { Logo } from "./Logos";

// Frames within the scene (147 long) — the hook: something must move from frame 0.
export const BLOCK_IN = 0; // blocks drop in 8 frames apart
export const COUNTER = [18, 128] as const;

type Box = { x: number; y: number; w: number; h: number };

/** One half-finished setup block: shakes harder as time is lost. */
const BrokenBlock: React.FC<{ i: number; box: Box; fs: number }> = ({ i, box, fs }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const b = BROKEN[i];
  const enter = spring({ frame: frame - BLOCK_IN - i * 5, fps, config: { damping: 11, stiffness: 140 } });
  const stress = interpolate(frame, [20, 140], [0.8, 3.4], clamp);
  const jitter = (k: string) => Math.sin(frame * (1.7 + random(`bj-${i}-${k}`)) + i * 2) * stress;
  const drift = Math.sin(frame / 22 + i * 1.7) * 8;
  return (
    <div
      style={{
        position: "absolute",
        left: box.x,
        top: box.y,
        width: box.w,
        height: box.h,
        background: C.white,
        borderRadius: 22,
        border: `2px dashed ${C.error}`,
        boxShadow: "0 20px 50px rgba(39,35,27,0.14)",
        padding: "20px 24px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 12,
        opacity: enter,
        translate: `${jitter("x")}px ${(1 - enter) * -60 + drift + jitter("y")}px`,
        rotate: `${(random(`br-${i}`) - 0.5) * 6 + jitter("r") * 0.6}deg`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ width: fs * 1.4, height: fs * 1.4, borderRadius: 99, background: "rgba(229,83,75,0.12)", color: C.error, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT.mono, fontWeight: 600, fontSize: fs * 0.8 }}>!</span>
        <span style={{ fontFamily: FONT.mono, fontWeight: 600, fontSize: fs, color: C.ink }}>{b.label}</span>
      </div>
      <div style={{ fontFamily: FONT.body, fontWeight: 500, fontSize: fs * 0.72, color: C.error }}>{b.status}</div>
    </div>
  );
};

/** Scene 1 (0–210): four broken setup blocks shaking, broken links between them, Time Lost: 80+ Hours. */
export const SetupHeadache: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { lw, lh, safeTop, safeBottom } = useFormat();
  const pick = usePick();

  // Areas per format: blocks + counter panel.
  const L = pick<{ blocks: Box; counter: Box; cols: number; fs: number; counterFs: number; row: boolean }>({
    wide: { blocks: { x: 120, y: 300, w: 1060, h: 680 }, counter: { x: 1260, y: 300, w: 540, h: 680 }, cols: 2, fs: 30, counterFs: 190, row: false },
    square: { blocks: { x: 50, y: 330, w: 980, h: 700 }, counter: { x: 50, y: 170, w: 980, h: 130 }, cols: 2, fs: 26, counterFs: 92, row: true },
    portrait: { blocks: { x: 60, y: 430, w: 960, h: lh - 430 - safeBottom }, counter: { x: 60, y: 200, w: 960, h: 190 }, cols: 2, fs: 28, counterFs: 130, row: true },
    vertical: { blocks: { x: 60, y: 640, w: 960, h: lh - 640 - safeBottom }, counter: { x: 60, y: safeTop + 200, w: 960, h: 260 }, cols: 1, fs: 32, counterFs: 160, row: true },
  });
  const rows = Math.ceil(BROKEN.length / L.cols);
  const gap = 28;
  const cardW = (L.blocks.w - (L.cols - 1) * gap) / L.cols;
  const cardH = Math.min(L.cols === 1 ? 210 : 280, (L.blocks.h - (rows - 1) * gap) / rows);
  const top = L.blocks.y + (L.blocks.h - (rows * cardH + (rows - 1) * gap)) / 2;
  const boxes = BROKEN.map((_, i) => ({ x: L.blocks.x + (i % L.cols) * (cardW + gap), y: top + Math.floor(i / L.cols) * (cardH + gap), w: cardW, h: cardH }));
  const mid = (b: Box) => ({ x: b.x + b.w / 2, y: b.y + b.h / 2 });
  const links: [number, number][] = L.cols === 1 ? [[0, 1], [1, 2], [2, 3]] : [[0, 1], [0, 2], [1, 3], [2, 3]];

  const hours = interpolate(frame, COUNTER, [0, 80], { ...clamp, easing: Easing.in(Easing.quad) });
  const done = frame >= COUNTER[1];
  const panelIn = spring({ frame: frame - 2, fps, config: { damping: 200 }, durationInFrames: 12 });

  return (
    <AbsoluteFill>
      <Backdrop tone="light" />
      <SceneHeadline text={COPY.headacheHeadline} accent={["train"]} color={C.ink} delay={0} stagger={1.5} {...pick({ wide: { x: 120, w: 1700, fs: 58, align: "left" as const }, square: {}, portrait: {}, vertical: {} })} />

      {/* Broken links between the blocks */}
      <svg width={lw} height={lh} style={{ position: "absolute", inset: 0 }}>
        {links.map(([a, b], k) => {
          const p = mid(boxes[a]);
          const q = mid(boxes[b]);
          const flicker = Math.floor(frame / 4 + k) % 3 === 0 ? 0.25 : 0.7;
          const show = interpolate(frame, [BLOCK_IN + 30, BLOCK_IN + 44], [0, 1], clamp);
          const mx = (p.x + q.x) / 2;
          const my = (p.y + q.y) / 2;
          return (
            <g key={k} opacity={show * flicker}>
              <line x1={p.x} y1={p.y} x2={mx - 18} y2={my} stroke={C.olive} strokeWidth={4} strokeDasharray="10 10" />
              <line x1={mx + 18} y1={my} x2={q.x} y2={q.y} stroke={C.olive} strokeWidth={4} strokeDasharray="10 10" />
              <text x={mx} y={my + 10} textAnchor="middle" fontFamily={FONT.mono} fontWeight={600} fontSize={30} fill={C.error}>
                ✕
              </text>
            </g>
          );
        })}
      </svg>
      {BROKEN.map((_, i) => (
        <BrokenBlock key={i} i={i} box={boxes[i]} fs={L.fs} />
      ))}

      {/* Time lost counter */}
      <div
        style={{
          position: "absolute",
          left: L.counter.x,
          top: L.counter.y,
          width: L.counter.w,
          height: L.counter.h,
          background: C.canvas,
          borderRadius: 26,
          display: "flex",
          flexDirection: L.row ? "row" : "column",
          alignItems: "center",
          justifyContent: "center",
          gap: L.row ? 28 : 14,
          opacity: panelIn,
          translate: `0px ${(1 - panelIn) * 30}px`,
        }}
      >
        <Logo name="automatikaMark" h={L.row ? L.counterFs * 0.36 : 56} style={{ position: "absolute", left: L.row ? 28 : undefined, top: L.row ? undefined : 30, opacity: 0.9 }} />
        <div style={{ fontFamily: FONT.mono, fontWeight: 600, fontSize: L.row ? L.counterFs * 0.2 : 26, letterSpacing: 3, color: C.blue }}>{COPY.timeLostLabel.toUpperCase()}:</div>
        <div style={{ fontFamily: FONT.mono, fontWeight: 600, fontSize: L.counterFs, lineHeight: 1, color: done ? C.lime : C.cream, letterSpacing: -L.counterFs / 24 }}>
          <MetricBadge value={Math.floor(hours)} />
          <span style={{ opacity: done ? 1 : 0 }}>+</span>
        </div>
        <div style={{ fontFamily: FONT.mono, fontWeight: 600, fontSize: L.row ? L.counterFs * 0.26 : 40, color: C.muted }}>HOURS</div>
      </div>
    </AbsoluteFill>
  );
};
