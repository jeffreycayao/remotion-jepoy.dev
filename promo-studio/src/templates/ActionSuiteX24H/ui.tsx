import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { RevealText } from "./RevealText";
import { C, clamp, FONT, useFrameLayout } from "./tokens";

/** Fades a scene in over `fadeIn` frames and out over the last `fadeOut` frames of its Sequence. */
export const SceneFade: React.FC<{ children: React.ReactNode; fadeIn?: number; fadeOut?: number }> = ({ children, fadeIn = 10, fadeOut = 10 }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const opacity = Math.min(
    fadeIn ? interpolate(frame, [0, fadeIn], [0, 1], clamp) : 1,
    fadeOut ? interpolate(frame, [durationInFrames - fadeOut, durationInFrames], [1, 0], clamp) : 1,
  );
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};

/** Scene headline pinned to the top safe area (Sora, sentence case). */
export const SceneHeadline: React.FC<{ text: string; delay?: number; accent?: string[]; align?: "top" | "bottom" }> = ({ text, delay = 4, accent, align = "top" }) => {
  const { u, vertical, safeTop, safeBottom } = useFrameLayout();
  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: align === "top" ? "flex-start" : "flex-end",
        paddingTop: align === "top" ? (vertical ? safeTop : 64 * u) : 0,
        paddingBottom: align === "bottom" ? (vertical ? safeBottom : 64 * u) : 0,
        paddingLeft: 60 * u,
        paddingRight: 60 * u,
      }}
    >
      <RevealText
        text={text}
        delay={delay}
        accent={accent}
        style={{ fontFamily: FONT.head, fontWeight: 800, fontSize: (vertical ? 64 : 58) * u, lineHeight: 1.1, color: C.cream, textAlign: "center", maxWidth: (vertical ? 960 : 1600) * u }}
      />
    </AbsoluteFill>
  );
};

/** Monospace pill: channel tags, engine ids, status pings. */
export const Chip: React.FC<{ children: React.ReactNode; tone?: "blue" | "lime" | "olive" | "dark"; size?: number; style?: React.CSSProperties }> = ({
  children,
  tone = "blue",
  size = 18,
  style,
}) => {
  const { u } = useFrameLayout();
  const bg = { blue: C.blue, lime: C.lime, olive: C.olive, dark: C.panel }[tone];
  const fg = tone === "dark" ? C.blue : tone === "olive" ? C.cream : C.canvas;
  return (
    <span
      style={{
        fontFamily: FONT.mono,
        fontWeight: 600,
        fontSize: size * u,
        color: fg,
        background: bg,
        borderRadius: 8 * u,
        padding: `${4 * u}px ${10 * u}px`,
        whiteSpace: "nowrap",
        display: "inline-block",
        ...style,
      }}
    >
      {children}
    </span>
  );
};

/** Charcoal canvas with a faint dot grid and slow olive/lime glows. */
export const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, u } = useFrameLayout();
  const blob = (x: number, y: number, color: string, size: number, phase: number, strength: number) => (
    <div
      style={{
        position: "absolute",
        left: x + Math.sin(frame / 70 + phase) * 60 * u - size / 2,
        top: y + Math.cos(frame / 90 + phase) * 50 * u - size / 2,
        width: size,
        height: size,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${color} 0%, rgba(0,0,0,0) 65%)`,
        opacity: strength,
      }}
    />
  );
  return (
    <AbsoluteFill style={{ backgroundColor: C.canvas, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(rgba(246,241,230,0.07) ${1.4 * u}px, transparent ${1.6 * u}px)`,
          backgroundSize: `${36 * u}px ${36 * u}px`,
        }}
      />
      {blob(width * 0.15, height * 0.2, C.olive, Math.max(width, height) * 0.8, 0, 0.16)}
      {blob(width * 0.88, height * 0.85, C.lime, Math.max(width, height) * 0.5, 2, 0.1)}
    </AbsoluteFill>
  );
};
