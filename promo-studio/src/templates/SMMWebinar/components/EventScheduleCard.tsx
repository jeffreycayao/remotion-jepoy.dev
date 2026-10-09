import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, clamp, FONT, T, useLayout } from "../tokens";

const ease = Easing.bezier(0.16, 1, 0.3, 1);

export const AUDIENCE = ["Aspiring Freelancers", "Career Shifters", "Business Owners"];
/** Frames where each audience chip pops (one soft tap each). */
export const CHIP_AT = AUDIENCE.map((_, i) => T.schedule + 6 + i * 12);
/** Frames where each planner tile lands. */
export const TILE_AT = Array.from({ length: 7 }, (_, i) => T.planner + i * 5);

const CalendarIcon: React.FC<{ s: number }> = ({ s }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={C.terracotta} strokeWidth={2} strokeLinecap="round">
    <rect x="3" y="5" width="18" height="16" rx="3" />
    <path d="M3 10h18M8 3v4M16 3v4" />
  </svg>
);

const ClockIcon: React.FC<{ s: number }> = ({ s }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={C.terracotta} strokeWidth={2} strokeLinecap="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

const Chip: React.FC<{ at: number; label: string; size: number }> = ({ at, label, size }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: frame - at, fps, config: { damping: 12, stiffness: 170 } });
  return (
    <div
      style={{
        padding: `${size * 0.45}px ${size * 0.95}px`,
        borderRadius: 999,
        background: C.white,
        border: `${Math.max(1, size * 0.08)}px solid ${C.sand}`,
        fontFamily: FONT.body,
        fontWeight: 600,
        fontSize: size,
        color: C.ink,
        scale: pop,
        opacity: Math.min(1, pop * 2),
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </div>
  );
};

/** The "first seven days of content" planner: seven tiles that slide in one after another. */
const Planner: React.FC<{ tile: number; columns: number }> = ({ tile, columns }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, ${tile}px)`, gap: tile * 0.14 }}>
      {TILE_AT.map((at, i) => {
        const land = spring({ frame: frame - at, fps, config: { damping: 15, stiffness: 140 } });
        const done = frame >= T.date + i * 3;
        return (
          <div
            key={i}
            style={{
              width: tile,
              height: tile * 1.18,
              borderRadius: tile * 0.14,
              background: i === 0 ? C.terracotta : C.white,
              border: i === 0 ? "none" : `${Math.max(1, tile * 0.02)}px solid ${C.sand}`,
              boxShadow: `0 ${tile * 0.05}px ${tile * 0.16}px rgba(45, 24, 16, 0.08)`,
              padding: tile * 0.12,
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
              gap: tile * 0.07,
              opacity: land,
              translate: `0 ${(1 - land) * tile * 0.6}px`,
            }}
          >
            <div style={{ fontFamily: FONT.body, fontWeight: 700, fontSize: tile * 0.13, letterSpacing: "0.12em", color: i === 0 ? C.peach : C.gold }}>
              DAY
            </div>
            <div style={{ fontFamily: FONT.serif, fontWeight: 800, fontSize: tile * 0.38, lineHeight: 1, color: i === 0 ? C.white : C.ink }}>
              {i + 1}
            </div>
            <div style={{ flex: 1 }} />
            {[0.9, 0.6].map((w, k) => (
              <div
                key={k}
                style={{
                  height: tile * 0.05,
                  width: `${w * 100}%`,
                  borderRadius: 99,
                  background: i === 0 ? "rgba(255,255,255,0.55)" : done ? C.gold : C.peach,
                }}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
};

/** Date and time card — the date lands on "October nine", the time on "seven to ten PM". */
const DateCard: React.FC<{ size: number }> = ({ size }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const snap = spring({ frame: frame - T.date, fps, config: { damping: 14, stiffness: 180 } });
  const time = interpolate(frame, [T.time, T.time + 14], [0, 1], { ...clamp, easing: ease });
  const row: React.CSSProperties = { display: "flex", alignItems: "center", gap: size * 0.5 };
  return (
    <div
      style={{
        background: C.white,
        borderRadius: size * 0.6,
        padding: `${size * 0.8}px ${size * 1.1}px`,
        boxShadow: `0 ${size * 0.4}px ${size * 1.4}px rgba(45, 24, 16, 0.12)`,
        borderLeft: `${size * 0.22}px solid ${C.terracotta}`,
        display: "flex",
        flexDirection: "column",
        gap: size * 0.45,
        scale: interpolate(snap, [0, 1], [0.85, 1]),
        opacity: Math.min(1, snap * 2),
      }}
    >
      <div style={row}>
        <CalendarIcon s={size * 1.15} />
        <div style={{ fontFamily: FONT.serif, fontWeight: 800, fontSize: size * 1.2, color: C.ink }}>October 9, 2026</div>
      </div>
      <div style={{ ...row, opacity: time, translate: `${(1 - time) * -size}px 0` }}>
        <ClockIcon s={size * 1.15} />
        <div style={{ fontFamily: FONT.body, fontWeight: 600, fontSize: size, color: C.ink }}>
          7:00–10:00 PM <span style={{ color: C.terracotta }}>PHT</span>
        </div>
      </div>
    </div>
  );
};

const Heading: React.FC<{ size: number; align: "left" | "center" }> = ({ size, align }) => {
  const frame = useCurrentFrame();
  const a = interpolate(frame, [T.schedule, T.schedule + 18], [0, 1], { ...clamp, easing: ease });
  const b = interpolate(frame, [T.planner - 6, T.planner + 12], [0, 1], { ...clamp, easing: ease });
  return (
    <div style={{ textAlign: align, lineHeight: 1.08 }}>
      <div style={{ fontFamily: FONT.serif, fontWeight: 800, fontSize: size, color: C.ink, opacity: a, translate: `0 ${(1 - a) * 30}px` }}>
        Learn the basics.
      </div>
      <div style={{ fontFamily: FONT.serif, fontStyle: "italic", fontWeight: 500, fontSize: size * 0.82, color: C.terracotta, opacity: b, translate: `0 ${(1 - b) * 30}px` }}>
        Plan your first 7 days of content.
      </div>
    </div>
  );
};

/** Scene 3 (T.schedule → T.cta). */
export const EventScheduleCard: React.FC = () => {
  const { u, s, tall, landscape } = useLayout();

  if (landscape) {
    return (
      <AbsoluteFill style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 110 * u }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 46 * u, width: 760 * u }}>
          <Heading size={74 * u} align="left" />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16 * u }}>
            {AUDIENCE.map((label, i) => (
              <Chip key={label} at={CHIP_AT[i]} label={label} size={26 * u} />
            ))}
          </div>
          <div style={{ alignSelf: "flex-start" }}>
            <DateCard size={40 * u} />
          </div>
        </div>
        <Planner tile={170 * u} columns={4} />
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 54 * u * s, padding: `0 ${60 * u}px` }}>
      <Heading size={80 * u * s} align="center" />
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 14 * u, maxWidth: 960 * u }}>
        {AUDIENCE.map((label, i) => (
          <Chip key={label} at={CHIP_AT[i]} label={label} size={28 * u * s} />
        ))}
      </div>
      {/* 9:16 has the height for a 4 + 3 grid of bigger tiles; shorter frames keep one row. */}
      <Planner tile={tall ? 190 * u : 118 * u} columns={tall ? 4 : 7} />
      <DateCard size={44 * u * s} />
    </AbsoluteFill>
  );
};
