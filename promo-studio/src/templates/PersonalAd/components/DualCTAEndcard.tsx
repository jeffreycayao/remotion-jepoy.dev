import type React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { CONTENT, LOGOS } from "../content";
import { C, clamp, FONT, useLayout } from "../design";

/** Two unmistakable response paths, with the booking button timed to the click cue. */
export const DualCTAEndcard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { w, h, vertical, wide, side, safeTop, safeBottom, scale } = useLayout();
  const titleIn = spring({ frame: frame - 10, fps, config: { damping: 17, stiffness: 110 } });
  const commentIn = spring({ frame: frame - 36, fps, config: { damping: 15 } });
  const bookingIn = spring({ frame: frame - 49, fps, config: { damping: 15 } });
  const bookingPress = interpolate(frame, [67, 70, 76], [1, 0.95, 1], clamp);
  const halo = interpolate(frame % 78, [0, 39, 78], [0.15, 0.32, 0.15], clamp);
  const headlineSize = vertical ? 80 : wide ? 112 : 78;
  const pillSize = vertical ? 38 : wide ? 38 : 30;
  const [headlineLead, headlineFinish] = CONTENT.cta.headline.split(". ");

  return (
    <AbsoluteFill style={{
      backgroundColor: C.charcoal, color: C.cream, overflow: "hidden",
      padding: `${safeTop}px ${side}px ${safeBottom}px`, boxSizing: "border-box",
    }}>
      <div style={{ position: "absolute", width: w * 0.7, height: w * 0.7, borderRadius: "50%", border: `2px solid rgba(104,115,35,${halo})`, right: -w * 0.25, top: h * 0.05, pointerEvents: "none" }} />
      <div style={{ position: "absolute", width: w * 0.55, height: w * 0.55, borderRadius: "50%", border: `2px solid rgba(213,250,0,${halo * 0.8})`, left: -w * 0.26, bottom: -w * 0.2, pointerEvents: "none" }} />

      <div style={{ position: "relative", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
          <Img src={staticFile(LOGOS.automatika)} style={{ width: vertical ? 230 : wide ? 250 : 205, height: vertical ? 75 : 66, objectFit: "contain", objectPosition: "left center" }} />
          <div style={{ borderRadius: 100, padding: vertical ? "15px 19px" : "12px 18px", backgroundColor: C.lime, color: C.charcoal, fontFamily: FONT.mono, fontSize: vertical ? 19 : wide ? 18 : 15, fontWeight: 600, letterSpacing: 0.7 }}>
            {CONTENT.partnerBadge}
          </div>
        </div>

        <div style={{ transform: `translateY(${(1 - titleIn) * 70}px)`, opacity: Math.max(0, Math.min(1, titleIn)) }}>
          <div style={{ fontFamily: FONT.mono, color: C.blue, fontSize: vertical ? 24 : wide ? 25 : 20, fontWeight: 600, letterSpacing: 4, marginBottom: vertical ? 24 : 18 }}>AUTOMATIKA / OPERATIONS, HANDLED</div>
          <div style={{ fontFamily: FONT.head, fontSize: headlineSize, fontWeight: 800, lineHeight: 1.04, letterSpacing: -4 * scale, maxWidth: wide ? 1650 : 980 }}>
            <div>{headlineLead}.</div>
            <div style={{ color: C.cream }}>{headlineFinish}</div>
          </div>
          <div style={{ width: interpolate(frame, [20, 75], [0, vertical ? 650 : 780], clamp), maxWidth: "90%", height: 8, backgroundColor: C.olive, borderRadius: 8, marginTop: vertical ? 34 : 26 }} />
        </div>

        <div>
          <div style={{ fontFamily: FONT.body, fontSize: vertical ? 32 : wide ? 32 : 27, lineHeight: 1.3, fontWeight: 600, color: C.cream, marginBottom: vertical ? 28 : 22 }}>
            Bawiin mo na ang oras mo. Choose your next step.
          </div>
          <div style={{ display: "flex", flexDirection: vertical ? "column" : "row", gap: vertical ? 22 : 24 }}>
            <div style={{
              flex: 1, minHeight: vertical ? 112 : wide ? 112 : 98,
              borderRadius: 100, backgroundColor: C.blue, color: C.charcoal,
              display: "flex", justifyContent: "center", alignItems: "center", gap: 18,
              fontFamily: FONT.head, fontSize: pillSize, fontWeight: 700,
              transform: `translateY(${(1 - commentIn) * 55}px) scale(${0.88 + commentIn * 0.12})`,
              opacity: Math.max(0, Math.min(1, commentIn)),
              boxShadow: "0 18px 42px rgba(0,0,0,.24)",
            }}><span style={{ fontSize: pillSize * 1.05 }}>💬</span>{CONTENT.cta.comment}</div>
            <div style={{
              flex: 1, minHeight: vertical ? 112 : wide ? 112 : 98,
              borderRadius: 100, backgroundColor: C.lime, color: C.charcoal,
              display: "flex", justifyContent: "center", alignItems: "center", gap: 18,
              fontFamily: FONT.head, fontSize: pillSize, fontWeight: 800,
              transform: `translateY(${(1 - bookingIn) * 55}px) scale(${(0.88 + bookingIn * 0.12) * bookingPress})`,
              opacity: Math.max(0, Math.min(1, bookingIn)),
              boxShadow: `0 18px 52px rgba(213,250,0,${halo})`,
            }}><span style={{ fontSize: pillSize * 1.05 }}>📅</span>{CONTENT.cta.booking}</div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, fontFamily: FONT.mono, fontSize: vertical ? 20 : 18, fontWeight: 500, color: C.muted }}>
          <span>{CONTENT.cta.url}</span><span>OFFICIAL PANCAKE PHILIPPINES PARTNER</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
