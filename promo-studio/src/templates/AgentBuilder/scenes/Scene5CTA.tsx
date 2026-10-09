import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { COPY, LOGO } from "../content";
import { RevealText } from "../RevealText";
import { C, clamp, FONT } from "../tokens";
import { Backdrop, useFormat } from "../ui";

// Frames within the scene (248 long), from the recorded voiceover:
//   4 "Available na sa dashboard mo." · 64 "Mag-login na sa actionsuite.automatika.ph/login."
export const PILL_AT = 62;

/** Scene 5 (1067–1315): charcoal endcard, "Stop Guessing Prompts. Ship in 5 Minutes.", login pill. */
export const Scene5CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logo = spring({ frame, fps, config: { damping: 12, stiffness: 130 } });
  const pill = spring({ frame: frame - PILL_AT, fps, config: { damping: 9, stiffness: 150 } });
  const breathe = 1 + 0.02 * Math.sin(frame / 9);
  const { mode, vertical } = useFormat();
  const z = mode === "wide" ? { head: 96, pill: 46, cap: 30, gap: 40 } : vertical ? { head: 76, pill: 38, cap: 30, gap: 52 } : mode === "tall" ? { head: 70, pill: 36, cap: 28, gap: 44 } : { head: 62, pill: 34, cap: 26, gap: 34 };

  return (
    <AbsoluteFill>
      <Backdrop tone="dark" />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: z.gap, padding: "0 50px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 22, opacity: logo, scale: `${0.7 + 0.3 * logo}` }}>
          <Img src={staticFile(LOGO)} style={{ width: 96, height: 96, borderRadius: 22, boxShadow: "0 0 60px rgba(213,250,0,0.25)" }} />
          <div>
            <div style={{ fontFamily: FONT.head, fontWeight: 700, fontSize: 26, color: C.blue }}>Automatika</div>
            <div style={{ fontFamily: FONT.head, fontWeight: 800, fontSize: 50, color: C.cream, lineHeight: 1.05 }}>ActionSuite</div>
          </div>
        </div>
        <div style={{ fontFamily: FONT.head, fontWeight: 800, fontSize: z.head, lineHeight: 1.06, color: C.cream, textAlign: "center" }}>
          {COPY.ctaHeadline.map((line, i) => (
            <RevealText key={line} text={line} delay={6 + i * 14} accent={i === 1 ? ["5", "Minutes."] : []} />
          ))}
        </div>
        <div style={{ fontFamily: FONT.body, fontWeight: 500, fontSize: z.cap, color: C.muted, opacity: interpolate(frame, [20, 34], [0, 1], clamp) }}>{COPY.ctaCaption}</div>
        <div
          style={{
            fontFamily: FONT.body,
            fontWeight: 600,
            fontSize: z.pill,
            color: C.canvas,
            background: C.lime,
            borderRadius: 999,
            padding: `${z.pill * 0.5}px ${z.pill * 1.3}px`,
            whiteSpace: "nowrap",
            boxShadow: "0 0 80px rgba(213,250,0,0.35)",
            opacity: pill,
            scale: `${(0.5 + 0.5 * pill) * breathe}`,
          }}
        >
          {COPY.url}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
