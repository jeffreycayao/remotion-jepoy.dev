import { Audio } from "@remotion/media";
import type React from "react";
import { AbsoluteFill, Sequence, staticFile, useVideoConfig } from "remotion";
import { DualCTAEndcard } from "./components/DualCTAEndcard";
import { FounderFrustration } from "./components/FounderFrustration";
import { PancakeEcosystemStack } from "./components/PancakeEcosystemStack";
import { PatternInterruptHook } from "./components/PatternInterruptHook";
import { StaffEnablement } from "./components/StaffEnablement";
import { CONTENT } from "./content";
import { C } from "./design";
import { SoundFX } from "./SoundFX";

/* eslint-disable @remotion/from-0 -- Keep the voiceover visibly anchored at frame zero in Studio. */

export const PERSONAL_AD_DURATION = 1350;

/** The uncut master VO is mounted once at frame zero for all four formats. */
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
      <Sequence name="01 — Pattern interrupt" from={0} durationInFrames={240} premountFor={fps}>
        <PatternInterruptHook />
      </Sequence>
      <Sequence name="02 — Founder frustration" from={240} durationInFrames={300} premountFor={fps}>
        <FounderFrustration />
      </Sequence>
      <Sequence name="03 — Pancake ecosystem stack" from={540} durationInFrames={330} premountFor={fps}>
        <PancakeEcosystemStack />
      </Sequence>
      <Sequence name="04 — Staff enablement" from={870} durationInFrames={270} premountFor={fps}>
        <StaffEnablement />
      </Sequence>
      <Sequence name="05 — Dual CTA" from={1140} durationInFrames={210} premountFor={fps}>
        <DualCTAEndcard />
      </Sequence>
    </AbsoluteFill>
  );
};
