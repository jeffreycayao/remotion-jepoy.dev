import type React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { CONTENT, type FastAdPillar } from "../content";
import { C, FONT, clamp, useLayout } from "../design";

const PillarCard: React.FC<{
  pillar: FastAdPillar;
  index: number;
  frame: number;
  fps: number;
  left: number;
  top: number;
  width: number;
  height: number;
  scale: number;
  wide: boolean;
  square: boolean;
}> = ({ pillar, index, frame, fps, left, top, width, height, scale, wide, square }) => {
  const enter = spring({ frame: frame - 76 - index * 20, fps, config: { damping: 16, stiffness: 148 } });
  const locked = frame >= 120 + index * 5;
  const short = square || height < 300 * scale;
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
        borderRadius: 20 * scale,
        border: `3px solid ${locked ? C.olive : C.muted}`,
        background: C.cream,
        color: C.charcoal,
        padding: `${(short ? 17 : 27) * scale}px ${(short ? 19 : 28) * scale}px`,
        boxShadow: locked ? `0 0 ${22 * scale}px ${C.olive}55` : `0 ${12 * scale}px ${20 * scale}px ${C.charcoal}44`,
        opacity: enter,
        translate: `0px ${(1 - enter) * 45 * scale}px`,
        scale: `${0.91 + enter * 0.09}`,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ width: (short ? 63 : 78) * scale, height: (short ? 63 : 78) * scale, display: "grid", placeItems: "center", background: C.white, border: `2px solid ${C.olive}66`, borderRadius: 12 * scale }}>
          <Img src={staticFile(pillar.logo)} style={{ width: (short ? 48 : 60) * scale, height: (short ? 48 : 60) * scale, objectFit: "contain" }} />
        </div>
        <div style={{ width: 25 * scale, height: 25 * scale, borderRadius: "50%", background: locked ? C.lime : C.olive, border: `3px solid ${C.charcoal}`, boxShadow: locked ? `0 0 ${18 * scale}px ${C.lime}` : "none" }} />
      </div>
      <div style={{ marginTop: (short ? 15 : 32) * scale, fontFamily: FONT.head, fontWeight: 800, fontSize: (wide ? 36 : short ? 29 : 38) * scale, lineHeight: 1.1, letterSpacing: -1.1 * scale }}>
        {pillar.name}
      </div>
      <div style={{ marginTop: (short ? 7 : 13) * scale, fontFamily: FONT.body, fontWeight: 500, fontSize: (wide ? 24 : short ? 19 : 25) * scale, lineHeight: 1.21, color: C.olive }}>
        {pillar.detail}
      </div>
      <div style={{ position: "absolute", right: 18 * scale, bottom: 16 * scale, fontFamily: FONT.mono, fontWeight: 700, fontSize: (short ? 15 : 17) * scale, color: C.olive }}>
        MODULE 0{index + 1}
      </div>
    </div>
  );
};

