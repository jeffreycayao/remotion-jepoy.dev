import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CALLOUTS, CATEGORIES, COPY, SCORES } from "../content";
import { C, clamp, FONT, useFrameLayout } from "../tokens";
import { Chip, SceneHeadline, Stage, useHeadlineSpace } from "../ui";

// Frames within the scene (Scene 3 is 271 frames long); beats follow the voiceover.
export const CELL_START = 16;
export const CELL_STEP = 8;
export const CALLOUT_AT = 82;
const DIAL_START = 70;
export const DIAL_LOCK = 186;

/** One stress-test subcategory: runs, flashes lime, settles to PASS. */
const Cell: React.FC<{ name: string; i: number; w: number; h: number }> = ({ name, i, w, h }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: frame - i * 2, fps, config: { damping: 200 }, durationInFrames: 18 });
  const passAt = CELL_START + i * CELL_STEP + 20;
  const passed = frame >= passAt;
  const flash = interpolate(frame, [passAt, passAt + 3, passAt + 16], [0, 1, 0], clamp);
  const running = interpolate(frame, [CELL_START + i * CELL_STEP, passAt], [0, 1], clamp);
  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: 18,
        boxSizing: "border-box",
        padding: "16px 18px",
        background: flash > 0.01 ? `rgba(213,250,0,${0.15 + flash * 0.75})` : C.card,
        border: `2px solid ${passed ? C.lime : C.border}`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        opacity: enter,
        scale: `${0.9 + 0.1 * enter + flash * 0.04}`,
      }}
    >
      <div style={{ fontFamily: FONT.body, fontWeight: 600, fontSize: 22, lineHeight: 1.2, color: flash > 0.5 ? C.ink : C.cream }}>{name}</div>
      {passed ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Chip tone="lime" size={16}>
            ✓ PASS
          </Chip>
        </div>
      ) : (
        <div style={{ height: 8, borderRadius: 99, background: C.border, overflow: "hidden" }}>
          <div style={{ width: `${running * 100}%`, height: "100%", background: C.olive }} />
        </div>
      )}
    </div>
  );
};

/** Score dial: ring fills to `fraction`, centre shows the ticking value; locks in with a lime pop. */
const Dial: React.FC<{ label: string; value: string; fraction: number; size: number; locked: number; good: boolean }> = ({ label, value, fraction, size, locked, good }) => {
  const r = size / 2 - 14;
  const circ = 2 * Math.PI * r;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <div style={{ position: "relative", width: size, height: size, scale: `${1 + locked * 0.05}` }}>
        <svg width={size} height={size} style={{ rotate: "-90deg" }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={C.border} strokeWidth={14} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={good ? C.lime : C.olive}
            strokeWidth={14}
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={circ * (1 - Math.max(0.001, fraction))}
          />
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: FONT.mono,
            fontWeight: 600,
            fontSize: size * 0.22,
            color: good ? C.lime : C.cream,
            textShadow: good ? `0 0 ${30 * locked}px rgba(213,250,0,0.6)` : undefined,
          }}
        >
          {value}
        </div>
      </div>
      <div style={{ fontFamily: FONT.body, fontWeight: 600, fontSize: 22, color: C.blue, textAlign: "center" }}>{label}</div>
    </div>
  );
};

