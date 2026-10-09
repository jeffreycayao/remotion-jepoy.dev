import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { CATEGORIES, COPY, LOGO, QA } from "../content";
import { MetricBadge } from "../MetricBadge";
import { C, clamp, FONT, useFrameLayout } from "../tokens";
import { BotcakeLogo, Chip, SceneHeadline, Stage, typed, useFillHeight, useHeadlineSpace } from "../ui";

// Frames within the scene (Scene 2 is 360 frames long).
export const PANEL_IN = 10;
export const RUN_START = 38;
export const RUN_END = 322;
export const STEP = 30; // one prompt → reply cycle in the chat
const FS = 24;

const two = (n: number) => String(Math.floor(n)).padStart(2, "0");

/** The Botcake chat being driven by the runner: prompt typed into the input, reply with latency tag. */
const ChatFeed: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame - RUN_START;
  const current = Math.max(0, Math.floor(t / STEP));
  const local = t - current * STEP;
  const running = frame >= RUN_START && frame < RUN_END;

  // Last three finished cycles + the one in flight.
  const bubbles: React.ReactNode[] = [];
  for (let k = Math.max(0, current - 4); k <= current; k++) {
    if (t < 0) break;
    const run = QA.runs[k % QA.runs.length];
    const sentAt = RUN_START + k * STEP + 9;
    const replyAt = sentAt + 8;
    if (frame >= sentAt) {
      const p = spring({ frame: frame - sentAt, fps, config: { damping: 16, stiffness: 200 } });
      bubbles.push(
        <div key={`p${k}`} style={{ alignSelf: "flex-end", maxWidth: "82%", background: C.blue, color: C.ink, fontFamily: FONT.body, fontWeight: 500, fontSize: FS, lineHeight: 1.35, padding: "12px 18px", borderRadius: "20px 20px 6px 20px", opacity: p, translate: `0px ${(1 - p) * 20}px` }}>
          {run.prompt}
        </div>,
      );
    }
    if (frame >= replyAt) {
      const p = spring({ frame: frame - replyAt, fps, config: { damping: 16, stiffness: 200 } });
      bubbles.push(
        <div key={`r${k}`} style={{ alignSelf: "flex-start", maxWidth: "86%", display: "flex", flexDirection: "column", gap: 6, opacity: p, translate: `0px ${(1 - p) * 20}px` }}>
          <div style={{ background: C.white, color: C.ink, fontFamily: FONT.body, fontWeight: 500, fontSize: FS, lineHeight: 1.35, padding: "12px 18px", borderRadius: "20px 20px 20px 6px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>{run.reply}</div>
          <div style={{ display: "flex", gap: 8 }}>
            <Chip tone="lime" size={16}>
              {run.ms}ms
            </Chip>
            <Chip size={16}>{run.cat}</Chip>
          </div>
        </div>,
      );
    }
  }

  const draft = running && local < 9 ? typed(QA.runs[current % QA.runs.length].prompt, local, 0, 5) : "";

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#F1ECE0", minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 22px", background: C.white, borderBottom: `2px solid ${C.line}` }}>
        <BotcakeLogo h={30} />
        <div style={{ fontFamily: FONT.body, fontWeight: 600, fontSize: 22, color: C.ink }}>AI · Test chat</div>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 14, padding: "18px 22px", overflow: "hidden" }}>{bubbles}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", background: C.white, borderTop: `2px solid ${C.line}` }}>
        <div style={{ flex: 1, fontFamily: FONT.mono, fontWeight: 500, fontSize: 20, color: draft ? C.ink : "#A39B8B", background: "#F6F3EC", borderRadius: 999, padding: "12px 20px", whiteSpace: "nowrap", overflow: "hidden" }}>
          {draft ? `${draft}▍` : "Type a message…"}
        </div>
        <div style={{ width: 46, height: 46, borderRadius: 99, background: draft ? C.lime : C.line, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: C.ink }}>➤</div>
      </div>
    </div>
  );
};

