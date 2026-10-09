import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { BOTCAKE_ICON, BOTCAKE_LOGO } from "./content";
import { RevealText } from "./RevealText";
import { C, clamp, FONT, useFrameLayout } from "./tokens";

/**
 * Lays out children on a fixed logical canvas (`w`×`h` px) and scales it uniformly to fit the
 * area under the headline. Scenes are written once in logical px and can never clip, whatever
 * the format. `top` reserves room (in real px) for the scene headline.
 */
export const Stage: React.FC<{ w: number; h: number; top?: number; children: React.ReactNode }> = ({ w, h, top = 0, children }) => {
  const { safe } = useFrameLayout();
  const availH = safe.h - top;
  const scale = Math.min(safe.w / w, availH / h);
  return (
    <div
      style={{
        position: "absolute",
        left: safe.x + (safe.w - w * scale) / 2,
        top: safe.y + top + (availH - h * scale) / 2,
        width: w,
        height: h,
        scale: `${scale}`,
        transformOrigin: "0 0",
      }}
    >
      {children}
    </div>
  );
};

/**
 * Logical height that makes a `w`-wide Stage exactly fill the space under the headline — for
 * scenes whose panels can stretch (chats, browser), so 1:1 and 4:5 aren't scaled down needlessly.
 */
export const useFillHeight = (w: number, top: number, min: number, max: number) => {
  const { safe } = useFrameLayout();
  return Math.min(max, Math.max(min, (w * (safe.h - top)) / safe.w));
};

/** Height (real px) a scene headline occupies, so the Stage can sit below it. */
export const useHeadlineSpace = () => {
  const { u, mode, vertical, square } = useFrameLayout();
  if (mode === "wide") return 150 * u;
  if (vertical) return 300 * u;
  return (square ? 150 : 200) * u;
};

/** Scene headline at the top of the safe area (Sora 800, sentence case). */
export const SceneHeadline: React.FC<{ text: string; accent?: string[]; delay?: number }> = ({ text, accent, delay = 3 }) => {
  const { u, safe, mode, vertical, square } = useFrameLayout();
  const size = mode === "wide" ? 60 : vertical ? 76 : square ? 54 : 62;
  return (
    <div style={{ position: "absolute", left: safe.x, top: safe.y, width: safe.w, display: "flex", justifyContent: "center" }}>
      <RevealText
        text={text}
        accent={accent}
        delay={delay}
        style={{ fontFamily: FONT.head, fontWeight: 800, fontSize: size * u, lineHeight: 1.08, color: C.cream, textAlign: "center", maxWidth: (mode === "wide" ? 1600 : 960) * u }}
      />
    </div>
  );
};

/** Fades a scene in/out at its Sequence edges. */
export const SceneFade: React.FC<{ children: React.ReactNode; fadeIn?: number; fadeOut?: number }> = ({ children, fadeIn = 10, fadeOut = 10 }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const opacity = Math.min(
    fadeIn ? interpolate(frame, [0, fadeIn], [0, 1], clamp) : 1,
    fadeOut ? interpolate(frame, [durationInFrames - fadeOut, durationInFrames], [1, 0], clamp) : 1,
  );
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};

/** Status chip in logical px (use inside a Stage). */
export const Chip: React.FC<{ children: React.ReactNode; tone?: "blue" | "lime" | "dark" | "error"; size?: number; style?: React.CSSProperties }> = ({
  children,
  tone = "blue",
  size = 20,
  style,
}) => {
  const bg = { blue: C.blue, lime: C.lime, dark: C.panel, error: C.error }[tone];
  const fg = tone === "dark" ? C.blue : tone === "error" ? C.white : C.ink;
  return (
    <span
      style={{
        fontFamily: FONT.mono,
        fontWeight: 600,
        fontSize: size,
        color: fg,
        background: bg,
        borderRadius: size * 0.45,
        padding: `${size * 0.25}px ${size * 0.55}px`,
        whiteSpace: "nowrap",
        display: "inline-block",
        ...style,
      }}
    >
      {children}
    </span>
  );
};

/** Charcoal canvas, faint dot grid, slow olive/lime glows. */
export const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, u } = useFrameLayout();
  const big = Math.max(width, height);
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
      <AbsoluteFill style={{ backgroundImage: `radial-gradient(rgba(246,241,230,0.07) ${1.4 * u}px, transparent ${1.6 * u}px)`, backgroundSize: `${36 * u}px ${36 * u}px` }} />
      {blob(width * 0.15, height * 0.2, C.olive, big * 0.8, 0, 0.16)}
      {blob(width * 0.88, height * 0.85, C.lime, big * 0.5, 2, 0.1)}
    </AbsoluteFill>
  );
};

/** Botcake wordmark (or mark only), sized by height in logical px. Light surfaces only. */
export const BotcakeLogo: React.FC<{ h: number; iconOnly?: boolean; style?: React.CSSProperties }> = ({ h, iconOnly, style }) => (
  <Img src={staticFile(iconOnly ? BOTCAKE_ICON : BOTCAKE_LOGO)} style={{ height: h, width: h * (iconOnly ? 22 / 30 : 109 / 30), display: "block", ...style }} />
);

/** Typewriter helper: the first N characters of `text` after `start`, at `cps` chars/frame. */
export const typed = (text: string, frame: number, start: number, cps = 1.2) => {
  const chars = Array.from(text); // keeps emoji intact
  return chars.slice(0, Math.max(0, Math.floor((frame - start) * cps))).join("");
};
