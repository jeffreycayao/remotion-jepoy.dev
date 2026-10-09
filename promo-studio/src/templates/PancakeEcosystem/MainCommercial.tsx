import { Audio } from "@remotion/media";
import type React from "react";
import { AbsoluteFill, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { AntiTheftDemo } from "./components/AntiTheftDemo";
import { DirectResponseCTA } from "./components/DirectResponseCTA";
import { EcosystemPipeline } from "./components/EcosystemPipeline";
import { OmnichannelChaos } from "./components/OmnichannelChaos";
import { CONTENT } from "./content";
import { C } from "./design";
import { SoundFX } from "./SoundFX";

export const PANCAKE_ECOSYSTEM_DURATION = 1050;

/** The source MP3 is pre-aligned to the four scenes as one 35-second WAV. */
const VoiceoverTrack: React.FC<{ fps: number }> = ({ fps }) => {
  return (
    <Audio
      name="Complete Taglish voiceover"
      src={staticFile(CONTENT.voiceoverAsset)}
      from={0}
      durationInFrames={PANCAKE_ECOSYSTEM_DURATION}
      premountFor={fps}
    />
  );
};

/** Four precise, non-overlapping scenes at 30 FPS. */
export const MainCommercial: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const cutFrame = [210, 510, 780].find((cut) => frame >= cut && frame < cut + 7);

  return (
    <AbsoluteFill style={{ backgroundColor: C.charcoal, overflow: "hidden" }}>
      <VoiceoverTrack fps={fps} />
      <SoundFX />
      <Sequence name="01 — Multi-channel grind" durationInFrames={210} premountFor={fps}>
        <OmnichannelChaos />
      </Sequence>
      <Sequence name="02 — Pancake Inbox + Botcake AI" from={210} durationInFrames={300} premountFor={fps}>
        <AntiTheftDemo />
      </Sequence>
      <Sequence name="03 — Webcake → POS → CRM" from={510} durationInFrames={270} premountFor={fps}>
        <EcosystemPipeline />
      </Sequence>
      <Sequence name="04 — Automatika setup + dual CTA" from={780} durationInFrames={270} premountFor={fps}>
        <DirectResponseCTA />
      </Sequence>
      {cutFrame !== undefined && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background: `linear-gradient(105deg, transparent 20%, rgba(213,250,0,${0.19 * (1 - (frame - cutFrame) / 7)}) 50%, transparent 78%)`,
            mixBlendMode: "screen",
          }}
        />
      )}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          width: (frame / PANCAKE_ECOSYSTEM_DURATION) * width,
          height: Math.max(3, height / 360),
          backgroundColor: C.lime,
          opacity: 0.7,
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
