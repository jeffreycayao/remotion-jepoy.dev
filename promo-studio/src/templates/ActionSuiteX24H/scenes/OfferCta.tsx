import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { COPY, LOGO } from "../content";
import { RevealText } from "../RevealText";
import { C, clamp, FONT, peso, useFrameLayout } from "../tokens";
import { Chip } from "../ui";

/** Scene 4A (795–915): first month at ₱499. */
export const OfferScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u, vertical } = useFrameLayout();
  const price = spring({ frame: frame - 16, fps, config: { damping: 10, stiffness: 140 } });
  const glow = 0.35 + 0.2 * Math.sin(frame / 6);

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 24 * u, padding: `0 ${60 * u}px` }}>
      <RevealText
        text={COPY.offerHeadline}
        delay={2}
        style={{ fontFamily: FONT.head, fontWeight: 800, fontSize: (vertical ? 62 : 60) * u, lineHeight: 1.1, color: C.cream, textAlign: "center" }}
      />
      <div
        style={{
          fontFamily: FONT.head,
          fontWeight: 800,
          fontSize: (vertical ? 250 : 260) * u,
          lineHeight: 1,
          letterSpacing: -8 * u,
          color: C.lime,
          textShadow: `0 0 ${80 * u}px rgba(213,250,0,${glow})`,
          opacity: price,
          scale: `${0.5 + 0.5 * price}`,
        }}
      >
        {peso(COPY.offerPrice)}
      </div>
      <div style={{ display: "flex", flexDirection: vertical ? "column" : "row", alignItems: "center", gap: 14 * u, marginTop: 10 * u }}>
        {COPY.offerIncludes.map((item, i) => {
          const p = spring({ frame: frame - 40 - i * 8, fps, config: { damping: 200 } });
          return (
            <span key={item} style={{ display: "inline-block", opacity: p, translate: `0px ${(1 - p) * 20 * u}px` }}>
              <Chip size={vertical ? 28 : 24} style={{ padding: `${10 * u}px ${18 * u}px`, borderRadius: 999 }}>
                ✓ {item}
              </Chip>
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/** Scene 4B (915–1050): logo lockup, headline, URL button. */
export const CtaScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u, vertical } = useFrameLayout();
  const logo = spring({ frame: frame - 2, fps, config: { damping: 12, stiffness: 120 } });
  const button = spring({ frame: frame - 38, fps, config: { damping: 13 } });
  const breathe = 1 + 0.02 * Math.sin(frame / 10);

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: (vertical ? 50 : 40) * u, padding: `0 ${60 * u}px` }}>
      <div style={{ display: "flex", flexDirection: vertical ? "column" : "row", alignItems: "center", gap: 26 * u, opacity: logo, scale: `${0.7 + 0.3 * logo}` }}>
        <Img src={staticFile(LOGO)} style={{ width: (vertical ? 170 : 140) * u, height: (vertical ? 170 : 140) * u, borderRadius: 32 * u, boxShadow: `0 0 ${70 * u}px rgba(213,250,0,0.25)` }} />
        <div style={{ fontFamily: FONT.head, fontWeight: 800, fontSize: (vertical ? 64 : 70) * u, lineHeight: 1.05, color: C.cream, textAlign: vertical ? "center" : "left" }}>
          {COPY.brand.split(" ").map((w, i) => (
            <div key={w} style={{ color: i === 0 ? C.blue : C.cream, fontSize: i === 0 ? "0.55em" : undefined, fontWeight: i === 0 ? 700 : 800 }}>
              {w}
            </div>
          ))}
        </div>
      </div>
      <RevealText
        text={COPY.ctaHeadline}
        delay={18}
        accent={["idle"]}
        style={{ fontFamily: FONT.head, fontWeight: 800, fontSize: (vertical ? 78 : 76) * u, lineHeight: 1.08, color: C.cream, textAlign: "center", maxWidth: 1400 * u }}
      />
      <div
        style={{
          fontFamily: FONT.body,
          fontWeight: 600,
          fontSize: (vertical ? 42 : 38) * u,
          color: C.canvas,
          background: C.lime,
          borderRadius: 999,
          padding: `${20 * u}px ${48 * u}px`,
          boxShadow: `0 0 ${60 * u}px rgba(213,250,0,0.3)`,
          opacity: button,
          scale: `${(0.8 + 0.2 * button) * breathe}`,
        }}
      >
        {COPY.url}
      </div>
      <div style={{ opacity: interpolate(frame, [55, 70], [0, 1], clamp) }}>
        <Chip tone="dark" size={vertical ? 26 : 22} style={{ padding: `${8 * u}px ${16 * u}px` }}>
          First month {peso(COPY.offerPrice)}
        </Chip>
      </div>
    </AbsoluteFill>
  );
};
