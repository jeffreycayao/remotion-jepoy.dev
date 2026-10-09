import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BUSINESSES, COPY, INDUSTRIES, TRAINING_STEPS } from "../content";
import { MetricBadge } from "../MetricBadge";
import { C, clamp, FONT } from "../tokens";
import { Backdrop, Chip, SceneHeadline, useFormat, usePick } from "../ui";

// Frames within Scene 3 (287 long), from the recorded voiceover:
//   4 "We train your team para mag-work hand-in-hand with AI."
//   104 "Mahigit ninety businesses na ang napagana namin—" · 193 "ecomm," ~215 "jewelry," ~236 "solar," ~257 "at education."
export const NODES_IN = 8;
export const LINK = [24, 54] as const;
export const STEP_AT = [44, 66, 88];
export const COUNT = [104, 166] as const;
export const INDUSTRY_AT = [190, 212, 233, 254];

/** Round node in the Human ⟷ AI diagram. */
const Node: React.FC<{ x: number; y: number; r: number; label: string; tone: "human" | "ai"; enter: number; pulse: number }> = ({ x, y, r, label, tone, enter, pulse }) => (
  <div style={{ position: "absolute", left: x - r, top: y - r, width: r * 2, display: "flex", flexDirection: "column", alignItems: "center", gap: r * 0.22, opacity: enter, scale: `${0.6 + 0.4 * enter}` }}>
    <div
      style={{
        width: r * 2,
        height: r * 2,
        borderRadius: 999,
        background: tone === "ai" ? C.lime : C.cream,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: tone === "ai" ? `0 0 ${r * 0.8 * pulse}px rgba(213,250,0,0.55)` : "0 20px 50px rgba(0,0,0,0.4)",
        border: `${r * 0.05}px solid ${tone === "ai" ? C.olive : C.line}`,
      }}
    >
      {tone === "human" ? (
        <svg width={r} height={r} viewBox="0 0 24 24">
          <circle cx={12} cy={8} r={4.5} fill={C.ink} />
          <path d="M3.5 22 C3.5 16.5 7.5 13.5 12 13.5 C16.5 13.5 20.5 16.5 20.5 22 Z" fill={C.ink} />
        </svg>
      ) : (
        <svg width={r} height={r} viewBox="0 0 24 24">
          <path d="M12 1.5 L14.4 9.6 L22.5 12 L14.4 14.4 L12 22.5 L9.6 14.4 L1.5 12 L9.6 9.6 Z" fill={C.ink} />
        </svg>
      )}
    </div>
    <Chip size={r * 0.2} tone={tone === "ai" ? "lime" : "blue"}>
      [{label}]
    </Chip>
  </div>
);

