import { Audio } from "@remotion/media";
import type React from "react";
import { AbsoluteFill, Sequence, staticFile, useVideoConfig } from "remotion";
import { DualCTAEndcard } from "./components/DualCTAEndcard";
import { PancakePillarsEngine } from "./components/PancakePillarsEngine";
import { PatternInterruptHook } from "./components/PatternInterruptHook";
import { RapidFirePains } from "./components/RapidFirePains";
import { CONTENT } from "./content";
import { C } from "./design";
import { SoundFX } from "./SoundFX";

/* eslint-disable @remotion/from-0 -- Explicit frame-zero audio anchor keeps the Studio waveform visible. */

export const FAST_AD_DURATION = 1050;

/** One uncut voiceover track drives every format. Scenes and SFX share its frame clock. */
export const MainCommercial: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: C.charcoal, overflow: "hidden" }}>
      <Audio
        name="Continuous master voiceover"
        src={staticFile(CONTENT.voiceoverAsset)}
        from={0}
        volume={1}
        premountFor={fps}
      />
      <SoundFX />
      <Sequence name="01 — Pattern interrupt" from={0} durationInFrames={210} premountFor={fps}>
        <PatternInterruptHook />
      </Sequence>
      <Sequence name="02 — Rapid-fire pains" from={210} durationInFrames={270} premountFor={fps}>
        <RapidFirePains />
      </Sequence>
      <Sequence name="03 — Pancake pillars engine" from={480} durationInFrames={300} premountFor={fps}>
        <PancakePillarsEngine />
      </Sequence>
      <Sequence name="04 — Dual CTA" from={780} durationInFrames={270} premountFor={fps}>
        <DualCTAEndcard />
      </Sequence>
    </AbsoluteFill>
  );
};
