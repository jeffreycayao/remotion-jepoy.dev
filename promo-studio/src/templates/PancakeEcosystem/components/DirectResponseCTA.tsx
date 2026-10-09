import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { CONTENT, LOGOS } from "../content";
import { C, clamp, FONT, useLayout } from "../design";

const SERVICES: string[] = CONTENT.setupSteps;

const ServiceChip: React.FC<{ label: string; index: number; frame: number; fps: number; size: number; wide: boolean }> = ({ label, index, frame, fps, size, wide }) => {
  const enter = spring({ frame: frame - 68 - index * 13, fps, config: { damping: 15, stiffness: 130 } });
  return (
    <div style={{
      minWidth: wide ? 310 : 0,
      flex: wide ? "0 0 auto" : "1 1 0",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: wide ? 15 : 8,
      border: `2px solid ${C.olive}`,
      borderRadius: 999,
      padding: wide ? "16px 21px" : "15px 12px",
      color: C.cream,
      background: C.panel,
      opacity: enter,
      transform: `translateY(${(1 - enter) * 25}px)`,
      boxSizing: "border-box",
    }}>
      <span style={{ fontFamily: FONT.mono, fontWeight: 600, fontSize: size * 0.72, color: C.lime, whiteSpace: "nowrap" }}>0{index + 1}</span>
      <span style={{ fontFamily: FONT.body, fontWeight: 600, fontSize: size, whiteSpace: "nowrap" }}>{label}</span>
    </div>
  );
};

type PillProps = {
  label: string;
  icon: "comment" | "calendar";
  color: string;
  start: number;
  frame: number;
  fps: number;
  fontSize: number;
  width: number;
  height: number;
  primary: boolean;
};

const ActionPill: React.FC<PillProps> = ({ label, icon, color, start, frame, fps, fontSize, width, height, primary }) => {
  const enter = spring({ frame: frame - start, fps, config: { damping: 11, stiffness: 145 } });
  const breathe = primary && frame > start + 40 ? 1 + Math.sin((frame - start - 40) / 10) * 0.016 : 1;
  const press = primary ? interpolate(frame, [204, 209, 216], [0, 1, 0], clamp) : 0;
  const ringBase = frame - start - 27;
  return (
    <div style={{ position: "relative", width, height, flexShrink: 0, opacity: enter, transform: `translateY(${(1 - enter) * 32}px) scale(${(0.83 + 0.17 * enter) * breathe * (1 - press * 0.035)})` }}>
      {primary && [0, 25].map((offset) => {
        const elapsed = ringBase - offset;
        const phase = elapsed < 0 ? 0 : (elapsed % 64) / 64;
        return (
          <div key={offset} style={{
            position: "absolute",
            inset: -7,
            borderRadius: 999,
            border: `4px solid ${C.lime}`,
            opacity: elapsed < 0 ? 0 : (1 - phase) * 0.62,
            transform: `scale(${1 + phase * 0.22})`,
            pointerEvents: "none",
          }} />
        );
      })}
      <div style={{
        position: "relative",
        width: "100%",
        height: "100%",
        background: color,
        color: C.ink,
        borderRadius: 999,
        boxShadow: primary ? `0 0 ${46 + 22 * Math.max(0, Math.sin(frame / 14))}px #D5FA0050, 0 16px 35px #00000044` : "0 16px 35px #00000044",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: fontSize * 0.4,
        fontFamily: FONT.body,
        fontWeight: 700,
        fontSize,
        whiteSpace: "nowrap",
        overflow: "hidden",
      }}>
        <svg width={fontSize * 0.9} height={fontSize * 0.9} viewBox="0 0 32 32" fill="none" stroke={C.ink} strokeWidth="2.7" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }} aria-hidden="true">
          {icon === "comment" ? (
            <>
              <path d="M7 5h18a4 4 0 0 1 4 4v12a4 4 0 0 1-4 4H14l-7 5v-5a4 4 0 0 1-4-4V9a4 4 0 0 1 4-4Z" />
              <path d="M10 13h12M10 18h9" />
            </>
          ) : (
            <>
              <rect x="4" y="7" width="24" height="21" rx="3" />
              <path d="M4 14h24M10 4v6M22 4v6M10 20h4M18 20h4M10 24h4" />
            </>
          )}
        </svg>
        <span>{label}</span>
      </div>
    </div>
  );
};

