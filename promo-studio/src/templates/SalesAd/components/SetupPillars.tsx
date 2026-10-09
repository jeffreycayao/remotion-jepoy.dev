import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COPY, LATENCY, PILLARS, UPTIME } from "../content";
import { RevealText } from "../RevealText";
import { C, FONT } from "../tokens";
import { Backdrop, Shimmer, usePick } from "../ui";
import { Logo } from "./Logos";

// Frames within Scene 2 (317 long), from the recorded voiceover:
//   4 "Dito sa Automatika," · 48 "kami na ang bahala" · ~80 "mag-set up ng entire pancake setup mo —"
//   154 "chatbot na kayang mag-assist ng client," · 215 "gumagana 24/7," · 266 "at mabilis mag-reply."
export const LOGO_AT = 2;
export const HEAD_AT = 46;
export const PILLAR_AT = [84, 100, 116, 132];
export const UPTIME_AT = 213;
export const LATENCY_AT = 263;

/** A pulsing status badge (dark pill, lime dot + border). */
const PulseBadge: React.FC<{ at: number; size: number; children: React.ReactNode }> = ({ at, size, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - at, fps, config: { damping: 10, stiffness: 170 } });
  const beat = frame >= at ? 0.5 + 0.5 * Math.sin((frame - at) / 5) : 0;
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: size * 0.5, padding: `${size * 0.5}px ${size * 0.85}px`, borderRadius: 999, background: C.panel, border: `2px solid ${C.lime}`, boxShadow: `0 0 ${size * 1.6 * beat}px rgba(213,250,0,${0.55 * beat})`, opacity: p, scale: `${0.6 + 0.4 * p}`, whiteSpace: "nowrap" }}>
      <span style={{ width: size * 0.5, height: size * 0.5, borderRadius: 99, background: C.lime, opacity: 0.5 + 0.5 * beat }} />
      <span style={{ fontFamily: FONT.mono, fontWeight: 700, fontSize: size, color: C.lime }}>[{children}]</span>
    </div>
  );
};

