import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CONTENT } from "../content";
import { C, FONT, clamp, useLayout } from "../design";

const FounderPortrait: React.FC<{ width: number; height: number; frame: number }> = ({ width, height, frame }) => {
  const breath = Math.sin(frame / 15) * 3;
  const worry = Math.sin(frame / 8) * 2;

  return (
    <svg width={width} height={height} viewBox="0 0 380 430" fill="none" aria-label="Illustrated founder juggling broken business tools">
      <ellipse cx="192" cy="405" rx="161" ry="17" fill={C.olive} opacity="0.23" />
      <path d="M72 375c7-88 45-130 119-130 76 0 115 42 121 130" fill={C.olive} stroke={C.charcoal} strokeWidth="8" />
      <path d="M158 241v44c17 23 49 23 66 0v-44" fill={C.cream} stroke={C.charcoal} strokeWidth="7" />
      <path d="M110 127c0-69 32-106 84-106 58 0 91 36 91 104v65c0 67-37 109-91 109-50 0-84-43-84-109v-63Z" fill={C.cream} stroke={C.charcoal} strokeWidth="8" />
      <path d="M108 153c-14-45-2-100 31-126 30-24 93-30 128 1 23 20 34 55 25 105-14-16-27-34-37-53-31 28-81 43-147 46v27Z" fill={C.charcoal} />
      <path d="M110 155c-17-12-30-3-28 16 2 17 13 27 29 29M283 155c16-13 29-4 27 15-2 18-13 28-29 30" fill={C.cream} stroke={C.charcoal} strokeWidth="7" />
      <path d="M137 161c16-10 30-9 43 0M210 160c16-10 30-9 43 1" stroke={C.charcoal} strokeWidth="8" strokeLinecap="round" />
      <path d="M151 181h16M220 181h16" stroke={C.charcoal} strokeWidth="8" strokeLinecap="round" />
      <path d="M197 183c-5 16-5 28 4 37" stroke={C.charcoal} strokeWidth="6" strokeLinecap="round" />
      <path d={`M166 ${246 + worry}c17-13 37-13 55 0`} stroke={C.charcoal} strokeWidth="7" strokeLinecap="round" />
      <path d="M288 180c12 23 12 35 0 42-11 6-24 0-24-12 0-9 7-20 24-30Z" fill={C.blue} stroke={C.charcoal} strokeWidth="4" />
      <path d="M97 292c-12 15-21 35-23 61M294 291c15 18 22 38 23 62" stroke={C.charcoal} strokeWidth="8" strokeLinecap="round" />
      <g transform={`translate(0 ${breath})`}>
        <rect x="65" y="327" width="260" height="68" rx="11" fill={C.blue} stroke={C.charcoal} strokeWidth="8" />
        <path d="M49 396h292l-15 18H64l-15-18Z" fill={C.cream} stroke={C.charcoal} strokeWidth="7" />
        <circle cx="194" cy="362" r="12" fill={C.lime} stroke={C.charcoal} strokeWidth="4" />
      </g>
    </svg>
  );
};

const ErrorBadge: React.FC<{ label: string; at: number; frame: number; fps: number; width: number; top: number; right: number }> = ({ label, at, frame, fps, width, top, right }) => {
  const enter = spring({ frame: frame - at, fps, config: { damping: 11, stiffness: 165 } });
  const tremor = frame < at ? 0 : Math.sin((frame - at) * 0.72) * 3;
  return (
    <div
      style={{
        position: "absolute",
        right,
        top,
        width,
        minHeight: 72,
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "13px 17px",
        borderRadius: 16,
        border: `3px solid ${C.red}`,
        background: C.white,
        color: C.charcoal,
        boxShadow: `0 15px 28px ${C.charcoal}55`,
        opacity: Math.max(0, Math.min(1, enter)),
        translate: `${(1 - enter) * 52 + tremor}px ${(1 - enter) * 10}px`,
        rotate: `${tremor * 0.45}deg`,
      }}
    >
      <span style={{ flexShrink: 0, width: 29, height: 29, borderRadius: "50%", display: "grid", placeItems: "center", background: C.red, color: C.white, fontFamily: FONT.mono, fontWeight: 700, fontSize: 20 }}>!</span>
      <span style={{ fontFamily: FONT.mono, fontWeight: 700, fontSize: 19, lineHeight: 1.12, overflowWrap: "anywhere" }}>{label}</span>
    </div>
  );
};

