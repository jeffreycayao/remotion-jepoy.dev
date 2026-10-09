import type React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CONTENT } from "../content";
import { C, FONT, clamp, useLayout } from "../design";

const FounderRig: React.FC<{ width: number; height: number; frame: number }> = ({ width, height, frame }) => {
  const tremor = Math.sin(frame * 0.62) * 2.5;
  const breath = Math.sin(frame / 13) * 3;
  return (
    <svg width={width} height={height} viewBox="0 0 420 530" fill="none" aria-label="Illustrated founder handling broken systems">
      <path d="M35 480C35 420 85 382 143 382h137c61 0 104 38 104 98" fill={C.olive} stroke={C.charcoal} strokeWidth="8" />
      <path d="M67 276c-33-20-55-23-60-66M346 260c47-8 66-24 67-73" stroke={C.olive} strokeWidth="10" strokeLinecap="round" strokeDasharray="16 13" />
      <rect x="52" y="184" width="61" height="47" rx="8" fill={C.white} stroke={C.charcoal} strokeWidth="7" />
      <path d="M61 195l43 25M104 195l-43 25" stroke={C.red} strokeWidth="7" />
      <rect x="317" y="153" width="63" height="51" rx="8" fill={C.white} stroke={C.charcoal} strokeWidth="7" />
      <path d="M331 166h37m-37 11h22m-22 11h29" stroke={C.red} strokeWidth="6" strokeLinecap="round" />
      <path d="M159 333v65h101v-65" fill={C.cream} stroke={C.charcoal} strokeWidth="8" />
      <path d="M120 143c0-70 39-115 92-115s91 44 91 115v91c0 72-40 122-91 122s-92-50-92-122v-91Z" fill={C.cream} stroke={C.charcoal} strokeWidth="9" />
      <path d="M119 179c-22-27-26-91-3-128 19-31 55-50 97-50 47 0 82 20 98 56 17 38 11 89-6 116-9-50-29-63-44-92-30 33-81 50-142 52v46Z" fill={C.charcoal} />
      <path d="M149 214h24m76 0h24" stroke={C.charcoal} strokeWidth="9" strokeLinecap="round" />
      <path d="M208 217c-5 19-6 28 5 36" stroke={C.charcoal} strokeWidth="6" strokeLinecap="round" />
      <path d={`M177 ${282 + tremor}c25-17 49-17 72 0`} stroke={C.charcoal} strokeWidth="8" strokeLinecap="round" />
      <path d="M290 207c19 32 21 50 4 59-15 8-28-2-28-17 0-13 9-27 24-42Z" fill={C.blue} stroke={C.charcoal} strokeWidth="5" />
      <path d="M145 250l-15 28m155-28 15 28" stroke={C.red} strokeWidth="6" strokeLinecap="round" />
      <g transform={`translate(0 ${breath})`}>
        <rect x="84" y="385" width="254" height="80" rx="10" fill={C.blue} stroke={C.charcoal} strokeWidth="9" />
        <rect x="108" y="399" width="206" height="50" rx="4" fill={C.white} />
        <path d="M62 465h298l-16 31H78l-16-31Z" fill={C.cream} stroke={C.charcoal} strokeWidth="8" />
        <circle cx="210" cy="423" r="15" fill={C.red} />
      </g>
    </svg>
  );
};

const AlertCard: React.FC<{
  label: string;
  frame: number;
  at: number;
  fps: number;
  top: number;
  right: number;
  width: number;
  scale: number;
}> = ({ label, frame, at, fps, top, right, width, scale }) => {
  const enter = spring({ frame: frame - at, fps, config: { damping: 12, stiffness: 160 } });
  const vibrate = frame > at ? Math.sin((frame - at) * 0.72) * 2.5 * scale : 0;
  return (
    <div
      style={{
        position: "absolute",
        top,
        right,
        width,
        minHeight: 67 * scale,
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        gap: 12 * scale,
        border: `3px solid ${C.red}`,
        borderLeftWidth: 12 * scale,
        borderRadius: 13 * scale,
        background: C.white,
        color: C.charcoal,
        boxShadow: `0 ${12 * scale}px ${22 * scale}px ${C.charcoal}55`,
        padding: `${11 * scale}px ${14 * scale}px`,
        opacity: enter,
        translate: `${(1 - enter) * 70 + vibrate}px 0px`,
        rotate: `${vibrate * 0.4}deg`,
      }}
    >
      <span style={{ font: `700 ${28 * scale}px ${FONT.mono}`, color: C.red, lineHeight: 1 }}>!</span>
      <span style={{ fontFamily: FONT.mono, fontWeight: 700, fontSize: 19 * scale, lineHeight: 1.13, overflowWrap: "anywhere" }}>
        {label}
      </span>
    </div>
  );
};

