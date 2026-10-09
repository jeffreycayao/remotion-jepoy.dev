import { Audio } from "@remotion/media";
import type React from "react";
import { Sequence, staticFile, useVideoConfig } from "remotion";

const SFX_DIR = "projects/automatika-fast-ad/sfx";

type CueProps = {
  at: number;
  name: string;
  file: string;
  frames: number;
  volume: number;
  fps: number;
};

const Cue: React.FC<CueProps> = ({ at, name, file, frames, volume, fps }) => (
  <Sequence name={`SFX · ${name}`} from={at} durationInFrames={frames} premountFor={fps}>
    <Audio from={0} src={staticFile(`${SFX_DIR}/${file}.mp3`)} volume={volume} premountFor={fps} />
  </Sequence>
);

/** Cue frames and nominal levels follow the supplied 35-second sound map. */
export const SoundFX: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <>
      <Cue name="screen slam" at={0} file="sub-drop" frames={35} volume={0.7} fps={fps} />
      <Cue name="record stop" at={10} file="record-stop" frames={25} volume={0.55} fps={fps} />
      <Cue name="alert strobe" at={60} file="alert-strobe" frames={19} volume={0.45} fps={fps} />

      <Cue name="pain stack entrance" at={210} file="whoosh-fast" frames={24} volume={0.5} fps={fps} />
      <Cue name="cold leads glitch" at={270} file="error-glitch" frames={18} volume={0.4} fps={fps} />
      <Cue name="inventory glitch" at={330} file="error-glitch" frames={18} volume={0.4} fps={fps} />
      <Cue name="staff glitch" at={390} file="error-glitch" frames={18} volume={0.4} fps={fps} />

      <Cue name="partner wipe" at={480} file="heavy-whoosh" frames={32} volume={0.6} fps={fps} />
      <Cue name="partner impact" at={510} file="anvil-impact" frames={34} volume={0.65} fps={fps} />
      <Cue name="platform lock" at={600} file="power-lock" frames={25} volume={0.55} fps={fps} />

      <Cue name="CTA riser" at={780} file="riser" frames={57} volume={0.6} fps={fps} />
      <Cue name="booking click" at={840} file="mouse-click" frames={12} volume={0.7} fps={fps} />
    </>
  );
};