/** Scene 1, local frames 0–239: the founder is trapped between a working day and failing tools. */
export const PatternInterruptHook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { w, h, scale, vertical, wide, square, side, safeTop, safeBottom } = useLayout();
  const portrait = !wide && !square && !vertical;
  const shake = frame < 21 ? (1 - frame / 21) * Math.sin(frame * 2.6) * 9 * scale : 0;
  const badgeEnter = spring({ frame, fps, config: { damping: 12, stiffness: 170 } });
  const badgePulse = 1 + 0.018 * Math.sin(frame / 9);
  const questionIn = spring({ frame: frame - 17, fps, config: { damping: 18, stiffness: 105 } });
  const stageIn = spring({ frame: frame - 9, fps, config: { damping: 17, stiffness: 115 } });

  const stage = wide
    ? { x: w * 0.52, y: safeTop + 22, width: w * 0.43, height: h - safeTop - safeBottom - 44 }
    : vertical
      ? { x: side, y: safeTop + 400, width: w - side * 2, height: h - safeTop - safeBottom - 426 }
      : portrait
        ? { x: side, y: safeTop + 345, width: w - side * 2, height: h - safeTop - safeBottom - 364 }
        : { x: side, y: safeTop + 300, width: w - side * 2, height: h - safeTop - safeBottom - 317 };
  const badgeFont = (wide ? 49 : vertical ? 60 : portrait ? 48 : 44) * scale;
  const questionFont = (wide ? 61 : vertical ? 58 : portrait ? 50 : 45) * scale;
  const avatarWidth = Math.min(stage.width * 0.46, stage.height * 0.53);
  const avatarHeight = avatarWidth * (430 / 380);
  const badgeWidth = stage.width * 0.47;
  const badgeRight = stage.width * 0.035;

  return (
    <AbsoluteFill style={{ background: C.charcoal, color: C.cream, overflow: "hidden" }}>
      <AbsoluteFill style={{ backgroundImage: `radial-gradient(${C.olive}42 1.5px, transparent 1.5px)`, backgroundSize: `${35 * scale}px ${35 * scale}px`, opacity: 0.38 }} />
      <AbsoluteFill style={{ background: `radial-gradient(circle at 82% 53%, ${C.red}2B, transparent 38%)`, opacity: interpolate(frame, [0, 16], [0.65, 1], clamp) }} />

      <AbsoluteFill style={{ translate: `${shake}px ${shake * 0.4}px` }}>
        <div style={{ position: "absolute", left: side, top: safeTop + (wide ? 7 : 0), width: wide ? w * 0.45 : w - 2 * side }}>
          <div style={{ fontFamily: FONT.mono, fontWeight: 600, fontSize: (wide ? 21 : 19) * scale, letterSpacing: 2.6 * scale, color: C.blue, marginBottom: (wide ? 31 : 22) * scale }}>AUTOMATIKA / A QUESTION FOR OWNERS</div>
          <div
            style={{
              background: C.lime,
              color: C.charcoal,
              borderRadius: 23 * scale,
              border: `3px solid ${C.cream}`,
              padding: `${(wide ? 27 : 21) * scale}px ${(wide ? 29 : 24) * scale}px`,
              fontFamily: FONT.head,
              fontWeight: 800,
              fontSize: badgeFont,
              lineHeight: 1.08,
              letterSpacing: -1.8 * scale,
              boxShadow: `0 0 ${45 + 15 * Math.sin(frame / 8)}px ${C.lime}66, 0 18px 36px ${C.charcoal}88`,
              opacity: 0.83 + 0.17 * Math.min(1, badgeEnter),
              scale: `${(0.93 + 0.07 * badgeEnter) * badgePulse}`,
              transformOrigin: "0% 50%",
              overflowWrap: "break-word",
            }}
          >
            {CONTENT.hookBadge}
          </div>
          <div style={{ fontFamily: FONT.head, fontWeight: 700, fontSize: questionFont, lineHeight: 1.13, letterSpacing: -1.7 * scale, marginTop: (wide ? 47 : 30) * scale, maxWidth: wide ? 815 * scale : undefined, opacity: Math.max(0, Math.min(1, questionIn)), translate: `0px ${(1 - questionIn) * 26}px` }}>
            {CONTENT.hookQuestion}
          </div>
        </div>

        <div style={{ position: "absolute", left: stage.x, top: stage.y, width: stage.width, height: stage.height, background: C.cream, border: `3px solid ${C.olive}`, borderRadius: 32 * scale, overflow: "hidden", boxSizing: "border-box", boxShadow: `0 35px 70px ${C.charcoal}99`, opacity: Math.max(0, Math.min(1, stageIn)), scale: `${0.95 + stageIn * 0.05}` }}>
          <div style={{ position: "absolute", left: "48%", right: 0, top: 0, bottom: 0, background: C.charcoal }} />
          <div style={{ position: "absolute", left: "48%", width: 3, top: 0, bottom: 0, background: C.olive }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 62 * scale, display: "flex", alignItems: "center", justifyContent: "space-between", padding: `0 ${22 * scale}px`, boxSizing: "border-box", background: C.cream, borderBottom: `2px solid ${C.olive}` }}>
            <span style={{ color: C.charcoal, fontFamily: FONT.mono, fontWeight: 700, fontSize: 19 * scale, letterSpacing: 1.2 * scale }}>FOUNDER / LIVE OPERATIONS</span>
            <span style={{ color: C.red, fontFamily: FONT.mono, fontWeight: 700, fontSize: 19 * scale }}>● ATTENTION</span>
          </div>
          <div style={{ position: "absolute", left: stage.width * 0.02, bottom: stage.height * 0.08, width: stage.width * 0.43, height: stage.height * 0.63, borderRadius: "50%", background: C.blue, opacity: 0.43 }} />
          <div style={{ position: "absolute", left: stage.width * 0.02, top: Math.max(76 * scale, (stage.height - avatarHeight) / 2), width: avatarWidth, height: avatarHeight }}>
            <FounderPortrait width={avatarWidth} height={avatarHeight} frame={frame} />
          </div>
          <ErrorBadge label={CONTENT.frustration.errors[0]} at={24} frame={frame} fps={fps} width={badgeWidth} top={stage.height * (stage.height < 550 ? 0.23 : 0.25)} right={badgeRight} />
          <ErrorBadge label={CONTENT.frustration.errors[1]} at={70} frame={frame} fps={fps} width={badgeWidth} top={stage.height * (stage.height < 550 ? 0.46 : 0.45)} right={badgeRight} />
          <ErrorBadge label="CHATBOT NEEDS FIX" at={105} frame={frame} fps={fps} width={badgeWidth} top={stage.height * (stage.height < 550 ? 0.69 : 0.66)} right={badgeRight} />
          <div style={{ position: "absolute", left: stage.width * 0.035, bottom: 17 * scale, color: C.olive, fontFamily: FONT.mono, fontWeight: 600, fontSize: 14 * scale, letterSpacing: 1.1 * scale }}>ILLUSTRATIVE SCENARIO</div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
