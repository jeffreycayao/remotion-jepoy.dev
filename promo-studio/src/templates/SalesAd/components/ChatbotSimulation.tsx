import React from "react";
import { AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CHAT, COPY } from "../content";
import { C, clamp, FONT } from "../tokens";
import { Backdrop, Chip, SceneHeadline, Shimmer, usePick } from "../ui";
import { Logo } from "./Logos";

// Frames within Scene 1 (118 long). 0.2 s = 6 frames, so the bot's latency is shown in real time.
export const ASK = 8; // "Available pa po?"
export const TYPING = 18; // typing indicator + latency timer start
export const REPLY = 24; // bot replies (6 frames = 0.2 s later)
export const YES = 62; // customer commits
export const CLOSED = 88; // [STATUS: CLIENT CLOSED] — lands on "Tara na!"

type Box = { x: number; y: number; w: number; h: number };

const Bubble: React.FC<{ side: "in" | "out"; at: number; fs: number; children: React.ReactNode }> = ({ side, at, fs, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - at, fps, config: { damping: 15, stiffness: 200 } });
  const customer = side === "in";
  if (frame < at) return null;
  return (
    <div
      style={{
        alignSelf: customer ? "flex-start" : "flex-end",
        maxWidth: "82%",
        background: customer ? "#EEF1F6" : C.ink,
        color: customer ? C.ink : C.cream,
        fontFamily: FONT.body,
        fontWeight: 500,
        fontSize: fs,
        lineHeight: 1.35,
        padding: `${fs * 0.5}px ${fs * 0.75}px`,
        borderRadius: customer ? `${fs}px ${fs}px ${fs}px 6px` : `${fs}px ${fs}px 6px ${fs}px`,
        opacity: p,
        scale: `${0.8 + 0.2 * p}`,
        transformOrigin: customer ? "0% 100%" : "100% 100%",
      }}
    >
      {children}
    </div>
  );
};

