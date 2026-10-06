import React from "react";
import { AbsoluteFill, Easing, interpolate, random, Sequence, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COPY, TOASTS } from "./content";
import { NotificationChaos } from "./NotificationChaos";
import { bezierPath, bezierPoint, connect, PipelineGraph } from "./PipelineGraph";
import { RevealText } from "./RevealText";
import { C, clamp, FONT, T, useFrameLayout } from "./tokens";

export const ACTION_SUITE_DURATION = T.total;

/** Charcoal canvas, faint dot grid and two slow olive/lime glows. Runs under every act. */
const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, u } = useFrameLayout();
  const calm = interpolate(frame, [T.graphIn, T.zoom, T.cta], [0.6, 1, 1.3], clamp);
  const blob = (x: number, y: number, color: string, size: number, phase: number) => (
    <div
      style={{
        position: "absolute",
        left: x + Math.sin(frame / 70 + phase) * 60 * u - size / 2,
        top: y + Math.cos(frame / 90 + phase) * 50 * u - size / 2,
        width: size,
        height: size,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${color} 0%, rgba(0,0,0,0) 65%)`,
        opacity: 0.18 * calm,
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
      {blob(width * 0.2, height * 0.25, C.olive, Math.max(width, height) * 0.8, 0)}
      {blob(width * 0.85, height * 0.8, C.lime, Math.max(width, height) * 0.55, 2)}
    </AbsoluteFill>
  );
};

/** Act 2 overlay: "Every lead sorted. Every conversation routed. Instantly." */
const RouteHeadline: React.FC = () => {
  const frame = useCurrentFrame();
  const { u, vertical, safeTop } = useFrameLayout();
  const out = interpolate(frame, [T.zoom - 25 - T.routeCopy, T.zoom - T.routeCopy], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: vertical ? safeTop : 78 * u, opacity: out }}>
      <RevealText
        text={COPY.routeHeadline}
        accent={["Instantly."]}
        style={{
          fontFamily: FONT.head,
          fontWeight: 800,
          fontSize: (vertical ? 60 : 52) * u,
          lineHeight: 1.12,
          color: C.cream,
          textAlign: "center",
          maxWidth: (vertical ? 960 : 1750) * u,
        }}
      />
    </AbsoluteFill>
  );
};

/** Renders "{…}" spans of a toast line in JetBrains Mono + accent colour. */
const Highlighted: React.FC<{ text: string; color: string }> = ({ text, color }) => (
  <>
    {text.split(/\{([^}]+)\}/).map((part, i) =>
      i % 2 ? (
        <span key={i} style={{ fontFamily: FONT.mono, fontWeight: 600, color }}>
          {part}
        </span>
      ) : (
        part
      ),
    )}
  </>
);

const Toast: React.FC<{ delay: number; tag: string; text: string; tone: "lime" | "blue" }> = ({ delay, tag, text, tone }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u, vertical } = useFrameLayout();
  const drop = spring({ frame: frame - delay, fps, config: { damping: 13, stiffness: 140 } });
  const accent = tone === "lime" ? C.lime : C.blue;
  return (
    <div
      style={{
        display: "flex",
        gap: 18 * u,
        alignItems: "center",
        background: "rgba(45, 41, 35, 0.98)",
        border: `${1.5 * u}px solid ${C.border}`,
        borderLeft: `${6 * u}px solid ${accent}`,
        borderRadius: 18 * u,
        padding: `${18 * u}px ${24 * u}px`,
        boxShadow: `0 ${18 * u}px ${44 * u}px rgba(0,0,0,0.5)`,
        opacity: drop,
        translate: `0px ${(1 - drop) * -70 * u}px`,
      }}
    >
      <div
        style={{
          fontFamily: FONT.mono,
          fontWeight: 600,
          fontSize: (vertical ? 22 : 18) * u,
          color: C.canvas,
          background: accent,
          borderRadius: 8 * u,
          padding: `${6 * u}px ${10 * u}px`,
          whiteSpace: "nowrap",
        }}
      >
        {tag}
      </div>
      <div style={{ fontFamily: FONT.body, fontWeight: 500, fontSize: (vertical ? 30 : 25) * u, lineHeight: 1.3, color: C.cream }}>
        <Highlighted text={text} color={accent} />
      </div>
    </div>
  );
};

/** Act 3 overlay: result toasts + "Automate the mundane…" while the camera pushes in. */
const ResultOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  const { u, vertical, safeTop, safeBottom } = useFrameLayout();
  const out = interpolate(frame, [T.graphOut - T.zoom, T.graphOut - T.zoom + 20], [1, 0], clamp);
  const scrim = interpolate(frame, [0, 40], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ opacity: out }}>
      {/* Shade the side the camera moved away from so the copy has a calm surface. */}
      <AbsoluteFill
        style={{
          opacity: scrim,
          background: vertical
            ? "linear-gradient(180deg, rgba(39,35,27,0.92) 0%, rgba(39,35,27,0) 24%, rgba(39,35,27,0) 74%, rgba(39,35,27,0.95) 84%)"
            : "linear-gradient(90deg, rgba(39,35,27,0.97) 0%, rgba(39,35,27,0.85) 42%, rgba(39,35,27,0) 60%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: (vertical ? 40 : 110) * u,
          top: vertical ? safeTop : 260 * u,
          width: (vertical ? 1000 : 820) * u,
          display: "flex",
          flexDirection: "column",
          gap: 18 * u,
        }}
      >
        {TOASTS.map((t, i) => (
          <Toast key={t.tag} delay={30 + i * 50} {...t} />
        ))}
      </div>
      <div
        style={{
          position: "absolute",
          left: (vertical ? 40 : 110) * u,
          bottom: vertical ? safeBottom * 0.7 : 110 * u,
          width: (vertical ? 1000 : 820) * u,
        }}
      >
        <RevealText
          text={COPY.resultHeadline}
          delay={70}
          accent={["matters."]}
          style={{ fontFamily: FONT.head, fontWeight: 800, fontSize: (vertical ? 62 : 60) * u, lineHeight: 1.1, color: C.cream, textAlign: vertical ? "center" : "left" }}
        />
      </div>
    </AbsoluteFill>
  );
};

/** Act 4: lime ActionSuite badge fed by converging flow lines, headline, URL pill. */
const CallToAction: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { width, height, u, vertical } = useFrameLayout();
  const badgeIn = spring({ frame: frame - 8, fps, config: { damping: 12, stiffness: 120 } });
  const pillIn = spring({ frame: frame - 48, fps, config: { damping: 14 } });
  const linesIn = interpolate(frame, [0, 35], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const centre = { x: width / 2, y: height * (vertical ? 0.4 : 0.36) };
  const breathe = 1 + Math.sin(frame / 12) * 0.015;

  // Eight curves from the frame edges into the badge, each carrying a lime particle.
  const curves = Array.from({ length: 8 }, (_, i) => {
    const left = i % 2 === 0;
    const y = height * (0.1 + (0.8 * Math.floor(i / 2)) / 3);
    return connect({ x: left ? -40 * u : width + 40 * u, y }, { x: centre.x + (left ? -1 : 1) * 160 * u, y: centre.y });
  });

  return (
    <AbsoluteFill style={{ opacity: interpolate(frame, [0, 15], [0, 1], clamp) }}>
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        {curves.map((c, i) => {
          const speed = 1.6 + random(`cta-${i}`) * 0.6;
          const t = ((frame * speed + random(`cta-o-${i}`) * 100) % 100) / 100;
          const q = bezierPoint(c, t);
          return (
            <g key={i}>
              <path d={bezierPath(c)} fill="none" stroke={C.olive} strokeWidth={2 * u} opacity={0.55} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - linesIn} />
              <circle cx={q.x} cy={q.y} r={5 * u} fill={C.lime} opacity={linesIn} />
            </g>
          );
        })}
      </svg>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: (vertical ? 56 : 44) * u, padding: `0 ${60 * u}px` }}>
        <div
          style={{
            fontFamily: FONT.head,
            fontWeight: 800,
            fontSize: (vertical ? 104 : 96) * u,
            letterSpacing: -2 * u,
            color: C.canvas,
            background: C.lime,
            borderRadius: 32 * u,
            padding: `${18 * u}px ${48 * u}px`,
            boxShadow: `0 0 ${90 * u}px rgba(213,250,0,${0.35 * breathe})`,
            opacity: badgeIn,
            scale: `${(0.6 + 0.4 * badgeIn) * breathe}`,
          }}
        >
          {COPY.brand}
        </div>
        <div style={{ fontFamily: FONT.head, fontWeight: 800, fontSize: (vertical ? 62 : 66) * u, lineHeight: 1.12, color: C.cream, textAlign: "center" }}>
          {COPY.ctaHeadline.map((line, i) => (
            <RevealText key={line} text={line} delay={22 + i * 14} />
          ))}
        </div>
        <div
          style={{
            fontFamily: FONT.body,
            fontWeight: 600,
            fontSize: (vertical ? 40 : 36) * u,
            color: C.canvas,
            background: C.lime,
            borderRadius: 999,
            padding: `${18 * u}px ${44 * u}px`,
            opacity: pillIn,
            translate: `0px ${(1 - pillIn) * 30 * u}px`,
          }}
        >
          {COPY.url}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** ActionSuite — 30 s promo: omnichannel chaos → automated calm. 900 frames @ 30 fps. */
export const ActionSuitePromo: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.canvas }}>
    <Backdrop />
    <Sequence name="Act 1 — Chaos" durationInFrames={T.chaosOut + 30}>
      <NotificationChaos />
    </Sequence>
    <Sequence name="Act 2–3 — Pipeline graph" from={T.graphIn} durationInFrames={T.graphOut + 30 - T.graphIn}>
      <PipelineGraph />
    </Sequence>
    <Sequence name="Act 2 — Headline" from={T.routeCopy} durationInFrames={T.zoom - T.routeCopy}>
      <RouteHeadline />
    </Sequence>
    <Sequence name="Act 3 — Result" from={T.zoom} durationInFrames={T.graphOut + 20 - T.zoom}>
      <ResultOverlay />
    </Sequence>
    <Sequence name="Act 4 — CTA" from={T.cta}>
      <CallToAction />
    </Sequence>
  </AbsoluteFill>
);
