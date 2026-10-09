import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { AutomatikaImplementorBadge } from "./components/AutomatikaImplementorBadge";
import { DualActionLaunchCTA } from "./components/DualActionLaunchCTA";
import { MultiNicheMatrix } from "./components/MultiNicheMatrix";
import { SpeedInterruptionHook } from "./components/SpeedInterruptionHook";
import { CONTENT } from "./content";
import { C, clamp, T } from "./design";
import { SoundFX } from "./SoundFX";

export const GO_LIVE_FAST_DURATION = T.total;

/** Quick push-in on entry so every cut lands with energy. */
const SceneIn: React.FC<{ children: React.ReactNode; skip?: boolean }> = ({ children, skip }) => {
  const frame = useCurrentFrame();
  const p = skip ? 1 : interpolate(frame, [0, 8], [0, 1], clamp);
  return <AbsoluteFill style={{ opacity: p, transform: `scale(${1.05 - 0.05 * p})`, filter: p < 1 ? `blur(${(1 - p) * 10}px)` : undefined }}>{children}</AbsoluteFill>;
};

/** Automatika "Go Live Fast": 35 s, one continuous voiceover, scenes cut to its phrase pauses. */
export const MainCommercial: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const span = (from: number, to: number) => ({ from, durationInFrames: to - from, premountFor: fps });
  const cut = [T.implementor, T.niches, T.cta].find((c) => frame >= c && frame < c + 7);

  return (
    <AbsoluteFill style={{ backgroundColor: C.charcoal }}>
      {/* Master voiceover: one unedited file, mounted once from frame 0 — never split across Sequences. */}
      <Audio src={staticFile(CONTENT.voiceoverAsset)} volume={1} />
      <SoundFX />

      <Sequence name="1 — Speed interruption hook" {...span(T.hook, T.implementor)}>
        <SceneIn skip>
          <SpeedInterruptionHook />
        </SceneIn>
      </Sequence>
      <Sequence name="2 — Automatika implementor" {...span(T.implementor, T.niches)}>
        <SceneIn>
          <AutomatikaImplementorBadge />
        </SceneIn>
      </Sequence>
      <Sequence name="3 — Multi-niche matrix" {...span(T.niches, T.cta)}>
        <SceneIn>
          <MultiNicheMatrix />
        </SceneIn>
      </Sequence>
      <Sequence name="4 — Dual-action launch CTA" {...span(T.cta, T.total)}>
        <SceneIn>
          <DualActionLaunchCTA />
        </SceneIn>
      </Sequence>

      {cut !== undefined && (
        <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen", background: `linear-gradient(105deg, transparent 20%, rgba(213,250,0,${0.22 * (1 - (frame - cut) / 7)}) 50%, transparent 80%)` }} />
      )}
      <div style={{ position: "absolute", left: 0, bottom: 0, height: Math.max(4, height / 320), width: (frame / T.total) * width, background: C.lime, opacity: 0.75 }} />
    </AbsoluteFill>
  );
};
