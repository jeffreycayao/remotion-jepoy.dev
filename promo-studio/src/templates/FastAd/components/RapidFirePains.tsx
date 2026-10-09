import type React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CONTENT, type FastAdPain } from "../content";
import { C, FONT, clamp, useLayout } from "../design";

const PainCard: React.FC<{
  pain: FastAdPain;
  index: number;
  frame: number;
  fps: number;
  width: number;
  height: number;
  top: number;
  left: number;
  scale: number;
  wide: boolean;
  vertical: boolean;
  square: boolean;
}> = ({ pain, index, frame, fps, width, height, top, left, scale, wide, vertical, square }) => {
  const at = 60 + index * 60;
  const enter = spring({ frame: frame - at, fps, config: { damping: 14, stiffness: 165 } });
  const jitter = frame >= at && frame < at + 22 ? Math.sin((frame - at) * 1.3) * 3.2 * scale : 0;
  const labelFont = (wide ? 43 : vertical ? 50 : square ? 38 : 42) * scale;
  const detailFont = (wide ? 28 : vertical ? 36 : square ? 27 : 31) * scale;

  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width,
        height,
        boxSizing: "border-box",
        overflow: "hidden",
        borderRadius: 18 * scale,
        border: `3px solid ${C.charcoal}`,
        borderLeft: `${12 * scale}px solid ${C.red}`,
        background: C.panel,
        color: C.cream,
        boxShadow: `0 ${12 * scale}px ${30 * scale}px ${C.charcoal}33`,
        opacity: enter,
        translate: `${(1 - enter) * 90 + jitter}px 0px`,
        scale: `${0.95 + 0.05 * enter}`,
      }}
    >
      <div style={{ position: "absolute", right: 16 * scale, top: -18 * scale, color: C.cream, opacity: 0.07, fontFamily: FONT.head, fontWeight: 800, fontSize: 182 * scale, letterSpacing: -8 * scale }}>
        0{index + 1}
      </div>
      <div style={{ position: "relative", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: `${(wide ? 25 : 22) * scale}px ${(wide ? 32 : 30) * scale}px`, boxSizing: "border-box" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 * scale, marginBottom: (wide ? 11 : 18) * scale, fontFamily: FONT.mono, fontWeight: 700, fontSize: 19 * scale, letterSpacing: 1.6 * scale, color: C.red }}>
          <span style={{ width: 14 * scale, height: 14 * scale, borderRadius: "50%", background: C.red, boxShadow: `0 0 ${11 * scale}px ${C.red}` }} />
          INCIDENT 0{index + 1}
        </div>
        <div style={{ fontFamily: FONT.head, fontWeight: 800, fontSize: labelFont, lineHeight: 1.08, letterSpacing: -1.5 * scale, maxWidth: "94%" }}>
          {pain.label}
        </div>
        <div style={{ fontFamily: FONT.body, fontWeight: 500, fontSize: detailFont, lineHeight: 1.2, color: C.blue, maxWidth: "94%", marginTop: 11 * scale }}>
          {pain.detail}
        </div>
      </div>
    </div>
  );
};

/** Scene 2, local frames 0–269: each leak hits on its matching glitch at 60/120/180. */
export const RapidFirePains: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { w, h, side, safeTop, safeBottom, wide, vertical, square, scale } = useLayout();
  const titleIn = spring({ frame: frame - 7, fps, config: { damping: 18, stiffness: 120 } });
  const left = wide ? w * 0.475 : side;
  const width = wide ? w * 0.47 : w - 2 * side;
  const stackTop = wide ? safeTop + 56 * scale : safeTop + (vertical ? 398 : square ? 263 : 315) * scale;
  const cardGap = (wide ? 18 : vertical ? 24 : 14) * scale;
  const stackHeight = h - stackTop - safeBottom - (wide ? 64 : 12) * scale;
  const cardHeight = (stackHeight - 2 * cardGap) / 3;

  return (
    <AbsoluteFill style={{ background: C.cream, color: C.charcoal, overflow: "hidden" }}>
      <AbsoluteFill style={{ backgroundImage: `repeating-linear-gradient(135deg, ${C.olive}13 0, ${C.olive}13 2px, transparent 2px, transparent 27px)`, opacity: 0.75 }} />
      <div style={{ position: "absolute", left: side, top: safeTop, fontFamily: FONT.mono, fontWeight: 700, fontSize: 20 * scale, letterSpacing: 2.3 * scale, color: C.olive }}>THE COST OF DIY TECH</div>
      <div
        style={{
          position: "absolute",
          left: side,
          top: safeTop + (wide ? 125 : 73) * scale,
          width: wide ? w * 0.385 : w - side * 2,
          fontFamily: FONT.head,
          fontWeight: 800,
          fontSize: (wide ? 99 : vertical ? 82 : square ? 65 : 73) * scale,
          lineHeight: 1.04,
          letterSpacing: -4 * scale,
          opacity: titleIn,
          translate: `0px ${(1 - titleIn) * 35 * scale}px`,
        }}
      >
        THREE LEAKS.<br /><span style={{ color: C.red }}>ONE OWNER.</span>
      </div>
      {wide && (
        <div style={{ position: "absolute", left: side, bottom: safeBottom + 80 * scale, width: w * 0.37, display: "flex", alignItems: "center", gap: 17 * scale, color: C.olive, fontFamily: FONT.mono, fontSize: 22 * scale, fontWeight: 700 }}>
          <div style={{ width: 74 * scale, height: 3 * scale, background: C.olive }} />
          EVERY MINUTE COUNTS
        </div>
      )}
      {CONTENT.pains.slice(0, 3).map((pain, index) => (
        <PainCard
          key={`${index}-${pain.label}`}
          pain={pain}
          index={index}
          frame={frame}
          fps={fps}
          left={left}
          top={stackTop + index * (cardHeight + cardGap)}
          width={width}
          height={cardHeight}
          scale={scale}
          wide={wide}
          vertical={vertical}
          square={square}
        />
      ))}
      <div style={{ position: "absolute", left: side, top: wide ? undefined : stackTop - 61 * scale, bottom: wide ? safeBottom + 12 * scale : undefined, color: C.cream, background: C.charcoal, padding: `${9 * scale}px ${13 * scale}px`, borderRadius: 6 * scale, fontFamily: FONT.mono, fontWeight: 700, fontSize: 21 * scale, letterSpacing: 0.3 * scale }}>
        {CONTENT.illustrativeNote}
      </div>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 12 * scale, background: C.red, opacity: interpolate(frame, [0, 12, 35], [0.95, 0.55, 0.68], clamp) }} />
    </AbsoluteFill>
  );
};
