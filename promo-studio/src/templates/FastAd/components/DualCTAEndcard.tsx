import type React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { CONTENT } from "../content";
import { C, FONT, clamp, useLayout } from "../design";

const CTAPill: React.FC<{
  text: string;
  kind: "comment" | "book";
  frame: number;
  fps: number;
  at: number;
  left: number;
  top: number;
  width: number;
  height: number;
  scale: number;
  wide: boolean;
}> = ({ text, kind, frame, fps, at, left, top, width, height, scale, wide }) => {
  const enter = spring({ frame: frame - at, fps, config: { damping: 11, stiffness: 150 } });
  const click = kind === "book" && frame >= 60 && frame < 73 ? 1 - 0.045 * Math.sin(((frame - 60) / 13) * Math.PI) : 1;
  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width,
        height,
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 18 * scale,
        padding: `0 ${(wide ? 34 : 29) * scale}px`,
        borderRadius: 20 * scale,
        border: `3px solid ${kind === "book" ? C.lime : C.blue}`,
        background: kind === "book" ? C.lime : C.blue,
        color: C.charcoal,
        boxShadow: kind === "book" ? `0 0 ${34 * scale}px ${C.lime}55, 0 ${20 * scale}px ${34 * scale}px ${C.charcoal}AA` : `0 ${18 * scale}px ${28 * scale}px ${C.charcoal}99`,
        fontFamily: FONT.head,
        fontWeight: 800,
        fontSize: (wide ? 40 : 42) * scale,
        letterSpacing: -1.2 * scale,
        lineHeight: 1.08,
        opacity: enter,
        translate: `0px ${(1 - enter) * 80 * scale}px`,
        scale: `${(0.9 + 0.1 * enter) * click}`,
        transformOrigin: "50% 50%",
      }}
    >
      <span>{text}</span>
      <span style={{ flexShrink: 0, width: 53 * scale, height: 53 * scale, display: "grid", placeItems: "center", borderRadius: "50%", background: C.charcoal, color: kind === "book" ? C.lime : C.blue, fontFamily: FONT.mono, fontSize: 38 * scale, lineHeight: 1 }}>
        {kind === "book" ? "↗" : "↵"}
      </span>
    </div>
  );
};

/** Scene 4, local frames 0–269: two clear, high-contrast response paths. */
export const DualCTAEndcard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { w, wide, vertical, square, side, safeTop, safeBottom, scale } = useLayout();
  const headlineIn = spring({ frame: frame - 8, fps, config: { damping: 17, stiffness: 112 } });
  const logoIn = spring({ frame, fps, config: { damping: 18, stiffness: 105 } });
  const stack = vertical || (!wide && !square);
  const ctaTop = wide ? safeTop + 630 * scale : vertical ? safeTop + 985 * scale : square ? safeTop + 615 * scale : safeTop + 720 * scale;
  const pillHeight = (wide ? 129 : vertical ? 147 : square ? 118 : 127) * scale;
  const gap = (wide ? 24 : vertical ? 28 : 18) * scale;
  const pillWidth = stack ? w - side * 2 : (w - side * 2 - gap) / 2;
  const firstLeft = side;
  const secondLeft = stack ? side : side + pillWidth + gap;
  const secondTop = stack ? ctaTop + pillHeight + gap : ctaTop;
  const brandMark = CONTENT.markAsset || CONTENT.logoAsset;

  return (
    <AbsoluteFill style={{ background: C.charcoal, color: C.cream, overflow: "hidden" }}>
      <AbsoluteFill style={{ backgroundImage: `linear-gradient(90deg, transparent 0%, transparent 48%, ${C.olive}25 48%, ${C.olive}25 49%, transparent 49%), radial-gradient(${C.olive}55 1.3px, transparent 1.3px)`, backgroundSize: `100% 100%, ${46 * scale}px ${46 * scale}px`, opacity: 0.52 }} />
      <div style={{ position: "absolute", left: -45 * scale, bottom: 75 * scale, width: 490 * scale, height: 490 * scale, border: `${48 * scale}px solid ${C.olive}33`, borderRadius: "50%" }} />
      <div style={{ position: "absolute", right: -80 * scale, top: -110 * scale, width: 460 * scale, height: 460 * scale, border: `${48 * scale}px solid ${C.olive}27`, borderRadius: "50%" }} />
      <div style={{ position: "absolute", left: side, top: safeTop + 10 * scale, display: "flex", alignItems: "center", gap: 17 * scale, opacity: logoIn }}>
        <div style={{ width: 73 * scale, height: 73 * scale, padding: 10 * scale, boxSizing: "border-box", background: C.cream, borderRadius: 15 * scale, display: "grid", placeItems: "center" }}>
          <Img src={staticFile(brandMark)} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
        </div>
        <div>
          <div style={{ fontFamily: FONT.head, fontSize: 33 * scale, fontWeight: 800, letterSpacing: -1.1 * scale, lineHeight: 1.05 }}>AUTOMATIKA</div>
          <div style={{ fontFamily: FONT.mono, fontSize: 15 * scale, fontWeight: 600, letterSpacing: 1.9 * scale, color: C.blue, marginTop: 7 * scale }}>PANCAKE PHILIPPINES PARTNER</div>
        </div>
      </div>
      <div style={{ position: "absolute", left: side, top: safeTop + (wide ? 171 : vertical ? 312 : square ? 209 : 248) * scale, width: w - 2 * side, fontFamily: FONT.head, fontWeight: 800, fontSize: (wide ? 112 : vertical ? 104 : square ? 77 : 86) * scale, lineHeight: 1.055, letterSpacing: -4 * scale, opacity: headlineIn, translate: `0px ${(1 - headlineIn) * 44 * scale}px` }}>
        {CONTENT.cta.headline}
      </div>
      <div style={{ position: "absolute", left: side, top: ctaTop - (wide ? 58 : vertical ? 85 : 64) * scale, width: w - 2 * side, height: 3 * scale, background: C.olive, scale: `${interpolate(frame, [22, 56], [0, 1], clamp)} 1`, transformOrigin: "0% 50%" }} />
      <CTAPill text={CONTENT.cta.comment} kind="comment" frame={frame} fps={fps} at={29} left={firstLeft} top={ctaTop} width={pillWidth} height={pillHeight} scale={scale} wide={wide} />
      <CTAPill text={CONTENT.cta.booking} kind="book" frame={frame} fps={fps} at={59} left={secondLeft} top={secondTop} width={pillWidth} height={pillHeight} scale={scale} wide={wide} />
      <div style={{ position: "absolute", left: side, bottom: safeBottom + (wide ? 10 : vertical ? 38 : 7) * scale, width: w - side * 2, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20 * scale, fontFamily: FONT.mono, fontWeight: 600, fontSize: (wide ? 22 : vertical ? 25 : 18) * scale, letterSpacing: 0.8 * scale, color: C.blue }}>
        <span>{CONTENT.cta.url}</span>
        <span style={{ color: C.cream, whiteSpace: "nowrap" }}>TAKE BACK YOUR TIME ↗</span>
      </div>
    </AbsoluteFill>
  );
};
