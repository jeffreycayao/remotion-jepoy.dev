import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COPY, MESSY_DOC } from "../content";
import { RevealText } from "../RevealText";
import { C, clamp, FONT } from "../tokens";
import { Backdrop, useFormat } from "../ui";

// Frames within the scene (194 long).
export const STRIKE_START = 14;
export const STRIKE_STEP = 15; // one doc line gets savaged every half second
const TIMER = [8, 184] as const;

type Token = { kind: "text" | "strike" | "insert" | "note"; text: string };

/** `~struck~`, `+inserted+`, `!margin note` → tokens. */
const parse = (line: string): Token[] => {
  const out: Token[] = [];
  const re = /~([^~]+)~|\+([^+]+)\+|!(.+)$/g;
  let last = 0;
  for (let m = re.exec(line); m; m = re.exec(line)) {
    if (m.index > last) out.push({ kind: "text", text: line.slice(last, m.index) });
    if (m[1]) out.push({ kind: "strike", text: m[1] });
    else if (m[2]) out.push({ kind: "insert", text: m[2] });
    else if (m[3]) out.push({ kind: "note", text: m[3] });
    last = re.lastIndex;
  }
  if (last < line.length) out.push({ kind: "text", text: line.slice(last) });
  return out;
};

const DocLine: React.FC<{ line: string; at: number; fs: number }> = ({ line, at, fs }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const strike = interpolate(frame, [at, at + 8], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const edit = spring({ frame: frame - at - 6, fps, config: { damping: 12, stiffness: 180 } });
  return (
    <div style={{ fontFamily: FONT.mono, fontWeight: 500, fontSize: fs, lineHeight: 1.5, color: C.ink, display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "0 10px", minHeight: fs * 2.1 }}>
      {parse(line).map((tok, i) => {
        if (tok.kind === "strike")
          return (
            <span key={i} style={{ position: "relative", color: strike > 0.5 ? "#A39B8B" : C.ink }}>
              {tok.text}
              <span style={{ position: "absolute", left: 0, top: "52%", height: 3, width: `${strike * 100}%`, background: C.error, borderRadius: 2 }} />
            </span>
          );
        if (tok.kind === "insert")
          return (
            <span key={i} style={{ color: C.error, fontWeight: 600, opacity: edit, display: "inline-block", translate: `0px ${(1 - edit) * -10}px`, background: "rgba(229,83,75,0.08)", borderRadius: 4, padding: "0 4px" }}>
              {tok.text}
            </span>
          );
        if (tok.kind === "note")
          return (
            <span key={i} style={{ fontFamily: FONT.body, fontWeight: 600, fontSize: fs * 0.76, color: C.white, background: C.error, borderRadius: 999, padding: "2px 12px", opacity: edit, scale: `${0.6 + 0.4 * edit}`, display: "inline-block", rotate: "-3deg" }}>
              {tok.text}
            </span>
          );
        return <span key={i}>{tok.text}</span>;
      })}
    </div>
  );
};

/** Scene 1 (0–194): an overflowing, red-penned prompt doc next to a timer crawling to 2:00 hours. */
export const Scene1Pain: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // Painfully slow at first, then the hours vanish.
  const minutes = interpolate(frame, TIMER, [0, 120], { ...clamp, easing: Easing.in(Easing.quad) });
  const hh = Math.floor(minutes / 60);
  const mm = String(Math.floor(minutes % 60)).padStart(2, "0");
  const revision = 1 + Math.floor(minutes / 7);
  const docIn = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 20 });
  // The doc overflows: it keeps scrolling as more lines get edited.
  const scroll = interpolate(frame, [100, 190], [0, -110], clamp);
  const strain = interpolate(frame, [120, 186], [0, 1], clamp);

  // Layout per format: side by side in 16:9 and 1:1, timer row stacked above the doc in 4:5 / 9:16.
  const { mode, lw, lh, vertical, safeTop, safeBottom } = useFormat();
  const L =
    mode === "wide"
      ? { head: { x: 120, y: 70, w: 1680, fs: 52 }, doc: { x: 120, y: 220, w: 980, h: 800 }, timer: { x: 1180, y: 220, w: 620, h: 800 }, row: false, timerFs: 170, docFs: 25 }
      : mode === "square"
        ? { head: { x: 44, y: 44, w: 992, fs: 40 }, doc: { x: 40, y: 150, w: 630, h: 890 }, timer: { x: 690, y: 150, w: 350, h: 890 }, row: false, timerFs: 100, docFs: 19 }
        : (() => {
            const timerH = vertical ? 330 : 270;
            const top = safeTop + (vertical ? 170 : 140);
            const docY = top + timerH + 28;
            return { head: { x: 60, y: safeTop, w: lw - 120, fs: vertical ? 56 : 50 }, doc: { x: 60, y: docY, w: lw - 120, h: lh - safeBottom - docY }, timer: { x: 60, y: top, w: lw - 120, h: timerH }, row: true, timerFs: vertical ? 150 : 128, docFs: vertical ? 26 : 22 };
          })();

  return (
    <AbsoluteFill>
      <Backdrop tone="light" />
      <div style={{ position: "absolute", left: L.head.x, top: L.head.y, width: L.head.w }}>
        <RevealText text={COPY.painHeadline} delay={10} accent={["2", "hours."]} style={{ fontFamily: FONT.head, fontWeight: 800, fontSize: L.head.fs, lineHeight: 1.1, color: C.ink }} />
      </div>

      {/* The messy doc */}
      <div style={{ position: "absolute", left: L.doc.x, top: L.doc.y, width: L.doc.w, height: L.doc.h, background: C.white, borderRadius: 24, boxShadow: "0 30px 70px rgba(39,35,27,0.16)", overflow: "hidden", opacity: docIn, translate: `0px ${(1 - docIn) * 40}px` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "18px 26px", borderBottom: `2px solid ${C.line}`, background: "#FBF9F4" }}>
          {[0, 1, 2].map((i) => (
            <span key={i} style={{ width: 14, height: 14, borderRadius: 99, background: C.line }} />
          ))}
          <span style={{ fontFamily: FONT.mono, fontWeight: 500, fontSize: mode === "square" ? 15 : 19, color: C.inkMuted, marginLeft: 10, whiteSpace: "nowrap" }}>botcake_instructions_v{revision}_FINAL.txt</span>
          {mode !== "square" && <span style={{ marginLeft: "auto", fontFamily: FONT.body, fontWeight: 600, fontSize: 17, color: C.error }}>● Unsaved changes</span>}
        </div>
        {/* Own clipping box so overflowing lines scroll under the title bar, not over it */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 58, bottom: 0, overflow: "hidden" }}>
          <div style={{ padding: mode === "square" ? "20px 24px" : "26px 34px", display: "flex", flexDirection: "column", gap: 6, translate: `0px ${scroll}px` }}>
            {MESSY_DOC.map((line, i) => (
              <DocLine key={i} line={line} at={STRIKE_START + i * STRIKE_STEP} fs={L.docFs} />
            ))}
          </div>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 120, background: "linear-gradient(180deg, rgba(255,255,255,0), #FFFFFF)" }} />
      </div>

      {/* The timer — a tall column beside the doc, or a row above it on vertical formats */}
      <div
        style={{
          position: "absolute",
          left: L.timer.x,
          top: L.timer.y,
          width: L.timer.w,
          height: L.timer.h,
          background: C.canvas,
          borderRadius: 24,
          display: "flex",
          flexDirection: L.row ? "row" : "column",
          alignItems: "center",
          justifyContent: "center",
          gap: L.row ? 40 : 18,
          padding: L.row ? "0 40px" : 20,
          boxSizing: "border-box",
          opacity: docIn,
          translate: L.row ? `0px ${(1 - docIn) * -40}px` : `${(1 - docIn) * 60}px 0px`,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <div style={{ fontFamily: FONT.body, fontWeight: 600, fontSize: mode === "square" ? 14 : 18, letterSpacing: 2.5, color: C.blue, textAlign: "center" }}>TIME SPENT ON ONE PROMPT</div>
          <div style={{ fontFamily: FONT.mono, fontWeight: 600, fontSize: L.timerFs, lineHeight: 1, color: C.cream, letterSpacing: -L.timerFs / 28, translate: `${Math.sin(frame * 2.3) * strain * 4}px 0px` }}>
            {hh}:{mm}
          </div>
          <div style={{ fontFamily: FONT.mono, fontWeight: 600, fontSize: mode === "square" ? 22 : 30, color: minutes >= 119 ? C.lime : C.muted }}>{minutes >= 119 ? "2:00 HOURS" : "HOURS"}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: L.row ? "flex-start" : "center", gap: 14, flex: L.row ? 1 : undefined, width: L.row ? undefined : "86%" }}>
          <div style={{ width: "100%", height: 12, borderRadius: 99, background: C.border, overflow: "hidden" }}>
            <div style={{ width: `${(minutes / 120) * 100}%`, height: "100%", background: C.olive }} />
          </div>
          <div style={{ fontFamily: FONT.body, fontWeight: 500, fontSize: mode === "square" ? 18 : 22, color: C.muted, textAlign: L.row ? "left" : "center" }}>{COPY.painTimerLabel}</div>
          <div style={{ fontFamily: FONT.mono, fontWeight: 600, fontSize: 22, color: C.error, background: "rgba(229,83,75,0.12)", borderRadius: 10, padding: "6px 14px" }}>Revision #{revision}</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
