import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT, clamp, useLayout } from "../design";
import { CONTENT } from "../content";

type Channel = {
  name: string;
  mark: string;
  message: string;
  x: number;
  y: number;
  angle: number;
};

const CHANNELS: Channel[] = CONTENT.channels.map((name, i) => ({
  name: ["Facebook", "Instagram", "TikTok", "Shopee", "WhatsApp"][i] ?? name,
  mark: name,
  message: ["Available pa po?", "Price and size?", "Mine! Pa-reserve.", "Stock says sold out", "Follow-up po…"][i] ?? "New inquiry",
  x: [0.055, 0.39, 0.075, 0.4, 0.065][i] ?? 0.08,
  y: [0.15, 0.3, 0.45, 0.6, 0.75][i] ?? 0.15,
  angle: [-5, 4, 3, -4, -3][i] ?? 0,
}));

const WarningIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
    <circle cx="32" cy="18" r="10" fill={C.red} />
    <path d="M11 56c2-15 10-23 21-23s19 8 21 23" fill={C.red} />
    <path d="M19 18h26M24 25h16" stroke={C.charcoal} strokeWidth="5" strokeLinecap="round" />
    <path d="M51 8l6 6-6 6" stroke={C.red} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** Scene 1, local frames 0–209. The five channels end by collapsing into one inbox. */
