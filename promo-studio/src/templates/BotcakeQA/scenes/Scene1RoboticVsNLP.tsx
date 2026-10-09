import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CHAT, COPY } from "../content";
import { C, clamp, FONT, useFrameLayout } from "../tokens";
import { BotcakeLogo, Chip, SceneHeadline, Stage, typed, useFillHeight, useHeadlineSpace } from "../ui";

// Frames within the scene.
export const ASK = 10; // customer bubble
const REPLY = 26; // both bots start typing the same flat answer
export const ERROR = 66; // left: generic-answer error
export const REWRITE = 80; // right: scan + rewrite into the NLP reply
const TAGS = 130;
export const WIN = 140; // customer says yes (right only)

const FS = 28; // chat text size (logical px)

const Bubble: React.FC<{ side: "customer" | "bot"; children: React.ReactNode; at: number; dim?: boolean; style?: React.CSSProperties }> = ({ side, children, at, dim, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - at, fps, config: { damping: 15, stiffness: 160 } });
  const customer = side === "customer";
  return (
    <div
      style={{
        alignSelf: customer ? "flex-end" : "flex-start",
        maxWidth: "84%",
        background: customer ? C.blue : C.white,
        color: C.ink,
        fontFamily: FONT.body,
        fontWeight: 500,
        fontSize: FS,
        lineHeight: 1.4,
        padding: "16px 22px",
        borderRadius: customer ? "24px 24px 6px 24px" : "24px 24px 24px 6px",
        boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
        opacity: p * (dim ? 0.75 : 1),
        scale: `${0.8 + 0.2 * p}`,
        transformOrigin: customer ? "100% 100%" : "0% 100%",
        position: "relative",
        overflow: "hidden",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** NLP reply with `{…}` rendered as an Electric Lime highlight; respects the typewriter cut. */
const Highlighted: React.FC<{ source: string; shown: number }> = ({ source, shown }) => {
  const parts = source.split(/\{([^}]+)\}/);
  let left = shown;
  return (
    <>
      {parts.map((part, i) => {
        const chars = Array.from(part);
        const visible = chars.slice(0, Math.max(0, left)).join("");
        left -= chars.length;
        if (!visible) return null;
        return i % 2 ? (
          <span key={i} style={{ background: C.lime, borderRadius: 6, padding: "0 4px", fontWeight: 600, boxDecorationBreak: "clone", WebkitBoxDecorationBreak: "clone" }}>
            {visible}
          </span>
        ) : (
          <span key={i}>{visible}</span>
        );
      })}
    </>
  );
};

const Panel: React.FC<{ variant: "robotic" | "nlp"; w: number; h: number; enter: number }> = ({ variant, w, h, enter }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const robotic = variant === "robotic";
  const rewritten = !robotic && frame >= REWRITE + 8;
  const scan = interpolate(frame, [REWRITE, REWRITE + 12], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const errorPop = spring({ frame: frame - ERROR, fps, config: { damping: 9, stiffness: 200 } });
  const shake = robotic && frame >= ERROR && frame < ERROR + 18 ? Math.sin((frame - ERROR) * 2.6) * (1 - (frame - ERROR) / 18) * 8 : 0;

  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: 32,
        background: robotic ? "#E9E4D8" : C.cream,
        border: `3px solid ${robotic ? "#CFC7B6" : rewritten ? C.lime : C.line}`,
        boxShadow: rewritten ? "0 0 60px rgba(213,250,0,0.25)" : "0 20px 60px rgba(0,0,0,0.35)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        opacity: enter,
        translate: `0px ${(1 - enter) * 40}px`,
        filter: robotic ? `grayscale(${interpolate(frame, [ERROR, ERROR + 20], [0, 0.6], clamp)})` : undefined,
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "20px 26px", background: C.white, borderBottom: `2px solid ${C.line}` }}>
        <BotcakeLogo h={34} />
        <div style={{ fontFamily: FONT.body, fontWeight: 600, fontSize: 26, color: C.ink }}>AI</div>
        <div style={{ flex: 1 }} />
        <Chip tone={robotic ? "dark" : rewritten ? "lime" : "dark"} size={18}>
          {robotic ? "Default prompt" : "ActionSuite prompt"}
        </Chip>
      </div>

      {/* Conversation */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16, padding: "24px 26px", justifyContent: "flex-start" }}>
        <Bubble side="customer" at={ASK}>
          {CHAT.customer}
        </Bubble>
        {frame >= REPLY && (
          <Bubble side="bot" at={REPLY} dim={robotic && frame >= ERROR} style={{ translate: `${shake}px 0px`, border: rewritten ? `2px solid ${C.lime}` : "2px solid transparent" }}>
            {rewritten ? <Highlighted source={CHAT.nlp} shown={Math.floor((frame - REWRITE - 8) * 2.8)} /> : typed(CHAT.robotic, frame, REPLY + 4, 1.6)}
            {!robotic && scan > 0 && scan < 1 && (
              <div style={{ position: "absolute", top: 0, bottom: 0, left: `${scan * 100}%`, width: 6, background: C.lime, boxShadow: `0 0 24px ${C.lime}` }} />
            )}
          </Bubble>
        )}
        {robotic && frame >= ERROR && (
          <div style={{ alignSelf: "flex-start", opacity: errorPop, scale: `${0.6 + 0.4 * errorPop}`, transformOrigin: "0 50%" }}>
            <Chip tone="error" size={22}>
              [{CHAT.roboticError}]
            </Chip>
          </div>
        )}
        {robotic && frame >= ERROR + 22 && (
          <div style={{ alignSelf: "center", fontFamily: FONT.body, fontWeight: 500, fontSize: 22, color: "#8C8475", opacity: interpolate(frame, [ERROR + 22, ERROR + 32], [0, 1], clamp) }}>
            Seen · customer left the chat
          </div>
        )}
        {!robotic && frame >= TAGS && (
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {CHAT.nlpTags.map((tag, i) => {
              const p = spring({ frame: frame - TAGS - i * 4, fps, config: { damping: 12 } });
              return (
                <span key={tag} style={{ display: "inline-block", opacity: p, scale: `${0.6 + 0.4 * p}` }}>
                  <Chip size={20}>[{tag}]</Chip>
                </span>
              );
            })}
          </div>
        )}
        {!robotic && frame >= WIN && (
          <Bubble side="customer" at={WIN}>
            Sige po! Reserve mo na 🙌
          </Bubble>
        )}
      </div>
    </div>
  );
};

/** Scene 1 (0–164): the same question answered by a robotic bot vs. an ActionSuite-prompted bot. */
export const Scene1RoboticVsNLP: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { mode } = useFrameLayout();
  const top = useHeadlineSpace();
  const enter = (d: number) => spring({ frame: frame - d, fps, config: { damping: 200 }, durationInFrames: 22 });
  const wide = mode === "wide";
  const tallH = useFillHeight(1000, top, 1000, 1280);
  const panelW = wide ? 770 : 1000;
  const panelH = wide ? 700 : (tallH - 40) / 2;

  return (
    <AbsoluteFill>
      <SceneHeadline text={COPY.s1Headline} accent={["kill"]} />
      <Stage w={wide ? 1600 : 1000} h={wide ? 700 : tallH} top={top}>
        <div style={{ display: "flex", flexDirection: wide ? "row" : "column", gap: wide ? 60 : 40, width: "100%", height: "100%" }}>
          <Panel variant="robotic" w={panelW} h={panelH} enter={enter(0)} />
          <Panel variant="nlp" w={panelW} h={panelH} enter={enter(6)} />
        </div>
      </Stage>
    </AbsoluteFill>
  );
};
