import { Audio } from "@remotion/media";
import type React from "react";
import { Sequence, staticFile, useVideoConfig } from "remotion";

const SFX_DIR = "projects/automatika-personal-ad/sfx";

type CueProps = {
  at: number;
  file: string;
  frames: number;
  volume: number;
  name: string;
  fps: number;
};

const Cue: React.FC<CueProps> = ({ at, file, frames, volume, name, fps }) => (
  <Sequence name={`SFX · ${name}`} from={at} durationInFrames={frames} premountFor={fps}>
    <Audio from={0} src={staticFile(`${SFX_DIR}/${file}.mp3`)} volume={volume} premountFor={fps} />
  </Sequence>
);

/** Every effect is independent of the single, continuous master voiceover. */
export const SoundFX: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <>
      <Cue name="hook bass drop" at={0} file="bass-drop" frames={29} volume={0.65} fps={fps} />
      <Cue name="pattern interrupt scratch" at={12} file="record-scratch" frames={19} volume={0.5} fps={fps} />
      <Cue name="founder alert" at={70} file="alert-ping" frames={13} volume={0.4} fps={fps} />

      <Cue name="error cards enter" at={240} file="whoosh-fast" frames={16} volume={0.45} fps={fps} />
      <Cue name="stock mismatch" at={270} file="error-beep" frames={9} volume={0.35} fps={fps} />
      <Cue name="broken webhook" at={310} file="error-beep" frames={9} volume={0.35} fps={fps} />
      <Cue name="staff confusion" at={350} file="error-beep" frames={9} volume={0.35} fps={fps} />

      <Cue name="Pancake stack wipe" at={540} file="heavy-whoosh" frames={28} volume={0.6} fps={fps} />
      <Cue name="partner badge impact" at={565} file="impact-hit" frames={24} volume={0.65} fps={fps} />
      <Cue name="four pillars lock" at={630} file="lock-snap" frames={13} volume={0.5} fps={fps} />

      <Cue name="training card slide" at={870} file="smooth-slide" frames={21} volume={0.45} fps={fps} />
      <Cue name="AI copilot connection" at={930} file="tech-chime" frames={27} volume={0.5} fps={fps} />
      <Cue name="team enabled" at={1020} file="success-ding" frames={31} volume={0.55} fps={fps} />

      <Cue name="CTA reveal" at={1140} file="whoosh-riser" frames={35} volume={0.6} fps={fps} />
      <Cue name="book button press" at={1210} file="mouse-click" frames={7} volume={0.7} fps={fps} />
    </>
  );
};
