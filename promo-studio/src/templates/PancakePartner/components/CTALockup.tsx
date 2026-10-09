import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BRAND, COPY } from "../content";
import { RevealText } from "../RevealText";
import { C, clamp, FONT } from "../tokens";
import { Backdrop, Cursor, Shimmer, usePick } from "../ui";
import { CoBrand } from "./Logos";

// Frames within Scene 4 (207 long), from the recorded voiceover:
//   4 "End-to-end solution from start to finish." · 78 "Chat us now" · ~120 "…book your on-boarding."
export const CHAT_AT = 76;
export const BOOK_AT = 116;
export const CLICK_AT = 168;

/** Scene 4 (780–1050): "Complete Deployment. Zero Guesswork." + Chat / Book dual CTA. */
export const CTALockup: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pick = usePick();
  const z = pick({
    wide: { head: 104, sub: 32, pill: 40, logo: 150, row: true, gap: 36 },
    square: { head: 72, sub: 26, pill: 32, logo: 120, row: true, gap: 28 },
    portrait: { head: 80, sub: 28, pill: 36, logo: 136, row: false, gap: 34 },
    vertical: { head: 90, sub: 32, pill: 42, logo: 168, row: false, gap: 46 },
  });

  const logoIn = spring({ frame: frame - 2, fps, config: { damping: 14, stiffness: 120 } });
  const chat = spring({ frame: frame - CHAT_AT, fps, config: { damping: 9, stiffness: 160 } });
  const book = spring({ frame: frame - BOOK_AT, fps, config: { damping: 9, stiffness: 160 } });
  const breathe = frame >= BOOK_AT ? 1 + 0.025 * Math.sin((frame - BOOK_AT) / 8) : 1;
  const pressed = interpolate(frame, [CLICK_AT, CLICK_AT + 3, CLICK_AT + 10], [0, 1, 0], clamp);

  // Cursor glides onto the Book pill (positioned relative to the pill, so it's exact in every format).
  const approach = interpolate(frame, [134, CLICK_AT - 4], [1, 0], clamp);
  const ring = frame - CLICK_AT;

  const pill = (label: string, tone: "blue" | "lime", p: number, extra = 1) => (
    <div
      style={{
        fontFamily: FONT.body,
        fontWeight: 600,
        fontSize: z.pill,
        color: C.ink,
        background: tone === "lime" ? C.lime : C.blue,
        borderRadius: 999,
        padding: `${z.pill * 0.55}px ${z.pill * 1.1}px`,
        whiteSpace: "nowrap",
        opacity: p,
        scale: `${(0.5 + 0.5 * p) * extra}`,
        boxShadow: tone === "lime" ? `0 0 ${70 * p}px rgba(213,250,0,0.4)` : "0 16px 40px rgba(0,0,0,0.35)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {label}
      {tone === "lime" && <Shimmer start={BOOK_AT + 12} every={45} duration={22} strength={0.8} />}
    </div>
  );

  return (
    <AbsoluteFill>
      <Backdrop tone="dark" />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: z.gap, padding: "0 60px" }}>
        <div style={{ opacity: logoIn, scale: `${0.85 + 0.15 * logoIn}`, translate: `0px ${(1 - logoIn) * -24}px` }}>
          <CoBrand h={z.logo} />
        </div>
        <div style={{ fontFamily: FONT.head, fontWeight: 800, fontSize: z.head, lineHeight: 1.05, color: C.cream, textAlign: "center" }}>
          {COPY.ctaHeadline.map((line, i) => (
            <RevealText key={line} text={line} delay={8 + i * 16} accent={i === 1 ? ["Zero", "Guesswork."] : []} />
          ))}
        </div>
        <div style={{ fontFamily: FONT.body, fontWeight: 500, fontSize: z.sub, color: C.muted, textAlign: "center", opacity: interpolate(frame, [40, 56], [0, 1], clamp) }}>{COPY.ctaSub}</div>
        <div style={{ display: "flex", flexDirection: z.row ? "row" : "column", alignItems: "center", gap: z.row ? 28 : 22, marginTop: 10 }}>
          {pill(COPY.chat, "blue", chat)}
          <div style={{ position: "relative" }}>
            {pill(COPY.book, "lime", book, breathe * (1 - 0.05 * pressed))}
            {ring >= 0 && ring <= 24 && (
              <div style={{ position: "absolute", left: "62%", top: "50%", width: 20 + ring * 6, height: 20 + ring * 6, translate: "-50% -50%", borderRadius: 999, border: `4px solid ${C.lime}`, opacity: 1 - ring / 24 }} />
            )}
            <div style={{ position: "absolute", left: "62%", top: "50%", translate: `${approach * 240}px ${approach * 200}px` }}>
              <Cursor x={0} y={0} press={pressed} opacity={interpolate(frame, [130, 140], [0, 1], clamp)} />
            </div>
          </div>
        </div>
        <div style={{ fontFamily: FONT.mono, fontWeight: 500, fontSize: z.sub * 0.85, letterSpacing: 2, color: C.muted, marginTop: 6, opacity: interpolate(frame, [120, 136], [0, 1], clamp) }}>{BRAND.url}</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
