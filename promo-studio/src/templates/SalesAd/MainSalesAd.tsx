import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, getStaticFiles, Sequence, staticFile, useCurrentFrame } from "remotion";
import { ChatbotSimulation } from "./components/ChatbotSimulation";
import { CommentCTA } from "./components/CommentCTA";
import { SalesCards } from "./components/SalesCards";
import { SetupPillars } from "./components/SetupPillars";
import { VOICEOVER_FILES } from "./content";
import { SoundFX } from "./SoundFX";
import { C, T } from "./tokens";
import { Canvas, CutStreak, SceneFade, Vignette } from "./ui";

export const SALES_AD_DURATION = T.total;

/** Mount <Audio> only once the voiceover is in public/ — a missing file would fail every render. */
const useVoiceover = () => {
  const names = new Set(getStaticFiles().map((f) => f.name.replace(/\\/g, "/")));
  return VOICEOVER_FILES.find((f) => names.has(f));
};

/** Automatika sales-proof ad: closing bot → full Pancake setup → real dashboards → comment HELP. 26 s, timed to the recorded voiceover, all 4 formats. */
export const MainSalesAd: React.FC = () => {
  const voiceover = useVoiceover();
  const frame = useCurrentFrame();
  const span = (from: number, to: number) => ({ from, durationInFrames: to - from });

  return (
    <AbsoluteFill style={{ backgroundColor: C.canvas }}>
      {voiceover && <Audio src={staticFile(voiceover)} />}
      <SoundFX />
      <Canvas>
        <Sequence name="1 — Closing bot hook" {...span(T.hook, T.setup)}>
          <SceneFade fadeIn={0} fadeOut={8}>
            <ChatbotSimulation />
          </SceneFade>
        </Sequence>
        <Sequence name="2 — Full Pancake setup" {...span(T.setup, T.proof)}>
          <SceneFade>
            <SetupPillars />
          </SceneFade>
        </Sequence>
        <Sequence name="3 — Real sales dashboards" {...span(T.proof, T.cta)}>
          <SceneFade>
            <SalesCards />
          </SceneFade>
        </Sequence>
        <Sequence name="4 — Comment HELP" {...span(T.cta, T.total)}>
          <SceneFade fadeOut={0}>
            <CommentCTA />
          </SceneFade>
        </Sequence>
        <Vignette />
        {[T.setup, T.proof, T.cta].map((cut) => (
          <CutStreak key={cut} t={frame - cut} />
        ))}
      </Canvas>
    </AbsoluteFill>
  );
};