/** Scene 3, local frames 0–299: credential, deployment, and staff training. */
export const PancakePillarsEngine: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { w, h, wide, vertical, square, side, safeTop, safeBottom, scale } = useLayout();
  const pillIn = spring({ frame: frame - 28, fps, config: { damping: 11, stiffness: 145 } });
  const headerIn = spring({ frame: frame - 43, fps, config: { damping: 17, stiffness: 125 } });
  const statusIn = spring({ frame: frame - 168, fps, config: { damping: 17, stiffness: 120 } });
  const cols = wide ? 4 : 2;
  const gridLeft = side;
  const gridWidth = w - 2 * side;
  const gap = (wide ? 20 : 18) * scale;
  const gridTop = wide ? safeTop + 355 * scale : vertical ? safeTop + 600 * scale : square ? safeTop + 332 * scale : safeTop + 465 * scale;
  const gridBottom = wide ? safeBottom + 155 * scale : vertical ? safeBottom + 265 * scale : square ? safeBottom + 178 * scale : safeBottom + 131 * scale;
  const cardWidth = (gridWidth - (cols - 1) * gap) / cols;
  const cardHeight = (h - gridTop - gridBottom - (wide ? 0 : gap)) / (wide ? 1 : 2);
  const statusesTop = wide ? h - safeBottom - 128 * scale : vertical ? h - safeBottom - 168 * scale : square ? h - safeBottom - 98 * scale : h - safeBottom - 106 * scale;

  return (
    <AbsoluteFill style={{ background: C.charcoal, color: C.cream, overflow: "hidden" }}>
      <AbsoluteFill style={{ backgroundImage: `radial-gradient(${C.olive}38 1.4px, transparent 1.4px)`, backgroundSize: `${37 * scale}px ${37 * scale}px`, opacity: 0.55 }} />
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 55%, ${C.olive}26, transparent 56%)`, opacity: interpolate(frame, [0, 40], [0.25, 1], clamp) }} />
      <div style={{ position: "absolute", left: side, top: safeTop + 4 * scale, fontFamily: FONT.mono, fontSize: 18 * scale, fontWeight: 700, color: C.blue, letterSpacing: 2.7 * scale }}>AUTOMATIKA / TURNKEY TAKEOVER</div>
      <div
        style={{
          position: "absolute",
          left: side,
          top: safeTop + (wide ? 52 : 54) * scale,
          maxWidth: w - 2 * side,
          borderRadius: 999,
          padding: `${16 * scale}px ${28 * scale}px`,
          background: C.lime,
          color: C.charcoal,
          fontFamily: FONT.mono,
          fontWeight: 700,
          fontSize: (wide ? 28 : vertical ? 29 : 21) * scale,
          letterSpacing: 0.3 * scale,
          boxShadow: `0 0 ${28 * scale}px ${C.lime}66`,
          opacity: pillIn,
          scale: `${0.87 + 0.13 * pillIn}`,
          transformOrigin: "0% 50%",
          whiteSpace: "normal",
        }}
      >
        {CONTENT.partnerBadge}
      </div>
      <div
        style={{
          position: "absolute",
          left: side,
          top: safeTop + (wide ? 137 : vertical ? 169 : square ? 138 : 147) * scale,
          width: w - 2 * side,
          fontFamily: FONT.head,
          fontWeight: 800,
          fontSize: (wide ? 84 : vertical ? 88 : square ? 56 : 68) * scale,
          lineHeight: 1.05,
          letterSpacing: -3 * scale,
          opacity: headerIn,
          translate: `0px ${(1 - headerIn) * 25 * scale}px`,
        }}
      >
        {CONTENT.engineHeadline ?? "FOUR TOOLS. ONE ENGINE."}
      </div>
      <div style={{ position: "absolute", left: side, top: safeTop + (wide ? 255 : vertical ? 382 : square ? 237 : 310) * scale, width: w - 2 * side, fontFamily: FONT.body, fontWeight: 600, fontSize: (wide ? 30 : vertical ? 38 : square ? 25 : 29) * scale, lineHeight: 1.24, color: C.blue, opacity: headerIn }}>
        {CONTENT.trainingLine ?? "We deploy the stack and train your team with AI co-pilots."}
      </div>
      <div style={{ position: "absolute", left: gridLeft, top: gridTop + cardHeight * 0.5, width: gridWidth, height: 3 * scale, background: C.olive, boxShadow: `0 0 ${16 * scale}px ${C.olive}`, opacity: interpolate(frame, [86, 122], [0, 1], clamp) }} />
      {!wide && <div style={{ position: "absolute", left: w / 2 - 1.5 * scale, top: gridTop, width: 3 * scale, height: cardHeight * 2 + gap, background: C.olive, opacity: interpolate(frame, [88, 124], [0, 1], clamp) }} />}
      {CONTENT.pillars.slice(0, 4).map((pillar, index) => {
        const col = index % cols;
        const row = Math.floor(index / cols);
        return (
          <PillarCard
            key={`${index}-${pillar.name}`}
            pillar={pillar}
            index={index}
            frame={frame}
            fps={fps}
            left={gridLeft + col * (cardWidth + gap)}
            top={gridTop + row * (cardHeight + gap)}
            width={cardWidth}
            height={cardHeight}
            scale={scale}
            wide={wide}
            square={square}
          />
        );
      })}
      <div style={{ position: "absolute", left: side, top: statusesTop, width: w - 2 * side, display: "flex", flexWrap: "wrap", gap: (wide ? 17 : 10) * scale, opacity: statusIn, translate: `0px ${(1 - statusIn) * 21 * scale}px` }}>
        {CONTENT.statusBadges.slice(0, 3).map((status) => (
          <div key={status} style={{ background: C.blue, color: C.charcoal, padding: `${(wide ? 13 : 11) * scale}px ${(wide ? 18 : 15) * scale}px`, borderRadius: 8 * scale, fontFamily: FONT.mono, fontWeight: 700, fontSize: (wide ? 20 : vertical ? 22 : 17) * scale, lineHeight: 1.1 }}>
            {status}
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: side, bottom: safeBottom + 12 * scale, fontFamily: FONT.mono, fontWeight: 700, fontSize: 21 * scale, letterSpacing: 0.3 * scale, color: C.cream, background: C.panel, border: `2px solid ${C.olive}`, borderRadius: 6 * scale, padding: `${9 * scale}px ${13 * scale}px` }}>
        {CONTENT.illustrativeNote}
      </div>
    </AbsoluteFill>
  );
};
