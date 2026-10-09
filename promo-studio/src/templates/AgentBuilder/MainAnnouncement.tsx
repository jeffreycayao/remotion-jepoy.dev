import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, getStaticFiles, Sequence, staticFile } from "remotion";
import { VOICEOVER_FILES } from "./content";
import { Scene1Pain } from "./scenes/Scene1Pain";
import { Scene2Gift } from "./scenes/Scene2Gift";
import { Scene3Demo } from "./scenes/Scene3Demo";
import { Scene4Speed } from "./scenes/Scene4Speed";
import { Scene5CTA } from "./scenes/Scene5CTA";
import { SoundFX } from "./SoundFX";
import { C, T } from "./tokens";
import { Canvas, SceneFade } from "./ui";

export const AGENT_BUILDER_DURATION = T.total;

/** Mount <Audio> only once the voiceover is in public/ — a missing file would fail every render. */
const useVoiceover = () => {
  const names = new Set(getStaticFiles().map((f) => f.name.replace(/\\/g, "/")));
  return VOICEOVER_FILES.find((f) => names.has(f));
};

/** "AI Agent Instructions Builder — now FREE for Paid/Pro" announcement. ~43.8 s (T.total frames @ 30 fps), timed to the recorded voiceover, 16:9. */
export const MainAnnouncement: React.FC = () => {
  const voiceover = useVoiceover();
  const span = (from: number, to: number) => ({ from, durationInFrames: to - from });

  return (
    <AbsoluteFill style={{ backgroundColor: C.canvas }}>
      {voiceover && <Audio src={staticFile(voiceover)} />}
      <SoundFX />
      <Canvas>
        <Sequence name="1 — The prompt grind" {...span(T.pain, T.gift)}>
          <SceneFade fadeIn={0} fadeOut={8}>
            <Scene1Pain />
          </SceneFade>
        </Sequence>
        <Sequence name="2 — Pro gift" {...span(T.gift, T.demo)}>
          <SceneFade fadeIn={0}>
            <Scene2Gift />
          </SceneFade>
        </Sequence>
        <Sequence name="3 — Builder demo" {...span(T.demo, T.speed)}>
          <SceneFade>
            <Scene3Demo />
          </SceneFade>
        </Sequence>
        <Sequence name="4 — 5-minute transformation" {...span(T.speed, T.cta)}>
          <SceneFade fadeIn={6}>
            <Scene4Speed />
          </SceneFade>
        </Sequence>
        <Sequence name="5 — Login CTA" {...span(T.cta, T.total)}>
          <SceneFade fadeOut={0}>
            <Scene5CTA />
          </SceneFade>
        </Sequence>
      </Canvas>
    </AbsoluteFill>
  );
};
