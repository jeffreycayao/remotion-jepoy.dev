import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CONTENT } from "../content";
import { C, FONT, clamp, useLayout } from "../design";

type ErrorCardProps = {
  label: string;
  index: number;
  at: number;
  frame: number;
  fps: number;
  x: number;
  y: number;
  width: number;
  height: number;
  textSize: number;
};

const ErrorCard: React.FC<ErrorCardProps> = ({ label, index, at, frame, fps, x, y, width, height, textSize }) => {
  const enter = spring({ frame: frame - at, fps, config: { damping: 11, stiffness: 135 } });
  const visible = Math.max(0, Math.min(1, enter));

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width,
        height,
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        gap: textSize * 0.6,
        padding: `${textSize * 0.54}px ${textSize * 0.7}px`,
        borderRadius: 22,
        border: `2px solid ${C.red}`,
        borderLeft: `12px solid ${C.red}`,
        background: C.cream,
        color: C.charcoal,
        boxShadow: `0 20px 40px ${C.charcoal}88`,
        opacity: visible,
        translate: `${(1 - enter) * (index % 2 === 0 ? -100 : 100)}px ${(1 - enter) * 24}px`,
        rotate: `${(1 - enter) * (index % 2 === 0 ? -5 : 5)}deg`,
      }}
    >
      <span style={{ width: textSize * 1.7, height: textSize * 1.7, display: "grid", placeItems: "center", flexShrink: 0, borderRadius: 13, background: C.red, color: C.white, fontFamily: FONT.mono, fontWeight: 700, fontSize: textSize * 1.12 }}>!</span>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontFamily: FONT.mono, fontWeight: 700, fontSize: textSize * 0.56, color: C.red, letterSpacing: 1.6, marginBottom: textSize * 0.22 }}>SYSTEM ERROR / 0{index + 1}</div>
        <div style={{ fontFamily: FONT.head, fontWeight: 700, fontSize: textSize, lineHeight: 1.1, overflowWrap: "anywhere" }}>{label}</div>
      </div>
      <div style={{ width: textSize * 0.28, height: textSize * 0.28, borderRadius: "50%", background: C.red, boxShadow: `0 0 0 ${textSize * 0.18}px ${C.red}33`, flexShrink: 0 }} />
    </div>
  );
};

type ChatCardProps = {
  frame: number;
  fps: number;
  x: number;
  y: number;
  width: number;
  height: number;
  textSize: number;
};

const ChatCard: React.FC<ChatCardProps> = ({ frame, fps, x, y, width, height, textSize }) => {
  const enter = spring({ frame: frame - 110, fps, config: { damping: 13, stiffness: 150 } });
  return (
    <div style={{ position: "absolute", left: x, top: y, width, height, boxSizing: "border-box", display: "flex", alignItems: "center", gap: textSize * 0.55, background: C.blue, color: C.charcoal, padding: `${textSize * 0.45}px ${textSize * 0.7}px`, borderRadius: 22, border: `2px solid ${C.olive}`, opacity: Math.max(0, Math.min(1, enter)), translate: `0px ${(1 - enter) * 45}px` }}>
      <span style={{ display: "grid", placeItems: "center", width: textSize * 1.8, height: textSize * 1.8, borderRadius: "50%", flexShrink: 0, background: C.charcoal, color: C.cream, fontFamily: FONT.body, fontWeight: 700, fontSize: textSize * 0.8 }}>?</span>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: FONT.mono, fontWeight: 700, fontSize: textSize * 0.55, letterSpacing: 1.5, color: C.olive, marginBottom: textSize * 0.13 }}>TEAM CHAT / JUST NOW</div>
        <div style={{ fontFamily: FONT.body, fontWeight: 600, fontSize: textSize, lineHeight: 1.15, overflowWrap: "anywhere" }}>“{CONTENT.frustration.chat}”</div>
      </div>
    </div>
  );
};