/** Scene 3 (524–795): 12-category stress-test matrix + composure / hallucination / latency scores. */
export const Scene3TestMatrix: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { mode } = useFrameLayout();
  const top = useHeadlineSpace();
  const wide = mode === "wide";

  const tick = interpolate(frame, [DIAL_START, DIAL_LOCK], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const lock = spring({ frame: frame - DIAL_LOCK, fps, config: { damping: 10, stiffness: 180 } });
  const lockedNow = frame >= DIAL_LOCK;
  const composure = SCORES.composure.from + (SCORES.composure.to - SCORES.composure.from) * tick;
  const halluc = SCORES.hallucination.from + (SCORES.hallucination.to - SCORES.hallucination.from) * tick;
  const latency = SCORES.latency.from + (SCORES.latency.to - SCORES.latency.from) * tick;

  const cols = wide ? 4 : 3;
  const cellW = wide ? 225 : 316;
  const cellH = wide ? 118 : 122;
  const gap = wide ? 16 : 18;
  const W = wide ? 1600 : 1000;
  const H = wide ? 700 : 1260;
  const dialSize = wide ? 190 : 240;

  const matrix = (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, ${cellW}px)`, gap }}>
      {CATEGORIES.map((name, i) => (
        <Cell key={name} name={name} i={i} w={cellW} h={cellH} />
      ))}
    </div>
  );

  const callouts = (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: wide ? "flex-start" : "center" }}>
      {CALLOUTS.map((c, i) => {
        const p = spring({ frame: frame - CALLOUT_AT - i * 7, fps, config: { damping: 11, stiffness: 170 } });
        return (
          <span key={c} style={{ display: "inline-block", opacity: p, scale: `${0.5 + 0.5 * p}` }}>
            <Chip size={wide ? 22 : 26} style={{ boxShadow: `0 0 ${20 * p}px rgba(191,208,239,0.35)` }}>
              [{c}]
            </Chip>
          </span>
        );
      })}
    </div>
  );

  const dials = (
    <div
      style={{
        display: "flex",
        flexDirection: wide ? "column" : "row",
        justifyContent: "center",
        alignItems: "center",
        gap: wide ? 16 : 30,
        background: "rgba(31,28,22,0.85)",
        border: `2px solid ${C.border}`,
        borderRadius: 28,
        padding: wide ? "24px 30px" : "34px 20px",
      }}
    >
      {wide ? (
        <>
          <div style={{ display: "flex", gap: 26 }}>
            <Dial label="Composure" value={`${Math.round(composure)}%`} fraction={composure / 100} size={dialSize} locked={lock} good={lockedNow} />
            <Dial label="Hallucination risk" value={`${Math.round(halluc)}%`} fraction={halluc / 100} size={dialSize} locked={lock} good={lockedNow} />
          </div>
          <LatencyBar ms={latency} locked={lockedNow} />
        </>
      ) : (
        <>
          <Dial label="Composure" value={`${Math.round(composure)}%`} fraction={composure / 100} size={dialSize} locked={lock} good={lockedNow} />
          <Dial label="Hallucination risk" value={`${Math.round(halluc)}%`} fraction={halluc / 100} size={dialSize} locked={lock} good={lockedNow} />
          <Dial label="Avg latency" value={`${Math.round(latency)}ms`} fraction={1 - latency / 1000} size={dialSize} locked={lock} good={lockedNow} />
        </>
      )}
    </div>
  );

  return (
    <AbsoluteFill>
      <SceneHeadline text={COPY.s3Headline} accent={["303"]} />
      <Stage w={W} h={H} top={top}>
        <div style={{ width: W, height: H, display: "flex", flexDirection: wide ? "row" : "column", gap: wide ? 40 : 40, alignItems: "center", justifyContent: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
            {matrix}
            {callouts}
          </div>
          {dials}
        </div>
      </Stage>
    </AbsoluteFill>
  );
};

/** Wide layout: latency as a horizontal meter under the two dials. */
const LatencyBar: React.FC<{ ms: number; locked: boolean }> = ({ ms, locked }) => (
  <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
      <span style={{ fontFamily: FONT.body, fontWeight: 600, fontSize: 22, color: C.blue }}>Avg latency</span>
      <span style={{ fontFamily: FONT.mono, fontWeight: 600, fontSize: 38, color: locked ? C.lime : C.cream }}>{Math.round(ms)}ms</span>
    </div>
    <div style={{ height: 12, borderRadius: 99, background: C.border, overflow: "hidden" }}>
      <div style={{ width: `${(ms / 1000) * 100}%`, height: "100%", background: locked ? C.lime : C.olive }} />
    </div>
  </div>
);
