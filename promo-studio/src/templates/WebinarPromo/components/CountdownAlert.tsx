import type React from "react";
import {interpolate, spring, useCurrentFrame, useVideoConfig} from "remotion";

const clamp = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;
const gold = "#FF9E16";
const orange = "#FF5722";

/** A five-second client-review clock for the opening 240-frame hook. */
export const CountdownAlert: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const portrait = height > width * 1.08;
  const boardWidth = Math.min(portrait ? 850 : width <= 1080 ? 780 : 650, width - 112);
  const boardHeight = Math.round(boardWidth * 0.54);
  const clockSize = Math.round(boardWidth * 0.305);
  const inset = Math.round(boardWidth * 0.046);

  // Frames 28–178 are the exact five-second countdown at 30 fps.
  const elapsed = Math.max(0, Math.min(150, frame - 28));
  const remaining = Math.max(0, 5 - Math.floor(elapsed / 30));
  const progress = 1 - elapsed / 150;
  const flash = frame >= 178 && frame < 196 && frame % 4 < 2;
  const shakeIntensity = interpolate(frame, [0, 80, 160, 178, 205], [0.5, 1.5, 3, 9, 1.2], clamp);
  const shakeX = Math.sin(frame * 2.75) * shakeIntensity;
  const shakeY = Math.cos(frame * 3.61) * shakeIntensity * 0.44;
  const stampIn = spring({frame: frame - 179, fps, config: {damping: 10, stiffness: 210}});
  const boardIn = spring({frame, fps, config: {damping: 15, stiffness: 130}});
  const circumference = 2 * Math.PI * 43;

  return (
    <div
      style={{
        position: "relative",
        width: boardWidth,
        height: boardHeight,
        boxSizing: "border-box",
        overflow: "hidden",
        flexShrink: 0,
        borderRadius: Math.round(boardWidth * 0.026),
        border: `2px solid ${frame >= 178 ? "rgba(255,87,34,0.80)" : "rgba(255,158,22,0.62)"}`,
        background: "linear-gradient(145deg, #211A12 0%, #111111 58%, #1A1612 100%)",
        boxShadow: flash
          ? "0 0 95px rgba(255,87,34,0.40), inset 0 0 70px rgba(255,87,34,0.11)"
          : "0 22px 75px rgba(0,0,0,0.5), 0 0 48px rgba(255,158,22,0.14), inset 0 0 60px rgba(255,158,22,0.04)",
        opacity: boardIn,
        scale: 0.94 + boardIn * 0.06,
        translate: `${shakeX}px ${shakeY + (1 - boardIn) * 32}px`,
      }}
    >
      {/* Scanlines give the alert a rough poster texture without time-based CSS. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "repeating-linear-gradient(0deg, transparent 0px, transparent 4px, rgba(255,158,22,0.035) 5px, transparent 6px)",
          opacity: 0.9,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: inset,
          right: inset,
          height: 4,
          background: `linear-gradient(90deg, transparent, ${gold}, ${orange}, transparent)`,
          boxShadow: `0 0 22px ${gold}`,
        }}
      />

      <div
        style={{
          position: "absolute",
          inset,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: gold,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: Math.round(boardWidth * 0.026),
            fontWeight: 700,
            letterSpacing: "0.13em",
          }}
        >
          <span>CLIENT REVIEW</span>
          <span style={{color: frame >= 178 ? orange : "#F6F1E6"}}>● LIVE</span>
        </div>

        <div style={{display: "flex", alignItems: "center", gap: Math.round(boardWidth * 0.04)}}>
          <div
            style={{
              position: "relative",
              width: clockSize,
              height: clockSize,
              flexShrink: 0,
              filter: `drop-shadow(0 0 ${flash ? 34 : 17}px ${frame >= 178 ? orange : gold})`,
            }}
          >
            <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">
              <circle cx="50" cy="50" r="43" fill="#17120F" stroke="rgba(255,158,22,0.17)" strokeWidth="5" />
              <circle
                cx="50"
                cy="50"
                r="43"
                fill="none"
                stroke={frame >= 178 ? orange : gold}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - progress)}
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: frame >= 178 ? orange : "#FFFFFF",
                fontFamily: "Impact, 'Arial Black', sans-serif",
                fontSize: Math.round(clockSize * 0.64),
                lineHeight: 1,
                textShadow: frame >= 178 ? `0 0 25px ${orange}` : `0 0 25px rgba(255,158,22,0.65)`,
              }}
            >
              {remaining}
            </div>
          </div>
          <div style={{minWidth: 0, display: "flex", flexDirection: "column", gap: Math.round(boardWidth * 0.018)}}>
            <div
              style={{
                color: gold,
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 700,
                fontSize: Math.round(boardWidth * 0.021),
                letterSpacing: "0.13em",
              }}
            >
              FIVE SECONDS
            </div>
            <div
              style={{
                color: "#FFFFFF",
                fontFamily: "Impact, 'Arial Black', sans-serif",
                fontSize: Math.round(boardWidth * 0.084),
                lineHeight: 0.94,
                letterSpacing: "0.012em",
                textShadow: "2px 3px 0 rgba(255,87,34,0.38)",
              }}
            >
              ONE WRONG
              <br />
              MOVE.
            </div>
            <div
              style={{
                color: "#F6F1E6",
                fontFamily: "Inter, Arial, sans-serif",
                fontSize: Math.round(boardWidth * 0.024),
                fontWeight: 600,
                letterSpacing: "0.035em",
              }}
            >
              Ekis agad sa client.
            </div>
          </div>
        </div>

        <div style={{display: "flex", alignItems: "center", gap: Math.round(boardWidth * 0.018)}}>
          <div
            style={{
              color: "#F6F1E6",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: Math.round(boardWidth * 0.019),
              fontWeight: 700,
              whiteSpace: "nowrap",
            }}
          >
            TIME LEFT
          </div>
          <div style={{display: "flex", flex: 1, gap: Math.round(boardWidth * 0.008)}}>
            {Array.from({length: 5}, (_, index) => (
              <div
                key={index}
                style={{
                  height: Math.round(boardWidth * 0.012),
                  flex: 1,
                  borderRadius: 3,
                  background: progress > index / 5 ? (frame >= 150 ? orange : gold) : "rgba(246,241,230,0.13)",
                  boxShadow: progress > index / 5 ? `0 0 10px ${frame >= 150 ? orange : gold}` : "none",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          zIndex: 3,
          top: "46%",
          left: "48%",
          width: "48%",
          boxSizing: "border-box",
          padding: `${Math.round(boardWidth * 0.009)}px ${Math.round(boardWidth * 0.02)}px`,
          border: `${Math.max(3, Math.round(boardWidth * 0.008))}px solid ${orange}`,
          borderRadius: 7,
          color: orange,
          background: "rgba(22,17,14,0.92)",
          boxShadow: `0 0 28px rgba(255,87,34,0.64), inset 0 0 16px rgba(255,87,34,0.20)`,
          fontFamily: "Impact, 'Arial Black', sans-serif",
          fontSize: Math.round(boardWidth * 0.066),
          lineHeight: 1,
          letterSpacing: "0.035em",
          textAlign: "center",
          opacity: stampIn,
          scale: 1.9 - stampIn * 0.9,
          rotate: "-11deg",
          translate: "-50% -50%",
        }}
      >
        REJECTED
      </div>
    </div>
  );
};