/** Frames 780–1049, with a local frame from its parent Sequence. */
export const DirectResponseCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { w, h, wide, vertical, safeTop, safeBottom, scale } = useLayout();
  const contentW = wide ? Math.min(w - 220 * scale, 1650 * scale) : w - 130 * scale;
  const badgeIn = spring({ frame: frame - 5, fps, config: { damping: 12, stiffness: 145 } });
  const headlineIn = spring({ frame: frame - 25, fps, config: { damping: 17, stiffness: 105 } });
  const serviceSize = wide ? 30 : vertical ? 30 : 28;
  const pillFont = wide ? 48 : vertical ? 42 : 41;
  const pillHeight = wide ? 106 * scale : vertical ? 116 * scale : 88 * scale;
  const pillW = wide ? Math.min(contentW * 0.47, 700 * scale) : Math.min(contentW, 845 * scale);
  const pillGap = wide ? 35 * scale : vertical ? 22 * scale : 14 * scale;
  const end = interpolate(frame, [263, 270], [1, 0.96], clamp);

  return (
    <AbsoluteFill style={{ background: C.canvas, overflow: "hidden", opacity: end }}>
      <AbsoluteFill style={{ backgroundImage: `radial-gradient(circle at 70% 62%, #D5FA001F, transparent 36%), radial-gradient(circle at 18% 14%, #6873232B, transparent 31%)` }} />
      <div style={{ position: "absolute", width: Math.min(w, h) * 1.17, height: Math.min(w, h) * 1.17, borderRadius: "50%", border: `2px solid ${C.olive}55`, top: -Math.min(w, h) * 0.42, right: -Math.min(w, h) * 0.36, transform: `rotate(${frame * 0.04}deg)`, opacity: 0.7 }} />
      <div style={{ position: "absolute", width: Math.min(w, h) * 0.72, height: Math.min(w, h) * 0.72, borderRadius: "50%", border: `2px solid ${C.olive}44`, bottom: -Math.min(w, h) * 0.41, left: -Math.min(w, h) * 0.22 }} />

      <AbsoluteFill style={{ padding: `${safeTop}px ${(w - contentW) / 2}px ${safeBottom}px`, boxSizing: "border-box", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        <div style={{
          border: `2px solid ${C.lime}`,
          borderRadius: 999,
          background: C.panel,
          padding: wide ? "16px 25px" : vertical ? "18px 25px" : "13px 20px",
          fontFamily: FONT.mono,
          fontWeight: 600,
          fontSize: wide ? 30 : vertical ? 34 : 29,
          letterSpacing: wide ? 1.2 : 0.4,
          color: C.lime,
          opacity: badgeIn,
          transform: `translateY(${(1 - badgeIn) * -24}px) scale(${0.75 + 0.25 * badgeIn})`,
          whiteSpace: "nowrap",
        }}>
          <span style={{ display: "inline-block", width: 11, height: 11, borderRadius: "50%", background: C.lime, marginRight: 13, boxShadow: `0 0 18px ${C.lime}` }} />
          {CONTENT.partnerBadge}
        </div>

        <div style={{ fontFamily: FONT.head, fontWeight: 800, fontSize: wide ? 112 : vertical ? 100 : 78, lineHeight: 1.07, color: C.cream, marginTop: wide ? 34 : vertical ? 47 : 27, opacity: headlineIn, transform: `translateY(${(1 - headlineIn) * 32}px)`, letterSpacing: wide ? -3 : -2 }}>
          Your full stack.<br /><span style={{ color: C.lime }}>Ready to sell.</span>
        </div>

        <div style={{ fontFamily: FONT.body, fontWeight: 500, fontSize: wide ? 35 : vertical ? 38 : 28, lineHeight: 1.2, color: C.cream, marginTop: wide ? 20 : vertical ? 25 : 18, opacity: interpolate(frame, [48, 65], [0, 1], clamp) }}>
          {CONTENT.scenes[3].title}
        </div>

        <div style={{ width: wide ? "auto" : "100%", display: "flex", alignItems: "stretch", justifyContent: "center", gap: wide ? 20 * scale : 9 * scale, marginTop: wide ? 50 : vertical ? 63 : 35 }}>
          {SERVICES.map((service, index) => <ServiceChip key={service} label={service} index={index} frame={frame} fps={fps} size={serviceSize} wide={wide} />)}
        </div>

        <div style={{ ...({ fontFamily: FONT.mono, fontWeight: 600, color: C.blue } as React.CSSProperties), fontSize: wide ? 23 : vertical ? 24 : 19, letterSpacing: 2, marginTop: wide ? 49 : vertical ? 85 : 42, opacity: interpolate(frame, [105, 122], [0, 1], clamp) }}>
          CHOOSE HOW TO START
        </div>

        <div style={{ display: "flex", flexDirection: wide ? "row" : "column", alignItems: "center", justifyContent: "center", gap: pillGap, marginTop: wide ? 21 : vertical ? 29 : 17 }}>
          <ActionPill label={CONTENT.cta.comment} icon="comment" color={C.blue} start={122} frame={frame} fps={fps} fontSize={pillFont} width={pillW} height={pillHeight} primary={false} />
          <ActionPill label={CONTENT.cta.booking} icon="calendar" color={C.lime} start={156} frame={frame} fps={fps} fontSize={pillFont} width={pillW} height={pillHeight} primary />
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: wide ? 16 : 12, marginTop: wide ? 32 : vertical ? 58 : 29, opacity: interpolate(frame, [184, 207], [0, 1], clamp) }}>
          <Img src={staticFile(LOGOS.automatikaMark)} style={{ width: wide ? 48 : vertical ? 55 : 45, height: wide ? 43 : vertical ? 50 : 41, objectFit: "contain" }} />
          <div style={{ display: "flex", alignItems: "baseline", gap: wide ? 10 : 7, whiteSpace: "nowrap" }}>
            <span style={{ fontFamily: FONT.head, fontWeight: 800, color: C.cream, fontSize: wide ? 29 : vertical ? 35 : 30, letterSpacing: -0.5 }}>{CONTENT.agency.toUpperCase()}</span>
            <span style={{ fontFamily: FONT.mono, fontWeight: 600, color: C.blue, fontSize: wide ? 23 : vertical ? 28 : 24 }}>× PANCAKE ECOSYSTEM</span>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
