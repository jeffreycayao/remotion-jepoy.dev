import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { RevealText } from "./RevealText";
import { C, clamp, FONT } from "./tokens";

const W = 1920; // 16:9 authoring width

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
  return { mode, lw, lh, vertical, safeTop: vertical ? 140 : mode === "wide" ? 0 : 48, safeBottom: vertical ? 170 : mode === "wide" ? 0 : 48 };
};

/** Scales the logical canvas (see useFormat) to the composition. */
export const Canvas: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { width } = useVideoConfig();
  const { lw, lh } = useFormat();
  return <div style={{ position: "absolute", left: 0, top: 0, width: lw, height: lh, scale: `${width / lw}`, transformOrigin: "0 0", overflow: "hidden" }}>{children}</div>;
};

/**
 * Cinematic scene wrapper: focus-pull entrance (slight zoom-out + de-blur), a slow push-in for
 * the whole scene so nothing is ever static, and a soft lift-and-fade exit.
 */
export const SceneFade: React.FC<{ children: React.ReactNode; fadeIn?: number; fadeOut?: number }> = ({ children, fadeIn = 12, fadeOut = 10 }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const inP = fadeIn ? interpolate(frame, [0, fadeIn], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) }) : 1;
  const outP = fadeOut ? interpolate(frame, [durationInFrames - fadeOut, durationInFrames], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) }) : 0;
  const push = interpolate(frame, [0, durationInFrames], [0, 0.025], clamp);
  return (
    <AbsoluteFill
      style={{
        opacity: inP * (1 - outP),
        scale: `${1 + (1 - inP) * 0.06 + push + outP * 0.03}`,
        filter: inP < 1 || outP > 0 ? `blur(${(1 - inP) * 12 + outP * 6}px)` : undefined,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/** A soft diagonal light sweep across its parent (parent needs position: relative + overflow: hidden). */
export const Shimmer: React.FC<{ start: number; every?: number; duration?: number; strength?: number }> = ({ start, every = 0, duration = 22, strength = 0.55 }) => {
  const frame = useCurrentFrame();
  if (frame < start) return null;
  const t = every ? (frame - start) % every : frame - start;
  if (t > duration) return null;
  const x = interpolate(t, [0, duration], [-60, 160], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: "inherit",
        pointerEvents: "none",
        background: `linear-gradient(105deg, rgba(255,255,255,0) ${x - 18}%, rgba(255,255,255,${strength}) ${x}%, rgba(255,255,255,0) ${x + 18}%)`,
        mixBlendMode: "soft-light",
      }}
    />
  );
};

/** Thin lime light streak that wipes across the frame at a scene cut (`t` = frames since the cut). */
export const CutStreak: React.FC<{ t: number }> = ({ t }) => {
  const { lw, lh } = useFormat();
  if (t < -8 || t > 10) return null;
  const p = interpolate(t, [-8, 10], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const w = lw * 0.55;
  return (
    <div
      style={{
        position: "absolute",
        left: -w + p * (lw + w),
        top: lh / 2 - 2,
        width: w,
        height: 4,
        borderRadius: 4,
        background: `linear-gradient(90deg, rgba(213,250,0,0), ${C.lime}, rgba(213,250,0,0))`,
        boxShadow: `0 0 30px 6px rgba(213,250,0,0.45)`,
        opacity: Math.sin(p * Math.PI),
      }}
    />
  );
};

/** Soft edge vignette — keeps the eye centred and gives the frame a premium finish. */
export const Vignette: React.FC = () => <AbsoluteFill style={{ pointerEvents: "none", background: "radial-gradient(ellipse 85% 80% at 50% 48%, rgba(0,0,0,0) 55%, rgba(15,13,10,0.42) 100%)" }} />;

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

/** Pick a value per format: 16:9 / 1:1 / 4:5 / 9:16. */
export const usePick = () => {
  const f = useFormat();
  return <V,>(v: { wide: V; square: V; portrait: V; vertical: V }): V => (f.mode === "wide" ? v.wide : f.mode === "square" ? v.square : f.vertical ? v.vertical : v.portrait);
};

/** Centred scene headline at the top of the safe area (16:9 can override position). */
export const SceneHeadline: React.FC<{ text: string; accent?: string[]; delay?: number; stagger?: number; y?: number; fs?: number; align?: "center" | "left"; x?: number; w?: number; color?: string }> = ({
  text,
  accent,
  delay = 3,
  stagger,
  y,
  fs,
  align = "center",
  x,
  w,
  color = C.cream,
}) => {
  const { lw, safeTop, mode, vertical } = useFormat();
  const size = fs ?? (mode === "wide" ? 64 : vertical ? 66 : mode === "tall" ? 56 : 46);
  return (
    <div style={{ position: "absolute", left: x ?? 60, top: y ?? (mode === "wide" ? 70 : safeTop), width: w ?? lw - 120, display: "flex", justifyContent: align === "center" ? "center" : "flex-start" }}>
      <RevealText text={text} accent={accent} delay={delay} stagger={stagger} style={{ fontFamily: FONT.head, fontWeight: 800, fontSize: size, lineHeight: 1.08, color, textAlign: align }} />
    </div>
  );
};