/** Scene 1, local frames 0–209: the viewer meets an owner stuck doing IT work. */
export const PatternInterruptHook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { w, h, wide, vertical, square, side, safeTop, safeBottom, scale } = useLayout();
  const shake = frame < 18 ? (1 - frame / 18) * Math.sin(frame * 2.8) * 11 * scale : 0;
  const badgeIn = spring({ frame, fps, config: { damping: 14, stiffness: 165 } });
  const questionIn = spring({ frame: frame - 24, fps, config: { damping: 17, stiffness: 125 } });
  const rigIn = spring({ frame: frame - 12, fps, config: { damping: 16, stiffness: 110 } });
  const stage = wide
    ? { x: w * 0.53, y: safeTop + 12 * scale, width: w * 0.42, height: h - safeTop - safeBottom - 24 * scale }
    : vertical
      ? { x: side, y: safeTop + 625 * scale, width: w - 2 * side, height: h - safeTop - safeBottom - 645 * scale }
      : square
        ? { x: side, y: safeTop + 370 * scale, width: w - 2 * side, height: h - safeTop - safeBottom - 385 * scale }
        : { x: side, y: safeTop + 500 * scale, width: w - 2 * side, height: h - safeTop - safeBottom - 515 * scale };
  const badgeTop = safeTop + (wide ? 85 : 67) * scale;
  const questionTop = safeTop + (wide ? 440 : vertical ? 347 : square ? 255 : 305) * scale;
  const copyWidth = wide ? w * 0.43 : w - side * 2;
  const portraitWidth = stage.width * 0.5;
  const portraitHeight = Math.min(stage.height * 0.78, portraitWidth * 1.26);

  return (
    <AbsoluteFill style={{ background: C.charcoal, color: C.cream, overflow: "hidden" }}>
      <AbsoluteFill style={{ backgroundImage: `linear-gradient(${C.olive}22 1px, transparent 1px), linear-gradient(90deg, ${C.olive}22 1px, transparent 1px)`, backgroundSize: `${54 * scale}px ${54 * scale}px` }} />
      <AbsoluteFill style={{ background: `radial-gradient(circle at 75% 54%, ${C.red}27, transparent 42%)` }} />
      <AbsoluteFill style={{ translate: `${shake}px ${shake * 0.3}px` }}>
        <div style={{ position: "absolute", left: side, top: safeTop, fontFamily: FONT.mono, fontWeight: 600, fontSize: 20 * scale, letterSpacing: 2.6 * scale, color: C.blue }}>
          AUTOMATIKA / OWNER ALERT
        </div>
        <div
          style={{
            position: "absolute",
            left: side,
            top: badgeTop,
            width: copyWidth,
            boxSizing: "border-box",
            padding: `${(wide ? 27 : 24) * scale}px ${(wide ? 29 : 25) * scale}px`,
            border: `3px solid ${C.cream}`,
            borderRadius: 19 * scale,
            background: C.lime,
            color: C.charcoal,
            boxShadow: `0 0 ${35 + 9 * Math.sin(frame / 6)}px ${C.lime}55`,
            fontFamily: FONT.head,
            fontWeight: 800,
            fontSize: (wide ? 52 : vertical ? 61 : square ? 47 : 52) * scale,
            lineHeight: 1.09,
            letterSpacing: -1.9 * scale,
            overflowWrap: "break-word",
            opacity: badgeIn,
            scale: `${0.93 + 0.07 * badgeIn + Math.sin(frame / 9) * 0.007}`,
            transformOrigin: "0 50%",
          }}
        >
          {CONTENT.hookBadge}
        </div>
        <div
          style={{
            position: "absolute",
            left: side,
            top: questionTop,
            width: copyWidth,
            fontFamily: FONT.head,
            fontWeight: 700,
            fontSize: (wide ? 51 : vertical ? 51 : square ? 42 : 46) * scale,
            lineHeight: 1.16,
            letterSpacing: -1.2 * scale,
            opacity: questionIn,
            translate: `0px ${(1 - questionIn) * 26 * scale}px`,
          }}
        >
          {CONTENT.hookQuestion}
        </div>
        <div
          style={{
            position: "absolute",
            left: stage.x,
            top: stage.y,
            width: stage.width,
            height: stage.height,
            boxSizing: "border-box",
            border: `3px solid ${C.olive}`,
            borderRadius: 28 * scale,
            overflow: "hidden",
            background: C.cream,
            boxShadow: `0 ${25 * scale}px ${60 * scale}px ${C.charcoal}99`,
            opacity: rigIn,
            scale: `${0.96 + 0.04 * rigIn}`,
          }}
        >
          <div style={{ position: "absolute", left: "50%", top: 0, right: 0, bottom: 0, background: C.panel }} />
          <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 4 * scale, background: C.olive }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 61 * scale, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "space-between", padding: `0 ${22 * scale}px`, background: C.cream, borderBottom: `3px solid ${C.charcoal}` }}>
            <span style={{ fontFamily: FONT.mono, fontWeight: 700, color: C.charcoal, fontSize: 17 * scale, letterSpacing: 0.8 * scale }}>OPS DESK / LIVE</span>
            <span style={{ fontFamily: FONT.mono, fontWeight: 700, color: C.red, fontSize: 17 * scale }}>● 3 INCIDENTS</span>
          </div>
          <div style={{ position: "absolute", left: stage.width * 0.015, top: Math.max(68 * scale, stage.height * 0.5 - portraitHeight * 0.45), width: portraitWidth, height: portraitHeight }}>
            <FounderRig width={portraitWidth} height={portraitHeight} frame={frame} />
          </div>
          <svg width={stage.width * 0.46} height={stage.height * 0.77} style={{ position: "absolute", right: stage.width * 0.015, top: stage.height * 0.11, opacity: 0.7 }} viewBox="0 0 420 580" fill="none" aria-hidden="true">
            <path d="M30 70C140 70 90 190 220 190s80 115 160 115M20 420c120 0 80-95 205-95s76-120 160-120" stroke={C.olive} strokeWidth="7" strokeDasharray="11 13" />
            <circle cx="220" cy="190" r="11" fill={C.red} /><circle cx="225" cy="325" r="11" fill={C.red} />
          </svg>
          <AlertCard label={CONTENT.pains[0]?.label ?? "LEADS WAITING"} frame={frame} at={58} fps={fps} width={stage.width * 0.45} top={stage.height * 0.25} right={stage.width * 0.027} scale={scale} />
          <AlertCard label={CONTENT.pains[1]?.label ?? "STOCK ERROR"} frame={frame} at={108} fps={fps} width={stage.width * 0.45} top={stage.height * 0.46} right={stage.width * 0.027} scale={scale} />
          <AlertCard label={CONTENT.pains[2]?.label ?? "STAFF NEEDS HELP"} frame={frame} at={158} fps={fps} width={stage.width * 0.45} top={stage.height * 0.67} right={stage.width * 0.027} scale={scale} />
          <div style={{ position: "absolute", left: 16 * scale, bottom: 12 * scale, fontFamily: FONT.mono, fontSize: 20 * scale, fontWeight: 700, color: C.olive }}>
            {CONTENT.illustrativeNote}
          </div>
        </div>
      </AbsoluteFill>
      <div style={{ position: "absolute", right: 0, top: 0, width: 16 * scale, height: h, background: C.red, opacity: interpolate(frame, [0, 18, 35], [0.9, 0.15, 0.5], clamp) }} />
    </AbsoluteFill>
  );
};