/** Scene 3 (510–780): staff ⟷ AI with training nodes on the link, then 90+ businesses and industries. */
export const TrainingAndProof: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { lw, lh, safeBottom } = useFormat();
  const pick = usePick();

  // Diagram box + proof box per format.
  const L = pick({
    wide: { dia: { x: 100, y: 260, w: 1000, h: 640 }, proof: { x: 1160, y: 250, w: 660, h: 680 }, r: 110, countFs: 210, chipFs: 30, chipCol: true },
    square: { dia: { x: 40, y: 150, w: 1000, h: 400 }, proof: { x: 40, y: 600, w: 1000, h: 440 }, r: 78, countFs: 140, chipFs: 24, chipCol: false },
    portrait: { dia: { x: 40, y: 180, w: 1000, h: 470 }, proof: { x: 40, y: 700, w: 1000, h: lh - 700 - safeBottom }, r: 88, countFs: 160, chipFs: 26, chipCol: false },
    vertical: { dia: { x: 40, y: 420, w: 1000, h: 520 }, proof: { x: 40, y: 860, w: 1000, h: lh - 860 - safeBottom }, r: 100, countFs: 190, chipFs: 30, chipCol: true },
  });

  const enter = (d: number) => spring({ frame: frame - d, fps, config: { damping: 12 } });
  const human = { x: L.dia.x + L.r + 30, y: L.dia.y + L.dia.h / 2 - L.r * 0.2 };
  const ai = { x: L.dia.x + L.dia.w - L.r - 30, y: human.y };
  const link = interpolate(frame, LINK, [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const pulse = 0.6 + 0.4 * Math.sin(frame / 6);
  const span = ai.x - human.x - 2 * L.r;
  const arcY = human.y - L.r * 0.9; // the link bows upward like a bracket
  const count = interpolate(frame, COUNT, [0, BUSINESSES], { ...clamp, easing: Easing.out(Easing.cubic) });
  const counted = frame >= COUNT[1];

  // Packets flowing both ways along the link.
  const packet = (k: number, dir: 1 | -1) => {
    const t = (((frame - LINK[1]) * 1.6 + k * 33) % 100) / 100;
    const tt = dir === 1 ? t : 1 - t;
    const x = human.x + L.r + tt * span;
    const y = human.y - Math.sin(tt * Math.PI) * (human.y - arcY);
    return <circle key={`${dir}-${k}`} cx={x} cy={y} r={L.r * 0.07} fill={dir === 1 ? C.blue : C.lime} opacity={frame > LINK[1] ? 1 : 0} />;
  };

  return (
    <AbsoluteFill>
      <Backdrop tone="dark" />
      <SceneHeadline text={COPY.proofHeadline} accent={["hand-in-hand."]} {...(pick({ wide: true, square: false, portrait: false, vertical: false }) ? { y: 80 } : {})} />

      {/* Human ⟷ AI */}
      <svg width={lw} height={lh} style={{ position: "absolute", inset: 0 }}>
        <path
          d={`M ${human.x + L.r} ${human.y} Q ${(human.x + ai.x) / 2} ${arcY - (human.y - arcY)} ${ai.x - L.r} ${ai.y}`}
          fill="none"
          stroke={C.olive}
          strokeWidth={L.r * 0.08}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - link}
        />
        {[0, 1, 2].map((k) => packet(k, 1))}
        {[0, 1, 2].map((k) => packet(k, -1))}
      </svg>
      <Node x={human.x} y={human.y} r={L.r} label="Staff Operator" tone="human" enter={enter(NODES_IN)} pulse={pulse} />
      <Node x={ai.x} y={ai.y} r={L.r} label="AI Co-Pilot" tone="ai" enter={enter(NODES_IN + 6)} pulse={pulse} />
      <div style={{ position: "absolute", left: (human.x + ai.x) / 2, top: human.y + L.r * 1.12, fontFamily: FONT.mono, fontWeight: 600, fontSize: L.r * 0.36, lineHeight: 1, color: C.lime, opacity: link, translate: "-50% 0" }}>⟷</div>

      {/* Training nodes along the link */}
      {TRAINING_STEPS.map((s, i) => {
        const t = (i + 1) / (TRAINING_STEPS.length + 1);
        const x = human.x + L.r + t * span;
        const y = human.y - Math.sin(t * Math.PI) * (human.y - arcY); // on the link
        const p = enter(STEP_AT[i]);
        return (
          <div key={s} style={{ position: "absolute", left: x, top: y, translate: "-50% -50%", opacity: p, scale: `${0.6 + 0.4 * p}` }}>
            <Chip tone="olive" size={L.r * 0.19}>
              ● {s}
            </Chip>
          </div>
        );
      })}

      {/* 90+ businesses + industries */}
      <div
        style={{
          position: "absolute",
          left: L.proof.x,
          top: L.proof.y,
          width: L.proof.w,
          height: L.proof.h,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 22,
          opacity: interpolate(frame, [COUNT[0] - 10, COUNT[0]], [0, 1], clamp),
        }}
      >
        <div style={{ fontFamily: FONT.mono, fontWeight: 600, fontSize: L.countFs, lineHeight: 0.95, color: C.lime, letterSpacing: -L.countFs / 20, textShadow: counted ? "0 0 50px rgba(213,250,0,0.45)" : undefined, scale: `${counted ? 1 + 0.04 * spring({ frame: frame - COUNT[1], fps, config: { damping: 8 } }) : 1}` }}>
          <MetricBadge value={Math.round(count)} jitter={counted ? 0 : 3} />
          <span style={{ opacity: counted ? 1 : 0.25 }}>+</span>
        </div>
        <div style={{ fontFamily: FONT.mono, fontWeight: 600, fontSize: L.countFs * 0.17, letterSpacing: 3, color: C.cream }}>BUSINESSES DEPLOYED</div>
        <div style={{ display: "flex", flexDirection: L.chipCol ? "column" : "row", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: 14, marginTop: 10 }}>
          {INDUSTRIES.map((ind, i) => {
            const p = spring({ frame: frame - INDUSTRY_AT[i], fps, config: { damping: 10, stiffness: 170 } });
            return (
              <span key={ind} style={{ display: "inline-block", opacity: p, scale: `${0.5 + 0.5 * p}`, translate: `0px ${(1 - p) * 20}px` }}>
                <Chip size={L.chipFs} style={{ padding: `${L.chipFs * 0.35}px ${L.chipFs * 0.8}px` }}>
                  [{ind}]
                </Chip>
              </span>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
