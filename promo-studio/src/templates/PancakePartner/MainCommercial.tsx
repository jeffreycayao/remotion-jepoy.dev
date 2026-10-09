import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, getStaticFiles, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { CTALockup } from "./components/CTALockup";
import { PancakePillars } from "./components/PancakePillars";
import { SetupHeadache } from "./components/SetupHeadache";
import { TrainingAndProof } from "./components/TrainingAndProof";
import { VOICEOVER_FILES } from "./content";
import { SoundFX } from "./SoundFX";
import { C, clamp, T } from "./tokens";
import { Canvas, CutStreak, SceneFade, Vignette } from "./ui";

export const PANCAKE_PARTNER_DURATION = T.total;

/** Mount <Audio> only once the voiceover is in public/ — a missing file would fail every render. */
const useVoiceover = () => {
  const names = new Set(getStaticFiles().map((f) => f.name.replace(/\\/g, "/")));
  return VOICEOVER_FILES.find((f) => names.has(f));
};

/** Automatika — Official Partner of Pancake Philippines. 32 s (T.total frames @ 30 fps) timed to the recorded voiceover, all 4 formats. */
export const MainCommercial: React.FC = () => {
  const voiceover = useVoiceover();
  const frame = useCurrentFrame();
  const span = (from: number, to: number) => ({ from, durationInFrames: to - from });

  return (
    <AbsoluteFill style={{ backgroundColor: C.canvas }}>
      {voiceover && <Audio src={staticFile(voiceover)} />}
      <SoundFX />
      <Canvas>
        <Sequence name="1 — Setup headache" {...span(T.headache, T.partner)}>
          <SceneFade fadeIn={0} fadeOut={8}>
            <SetupHeadache />
          </SceneFade>
        </Sequence>
        <Sequence name="2 — Official partner + 4 pillars" {...span(T.partner, T.proof)}>
          <SceneFade fadeIn={6}>
            <PancakePillars />
          </SceneFade>
        </Sequence>
        <Sequence name="3 — Training + 90+ proof" {...span(T.proof, T.cta)}>
          <SceneFade>
            <TrainingAndProof />
          </SceneFade>
        </Sequence>
        <Sequence name="4 — Dual CTA" {...span(T.cta, T.total)}>
          <SceneFade fadeOut={0}>
            <CTALockup />
          </SceneFade>
        </Sequence>
        {/* Vignette on the dark scenes only — on the cream opener it would just grey the edges */}
        <AbsoluteFill style={{ opacity: interpolate(frame, [T.partner - 8, T.partner + 4], [0, 1], clamp) }}>
          <Vignette />
        </AbsoluteFill>
        {[T.partner, T.proof, T.cta].map((cut) => (
          <CutStreak key={cut} t={frame - cut} />
        ))}
      </Canvas>
    </AbsoluteFill>
  );
};