/** Chrome Side Panel: ActionSuite QA Runner. */
const SidePanel: React.FC<{ w: number }> = ({ w }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const open = spring({ frame: frame - PANEL_IN, fps, config: { damping: 18, stiffness: 120 } });
  const progress = interpolate(frame, [RUN_START, RUN_END], [0, 1], { ...clamp, easing: Easing.bezier(0.3, 0, 0.6, 1) });
  const done = progress >= 1;
  const tests = Math.round(progress * QA.total);
  const secs = progress * 240; // the 4-minute run, compressed
  const cat = CATEGORIES[Math.floor(frame / 4) % CATEGORIES.length];
  const donePop = spring({ frame: frame - RUN_END, fps, config: { damping: 10 } });

  const label = (text: string) => <div style={{ fontFamily: FONT.body, fontWeight: 600, fontSize: 16, letterSpacing: 2, color: C.inkMuted }}>{text}</div>;

  return (
    <div
      style={{
        width: w * open,
        overflow: "hidden",
        borderLeft: `2px solid ${C.line}`,
        background: C.white,
        flexShrink: 0,
      }}
    >
      <div style={{ width: w, padding: "22px 26px", display: "flex", flexDirection: "column", gap: 22, boxSizing: "border-box" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Img src={staticFile(LOGO)} style={{ width: 42, height: 42, borderRadius: 10 }} />
          <div style={{ fontFamily: FONT.head, fontWeight: 800, fontSize: 24, color: C.ink, lineHeight: 1.1 }}>QA Runner</div>
          <div style={{ flex: 1 }} />
          <span style={{ scale: done ? `${0.7 + 0.3 * donePop}` : "1", display: "inline-block" }}>
            <Chip tone={done ? "lime" : "dark"} size={16}>
              {done ? "✓ Complete" : frame >= RUN_START ? "● Running" : "Ready"}
            </Chip>
          </span>
        </div>

        <div>
          {label("STRESS TESTS")}
          <div style={{ fontFamily: FONT.mono, fontWeight: 600, fontSize: 64, color: C.ink, lineHeight: 1.1 }}>
            <MetricBadge value={tests} />
            <span style={{ color: C.inkMuted, fontSize: 34 }}> / {QA.total}</span>
          </div>
          <div style={{ height: 14, borderRadius: 99, background: "#ECE6D8", overflow: "hidden", marginTop: 12 }}>
            <div style={{ width: `${progress * 100}%`, height: "100%", background: `linear-gradient(90deg, ${C.olive}, ${C.lime})` }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontFamily: FONT.mono, fontWeight: 500, fontSize: 18, color: C.inkMuted }}>
            <span>{done ? "All categories" : `#${String(Math.max(1, tests)).padStart(3, "0")} · ${cat}`}</span>
            <span style={{ color: C.ink, fontWeight: 600 }}>{Math.round(progress * 100)}%</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, background: C.canvas, borderRadius: 18, padding: "18px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span style={{ fontFamily: FONT.body, fontWeight: 500, fontSize: 20, color: C.muted }}>Manual QA</span>
            <span style={{ fontFamily: FONT.mono, fontWeight: 600, fontSize: 26, color: C.muted, textDecoration: "line-through", textDecorationColor: C.lime }}>{QA.manual}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span style={{ fontFamily: FONT.body, fontWeight: 600, fontSize: 20, color: C.cream }}>ActionSuite run</span>
            <span style={{ fontFamily: FONT.mono, fontWeight: 600, fontSize: 34, color: C.lime }}>
              {two(secs / 60)}:{two(secs % 60)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

/** Scene 2 (164–524): Chrome Side Panel opens on Botcake and auto-types the 303 test prompts. */
export const Scene2SidePanelQA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { mode } = useFrameLayout();
  const top = useHeadlineSpace();
  const wide = mode === "wide";
  const W = wide ? 1600 : 1000;
  const tallH = useFillHeight(1000, top, 820, 1300);
  const H = wide ? 740 : tallH;
  const win = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 22 });

  return (
    <AbsoluteFill>
      <SceneHeadline text={COPY.s2Headline} accent={["4", "minutes."]} />
      <Stage w={W} h={H} top={top}>
        <div
          style={{
            width: W,
            height: H,
            borderRadius: 26,
            overflow: "hidden",
            background: C.white,
            boxShadow: "0 40px 90px rgba(0,0,0,0.5)",
            display: "flex",
            flexDirection: "column",
            opacity: win,
            scale: `${0.94 + 0.06 * win}`,
          }}
        >
          {/* Browser chrome */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 20px", background: "#E9E4D8" }}>
            {["#CFC7B6", "#CFC7B6", "#CFC7B6"].map((c, i) => (
              <span key={i} style={{ width: 16, height: 16, borderRadius: 99, background: c }} />
            ))}
            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, background: C.white, borderRadius: 999, padding: "8px 18px", fontFamily: FONT.body, fontWeight: 500, fontSize: 20, color: C.inkMuted }}>
              🔒 <BotcakeLogo h={20} iconOnly /> Botcake — AI chatbot settings
            </div>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: frame >= PANEL_IN ? C.lime : C.white, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🧩</div>
          </div>
          <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
            <ChatFeed />
            <SidePanel w={wide ? 560 : 440} />
          </div>
        </div>
      </Stage>
    </AbsoluteFill>
  );
};
