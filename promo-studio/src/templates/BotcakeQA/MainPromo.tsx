import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, getStaticFiles, Sequence, staticFile } from "remotion";
import { VOICEOVER_FILES } from "./content";
import { Scene1RoboticVsNLP } from "./scenes/Scene1RoboticVsNLP";
import { Scene2SidePanelQA } from "./scenes/Scene2SidePanelQA";
import { Scene3TestMatrix } from "./scenes/Scene3TestMatrix";
import { Scene4CTA } from "./scenes/Scene4CTA";
import { SoundFX } from "./SoundFX";
import { C, T } from "./tokens";
import { Backdrop, SceneFade } from "./ui";

export const BOTCAKE_QA_DURATION = T.total;

/** Mount <Audio> only once the voiceover is in public/ — a missing file would fail every render. */
const useVoiceover = () => {
  const names = new Set(getStaticFiles().map((f) => f.name.replace(/\\/g, "/")));
  return VOICEOVER_FILES.find((f) => names.has(f));
};

/** ActionSuite — Botcake AI Prompt Architect & Automated QA Runner. ~34.7 s (T.total frames @ 30 fps) timed to the recorded voiceover, any of the 4 formats. */
export const MainPromo: React.FC = () => {
  const voiceover = useVoiceover();
  const span = (from: number, to: number) => ({ from, durationInFrames: to - from });

  return (
    <AbsoluteFill style={{ backgroundColor: C.canvas }}>
      <Backdrop />
      {voiceover && <Audio src={staticFile(voiceover)} />}
      <SoundFX />

      <Sequence name="1 — Robotic vs NLP" {...span(T.robotic, T.qa)}>
        <SceneFade fadeIn={0}>
          <Scene1RoboticVsNLP />
        </SceneFade>
      </Sequence>
      <Sequence name="2 — Side panel QA" {...span(T.qa, T.matrix)}>
        <SceneFade>
          <Scene2SidePanelQA />
        </SceneFade>
      </Sequence>
      <Sequence name="3 — Test matrix" {...span(T.matrix, T.cta)}>
        <SceneFade>
          <Scene3TestMatrix />
        </SceneFade>
      </Sequence>
      <Sequence name="4 — CTA" {...span(T.cta, T.total)}>
        <SceneFade fadeOut={0}>
          <Scene4CTA />
        </SceneFade>
      </Sequence>
    </AbsoluteFill>
  );
};
