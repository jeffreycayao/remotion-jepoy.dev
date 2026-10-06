import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { useLayout } from "../../lib/layout";

/** Resolve a brief asset path: "" → null, http(s) → as-is, else a file in public/. */
export const resolveAsset = (path: string): string | null => {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  return staticFile(path.replace(/^\/+/, ""));
};

/** Spring-in helper: 0 → 1 starting at `delay` frames. */
export const useEnter = (delay = 0, damping = 200) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping } });
};

/** Slow-drifting gradient blobs in brand colors. Continuous across scenes. */
export const BrandBackground: React.FC<{
  background: string;
  primary: string;
  secondary: string;
}> = ({ background, primary, secondary }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const size = Math.max(width, height) * 0.75;
  const drift = (speed: number, amp: number, phase: number) =>
    Math.sin(frame / speed + phase) * amp;

  return (
    <AbsoluteFill style={{ backgroundColor: background, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          width: size,
          height: size,
          borderRadius: "50%",
          background: primary,
          opacity: 0.35,
          filter: `blur(${size * 0.18}px)`,
          left: -size * 0.3 + drift(90, width * 0.05, 0),
          top: -size * 0.35 + drift(110, height * 0.05, 1),
        }}
      />
      <div
        style={{
          position: "absolute",
          width: size * 0.9,
          height: size * 0.9,
          borderRadius: "50%",
          background: secondary,
          opacity: 0.3,
          filter: `blur(${size * 0.18}px)`,
          right: -size * 0.35 + drift(100, width * 0.05, 2),
          bottom: -size * 0.4 + drift(80, height * 0.05, 3),
        }}
      />
      {/* Subtle vignette for depth */}
      <AbsoluteFill
        style={{
          background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.35) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

/** Logo image, or a monogram tile when no logo is supplied. */
export const Logo: React.FC<{
  src: string;
  appName: string;
  size: number;
  primary: string;
  secondary: string;
}> = ({ src, appName, size, primary, secondary }) => {
  const url = resolveAsset(src);
  if (url) {
    return <Img src={url} style={{ width: size, height: size, objectFit: "contain" }} />;
  }
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.24,
        background: `linear-gradient(135deg, ${primary}, ${secondary})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontSize: size * 0.48,
        fontWeight: 800,
        boxShadow: `0 ${size * 0.12}px ${size * 0.35}px ${primary}66`,
      }}
    >
      {appName.trim().charAt(0).toUpperCase()}
    </div>
  );
};

/** CSS phone mockup. Shows the screenshot, or a skeleton app UI as placeholder. */
export const PhoneFrame: React.FC<{
  screenshot: string;
  height: number;
  primary: string;
  secondary: string;
  icon: string;
}> = ({ screenshot, height, primary, secondary, icon }) => {
  const frame = useCurrentFrame();
  const width = height * 0.49;
  const bezel = height * 0.018;
  const radius = height * 0.07;
  const url = resolveAsset(screenshot);

  return (
    <div
      style={{
        width,
        height,
        borderRadius: radius,
        background: "#0b0b0f",
        padding: bezel,
        boxShadow: `0 ${height * 0.05}px ${height * 0.12}px rgba(0,0,0,0.45), 0 0 0 ${height * 0.004}px rgba(255,255,255,0.12)`,
        position: "relative",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: radius - bezel,
          overflow: "hidden",
          background: "#f4f5f8",
          position: "relative",
        }}
      >
        {url ? (
          <Img src={url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <SkeletonUI frame={frame} h={height} primary={primary} secondary={secondary} icon={icon} />
        )}
      </div>
      {/* Dynamic island */}
      <div
        style={{
          position: "absolute",
          top: bezel + height * 0.015,
          left: "50%",
          translate: "-50% 0",
          width: width * 0.3,
          height: height * 0.028,
          borderRadius: height,
          background: "#0b0b0f",
        }}
      />
    </div>
  );
};

const SkeletonUI: React.FC<{
  frame: number;
  h: number;
  primary: string;
  secondary: string;
  icon: string;
}> = ({ frame, h, primary, secondary, icon }) => {
  const bar = (w: string, op = 0.12) => (
    <div style={{ height: h * 0.014, width: w, borderRadius: h, background: `rgba(0,0,0,${op})` }} />
  );
  const shimmer = interpolate(frame % 60, [0, 60], [-100, 200]);
  return (
    <div style={{ padding: h * 0.035, paddingTop: h * 0.08, display: "flex", flexDirection: "column", gap: h * 0.022 }}>
      <div
        style={{
          height: h * 0.2,
          borderRadius: h * 0.03,
          background: `linear-gradient(135deg, ${primary}, ${secondary})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: h * 0.08,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {icon}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(100deg, transparent ${shimmer - 30}%, rgba(255,255,255,0.25) ${shimmer}%, transparent ${shimmer + 30}%)`,
          }}
        />
      </div>
      {bar("70%", 0.2)}
      {bar("90%")}
      {bar("55%")}
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            display: "flex",
            gap: h * 0.02,
            alignItems: "center",
            background: "white",
            borderRadius: h * 0.02,
            padding: h * 0.018,
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}
        >
          <div style={{ width: h * 0.05, height: h * 0.05, borderRadius: h * 0.014, background: i === 0 ? primary : `${secondary}88` }} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: h * 0.01 }}>
            {bar("80%", 0.18)}
            {bar("50%")}
          </div>
        </div>
      ))}
    </div>
  );
};

/** Pill button used in CTA. */
export const Pill: React.FC<{ children: React.ReactNode; color: string; scale?: number }> = ({
  children,
  color,
  scale = 1,
}) => {
  const { u } = useLayout();
  return (
    <div
      style={{
        background: color,
        color: "white",
        fontWeight: 700,
        fontSize: 44 * u,
        padding: `${24 * u}px ${56 * u}px`,
        borderRadius: 999,
        scale: String(scale),
        boxShadow: `0 ${16 * u}px ${48 * u}px ${color}77`,
      }}
    >
      {children}
    </div>
  );
};
