import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ASSETS, C, clamp, FONT, T, useLayout } from "../tokens";

const ease = Easing.bezier(0.16, 1, 0.3, 1);

/** Brand tag, small caps with gold rules either side. */
export const BrandTag: React.FC<{ at: number; size: number }> = ({ at, size }) => {
  const frame = useCurrentFrame();
  const show = interpolate(frame, [at, at + 18], [0, 1], { ...clamp, easing: ease });
  return (
    <div style={{ display: "flex", alignItems: "center", gap: size * 0.8, opacity: show }}>
      <div style={{ width: size * 2.2 * show, height: Math.max(1, size * 0.08), background: C.gold }} />
      <div style={{ fontFamily: FONT.body, fontWeight: 700, fontSize: size, letterSpacing: "0.28em", color: C.ink }}>
        THE HAPPY FREELANCERS
      </div>
      <div style={{ width: size * 2.2 * show, height: Math.max(1, size * 0.08), background: C.gold }} />
    </div>
  );
};

/** Terracotta pill that pops in on "FREE Social Media Marketing Webinar". */
const FreeBadge: React.FC<{ size: number }> = ({ size }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: frame - T.badge, fps, config: { damping: 11, stiffness: 160 } });
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: size * 0.5,
        background: C.terracotta,
        color: C.white,
        borderRadius: 999,
        padding: `${size * 0.55}px ${size * 1.25}px`,
        fontFamily: FONT.body,
        fontWeight: 700,
        fontSize: size,
        letterSpacing: "0.16em",
        boxShadow: `0 ${size * 0.5}px ${size * 1.4}px rgba(208, 90, 34, 0.32)`,
        scale: pop,
        opacity: Math.min(1, pop * 2),
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ fontSize: size * 0.9 }}>✦</span> FREE SMM WEBINAR
    </div>
  );
};

/** "with Coach Mary Amorin" in italic serif, written on from left to right. */
const Signature: React.FC<{ size: number; align: "left" | "center" }> = ({ size, align }) => {
  const frame = useCurrentFrame();
  const write = interpolate(frame, [T.coach, T.coach + 26], [0, 1], { ...clamp, easing: Easing.out(Easing.quad) });
  return (
    <div style={{ textAlign: align }}>
      <div
        style={{
          display: "inline-block",
          fontFamily: FONT.serif,
          fontStyle: "italic",
          fontWeight: 500,
          fontSize: size,
          color: C.ink,
          clipPath: `inset(-20% ${(1 - write) * 100}% -20% 0)`,
          whiteSpace: "nowrap",
        }}
      >
        with Coach <span style={{ color: C.terracotta, fontWeight: 600 }}>Mary Amorin</span>
      </div>
      <div
        style={{
          height: Math.max(1, size * 0.04),
          width: `${write * 100}%`,
          background: C.gold,
          marginTop: size * 0.12,
          marginLeft: align === "center" ? "auto" : 0,
          marginRight: align === "center" ? "auto" : 0,
          opacity: 0.8,
        }}
      />
    </div>
  );
};

/** Tall sand arch that rises to reveal the round portrait. */
const PortraitArch: React.FC<{ w: number; h: number }> = ({ w, h }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const reveal = interpolate(frame, [T.speaker, T.speaker + 30], [0, 1], { ...clamp, easing: ease });
  const face = spring({ frame: frame - T.speaker - 14, fps, config: { damping: 200 }, durationInFrames: 30 });
  const drift = interpolate(frame, [T.speaker, T.schedule], [1.02, 1.08], clamp);
  return (
    <div
      style={{
        position: "relative",
        width: w,
        height: h,
        borderRadius: `${w / 2}px ${w / 2}px ${w * 0.06}px ${w * 0.06}px`,
        background: `linear-gradient(180deg, ${C.peach} 0%, ${C.sand} 100%)`,
        overflow: "hidden",
        clipPath: `inset(${(1 - reveal) * 100}% 0 0 0)`,
        boxShadow: `0 ${w * 0.04}px ${w * 0.12}px rgba(45, 24, 16, 0.12)`,
      }}
    >
      <div style={{ position: "absolute", left: "50%", top: w * 0.1, translate: "-50% 0" }}>
        <Img
          src={staticFile(ASSETS.portrait)}
          style={{
            width: w * 0.9,
            height: w * 0.9,
            opacity: face,
            scale: interpolate(face, [0, 1], [0.86, 1]) * drift,
          }}
        />
      </div>
    </div>
  );
};

/** Scene 2 (T.speaker → T.schedule). */
export const SpeakerCard: React.FC = () => {
  const { u, s, landscape } = useLayout();

  if (landscape) {
    return (
      <AbsoluteFill style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 120 * u }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 44 * u, width: 820 * u }}>
          <BrandTag at={T.speaker + 6} size={24 * u} />
          <div style={{ fontFamily: FONT.serif, fontWeight: 800, fontSize: 84 * u, lineHeight: 1.05, color: C.ink }}>
            Social Media
            <br />
            Marketing Webinar
          </div>
          <div>
            <FreeBadge size={34 * u} />
          </div>
          <Signature size={64 * u} align="left" />
        </div>
        <PortraitArch w={560 * u} h={640 * u} />
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 44 * u * s }}>
      <BrandTag at={T.speaker + 6} size={26 * u * s} />
      <div style={{ position: "relative" }}>
        <PortraitArch w={680 * u * s} h={780 * u * s} />
        <div style={{ position: "absolute", left: 0, right: 0, bottom: -44 * u * s, display: "flex", justifyContent: "center" }}>
          <FreeBadge size={38 * u * s} />
        </div>
      </div>
      <div style={{ marginTop: 40 * u * s }}>
        <Signature size={76 * u * s} align="center" />
      </div>
    </AbsoluteFill>
  );
};