/** Scene 1 (0–180): customer asks, the bot answers in 0.2 s, the lead moves New → Engaged → Closed. */
export const ChatbotSimulation: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pick = usePick();

  const L = pick<{ chat: Box; panel: Box; fs: number; row: boolean }>({
    wide: { chat: { x: 200, y: 230, w: 780, h: 640 }, panel: { x: 1060, y: 280, w: 680, h: 560 }, fs: 32, row: false },
    square: { chat: { x: 60, y: 140, w: 960, h: 500 }, panel: { x: 60, y: 680, w: 960, h: 330 }, fs: 30, row: true },
    portrait: { chat: { x: 60, y: 200, w: 960, h: 600 }, panel: { x: 60, y: 850, w: 960, h: 380 }, fs: 32, row: true },
    vertical: { chat: { x: 60, y: 360, w: 960, h: 760 }, panel: { x: 60, y: 1170, w: 960, h: 420 }, fs: 38, row: true },
  });

  const chatIn = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 14 });
  const typing = frame >= TYPING && frame < REPLY;
  const ms = interpolate(frame, [TYPING, REPLY], [0, 0.2], clamp);
  const stage = frame >= CLOSED ? 2 : frame >= REPLY ? 1 : 0;
  const closedP = spring({ frame: frame - CLOSED, fps, config: { damping: 9, stiffness: 160 } });
  const glow = frame >= CLOSED ? 0.5 + 0.25 * Math.sin((frame - CLOSED) / 6) : 0;

  return (
    <AbsoluteFill>
      <Backdrop tone="dark" />
      <SceneHeadline text={COPY.hookHeadline} accent={["closes."]} delay={0} stagger={2} />

      {/* Chat window */}
      <div
        style={{
          position: "absolute",
          left: L.chat.x,
          top: L.chat.y,
          width: L.chat.w,
          height: L.chat.h,
          background: C.white,
          borderRadius: 32,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 40px 90px rgba(0,0,0,0.5)",
          opacity: chatIn,
          scale: `${0.94 + 0.06 * chatIn}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "20px 26px", borderBottom: `2px solid ${C.line}` }}>
          <div style={{ width: L.fs * 1.7, height: L.fs * 1.7, borderRadius: 99, background: C.cream, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Logo name="pancake" h={L.fs * 1.05} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: FONT.body, fontWeight: 600, fontSize: L.fs * 0.85, color: C.ink }}>{CHAT.shop}</div>
            <div style={{ fontFamily: FONT.body, fontWeight: 500, fontSize: L.fs * 0.55, color: C.inkMuted }}>Botcake AI · replies instantly</div>
          </div>
          <Chip size={L.fs * 0.55}>[24/7 Active]</Chip>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-start", gap: L.fs * 0.55, padding: `${L.fs * 0.8}px ${L.fs * 0.9}px`, background: "#FBFAF7" }}>
          <Bubble side="in" at={ASK} fs={L.fs}>
            {CHAT.ask}
          </Bubble>
          {typing && (
            <div style={{ alignSelf: "flex-end", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontFamily: FONT.mono, fontWeight: 600, fontSize: L.fs * 0.6, color: C.olive }}>{ms.toFixed(2)}s</span>
              <div style={{ display: "flex", gap: 6, background: C.ink, borderRadius: 99, padding: "12px 16px" }}>
                {[0, 1, 2].map((i) => (
                  <span key={i} style={{ width: 9, height: 9, borderRadius: 99, background: C.lime, opacity: 0.4 + 0.6 * Math.abs(Math.sin((frame + i * 2) / 2)) }} />
                ))}
              </div>
            </div>
          )}
          <Bubble side="out" at={REPLY} fs={L.fs}>
            {CHAT.reply}
          </Bubble>
          {frame >= REPLY + 6 && (
            <div style={{ alignSelf: "flex-end", display: "flex", gap: 8, opacity: interpolate(frame, [REPLY + 6, REPLY + 12], [0, 1], clamp) }}>
              <Chip tone="lime" size={L.fs * 0.55}>
                ⚡ Replied in {CHAT.latency}
              </Chip>
              {frame >= CLOSED && <Chip size={L.fs * 0.55}>[Auto-Closed]</Chip>}
            </div>
          )}
          <Bubble side="in" at={YES} fs={L.fs}>
            {CHAT.yes}
          </Bubble>
        </div>
      </div>

      {/* Lead status: New → Engaged → Closed */}
      <div
        style={{
          position: "absolute",
          left: L.panel.x,
          top: L.panel.y,
          width: L.panel.w,
          height: L.panel.h,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: L.row ? "center" : "flex-start",
          gap: L.row ? 30 : 46,
          opacity: interpolate(frame, [6, 18], [0, 1], clamp),
        }}
      >
        <div style={{ display: "flex", flexDirection: L.row ? "row" : "column", alignItems: L.row ? "center" : "flex-start" }}>
          {CHAT.stages.map((s, i) => {
            const on = stage >= i;
            const current = stage === i;
            return (
              <div key={s} style={{ display: "flex", alignItems: "center" }}>
                {i > 0 && L.row && <div style={{ width: 70, height: 4, background: on ? C.lime : C.border }} />}
                <div style={{ display: "flex", alignItems: "center", gap: 14, padding: L.row ? "0 14px" : "14px 0" }}>
                  <span style={{ width: 26, height: 26, borderRadius: 99, background: on ? C.lime : C.border, boxShadow: current ? `0 0 24px ${C.lime}` : undefined }} />
                  <span style={{ fontFamily: FONT.body, fontWeight: 600, fontSize: L.fs * (L.row ? 0.75 : 0.95), color: on ? C.cream : C.muted }}>{s}</span>
                </div>
              </div>
            );
          })}
        </div>
        {/* The money shot */}
        <div style={{ position: "relative", opacity: closedP, scale: `${0.5 + 0.5 * closedP}`, transformOrigin: L.row ? "50% 50%" : "0% 50%" }}>
          <div
            style={{
              position: "relative",
              overflow: "hidden",
              fontFamily: FONT.mono,
              fontWeight: 700,
              fontSize: L.fs * 1.15,
              color: C.ink,
              background: C.lime,
              borderRadius: 18,
              padding: `${L.fs * 0.55}px ${L.fs * 0.9}px`,
              boxShadow: `0 0 ${70 * glow}px rgba(213,250,0,${glow})`,
              whiteSpace: "nowrap",
            }}
          >
            [{CHAT.closed}]
            <Shimmer start={CLOSED + 10} every={60} duration={22} strength={0.8} />
          </div>
          {frame >= CLOSED &&
            Array.from({ length: 12 }, (_, i) => {
              const t = interpolate(frame, [CLOSED, CLOSED + 26], [0, 1], clamp);
              const a = (i / 12) * Math.PI * 2 + random(`cs-${i}`) * 0.5;
              const d = 40 + t * (120 + random(`cd-${i}`) * 80);
              return <span key={i} style={{ position: "absolute", left: "50%", top: "50%", width: 10, height: 10, borderRadius: 99, translate: `${Math.cos(a) * d - 5}px ${Math.sin(a) * d - 5}px`, background: i % 3 ? C.lime : C.blue, opacity: 1 - t }} />;
            })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
