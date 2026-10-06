import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { TAGPILOT } from "../content";
import { C, clamp, FONT, useFrameLayout } from "../tokens";
import { Chip } from "../ui";

const FIX_AT = 44; // frame (in this scene) where the broken badge collapses

/** Scene 3A (570–675): a conflicting red tag badge morphs into two valid blue chips. */
export const TagPilotScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u, vertical, t } = useFrameLayout();

  const cardIn = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 25 });
  const collapse = interpolate(frame, [FIX_AT, FIX_AT + 10], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const shake = frame < FIX_AT ? Math.sin(frame * 2.4) * interpolate(frame, [10, FIX_AT], [2, 7], clamp) * u : 0;
  const fixed = frame >= FIX_AT + 6;
  const scan = interpolate(frame, [FIX_AT - 14, FIX_AT + 4], [0, 1], clamp);

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingTop: (vertical ? 60 : 70) * u }}>
      <div
        style={{
          width: (vertical ? 960 : 1180) * u,
          background: C.white,
          borderRadius: 28 * u,
          padding: `${34 * u}px ${40 * u}px`,
          boxShadow: `0 ${40 * u}px ${90 * u}px rgba(0,0,0,0.5)`,
          opacity: cardIn,
          translate: `0px ${(1 - cardIn) * 50 * u}px`,
          display: "flex",
          flexDirection: "column",
          gap: (vertical ? 36 : 26) * u,
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 * u }}>
          <div style={{ fontFamily: FONT.head, fontWeight: 800, fontSize: 40 * u * t, color: C.canvas }}>TagPilot™</div>
          <div style={{ flex: 1 }} />
          <span
            style={{
              fontFamily: FONT.mono,
              fontWeight: 600,
              fontSize: 20 * u * t,
              borderRadius: 999,
              padding: `${6 * u}px ${16 * u}px`,
              color: fixed ? C.canvas : C.white,
              background: fixed ? C.lime : C.error,
            }}
          >
            {fixed ? "● Synced" : "● Broken"}
          </span>
        </div>

        <div style={{ fontFamily: FONT.body, fontWeight: 500, fontSize: 24 * u * t, color: "#6E6658" }}>
          Rule: <span style={{ fontFamily: FONT.mono, color: C.canvas }}>reactivated_lead → apply tags</span>
        </div>

        {/* Tag well — a scan line sweeps across just before the fix */}
        <div
          style={{
            position: "relative",
            minHeight: (vertical ? 260 : 110) * u,
            borderRadius: 18 * u,
            background: "#F4F0E6",
            border: `${2 * u}px dashed ${fixed ? C.olive : C.error}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 18 * u,
            flexWrap: "wrap",
            flexDirection: vertical ? "column" : "row",
            padding: 20 * u,
            overflow: "hidden",
          }}
        >
          <div style={{ position: "absolute", top: 0, bottom: 0, left: `${scan * 100}%`, width: 4 * u, background: C.lime, opacity: scan > 0 && scan < 1 ? 1 : 0, boxShadow: `0 0 ${20 * u}px ${C.lime}` }} />
          {!fixed && (
            <span
              style={{
                fontFamily: FONT.mono,
                fontWeight: 600,
                fontSize: 26 * u * t,
                color: C.white,
                background: C.error,
                borderRadius: 12 * u,
                padding: `${12 * u}px ${22 * u}px`,
                translate: `${shake}px 0px`,
                scale: `${1 - collapse} ${1 - collapse * 0.4}`,
                opacity: 1 - collapse,
              }}
            >
              {TAGPILOT.broken}
            </span>
          )}
          {fixed &&
            TAGPILOT.fixed.map((tag, i) => {
              const pop = spring({ frame: frame - FIX_AT - 6 - i * 7, fps, config: { damping: 10, stiffness: 170 } });
              return (
                <span key={tag} style={{ display: "inline-block", opacity: pop, scale: `${0.3 + 0.7 * pop}` }}>
                  <Chip size={28 * t} style={{ padding: `${12 * u}px ${22 * u}px`, borderRadius: 12 * u, border: `${2 * u}px solid #9FB4DB` }}>
                    ✓ [{tag}]
                  </Chip>
                </span>
              );
            })}
        </div>

        <div style={{ fontFamily: FONT.body, fontWeight: 500, fontSize: 22 * u * t, color: "#6E6658" }}>
          Works inside your Omni / Pancake inbox — no more tag loops or missed automations.
        </div>
      </div>
    </AbsoluteFill>
  );
};
