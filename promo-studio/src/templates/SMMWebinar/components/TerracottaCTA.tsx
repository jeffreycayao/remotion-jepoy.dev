import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ASSETS, C, clamp, FONT, T, useLayout } from "../tokens";

const ease = Easing.bezier(0.16, 1, 0.3, 1);

/** Pill button: springs in on "Click the event link", arrow pulses, presses on "register now". */
const RegisterButton: React.FC<{ size: number }> = ({ size }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: frame - T.button, fps, config: { damping: 12, stiffness: 150 } });
  const press = interpolate(frame, [T.press, T.press + 4, T.press + 12], [1, 0.94, 1], clamp);
  const ripple = interpolate(frame, [T.press, T.press + 24], [0, 1], { ...clamp, easing: Easing.out(Easing.quad) });
  const nudge = frame > T.button + 12 ? Math.max(0, Math.sin((frame - T.button) / 5)) * size * 0.28 : 0;
  return (
    <div style={{ position: "relative", scale: enter * press, opacity: Math.min(1, enter * 2) }}>
      {frame >= T.press && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 999,
            border: `${size * 0.1}px solid ${C.terracotta}`,
            scale: 1 + ripple * 0.35,
            opacity: 1 - ripple,
          }}
        />
      )}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: size * 0.6,
          background: C.terracotta,
          color: C.white,
          borderRadius: 999,
          padding: `${size * 0.8}px ${size * 1.5}px`,
          fontFamily: FONT.body,
          fontWeight: 700,
          fontSize: size,
          boxShadow: `0 ${size * 0.5}px ${size * 1.6}px rgba(208, 90, 34, 0.38)`,
          whiteSpace: "nowrap",
        }}
      >
        Register through the event link
        <span style={{ display: "inline-block", translate: `${nudge}px 0`, fontSize: size * 1.1 }}>→</span>
      </div>
    </div>
  );
};

/** Scene 4 (T.cta → end). */
export const TerracottaCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u, s, landscape } = useLayout();
  const free = spring({ frame: frame - T.cta, fps, config: { damping: 14, stiffness: 120 } });
  const slots = interpolate(frame, [T.slots, T.slots + 18], [0, 1], { ...clamp, easing: ease });
  const footer = interpolate(frame, [T.button + 10, T.button + 30], [0, 1], { ...clamp, easing: ease });
  const k = landscape ? 1 : 1.08 * s;

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 44 * u * k, padding: `0 ${60 * u}px` }}>
      <div
        style={{
          fontFamily: FONT.serif,
          fontWeight: 800,
          fontSize: 150 * u * k,
          lineHeight: 1,
          color: C.ink,
          letterSpacing: "0.01em",
          opacity: Math.min(1, free * 1.6),
          scale: interpolate(free, [0, 1], [0.8, 1]),
          textAlign: "center",
        }}
      >
        100% <span style={{ color: C.terracotta }}>FREE</span>
      </div>
      <div
        style={{
          fontFamily: FONT.serif,
          fontStyle: "italic",
          fontWeight: 500,
          fontSize: 54 * u * k,
          color: C.ink,
          textAlign: "center",
          opacity: slots,
          translate: `0 ${(1 - slots) * 24 * u}px`,
        }}
      >
        Limited free slots. <span style={{ color: C.terracotta }}>Secure your seat now.</span>
      </div>
      <div style={{ marginTop: 18 * u }}>
        {/* The button is the widest element, so it doesn't take the 9:16 boost. */}
        <RegisterButton size={(landscape ? 40 : 41) * u} />
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 26 * u,
          marginTop: 22 * u,
          background: C.ink,
          borderRadius: 999,
          padding: `${16 * u}px ${34 * u}px`,
          opacity: footer,
          translate: `0 ${(1 - footer) * 20 * u}px`,
        }}
      >
        <Img src={staticFile(ASSETS.logo)} style={{ height: 76 * u * k }} />
        <div style={{ width: 1.5 * u, height: 40 * u * k, background: "rgba(255,255,255,0.35)" }} />
        <div style={{ fontFamily: FONT.body, fontWeight: 600, fontSize: 26 * u * k, color: C.peach, whiteSpace: "nowrap" }}>
          Oct 9 · 7–10 PM PHT
        </div>
      </div>
    </AbsoluteFill>
  );
};
