import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { BOTCAKE_LOGO } from "./content";
import { C, clamp, FONT, W } from "./tokens";

export type Mode = "wide" | "square" | "tall";

/**
 * Format-aware logical canvas. 16:9 is authored on 1920×1080; 1:1, 4:5 and 9:16 on a 1080-wide
 * canvas of their real height (1080 / 1350 / 1920), so scenes lay out natively instead of shrinking.
 * `safeTop`/`safeBottom` keep copy clear of platform UI on vertical video.
 */
export const useFormat = () => {
  const { width, height } = useVideoConfig();
  const aspect = width / height;
  const mode: Mode = aspect > 1.2 ? "wide" : aspect > 0.9 ? "square" : "tall";
  const lw = mode === "wide" ? W : 1080;
  const lh = Math.round((lw * height) / width);
  const vertical = aspect < 0.7;
  return { mode, lw, lh, vertical, safeTop: vertical ? 150 : mode === "wide" ? 0 : 48, safeBottom: vertical ? 170 : mode === "wide" ? 0 : 48 };
};

/** Scales the logical canvas (see useFormat) to the composition. */
export const Canvas: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { width } = useVideoConfig();
  const { lw, lh } = useFormat();
  return <div style={{ position: "absolute", left: 0, top: 0, width: lw, height: lh, scale: `${width / lw}`, transformOrigin: "0 0", overflow: "hidden" }}>{children}</div>;
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

export const Chip: React.FC<{ children: React.ReactNode; tone?: "blue" | "lime" | "dark" | "olive"; size?: number; style?: React.CSSProperties }> = ({
  children,
  tone = "blue",
  size = 18,
  style,
}) => {
  const bg = { blue: C.blue, lime: C.lime, dark: C.panel, olive: C.olive }[tone];
  const fg = tone === "dark" ? C.blue : tone === "olive" ? C.cream : C.ink;
  return (
    <span
      style={{
        fontFamily: FONT.mono,
        fontWeight: 600,
        fontSize: size,
        color: fg,
        background: bg,
        borderRadius: size * 0.45,
        padding: `${size * 0.25}px ${size * 0.6}px`,
        whiteSpace: "nowrap",
        display: "inline-block",
        ...style,
      }}
    >
      {children}
    </span>
  );
};

export const BotcakeLogo: React.FC<{ h: number; style?: React.CSSProperties }> = ({ h, style }) => (
  <Img src={staticFile(BOTCAKE_LOGO)} style={{ height: h, width: (h * 109) / 30, display: "block", ...style }} />
);

/** Charcoal or cream backdrop with a faint dot grid and slow glows. */
export const Backdrop: React.FC<{ tone: "dark" | "light" }> = ({ tone }) => {
  const frame = useCurrentFrame();
  const { lw, lh } = useFormat();
  const dark = tone === "dark";
  const blob = (x: number, y: number, color: string, size: number, phase: number, strength: number) => (
    <div
      style={{
        position: "absolute",
        left: x + Math.sin(frame / 70 + phase) * 60 - size / 2,
        top: y + Math.cos(frame / 90 + phase) * 50 - size / 2,
        width: size,
        height: size,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${color} 0%, rgba(0,0,0,0) 65%)`,
        opacity: strength,
      }}
    />
  );
  return (
    <AbsoluteFill style={{ backgroundColor: dark ? C.canvas : C.cream, overflow: "hidden" }}>
      <AbsoluteFill style={{ backgroundImage: `radial-gradient(${dark ? "rgba(246,241,230,0.07)" : "rgba(39,35,27,0.07)"} 1.4px, transparent 1.6px)`, backgroundSize: "36px 36px" }} />
      {blob(lw * 0.16, lh * 0.2, C.olive, Math.max(lw, lh) * 0.8, 0, dark ? 0.16 : 0.08)}
      {blob(lw * 0.88, lh * 0.85, C.lime, Math.max(lw, lh) * 0.5, 2, dark ? 0.1 : 0.12)}
    </AbsoluteFill>
  );
};

/** Animated pointer (logical px). `press` 0→1 squashes it on click. */
export const Cursor: React.FC<{ x: number; y: number; press?: number; opacity?: number }> = ({ x, y, press = 0, opacity = 1 }) => (
  <svg width={44} height={52} viewBox="0 0 22 26" style={{ position: "absolute", left: x - 4, top: y - 2, opacity, scale: `${1 - 0.15 * press}`, transformOrigin: "4px 2px", filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.35))", zIndex: 50 }}>
    <path d="M2 1 L2 20 L7 15.5 L10.5 23.5 L13.8 22 L10.4 14.2 L17 14 Z" fill={C.white} stroke={C.ink} strokeWidth={1.6} strokeLinejoin="round" />
  </svg>
);

/** Expanding click ring at (x, y); `t` = frames since the click. */
export const ClickRipple: React.FC<{ x: number; y: number; t: number; color?: string }> = ({ x, y, t, color = C.lime }) => {
  if (t < 0 || t > 24) return null;
  const p = t / 24;
  const r = 10 + p * 70;
  return <div style={{ position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: 999, border: `4px solid ${color}`, opacity: 1 - p, zIndex: 49 }} />;
};