/** Scene 2, local frames 0–299: errors stack up and the cost to the founder becomes visible. */
export const FounderFrustration: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { w, h, scale, vertical, wide, square, side, safeTop, safeBottom } = useLayout();
  const portrait = !wide && !square && !vertical;
  const cardX = side;
  const cardW = wide ? w * 0.43 : w - side * 2;
  const cardTop = wide ? safeTop + 316 : vertical ? safeTop + 440 : portrait ? safeTop + 300 : safeTop + 270;
  const cardH = wide ? 149 : vertical ? 165 : portrait ? 130 : 105;
  const cardGap = wide ? 24 : vertical ? 26 : portrait ? 22 : 16;
  const chatH = wide ? 144 : vertical ? 154 : portrait ? 136 : 113;
  const chatY = cardTop + cardH * 2 + cardGap * 2;
  const meterX = wide ? w * 0.535 : side;
  const meterY = wide ? safeTop + 270 : chatY + chatH + (vertical ? 55 : portrait ? 35 : 26);
  const meterW = wide ? w * 0.415 : w - side * 2;
  const meterH = wide ? h - meterY - safeBottom - 30 : h - meterY - safeBottom - (vertical ? 20 : 12);
  const cardText = wide ? 32 : vertical ? 38 : portrait ? 31 : 27;
  const chatText = wide ? 31 : vertical ? 36 : portrait ? 31 : 27;
  const headlineIn = spring({ frame: frame - 7, fps, config: { damping: 20, stiffness: 110 } });
  const meterIn = spring({ frame: frame - 143, fps, config: { damping: 13, stiffness: 110 } });
  const progress = interpolate(frame, [149, 234], [0, 1], clamp);
  const finalHours = Number.parseFloat(CONTENT.frustration.lostTime) || 4.5;
  const hoursUnit = CONTENT.frustration.lostTime.replace(/^[\d.]+\s*/, "");
  const currentHours = (finalHours * progress).toFixed(1);
  const bars = Array.from({ length: 15 }, (_, i) => i);

  return (
    <AbsoluteFill style={{ background: C.charcoal, color: C.cream, overflow: "hidden" }}>
      <AbsoluteFill style={{ backgroundImage: `linear-gradient(${C.olive}2E 1px, transparent 1px), linear-gradient(90deg, ${C.olive}2E 1px, transparent 1px)`, backgroundSize: `${60 * scale}px ${60 * scale}px`, opacity: 0.42 }} />
      <div style={{ position: "absolute", top: -h * 0.3, right: -w * 0.18, width: w * 0.7, height: w * 0.7, borderRadius: "50%", background: `radial-gradient(circle, ${C.red}24, transparent 68%)` }} />

      <div style={{ position: "absolute", left: side, top: safeTop + (wide ? 25 : 16), width: wide ? w * 0.47 : w - side * 2, opacity: Math.max(0, Math.min(1, headlineIn)), translate: `0px ${(1 - headlineIn) * 23}px` }}>
        <div style={{ color: C.blue, fontFamily: FONT.mono, fontWeight: 600, fontSize: (wide ? 22 : vertical ? 26 : 20) * scale, letterSpacing: 2.4 * scale, marginBottom: (wide ? 23 : 19) * scale }}>THE DAILY DRAG / 02</div>
        <div style={{ fontFamily: FONT.head, fontWeight: 800, fontSize: (wide ? 68 : vertical ? 78 : portrait ? 66 : 56) * scale, lineHeight: 1.08, letterSpacing: -2.1 * scale }}>
          MORE FIXING.<br /><span style={{ color: C.red }}>LESS SELLING.</span>
        </div>
        <div style={{ color: C.cream, fontFamily: FONT.body, fontWeight: 500, fontSize: (wide ? 29 : vertical ? 35 : 27) * scale, lineHeight: 1.25, marginTop: (wide ? 18 : 13) * scale, opacity: 0.84 }}>Inventory headaches. Broken connections. A confused team.</div>
      </div>

      <ErrorCard label={CONTENT.frustration.errors[0]} index={0} at={30} frame={frame} fps={fps} x={cardX} y={cardTop} width={cardW} height={cardH} textSize={cardText} />
      <ErrorCard label={CONTENT.frustration.errors[1]} index={1} at={70} frame={frame} fps={fps} x={cardX} y={cardTop + cardH + cardGap} width={cardW} height={cardH} textSize={cardText} />
      <ChatCard frame={frame} fps={fps} x={cardX} y={chatY} width={cardW} height={chatH} textSize={chatText} />

      <div style={{ position: "absolute", left: meterX, top: meterY, width: meterW, height: Math.max(180, meterH), boxSizing: "border-box", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: wide ? "46px 48px" : vertical ? "50px 51px" : portrait ? "28px 32px" : "22px 27px", borderRadius: wide ? 32 : 25, background: C.cream, color: C.charcoal, border: `3px solid ${C.olive}`, boxShadow: `0 28px 70px ${C.charcoal}99`, opacity: Math.max(0, Math.min(1, meterIn)), translate: `0px ${(1 - meterIn) * 65}px`, scale: `${0.96 + 0.04 * meterIn}` }}>
        <div>
          <div style={{ fontFamily: FONT.mono, fontWeight: 700, color: C.olive, fontSize: wide ? 23 : vertical ? 27 : 19, letterSpacing: 2 }}>LOST TIME / EVERY DAY</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: wide ? 13 : 9, whiteSpace: "nowrap", marginTop: wide ? 33 : vertical ? 42 : portrait ? 20 : 13 }}>
            <span style={{ fontFamily: FONT.head, fontWeight: 800, fontSize: wide ? 142 : vertical ? 155 : portrait ? 119 : 101, letterSpacing: -7, lineHeight: 0.95, fontVariantNumeric: "tabular-nums" }}>{currentHours}</span>
            <span style={{ fontFamily: FONT.mono, fontWeight: 700, fontSize: wide ? 31 : vertical ? 37 : portrait ? 29 : 23, color: C.red }}>{hoursUnit}</span>
          </div>
          <div style={{ fontFamily: FONT.body, fontWeight: 600, fontSize: wide ? 32 : vertical ? 36 : portrait ? 29 : 24, lineHeight: 1.18, marginTop: wide ? 26 : vertical ? 22 : 9 }}>Pulled away from sales and fulfillment.</div>
        </div>
        <div>
          <div style={{ height: wide ? 22 : vertical ? 25 : 15, display: "flex", gap: wide ? 8 : 5, marginBottom: wide ? 24 : vertical ? 24 : 13 }}>
            {bars.map((bar) => {
              const active = progress * bars.length > bar;
              return <div key={bar} style={{ flex: 1, borderRadius: 5, background: active ? C.red : C.blue, opacity: active ? 1 : 0.5, scale: `${active ? 1 : 0.75}`, transformOrigin: "50% 100%" }} />;
            })}
          </div>
          <div style={{ fontFamily: FONT.mono, fontWeight: 600, fontSize: wide ? 18 : vertical ? 21 : 15, color: C.olive, letterSpacing: 0.5, lineHeight: 1.2 }}>{CONTENT.illustrativeNote}</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