export const OmnichannelChaos: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { w, h, wide, vertical, square, side, safeTop, safeBottom, scale } = useLayout();
  const portrait = !wide && !square && !vertical;
  const fontScale = scale;

  const stage = wide
    ? { x: w * 0.46, y: safeTop + 22, w: w * 0.48 - side * 0.55, h: h - safeTop - safeBottom - 36 }
    : vertical
      ? { x: side, y: safeTop + 355, w: w - 2 * side, h: h - safeTop - safeBottom - 555 }
      : portrait
        ? { x: side, y: safeTop + 290, w: w - 2 * side, h: h - safeTop - safeBottom - 385 }
        : { x: side, y: safeTop + 235, w: w - 2 * side, h: h - safeTop - safeBottom - 310 };
  const headlineSize = (wide ? 73 : vertical ? 78 : portrait ? 75 : 72) * fontScale;
  const noticeTop = wide ? safeTop + 530 : vertical ? h - safeBottom - 182 : portrait ? h - safeBottom - 92 : h - safeBottom - 70;
  const merge = interpolate(frame, [174, 207], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const clutterOpacity = interpolate(frame, [182, 202], [1, 0], clamp);
  const stageIn = spring({ frame: frame - 4, fps, config: { damping: 19, stiffness: 115 } });
  const alertIn = spring({ frame: frame - 92, fps, config: { damping: 14, stiffness: 200 } });
  const stockIn = spring({ frame: frame - 130, fps, config: { damping: 17, stiffness: 180 } });
  const commentIn = spring({ frame: frame - 68, fps, config: { damping: 16, stiffness: 205 } });
  const commentOut = interpolate(frame, [94, 104], [1, 0], clamp);
  const poachX = interpolate(frame, [72, 94], [stage.w * 0.78, stage.w * 0.62], { ...clamp, easing: Easing.inOut(Easing.cubic) });

  return (
    <AbsoluteFill style={{ background: C.charcoal, overflow: "hidden", color: C.cream }}>
      <AbsoluteFill style={{ backgroundImage: `linear-gradient(${C.olive}24 1px, transparent 1px), linear-gradient(90deg, ${C.olive}24 1px, transparent 1px)`, backgroundSize: "54px 54px", opacity: 0.46 }} />
      <div style={{ position: "absolute", width: w * 0.6, height: w * 0.6, left: -w * 0.21, top: h * 0.3, borderRadius: "50%", background: `radial-gradient(circle, ${C.olive}50, transparent 67%)` }} />

      <div style={{ position: "absolute", left: side, top: safeTop + (wide ? 15 : 8), width: wide ? w * 0.38 : w - 2 * side }}>
        <div style={{ fontFamily: FONT.mono, fontWeight: 600, letterSpacing: 2.2 * fontScale, fontSize: 21 * fontScale, color: C.blue, marginBottom: 30 * fontScale }}>THE MULTI-CHANNEL GRIND / 01</div>
        <div style={{ fontFamily: FONT.head, fontWeight: 800, fontSize: headlineSize, lineHeight: 1.07, letterSpacing: -3 * fontScale, opacity: interpolate(frame, [0, 15], [0.82, 1], clamp), translate: `0px ${interpolate(frame, [0, 18], [12, 0], clamp)}px` }}>
          SABAY-SABAY<br />ANG <span style={{ color: C.lime }}>INQUIRIES?</span>
        </div>
        {!square && <div style={{ fontFamily: FONT.body, fontWeight: 600, fontSize: (wide ? 29 : vertical ? 31 : 27) * fontScale, lineHeight: 1.3, color: C.blue, marginTop: (portrait ? 12 : 28) * fontScale, opacity: interpolate(frame, [15, 31], [0, 1], clamp) }}>
          {portrait ? CONTENT.scenes[0].title : `${CONTENT.scenes[0].title} Leaking leads. Stock that never matches.`}
        </div>}
      </div>

      <div style={{ position: "absolute", left: stage.x, top: stage.y, width: stage.w, height: stage.h, borderRadius: 36 * fontScale, background: C.panel, border: `2px solid ${C.olive}`, boxShadow: `0 35px 85px ${C.charcoal}`, overflow: "hidden", opacity: stageIn, scale: `${0.94 + 0.06 * stageIn}` }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 70 * fontScale, background: C.cream, color: C.charcoal, display: "flex", alignItems: "center", justifyContent: "space-between", padding: `0 ${30 * fontScale}px`, boxSizing: "border-box" }}>
          <span style={{ fontFamily: FONT.body, fontWeight: 700, fontSize: 26 * fontScale }}>INCOMING / ALL CHANNELS</span>
          <span style={{ borderRadius: 999, padding: `7px ${14 * fontScale}px`, fontFamily: FONT.mono, fontSize: 21 * fontScale, fontWeight: 600, background: C.red, color: C.white }}>128 UNREAD</span>
        </div>
        <div style={{ position: "absolute", inset: 0, top: 70 * fontScale, backgroundImage: `radial-gradient(${C.olive}66 1.5px, transparent 1.5px)`, backgroundSize: "30px 30px" }} />

        {CHANNELS.map((ch, i) => {
          const at = 12 + i * 15;
          const enter = spring({ frame: frame - at, fps, config: { damping: 15, stiffness: 230 } });
          const cardW = stage.w * 0.56;
          const cardH = Math.min(137 * fontScale, stage.h * 0.21);
          const startX = ch.x * stage.w;
          const startY = ch.y * stage.h;
          const targetX = (stage.w - cardW) / 2;
          const targetY = (stage.h - cardH) / 2;
          const drift = frame >= at ? Math.sin((frame - at) * (0.24 + i * 0.02)) * (4 + i) * (1 - merge) : 0;
          return (
            <div key={ch.name} style={{ position: "absolute", left: startX + (targetX - startX) * merge + drift, top: startY + (targetY - startY) * merge + Math.sin(frame * 0.18 + i) * 4 * (1 - merge), width: cardW, height: cardH, boxSizing: "border-box", borderRadius: 20 * fontScale, background: C.cream, color: C.charcoal, padding: `${14 * fontScale}px ${16 * fontScale}px`, boxShadow: `0 18px 32px ${C.charcoal}88`, opacity: enter * clutterOpacity, scale: `${0.77 + 0.23 * enter - merge * 0.1}`, rotate: `${ch.angle * (1 - merge)}deg`, zIndex: i + 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 * fontScale }}>
                <span style={{ display: "grid", placeItems: "center", minWidth: 54 * fontScale, height: 40 * fontScale, borderRadius: 9 * fontScale, background: C.blue, fontFamily: FONT.mono, fontSize: 22 * fontScale, fontWeight: 600 }}>{ch.mark}</span>
                <span style={{ fontFamily: FONT.body, fontSize: 23 * fontScale, fontWeight: 700 }}>{ch.name}</span>
                <span style={{ marginLeft: "auto", width: 11 * fontScale, height: 11 * fontScale, borderRadius: "50%", background: C.red }} />
              </div>
              <div style={{ marginTop: 12 * fontScale, fontFamily: FONT.body, fontSize: 26 * fontScale, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ch.message}</div>
            </div>
          );
        })}

        <div style={{ position: "absolute", left: stage.w * 0.055, top: stage.h * 0.685, width: stage.w * 0.7, height: 105 * fontScale, borderRadius: 20 * fontScale, boxSizing: "border-box", background: C.cream, color: C.charcoal, padding: `${13 * fontScale}px ${20 * fontScale}px`, opacity: commentIn * commentOut * clutterOpacity, translate: `0px ${(1 - commentIn) * 22}px`, zIndex: 7, overflow: "hidden" }}>
          <div style={{ fontFamily: FONT.mono, fontSize: 18 * fontScale, fontWeight: 600, color: C.olive }}>PUBLIC COMMENT</div>
          <div style={{ marginTop: 9 * fontScale, fontFamily: FONT.body, fontSize: 23 * fontScale, fontWeight: 700, whiteSpace: "nowrap" }}>Price po? Contact me: 09XX…</div>
        </div>
        <div style={{ position: "absolute", left: poachX, top: stage.h * 0.665, display: "flex", alignItems: "center", gap: 6 * fontScale, background: C.cream, color: C.red, border: `2px solid ${C.red}`, padding: `${9 * fontScale}px ${12 * fontScale}px`, borderRadius: 12 * fontScale, boxShadow: `0 14px 30px ${C.charcoal}`, fontFamily: FONT.mono, fontWeight: 600, fontSize: 16 * fontScale, opacity: commentIn * commentOut * clutterOpacity, zIndex: 7 }}><WarningIcon size={30 * fontScale} /> POACHING</div>

        <div style={{ position: "absolute", left: stage.w * 0.055, right: stage.w * 0.055, top: stage.h * 0.685, height: Math.min(140 * fontScale, stage.h * 0.22), background: C.cream, borderRadius: 22 * fontScale, borderLeft: `10px solid ${C.red}`, display: "flex", alignItems: "center", gap: 18 * fontScale, padding: `0 ${20 * fontScale}px`, boxSizing: "border-box", color: C.charcoal, opacity: alertIn * clutterOpacity, scale: `${0.82 + 0.18 * alertIn}`, zIndex: 8 }}>
          <WarningIcon size={50 * fontScale} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: FONT.mono, fontSize: 20 * fontScale, fontWeight: 600, color: C.red, whiteSpace: "nowrap" }}>[EXPOSED CUSTOMER DATA]</div>
            <div style={{ fontFamily: FONT.body, fontSize: 21 * fontScale, fontWeight: 600, marginTop: 5 * fontScale, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Public comment → competitor inbox</div>
          </div>
        </div>

        <div style={{ position: "absolute", left: stage.w * 0.14, right: stage.w * 0.14, bottom: 17 * fontScale, height: 65 * fontScale, background: C.blue, color: C.charcoal, borderRadius: 16 * fontScale, display: "flex", alignItems: "center", justifyContent: "space-between", padding: `0 ${23 * fontScale}px`, fontFamily: FONT.mono, fontWeight: 600, fontSize: 20 * fontScale, opacity: stockIn * clutterOpacity, zIndex: 9 }}>
          <span>STOCK: 12</span><span style={{ color: C.red }}>ORDERS: 18</span><span>−6</span>
        </div>

        <div style={{ position: "absolute", left: stage.w * 0.105, top: stage.h * 0.35, width: stage.w * 0.79, height: stage.h * 0.3, borderRadius: 28 * fontScale, background: C.cream, color: C.charcoal, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 19 * fontScale, boxShadow: `0 20px 60px ${C.charcoal}`, opacity: merge, scale: `${0.75 + 0.25 * merge}`, zIndex: 10 }}>
          <div style={{ fontFamily: FONT.head, fontWeight: 800, fontSize: 49 * fontScale, lineHeight: 1.05, textAlign: "center" }}>ONE INBOX</div>
          <div style={{ display: "flex", gap: 9 * fontScale, flexWrap: "wrap", justifyContent: "center" }}>
            {CHANNELS.map((ch) => <span key={ch.mark} style={{ background: C.blue, borderRadius: 9 * fontScale, padding: `${8 * fontScale}px ${12 * fontScale}px`, fontFamily: FONT.mono, fontSize: 19 * fontScale, fontWeight: 600 }}>{ch.mark}</span>)}
          </div>
        </div>
      </div>

      {wide && <div style={{ position: "absolute", left: side, top: noticeTop, width: w * 0.33, opacity: alertIn, translate: `0px ${(1 - alertIn) * 25}px` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 * fontScale, color: C.red, fontFamily: FONT.mono, fontSize: 22 * fontScale, fontWeight: 600 }}><WarningIcon size={52 * fontScale} />[EXPOSED CUSTOMER DATA]</div>
        <div style={{ fontFamily: FONT.body, fontSize: 28 * fontScale, fontWeight: 600, marginTop: 18 * fontScale, lineHeight: 1.35 }}>A public comment becomes a competitor&apos;s lead.</div>
        <div style={{ marginTop: 37 * fontScale, display: "flex", alignItems: "center", gap: 15 * fontScale, opacity: stockIn }}><span style={{ background: C.blue, color: C.charcoal, fontFamily: FONT.mono, fontSize: 22 * fontScale, fontWeight: 600, borderRadius: 11 * fontScale, padding: `${10 * fontScale}px ${16 * fontScale}px` }}>STOCK −6</span><span style={{ fontFamily: FONT.body, fontSize: 26 * fontScale }}>Oversold again.</span></div>
      </div>}
      {vertical && <div style={{ position: "absolute", left: side, right: side, top: noticeTop, height: 145 * fontScale, display: "flex", flexDirection: "column", gap: 12 * fontScale, opacity: alertIn * (1 - merge) }}>
        <div style={{ color: C.red, fontFamily: FONT.mono, fontSize: 26 * fontScale, fontWeight: 600 }}>[EXPOSED CUSTOMER DATA]</div>
        <div style={{ fontFamily: FONT.body, fontSize: 29 * fontScale, lineHeight: 1.18, fontWeight: 600 }}>A stolen lead. Another stock mismatch.</div>
      </div>}
    </AbsoluteFill>
  );
};
