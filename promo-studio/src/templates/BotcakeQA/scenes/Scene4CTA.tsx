import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { COPY, LOGO } from "../content";
import { RevealText } from "../RevealText";
import { C, clamp, FONT, useFrameLayout } from "../tokens";
import { BotcakeLogo, Stage } from "../ui";

export const PILL_AT = 98; // "Bisitahin…"

/** Scene 4 (795–1040): logo lockup, "Build better prompts. Ship with confidence.", lime URL pill. */
export const Scene4CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { mode, vertical } = useFrameLayout();
  const wide = mode === "wide";
  const logo = spring({ frame: frame - 2, fps, config: { damping: 12, stiffness: 120 } });
  const pill = spring({ frame: frame - PILL_AT, fps, config: { damping: 9, stiffness: 150 } });
  const breathe = 1 + 0.02 * Math.sin(frame / 10);
  const W = wide ? 1500 : 1000;
  const H = wide ? 820 : vertical ? 1300 : 1000;

  return (
    <AbsoluteFill>
      <Stage w={W} h={H}>
        <div style={{ width: W, height: H, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: wide ? 40 : 52 }}>
          <div style={{ display: "flex", flexDirection: wide ? "row" : "column", alignItems: "center", gap: 26, opacity: logo, scale: `${0.7 + 0.3 * logo}` }}>
            <Img src={staticFile(LOGO)} style={{ width: wide ? 130 : 160, height: wide ? 130 : 160, borderRadius: 30, boxShadow: "0 0 70px rgba(213,250,0,0.25)" }} />
            <div style={{ textAlign: wide ? "left" : "center" }}>
              <div style={{ fontFamily: FONT.head, fontWeight: 700, fontSize: 34, color: C.blue }}>Automatika</div>
              <div style={{ fontFamily: FONT.head, fontWeight: 800, fontSize: 68, color: C.cream, lineHeight: 1.05 }}>ActionSuite</div>
            </div>
          </div>

          <div style={{ fontFamily: FONT.head, fontWeight: 800, fontSize: wide ? 80 : 86, lineHeight: 1.08, color: C.cream, textAlign: "center" }}>
            {COPY.ctaHeadline.map((line, i) => (
              <RevealText key={line} text={line} delay={i === 0 ? 4 : 46} accent={i === 1 ? ["confidence."] : []} />
            ))}
          </div>

          <div style={{ fontFamily: FONT.body, fontWeight: 500, fontSize: wide ? 28 : 32, color: C.muted, textAlign: "center", maxWidth: 900, opacity: interpolate(frame, [64, 78], [0, 1], clamp) }}>
            {COPY.product}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginTop: 18 }}>
              <span style={{ fontFamily: FONT.body, fontWeight: 600, fontSize: wide ? 24 : 28, color: C.muted }}>Works with</span>
              <span style={{ background: C.cream, borderRadius: 999, padding: wide ? "10px 22px" : "12px 26px" }}>
                <BotcakeLogo h={wide ? 34 : 40} />
              </span>
            </div>
          </div>

          <div
            style={{
              fontFamily: FONT.body,
              fontWeight: 600,
              fontSize: wide ? 42 : 48,
              color: C.canvas,
              background: C.lime,
              borderRadius: 999,
              padding: "22px 54px",
              boxShadow: "0 0 70px rgba(213,250,0,0.35)",
              opacity: pill,
              scale: `${(0.5 + 0.5 * pill) * breathe}`,
            }}
          >
            {COPY.url}
          </div>
        </div>
      </Stage>
    </AbsoluteFill>
  );
};
