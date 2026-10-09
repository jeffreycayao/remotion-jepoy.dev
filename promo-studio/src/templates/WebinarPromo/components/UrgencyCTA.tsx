import React from "react";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { loadFont as loadSora } from "@remotion/google-fonts/Sora";
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const HEAD = loadSora("normal", { weights: ["700", "800"], subsets: ["latin"] }).fontFamily;
const BODY = loadInter("normal", { weights: ["500", "600", "700"], subsets: ["latin"] }).fontFamily;
const MONO = loadMono("normal", { weights: ["600", "700"], subsets: ["latin"] }).fontFamily;

const GOLD = "#FF9E16";
const AMBER = "#F57C00";
const CREAM = "#F6F1E6";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Fixed positions keep the dust stable when Remotion renders frames out of order.
const dust = Array.from({ length: 44 }, (_, index) => ({
  x: (index * 173 + 41) % 100,
  y: (index * 271 + 17) % 100,
  radius: index % 7 === 0 ? 3 : 1.3,
  phase: index * 0.71,
}));

/** Frames 900–1049: final registration end card. `frame` is local to its Sequence. */
export const UrgencyCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const aspect = width / height;
  const wide = aspect > 1.4;
  const tall = aspect < 0.7;
  const portrait = aspect < 0.9 && !tall;
  const contentWidth = wide ? Math.min(width - 240, 1500) : width - 128;

  const entrance = spring({
    frame: frame - 4,
    fps,
    config: { damping: 16, stiffness: 110 },
  });
  const headlineIn = spring({
    frame: frame - 10,
    fps,
    config: { damping: 15, stiffness: 120 },
  });
  const buttonIn = spring({
    frame: frame - 24,
    fps,
    config: { damping: 11, stiffness: 150 },
  });
  const promptIn = interpolate(frame, [39, 57], [0, 1], clamp);
  const pulse = 1 + (frame >= 47 ? 0.025 * Math.sin((frame - 47) / 6) : 0);
  const glow = 0.44 + (frame >= 47 ? 0.16 * (1 + Math.sin((frame - 47) / 6)) / 2 : 0);
  const shine = interpolate(frame % 70, [5, 29], [-75, 130], clamp);

  const headlineSize = wide ? 120 : tall ? 112 : portrait ? 85 : 78;
  const ctaSize = wide ? 43 : tall ? 35 : portrait ? 32 : 31;
  const sectionGap = wide ? 24 : tall ? 36 : 23;
  const ripple = (offset: number) => {
    const elapsed = frame - 47 - offset;
    const progress = elapsed < 0 ? 0 : (elapsed % 58) / 58;
    return {
      opacity: elapsed < 0 ? 0 : (1 - progress) * 0.7,
      scale: 1 + progress * 0.28,
    };
  };

  return (
    <AbsoluteFill
      style={{
        background: "radial-gradient(circle at 50% 47%, #292014 0%, #171410 48%, #111111 100%)",
        overflow: "hidden",
      }}
    >
      <AbsoluteFill
        style={{
          backgroundImage:
            "radial-gradient(circle at 15% 35%, rgba(255,158,22,0.18), transparent 34%), radial-gradient(circle at 85% 75%, rgba(245,124,0,0.13), transparent 35%), repeating-linear-gradient(115deg, transparent 0px, transparent 9px, rgba(255,158,22,0.018) 10px, transparent 11px)",
        }}
      />
      {dust.map((particle, index) => (
        <div
          key={index}
          style={{
            position: "absolute",
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.radius * 2,
            height: particle.radius * 2,
            borderRadius: "50%",
            background: GOLD,
            boxShadow: `0 0 ${particle.radius * 7}px ${GOLD}`,
            opacity: 0.13 + 0.17 * (1 + Math.sin(frame / 22 + particle.phase)) / 2,
            translate: `0px ${Math.sin(frame / 35 + particle.phase) * 9}px`,
          }}
        />
      ))}

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: tall ? "140px 64px 150px" : wide ? "70px 120px" : "60px 64px",
          gap: sectionGap,
          textAlign: "center",
        }}
      >
        <Img
          src={staticFile("projects/the-happy-freelancers-webinars/logos/happy-freelancers-logo.webp")}
          style={{
            width: wide ? 430 : tall ? 480 : portrait ? 390 : 370,
            height: "auto",
            objectFit: "contain",
            filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.48))",
            opacity: entrance,
            translate: `0px ${(1 - entrance) * 20}px`,
          }}
        />

        <div
          style={{
            width: contentWidth,
            fontFamily: HEAD,
            fontWeight: 800,
            fontSize: headlineSize,
            lineHeight: 0.98,
            letterSpacing: -3.5,
            color: "#FFFFFF",
            textShadow: "0 6px 30px rgba(0,0,0,0.48)",
            opacity: headlineIn,
            translate: `0px ${(1 - headlineIn) * 58}px`,
            scale: 0.9 + 0.1 * headlineIn,
          }}
        >
          LAST CALL.
          <br />
          <span style={{ color: GOLD, textShadow: "0 0 58px rgba(255,158,22,0.35)" }}>GRAB YOUR SLOT.</span>
        </div>

        <div
          style={{
            fontFamily: MONO,
            fontWeight: 700,
            fontSize: wide ? 28 : tall ? 25 : 22,
            letterSpacing: 1.4,
            color: CREAM,
            opacity: interpolate(frame, [22, 38], [0, 1], clamp),
          }}
        >
          OCT 08 + 09, 2026 <span style={{ color: GOLD }}>•</span> 100% FREE WEBINARS
        </div>

        <div
          style={{
            position: "relative",
            marginTop: tall ? 34 : 17,
            width: "fit-content",
            maxWidth: "100%",
            opacity: buttonIn,
            scale: (0.66 + 0.34 * buttonIn) * pulse,
          }}
        >
          {[0, 29].map((offset) => {
            const ring = ripple(offset);
            return (
              <div
                key={offset}
                style={{
                  position: "absolute",
                  inset: -10,
                  border: `4px solid ${GOLD}`,
                  borderRadius: 999,
                  opacity: ring.opacity,
                  scale: ring.scale,
                  pointerEvents: "none",
                }}
              />
            );
          })}
          <div
            style={{
              position: "relative",
              borderRadius: 999,
              border: "2px solid #FFD583",
              background: `linear-gradient(110deg, ${AMBER}, ${GOLD} 55%, #FFC04D)`,
              boxShadow: `0 0 80px rgba(255,158,22,${glow}), 0 18px 40px rgba(0,0,0,0.45), inset 0 2px 8px rgba(255,255,255,0.35)`,
              padding: `${wide ? 27 : tall ? 31 : 24}px ${wide ? 64 : 43}px`,
              overflow: "hidden",
              whiteSpace: "nowrap",
              fontFamily: MONO,
              fontWeight: 700,
              fontSize: ctaSize,
              letterSpacing: wide ? 1.5 : 0.2,
              color: "#1A1612",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: -20,
                bottom: -20,
                left: `${shine}%`,
                width: "18%",
                rotate: "-18deg",
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)",
                pointerEvents: "none",
              }}
            />
            <span style={{ position: "relative" }}>REGISTER VIA THE LINK IN CAPTION</span>
          </div>
        </div>

        <div
          style={{
            fontFamily: BODY,
            fontWeight: 600,
            fontSize: wide ? 33 : tall ? 30 : 27,
            color: CREAM,
            opacity: promptIn,
            translate: `0px ${(1 - promptIn) * 16}px`,
          }}
        >
          Limitado ang seats. Click the link now!
        </div>

        <div
          style={{
            height: 2,
            width: wide ? 490 : 350,
            maxWidth: "55%",
            background: "linear-gradient(90deg, transparent, rgba(255,158,22,0.8), transparent)",
            marginTop: tall ? 24 : 8,
            opacity: interpolate(frame, [54, 75], [0, 1], clamp),
          }}
        />
        <div
          style={{
            fontFamily: MONO,
            fontWeight: 600,
            fontSize: wide ? 20 : 18,
            letterSpacing: 1.2,
            color: "rgba(246,241,230,0.55)",
            opacity: interpolate(frame, [60, 76], [0, 1], clamp),
          }}
        >
          TWO NIGHTS <span style={{ color: GOLD }}>{"//"}</span> TWO INDUSTRY COACHES
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
