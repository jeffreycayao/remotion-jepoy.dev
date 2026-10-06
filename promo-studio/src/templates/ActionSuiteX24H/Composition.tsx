import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, getStaticFiles, Sequence, staticFile } from "remotion";
import { COPY, VOICEOVER_FILES } from "./content";
import { EngineScene } from "./scenes/EngineScene";
import { McpScene } from "./scenes/McpScene";
import { CtaScene, OfferScene } from "./scenes/OfferCta";
import { RevenueHook } from "./scenes/RevenueHook";
import { TagPilotScene } from "./scenes/TagPilotScene";
import { C, T } from "./tokens";
import { Backdrop, SceneFade, SceneHeadline } from "./ui";

export const ACTION_SUITE_X24H_DURATION = T.total;

/**
 * The voiceover is optional until it's recorded: a missing file would fail every render, so only
 * mount <Audio> when one of VOICEOVER_FILES is actually in public/ (the bundle embeds that list).
 */
const useVoiceover = () => {
  const names = new Set(getStaticFiles().map((f) => f.name.replace(/\\/g, "/")));
  return VOICEOVER_FILES.find((f) => names.has(f));
};

/** Automatika ActionSuite — 35 s promo (1050 frames @ 30 fps), timed to the Taglish voiceover. */
export const ActionSuiteX24HPromo: React.FC = () => {
  const voiceover = useVoiceover();
  const span = (from: number, to: number) => ({ from, durationInFrames: to - from });

  return (
    <AbsoluteFill style={{ backgroundColor: C.canvas }}>
      <Backdrop />
      {voiceover && <Audio src={staticFile(voiceover)} />}

      <Sequence name="1A+1B — ₱5M idle math" {...span(T.idle, T.outbound)}>
        <SceneFade fadeIn={0} fadeOut={12}>
          <RevenueHook />
        </SceneFade>
      </Sequence>

      <Sequence name="2A+2B — X24H engines" {...span(T.outbound, T.tagpilot)}>
        <SceneFade>
          <EngineScene />
        </SceneFade>
      </Sequence>
      <Sequence name="2A — headline" {...span(T.outbound, T.extreme)}>
        <SceneFade>
          <SceneHeadline text={COPY.outboundHeadline} accent={["autopilot."]} />
        </SceneFade>
      </Sequence>
      <Sequence name="2B — headline" {...span(T.extreme, T.tagpilot)}>
        <SceneFade>
          <SceneHeadline text={COPY.extremeHeadline} accent={["14"]} />
        </SceneFade>
      </Sequence>

      <Sequence name="3A — TagPilot" {...span(T.tagpilot, T.mcp)}>
        <SceneFade>
          <SceneHeadline text={COPY.tagpilotHeadline} accent={["never"]} />
          <TagPilotScene />
        </SceneFade>
      </Sequence>

      <Sequence name="3B — MCP Library" {...span(T.mcp, T.offer)}>
        <SceneFade>
          <SceneHeadline text={COPY.mcpHeadline} accent={["seconds."]} />
          <McpScene />
        </SceneFade>
      </Sequence>

      <Sequence name="4A — ₱499 offer" {...span(T.offer, T.cta)}>
        <SceneFade>
          <OfferScene />
        </SceneFade>
      </Sequence>

      <Sequence name="4B — CTA" {...span(T.cta, T.total)}>
        <SceneFade fadeOut={0}>
          <CtaScene />
        </SceneFade>
      </Sequence>
    </AbsoluteFill>
  );
};