/** Scene 2: Automatika lockup, 4 pillars assemble around a Pancake hub, 24/7 + latency badges. */
export const SetupPillars: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pick = usePick();

  // Copy column + assembly grid per format.
  const L = pick({
    wide: { copy: { x: 120, y: 200, w: 760 }, logo: 220, head: 84, sub: 32, align: "left" as const, grid: { cx: 1370, cy: 560 }, tile: { w: 330, h: 190 }, gap: 40, hub: 170, badge: 24, badgesInCopy: true },
    square: { copy: { x: 60, y: 40, w: 960 }, logo: 120, head: 56, sub: 26, align: "center" as const, grid: { cx: 540, cy: 640 }, tile: { w: 430, h: 150 }, gap: 28, hub: 120, badge: 20, badgesInCopy: false },
    portrait: { copy: { x: 60, y: 50, w: 960 }, logo: 150, head: 66, sub: 28, align: "center" as const, grid: { cx: 540, cy: 790 }, tile: { w: 440, h: 190 }, gap: 30, hub: 140, badge: 22, badgesInCopy: false },
    vertical: { copy: { x: 60, y: 150, w: 960 }, logo: 190, head: 80, sub: 32, align: "center" as const, grid: { cx: 540, cy: 1000 }, tile: { w: 440, h: 230 }, gap: 34, hub: 160, badge: 26, badgesInCopy: false },
  });

  const logoIn = spring({ frame: frame - LOGO_AT, fps, config: { damping: 14, stiffness: 120 } });
  const assembled = frame >= PILLAR_AT[3] + 10;
  const hubP = spring({ frame: frame - (PILLAR_AT[0] - 10), fps, config: { damping: 12 } });
  const gridH = L.tile.h * 2 + L.gap;
  const gridW = L.tile.w * 2 + L.gap;
  const badgesY = L.grid.cy + gridH / 2 + (L.badge * 2.2);

  const tile = (i: number) => {
    const p = spring({ frame: frame - PILLAR_AT[i], fps, config: { damping: 13, stiffness: 150 } });
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = L.grid.cx - gridW / 2 + col * (L.tile.w + L.gap);
    const y = L.grid.cy - gridH / 2 + row * (L.tile.h + L.gap);
    const fromX = (col ? 1 : -1) * 260;
    const fromY = (row ? 1 : -1) * 180;
    return (
      <div
        key={i}
        style={{
          position: "absolute",
          left: x,
          top: y,
          width: L.tile.w,
          height: L.tile.h,
          background: C.cream,
          borderRadius: 24,
          border: `3px solid ${assembled ? C.lime : C.cream}`,
          boxShadow: "0 24px 60px rgba(0,0,0,0.45)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: col ? "flex-end" : "flex-start",
          textAlign: col ? "right" : "left",
          paddingLeft: col ? L.hub * 0.42 + 26 : 26,
          paddingRight: col ? 26 : L.hub * 0.42 + 26,
          boxSizing: "border-box",
          opacity: Math.min(1, p * 1.5),
          translate: `${(1 - p) * fromX}px ${(1 - p) * fromY}px`,
          rotate: `${(1 - p) * (col ? 10 : -10)}deg`,
          overflow: "hidden",
        }}
      >
        <div style={{ fontFamily: FONT.head, fontWeight: 800, fontSize: L.tile.h * 0.2, color: C.ink, lineHeight: 1.05 }}>{PILLARS[i].title}</div>
        <div style={{ fontFamily: FONT.body, fontWeight: 500, fontSize: L.tile.h * 0.12, color: C.inkMuted, marginTop: 6 }}>{PILLARS[i].tag}</div>
        <Shimmer start={PILLAR_AT[i] + 8} duration={22} strength={0.7} />
      </div>
    );
  };

  const badges = (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 16, justifyContent: L.align === "left" ? "flex-start" : "center" }}>
      <PulseBadge at={UPTIME_AT} size={L.badge}>
        {UPTIME}
      </PulseBadge>
      <PulseBadge at={LATENCY_AT} size={L.badge}>
        {LATENCY}
      </PulseBadge>
    </div>
  );

  return (
    <AbsoluteFill>
      <Backdrop tone="dark" />

      {/* Copy column: lockup with lime slash, headline, sub (+ badges in 16:9) */}
      <div style={{ position: "absolute", left: L.copy.x, top: L.copy.y, width: L.copy.w, display: "flex", flexDirection: "column", alignItems: L.align === "left" ? "flex-start" : "center", gap: L.head * 0.3 }}>
        <div style={{ position: "relative", opacity: logoIn, scale: `${0.85 + 0.15 * logoIn}` }}>
          <Logo name="automatika" h={L.logo} style={{ position: "relative" }} />
        </div>
        <RevealText text={COPY.setupHeadline} delay={HEAD_AT} stagger={3} accent={["bahala."]} style={{ fontFamily: FONT.head, fontWeight: 800, fontSize: L.head, lineHeight: 1.05, color: C.cream, textAlign: L.align }} />
        <RevealText text={COPY.setupSub} delay={HEAD_AT + 30} stagger={2} style={{ fontFamily: FONT.body, fontWeight: 600, fontSize: L.sub, lineHeight: 1.3, color: C.blue, textAlign: L.align }} />
        {L.badgesInCopy && <div style={{ marginTop: 20 }}>{badges}</div>}
      </div>

      {/* Assembly: 4 tiles snap into a 2×2 around the Pancake hub */}
      {PILLARS.map((_, i) => tile(i))}
      <div
        style={{
          position: "absolute",
          left: L.grid.cx - L.hub / 2,
          top: L.grid.cy - L.hub / 2,
          width: L.hub,
          height: L.hub,
          borderRadius: 999,
          background: C.panel,
          border: `4px solid ${assembled ? C.lime : C.olive}`,
          boxShadow: assembled ? "0 0 50px rgba(213,250,0,0.45)" : "0 20px 50px rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: hubP,
          scale: `${0.4 + 0.6 * hubP}`,
        }}
      >
        <Logo name="pancake" h={L.hub * 0.55} />
      </div>
      {!L.badgesInCopy && <div style={{ position: "absolute", left: 60, right: 60, top: badgesY }}>{badges}</div>}
    </AbsoluteFill>
  );
};
