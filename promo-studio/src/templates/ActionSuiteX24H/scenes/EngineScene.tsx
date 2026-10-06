import React from "react";
import { AbsoluteFill, Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CHANNELS, MATH, QUEUE_ROWS } from "../content";
import { MetricBadge } from "../MetricBadge";
import { C, clamp, FONT, T, useFrameLayout } from "../tokens";
import { Chip } from "../ui";

// Frames relative to this scene's Sequence (starts at T.outbound).
const L = {
  extreme: T.extreme - T.outbound, // single engine → 14-lane matrix
  end: T.tagpilot - T.outbound,
};
const ENGINES = 14;

const LiveDot: React.FC<{ size: number }> = ({ size }) => {
  const frame = useCurrentFrame();
  return <span style={{ display: "inline-block", width: size, height: size, borderRadius: 99, background: C.lime, boxShadow: `0 0 ${size}px ${C.lime}`, opacity: 0.6 + 0.4 * Math.sin(frame / 4) }} />;
};

/** Scene 2A: Omni Inbox dashboard with X24H Outbound (1 engine) working through the queue. */
const OutboundDashboard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u, vertical, t } = useFrameLayout();
  const pan = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 40 });
  const exit = interpolate(frame, [L.extreme - 14, L.extreme], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  // One engine is slow: the queue barely moves.
  const queue = interpolate(frame, [20, L.extreme], [MATH.contacts, MATH.contacts - 14], clamp);

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingTop: (vertical ? 120 : 90) * u }}>
      <div
        style={{
          width: (vertical ? 1000 : 1500) * u,
          background: C.cream,
          borderRadius: 28 * u,
          boxShadow: `0 ${40 * u}px ${90 * u}px rgba(0,0,0,0.5)`,
          overflow: "hidden",
          opacity: pan * (1 - exit),
          translate: `${(1 - pan) * 260 * u}px ${(1 - pan) * 60 * u}px`,
          scale: `${(0.9 + 0.1 * pan) * (1 - 0.15 * exit)}`,
          rotate: `${(1 - pan) * -3}deg`,
        }}
      >
        {/* Title bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 * u, padding: `${22 * u}px ${30 * u}px`, background: C.white, borderBottom: `${1.5 * u}px solid #E6DFD0`, flexWrap: "wrap" }}>
          <div style={{ fontFamily: FONT.head, fontWeight: 800, fontSize: 30 * u * t, color: C.canvas }}>Omni Inbox</div>
          <div style={{ fontFamily: FONT.body, fontWeight: 500, fontSize: 20 * u * t, color: "#7A7264" }}>Dormant contacts · 100,000</div>
          <div style={{ flex: 1 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 10 * u, background: C.canvas, borderRadius: 999, padding: `${8 * u}px ${18 * u}px` }}>
            <LiveDot size={12 * u} />
            <span style={{ fontFamily: FONT.mono, fontWeight: 600, fontSize: 20 * u * t, color: C.cream }}>X24H Outbound</span>
            <span style={{ fontFamily: FONT.mono, fontWeight: 500, fontSize: 18 * u * t, color: C.blue }}>(1 Engine)</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: vertical ? "column" : "row", gap: 24 * u, padding: 26 * u }}>
          {/* Outreach queue */}
          <div style={{ flex: 1.6, display: "flex", flexDirection: "column", gap: 10 * u }}>
            {QUEUE_ROWS.map((row, i) => {
              const sendAt = 26 + i * 11;
              const state = frame >= sendAt + 8 ? "sent" : frame >= sendAt ? "sending" : "queued";
              const rowIn = spring({ frame: frame - 8 - i * 3, fps, config: { damping: 200 } });
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14 * u,
                    background: C.white,
                    borderRadius: 14 * u,
                    padding: `${12 * u}px ${18 * u}px`,
                    border: `${1.5 * u}px solid ${state === "sending" ? C.olive : "#ECE6D8"}`,
                    opacity: rowIn,
                    translate: `${(1 - rowIn) * 40 * u}px 0px`,
                  }}
                >
                  <div style={{ width: 38 * u, height: 38 * u, borderRadius: 99, background: "#E9E2D2", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT.body, fontWeight: 600, fontSize: 16 * u * t, color: C.canvas }}>
                    {row.name.slice(0, 1)}
                  </div>
                  <div style={{ fontFamily: FONT.body, fontWeight: 600, fontSize: 21 * u * t, color: C.canvas, width: 130 * u * t }}>{row.name}</div>
                  <Chip size={16 * t}>{row.channel}</Chip>
                  <div style={{ fontFamily: FONT.mono, fontWeight: 500, fontSize: 16 * u * t, color: "#8C8475", flex: 1 }}>{vertical ? "" : row.tag}</div>
                  <div
                    style={{
                      fontFamily: FONT.mono,
                      fontWeight: 600,
                      fontSize: 17 * u * t,
                      color: state === "sent" ? C.canvas : state === "sending" ? C.olive : "#A39B8B",
                      background: state === "sent" ? C.lime : "transparent",
                      borderRadius: 8 * u,
                      padding: `${3 * u}px ${10 * u}px`,
                      width: 110 * u * t,
                      textAlign: "center",
                    }}
                  >
                    {state === "sent" ? "Sent ✓" : state === "sending" ? "Sending…" : "Queued"}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Queue meter */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 * u, background: C.canvas, borderRadius: 20 * u, padding: 26 * u }}>
            <div style={{ fontFamily: FONT.body, fontWeight: 600, fontSize: 18 * u * t, letterSpacing: 2 * u, color: C.blue }}>OUTREACH QUEUE</div>
            <MetricBadge value={Math.round(queue)} style={{ fontSize: 64 * u * t, color: C.cream, lineHeight: 1 }} />
            <div style={{ height: 10 * u, borderRadius: 99, background: "#3A342A", overflow: "hidden" }}>
              <div style={{ width: `${(1 - queue / MATH.contacts) * 100 + 0.8}%`, height: "100%", background: C.olive }} />
            </div>
            <div style={{ fontFamily: FONT.body, fontWeight: 500, fontSize: 20 * u * t, color: C.muted, lineHeight: 1.4 }}>
              Automated follow-ups, sent one engine at a time — no manual outreach.
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** Scene 2B: one engine lane splits into 14 parallel lanes while the queue drains 100,000 → 0. */
const EngineMatrix: React.FC = () => {
  const frame = useCurrentFrame() - L.extreme; // 0 = T.extreme; negative during the hand-over
  const { fps } = useVideoConfig();
  const { width, height, u, vertical } = useFrameLayout();

  const appear = interpolate(frame, [-2, 6], [0, 1], clamp);
  const drain = interpolate(frame, [14, L.end - L.extreme - 18], [0, 1], { ...clamp, easing: Easing.inOut(Easing.quad) });
  const queue = MATH.contacts * (1 - drain);
  // All beams breathe together — 14 engines, one rhythm.
  const beat = 0.5 + 0.5 * Math.sin(frame / 5);

  // Geometry: counters left/right in 16:9, stacked above in 9:16; lanes fill the rest.
  const lanes = vertical
    ? { x0: 150 * u, x1: width - 190 * u, y0: height * 0.36, y1: height * 0.8 }
    : { x0: 560 * u, x1: width - 600 * u, y0: 290 * u, y1: height - 80 * u };
  const midY = (lanes.y0 + lanes.y1) / 2;
  const pitch = (lanes.y1 - lanes.y0) / (ENGINES - 1);

  const counter = (label: string, value: number, tone: "cream" | "lime") => (
    <div style={{ background: C.card, border: `${1.5 * u}px solid ${C.border}`, borderRadius: 22 * u, padding: `${22 * u}px ${26 * u}px`, width: (vertical ? 470 : 340) * u, boxSizing: "border-box" }}>
      <div style={{ fontFamily: FONT.body, fontWeight: 600, fontSize: 18 * u, letterSpacing: 2 * u, color: C.blue }}>{label}</div>
      <MetricBadge value={Math.round(value)} style={{ fontSize: (vertical ? 62 : 56) * u, color: tone === "lime" ? C.lime : C.cream, lineHeight: 1.15 }} />
    </div>
  );

  return (
    <AbsoluteFill style={{ opacity: appear }}>
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <radialGradient id="x24-glow">
            <stop offset="0%" stopColor={C.lime} stopOpacity={0.9} />
            <stop offset="100%" stopColor={C.lime} stopOpacity={0} />
          </radialGradient>
        </defs>
        {Array.from({ length: ENGINES }, (_, i) => {
          // Lanes fan out from the middle — the single engine splitting into 14.
          const order = Math.abs(i - (ENGINES - 1) / 2);
          const split = spring({ frame: frame - 4 - order * 2, fps, config: { damping: 15, stiffness: 110 } });
          const y = midY + (lanes.y0 + i * pitch - midY) * split;
          return (
            <g key={i}>
              <line x1={lanes.x0} y1={y} x2={lanes.x1} y2={y} stroke={C.olive} strokeWidth={(3 + beat * 2) * u} strokeLinecap="round" opacity={0.55 + 0.35 * beat} />
              {[0, 1, 2].map((k) => {
                const speed = 1.6 + random(`lane-${i}-${k}`) * 1.2;
                const v = (frame - 10) * speed - k * 33 - random(`lane-o-${i}`) * 30;
                if (v < 0 || drain >= 1) return null;
                const x = lanes.x0 + ((v % 100) / 100) * (lanes.x1 - lanes.x0);
                return (
                  <g key={k}>
                    <rect x={x - 26 * u} y={y - 1.5 * u} width={26 * u} height={3 * u} fill={C.lime} opacity={0.35} />
                    <circle cx={x} cy={y} r={14 * u} fill="url(#x24-glow)" />
                    <circle cx={x} cy={y} r={4.5 * u} fill={C.lime} />
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>

      {/* Lane labels (engine id left, channel right) */}
      {Array.from({ length: ENGINES }, (_, i) => {
        const order = Math.abs(i - (ENGINES - 1) / 2);
        const split = spring({ frame: frame - 4 - order * 2, fps, config: { damping: 15, stiffness: 110 } });
        const y = midY + (lanes.y0 + i * pitch - midY) * split;
        const show = interpolate(split, [0.6, 1], [0, 1], clamp);
        return (
          <React.Fragment key={i}>
            <div style={{ position: "absolute", right: width - lanes.x0 + 12 * u, top: y, translate: "0px -50%", opacity: show }}>
              <Chip tone="dark" size={vertical ? 18 : 16}>
                ENG {String(i + 1).padStart(2, "0")}
              </Chip>
            </div>
            <div style={{ position: "absolute", left: lanes.x1 + 12 * u, top: y, translate: "0px -50%", opacity: show }}>
              <Chip size={vertical ? 18 : 16}>{CHANNELS[i % CHANNELS.length]}</Chip>
            </div>
          </React.Fragment>
        );
      })}

      {/* Engine badge + counters */}
      {vertical ? (
        <div style={{ position: "absolute", top: height * 0.235, left: 40 * u, right: 40 * u, display: "flex", justifyContent: "space-between" }}>
          {counter("QUEUE", queue, "cream")}
          {counter("DISPATCHED", MATH.contacts - queue, "lime")}
        </div>
      ) : (
        <>
          <div style={{ position: "absolute", left: 70 * u, top: midY, translate: "0px -50%" }}>{counter("QUEUE", queue, "cream")}</div>
          <div style={{ position: "absolute", right: 70 * u, top: midY, translate: "0px -50%" }}>{counter("DISPATCHED", MATH.contacts - queue, "lime")}</div>
        </>
      )}
      <div style={{ position: "absolute", left: 0, right: 0, top: vertical ? height * 0.82 : 205 * u, display: "flex", justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 * u, background: C.lime, borderRadius: 999, padding: `${10 * u}px ${22 * u}px`, scale: `${spring({ frame: frame - 6, fps, config: { damping: 12 } })}` }}>
          <span style={{ fontFamily: FONT.mono, fontWeight: 600, fontSize: 24 * u, color: C.canvas }}>X24H Extreme</span>
          <span style={{ fontFamily: FONT.mono, fontWeight: 500, fontSize: 22 * u, color: C.canvas }}>· 14 Engines</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** Scenes 2A + 2B (frames 255–570). The dashboard hands over to the matrix around T.extreme. */
export const EngineScene: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      {frame < L.extreme && <OutboundDashboard />}
      {frame >= L.extreme - 2 && <EngineMatrix />}
    </AbsoluteFill>
  );
};
