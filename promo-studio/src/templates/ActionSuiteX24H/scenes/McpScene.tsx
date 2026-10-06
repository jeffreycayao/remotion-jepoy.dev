import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { MCP } from "../content";
import { C, clamp, FONT, useFrameLayout } from "../tokens";

const DEPLOY_AT = 42; // second line starts
const LIVE_AT = 70; // "Live (1.2s)"

/** Typewriter: reveals `text` from frame `start` at `cps` characters per frame. */
const typed = (text: string, frame: number, start: number, cps = 1.4) => text.slice(0, Math.max(0, Math.floor((frame - start) * cps)));

/** Scene 3B (675–795): MCP Library terminal deploys a Webcake page; ad sliders self-optimise. */
export const McpScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u, vertical, t } = useFrameLayout();
  const enter = (d: number) => spring({ frame: frame - d, fps, config: { damping: 200 }, durationInFrames: 25 });
  const cursor = Math.floor(frame / 8) % 2 === 0;
  const spinner = "⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏"[Math.floor(frame / 2) % 10];
  const live = spring({ frame: frame - LIVE_AT, fps, config: { damping: 9, stiffness: 180 } });
  const line = { fontFamily: FONT.mono, fontWeight: 500, fontSize: (vertical ? 30 : 25) * u, lineHeight: 1.7, color: C.cream, whiteSpace: "pre-wrap" as const };

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingTop: (vertical ? 80 : 80) * u }}>
      <div style={{ display: "flex", flexDirection: vertical ? "column" : "row", gap: 28 * u, alignItems: "stretch", width: (vertical ? 980 : 1640) * u }}>
        {/* Terminal */}
        <div
          style={{
            flex: 1.25,
            background: C.panel,
            border: `${1.5 * u}px solid ${C.border}`,
            borderRadius: 24 * u,
            overflow: "hidden",
            boxShadow: `0 ${30 * u}px ${80 * u}px rgba(0,0,0,0.5)`,
            opacity: enter(0),
            translate: `${(1 - enter(0)) * -60 * u}px 0px`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 * u, padding: `${16 * u}px ${22 * u}px`, borderBottom: `${1.5 * u}px solid ${C.border}` }}>
            {[C.border, C.border, C.olive].map((c, i) => (
              <span key={i} style={{ width: 14 * u, height: 14 * u, borderRadius: 99, background: c }} />
            ))}
            <span style={{ fontFamily: FONT.mono, fontWeight: 500, fontSize: 18 * u * t, color: C.blue, marginLeft: 12 * u }}>MCP Library</span>
          </div>
          <div style={{ padding: `${24 * u}px ${28 * u}px`, minHeight: (vertical ? 380 : 330) * u }}>
            <div style={line}>
              <span style={{ color: C.lime }}>&gt; </span>
              {typed(MCP.command, frame, 8)}
              {frame < DEPLOY_AT && cursor ? "▍" : ""}
            </div>
            {frame >= DEPLOY_AT && (
              <div style={line}>
                <span style={{ color: C.lime }}>&gt; </span>
                {typed(MCP.deploy, frame, DEPLOY_AT, 1.2)}
                {frame >= DEPLOY_AT + 20 && frame < LIVE_AT && <span style={{ color: C.blue }}> {spinner}</span>}
                {frame >= LIVE_AT && (
                  <span style={{ display: "inline-block", color: C.canvas, background: C.lime, borderRadius: 8 * u, padding: `0 ${10 * u}px`, marginLeft: 12 * u, scale: `${0.5 + 0.5 * live}`, fontWeight: 600 }}>
                    {MCP.result}
                  </span>
                )}
              </div>
            )}
            {frame >= LIVE_AT + 10 && (
              <div style={{ ...line, color: C.blue, opacity: interpolate(frame, [LIVE_AT + 10, LIVE_AT + 18], [0, 1], clamp) }}>
                ✓ webcake page published · ad workflow optimised
              </div>
            )}
          </div>
        </div>

        {/* Ad optimisation sliders */}
        <div
          style={{
            flex: 1,
            background: C.cream,
            borderRadius: 24 * u,
            padding: `${26 * u}px ${30 * u}px`,
            display: "flex",
            flexDirection: "column",
            gap: (vertical ? 40 : 22) * u,
            justifyContent: "center",
            opacity: enter(10),
            translate: `${(1 - enter(10)) * 60 * u}px 0px`,
          }}
        >
          <div style={{ fontFamily: FONT.body, fontWeight: 600, fontSize: 18 * u * t, letterSpacing: 2 * u, color: C.olive }}>AD OPTIMISATION</div>
          {MCP.sliders.map((s, i) => {
            const v = interpolate(frame, [30 + i * 8, 95 + i * 6], [s.from, s.to], { ...clamp, easing: Easing.inOut(Easing.cubic) });
            return (
              <div key={s.label}>
                <div style={{ display: "flex", justifyContent: "space-between", fontFamily: FONT.body, fontWeight: 600, fontSize: 22 * u * t, color: C.canvas, marginBottom: 10 * u }}>
                  <span>{s.label}</span>
                  <span style={{ fontFamily: FONT.mono }}>{Math.round(v * 100)}%</span>
                </div>
                <div style={{ position: "relative", height: 10 * u * t, borderRadius: 99, background: "#E3DCCB" }}>
                  <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${v * 100}%`, borderRadius: 99, background: C.olive }} />
                  <div
                    style={{
                      position: "absolute",
                      left: `${v * 100}%`,
                      top: "50%",
                      width: 26 * u * t,
                      height: 26 * u * t,
                      borderRadius: 99,
                      background: C.canvas,
                      border: `${4 * u}px solid ${C.lime}`,
                      translate: "-50% -50%",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
