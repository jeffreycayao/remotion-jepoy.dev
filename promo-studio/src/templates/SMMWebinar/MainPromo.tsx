import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, Easing, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { EditorialOpening } from "./components/EditorialTypography";
import { EventScheduleCard } from "./components/EventScheduleCard";
import { OrganicArches } from "./components/OrganicArches";
import { SpeakerCard } from "./components/SpeakerCard";
import { TerracottaCTA } from "./components/TerracottaCTA";
import { SoundFX } from "./SoundFX";
import { ASSETS, clamp, T, useLayout } from "./tokens";

export const SMM_WEBINAR_DURATION = T.total;

/**
 * Cross-fades a scene in and out. The scene keeps absolute frame numbers (it is offset back by
 * `from`), so every component can use the voiceover beats in tokens.ts directly.
 */
const Scene: React.FC<{ from: number; to: number; name: string; children: React.ReactNode }> = ({ from, to, name, children }) => {
  const isLast = to >= T.total;
  return (
    <Sequence name={name} from={from} durationInFrames={to - from + (isLast ? 0 : 10)}>
      <SceneFrame from={from} to={to} isLast={isLast}>
        {children}
      </SceneFrame>
    </Sequence>
  );
};

const SceneFrame: React.FC<{ from: number; to: number; isLast: boolean; children: React.ReactNode }> = ({ from, to, isLast, children }) => {
  const local = useCurrentFrame();
  const { u } = useLayout();
  const frame = local + from;
  const fadeIn = from === 0 ? 1 : interpolate(frame, [from, from + 12], [0, 1], { ...clamp, easing: Easing.out(Easing.quad) });
  const fadeOut = isLast ? 1 : interpolate(frame, [to - 4, to + 8], [1, 0], { ...clamp, easing: Easing.in(Easing.quad) });
  return (
    <AbsoluteFill style={{ opacity: Math.min(fadeIn, fadeOut), translate: `0 ${(1 - fadeIn) * 30 * u}px` }}>
      <Sequence from={-from} layout="none">
        {children}
      </Sequence>
    </AbsoluteFill>
  );
};

/** The Happy Freelancers — Free SMM Webinar with Coach Mary Amorin. 30 s, timed to the recorded voiceover. */
export const MainPromo: React.FC = () => {
  const { padX, padY } = useLayout();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill>
      <OrganicArches />
      {/* Master voiceover: one uninterrupted stream from frame 0 — never split across scenes. */}
      <Audio src={staticFile(ASSETS.voiceover)} volume={1} premountFor={fps} />

      <AbsoluteFill style={{ padding: `${padY}px ${padX}px` }}>
        <AbsoluteFill style={{ position: "relative" }}>
          <Scene name="1 — Your next chapter" from={0} to={T.speaker}>
            <EditorialOpening />
          </Scene>
          <Scene name="2 — Coach Mary Amorin" from={T.speaker} to={T.schedule}>
            <SpeakerCard />
          </Scene>
          <Scene name="3 — Schedule" from={T.schedule} to={T.cta}>
            <EventScheduleCard />
          </Scene>
          <Scene name="4 — Register" from={T.cta} to={T.total}>
            <TerracottaCTA />
          </Scene>
        </AbsoluteFill>
      </AbsoluteFill>

      <SoundFX />
    </AbsoluteFill>
  );
};
