import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ActionSuiteLayout, centre, GEO } from "../components/ActionSuiteLayout";
import { COPY } from "../content";
import { RevealText } from "../RevealText";
import { C, clamp, FONT, H, W } from "../tokens";

import { Chip, ClickRipple, Cursor, useFormat } from "../ui";
import { cameraFor, demoState } from "./Scene3Demo";

// Frames within the scene (183 long), from the recorded voiceover:
//   0 "Walang hulaan."        → 1–2 HOURS slashed, 5 MINUTES pops
//   44 "Kumpleto sa rules,"   → checklist ticks
//   80 "behavior, at one-click validation sa ChatGPT." → Validate button lights up
export const SLASH = 10;
export const FIVE_MIN = 26;
export const CHECKS_AT = 44;
export const VALIDATE_CLICK = 128;

const CHECKS = ["Role & tone", "Rules", "Behavior", "Formatting", "One-click validation"];

/** Scene 4 (884–1067): "1–2 HOURS" slashed → "5 MINUTES"; Validate on ChatGPT lights up. */
export const Scene4Speed: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 16:9: the app fills the frame, camera parked so the left third is free for the comparison.
  // Other formats: comparison on top, app in a viewport below parked on the Validate button.
  const { mode, lw, lh, vertical, safeTop, safeBottom } = useFormat();
  const wide = mode === "wide";
  const z = wide
    ? { head: 54, hours: 64, five: 104, chip: 22, row: false }
    : vertical
      ? { head: 62, hours: 60, five: 112, chip: 24, row: false }
      : mode === "tall"
        ? { head: 52, hours: 52, five: 92, chip: 21, row: false }
        : { head: 44, hours: 42, five: 68, chip: 18, row: true };
  const vpY = vertical ? 900 : mode === "tall" ? 700 : 560;
  const vp = wide ? { x: 0, y: 0, w: W, h: H } : { x: vertical ? 0 : 40, y: vpY, w: vertical ? lw : lw - 80, h: lh - vpY - (vertical ? safeBottom - 40 : safeBottom) };
  const narrowS = 1.42;
  const cam = wide ? cameraFor(1.16, 1300, 580, W, H) : cameraFor(narrowS, 1520, 1045 - vp.h / (2 * narrowS), vp.w, vp.h) // bottom of the view sits on the Validate row;
  const v = centre(GEO.validate);
  const cursor = { x: interpolate(frame, [92, VALIDATE_CLICK - 4], [v.x - 300, v.x], { ...clamp, easing: Easing.inOut(Easing.quad) }), y: interpolate(frame, [92, VALIDATE_CLICK - 4], [v.y - 260, v.y], { ...clamp, easing: Easing.inOut(Easing.quad) }) };
  const press = interpolate(frame, [VALIDATE_CLICK, VALIDATE_CLICK + 3, VALIDATE_CLICK + 9], [0, 1, 0], clamp);
  const state = {
    ...demoState(420, fps), // Scene 3's final state
    generated: 999,
    validate: interpolate(frame, [VALIDATE_CLICK, VALIDATE_CLICK + 8], [0, 1], clamp),
    validateRipple: frame >= VALIDATE_CLICK ? frame - VALIDATE_CLICK : -1,
  };

  const slash = interpolate(frame, [SLASH, SLASH + 12], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const five = spring({ frame: frame - FIVE_MIN, fps, config: { damping: 9, stiffness: 160 } });
  const pulse = frame >= FIVE_MIN ? 1 + 0.04 * Math.sin((frame - FIVE_MIN) / 5) : 1;
  const cardIn = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 18 });

  const hoursW = z.hours * 5.6 + 70;

  return (
    <AbsoluteFill style={{ overflow: "hidden", background: C.canvas }}>
      <div style={{ position: "absolute", left: vp.x, top: vp.y, width: vp.w, height: vp.h, overflow: "hidden", borderRadius: wide ? 0 : 28, boxShadow: wide ? undefined : "0 30px 80px rgba(0,0,0,0.5)" }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: W, height: H, transformOrigin: "0 0", scale: `${cam.s}`, translate: `${cam.tx}px ${cam.ty}px` }}>
          <ActionSuiteLayout state={state} />
          <ClickRipple x={v.x} y={v.y} t={frame - VALIDATE_CLICK} />
          <Cursor x={cursor.x} y={cursor.y} press={press} opacity={interpolate(frame, [86, 94, 166, 178], [0, 1, 1, 0], clamp)} />
        </div>
      </div>
      {/* 16:9 only: shade the left of the frame so the comparison sits on calm ground */}
      {wide && <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(39,35,27,0.97) 0%, rgba(39,35,27,0.97) 40%, rgba(39,35,27,0) 47%)", opacity: cardIn }} />}

      <div
        style={{
          position: "absolute",
          left: wide ? 90 : 60,
          top: wide ? 110 : safeTop + (mode === "square" ? 0 : 10),
          width: wide ? 700 : lw - 120,
          display: "flex",
          flexDirection: "column",
          alignItems: wide ? "flex-start" : "center",
          gap: mode === "square" ? 22 : 34,
          opacity: cardIn,
        }}
      >
        <RevealText text={COPY.speedHeadline} delay={2} accent={["guesswork."]} style={{ fontFamily: FONT.head, fontWeight: 800, fontSize: z.head, lineHeight: 1.08, color: C.cream, textAlign: wide ? "left" : "center" }} />

        <div style={{ display: "flex", flexDirection: z.row ? "row" : "column", alignItems: wide ? "flex-start" : "center", gap: z.row ? 26 : 34 }}>
          <div style={{ position: "relative" }}>
            <div style={{ fontFamily: FONT.mono, fontWeight: 600, fontSize: z.hours, color: slash > 0.5 ? C.muted : C.cream, border: `3px solid ${C.border}`, borderRadius: 18, padding: `${z.hours * 0.15}px ${z.hours * 0.44}px`, whiteSpace: "nowrap" }}>1–2 HOURS</div>
            <svg width={hoursW} height={z.hours * 1.9} style={{ position: "absolute", left: -20, top: -z.hours * 0.16, overflow: "visible" }}>
              <line x1={0} y1={z.hours * 1.56} x2={(hoursW - 20) * slash} y2={z.hours * 1.56 - z.hours * 1.25 * slash} stroke={C.olive} strokeWidth={z.hours * 0.19} strokeLinecap="round" />
            </svg>
          </div>

          <div style={{ opacity: five, scale: `${(0.5 + 0.5 * five) * pulse}`, transformOrigin: wide ? "0% 50%" : "50% 50%", fontFamily: FONT.mono, fontWeight: 600, fontSize: z.five, lineHeight: 1, color: C.ink, background: C.lime, borderRadius: z.five * 0.23, padding: `${z.five * 0.17}px ${z.five * 0.33}px`, boxShadow: `0 0 ${70 * five}px rgba(213,250,0,0.45)`, whiteSpace: "nowrap" }}>
            5 MINUTES
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: wide ? "flex-start" : "center", gap: 12, marginTop: 6 }}>
          {CHECKS.map((c, i) => {
            const p = spring({ frame: frame - CHECKS_AT - i * 12, fps, config: { damping: 12 } });
            return (
              <span key={c} style={{ display: "inline-block", opacity: p, scale: `${0.6 + 0.4 * p}` }}>
                <Chip tone={i === CHECKS.length - 1 ? "lime" : "blue"} size={z.chip} style={{ padding: `${z.chip * 0.36}px ${z.chip * 0.72}px` }}>
                  ✓ {c}
                </Chip>
              </span>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
