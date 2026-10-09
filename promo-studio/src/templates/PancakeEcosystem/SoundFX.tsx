import { Audio } from "@remotion/media";
import type React from "react";
import { staticFile, useVideoConfig } from "remotion";

const SFX_DIR = "projects/pancake-end-to-end/sfx";

// Local CC0 copies keep renders independent of the sound library's CDN.
const SOUNDS = {
  click: { file: "mouse-click.wav", frames: 13 },
  page: { file: "page-turn.wav", frames: 13 },
  shutter: { file: "shutter-modern.wav", frames: 16 },
  switch: { file: "switch.wav", frames: 11 },
  whip: { file: "whip.wav", frames: 7 },
  whoosh: { file: "whoosh.wav", frames: 6 },
} as const;

type Sound = keyof typeof SOUNDS;
type Cue = { at: number; sound: Sound; volume: number; label: string };

/** Global 30 FPS cues. Levels leave the supplied voiceover in the foreground. */
const CUES: Cue[] = [
  // Scene 1: channel cards accumulate, data is exposed, and the cards converge.
  ...[12, 27, 42, 57, 72].map((at, index) => ({
    at,
    sound: "click" as const,
    volume: 0.09 + index * 0.008,
    label: `channel ${index + 1} arrives`,
  })),
  { at: 95, sound: "shutter", volume: 0.16, label: "exposed customer data" },
  { at: 132, sound: "switch", volume: 0.13, label: "stock mismatch" },
  { at: 183, sound: "page", volume: 0.12, label: "channels converge" },
  { at: 207, sound: "whoosh", volume: 0.24, label: "one inbox reveal" },

  // Scene 2: private-data protection, comment-to-DM, and order capture.
  { at: 310, sound: "switch", volume: 0.2, label: "anti-theft shield" },
  { at: 389, sound: "click", volume: 0.13, label: "automatic DM" },
  { at: 442, sound: "switch", volume: 0.18, label: "in-chat order" },

  // Scene 3: each module lands as the connected sale moves to fulfillment.
  { at: 510, sound: "whoosh", volume: 0.22, label: "connected stack reveal" },
  { at: 522, sound: "whip", volume: 0.18, label: "Webcake card" },
  { at: 588, sound: "whip", volume: 0.18, label: "POS card" },
  { at: 625, sound: "page", volume: 0.14, label: "courier waybill" },
  { at: 660, sound: "whip", volume: 0.19, label: "CRM card" },
  { at: 687, sound: "switch", volume: 0.19, label: "customer profile connected" },

  // Scene 4: the two response options appear, then the booking button presses.
  { at: 780, sound: "whoosh", volume: 0.24, label: "Automatika CTA reveal" },
  { at: 902, sound: "whip", volume: 0.18, label: "comment CTA" },
  { at: 936, sound: "whip", volume: 0.2, label: "book CTA" },
  { at: 989, sound: "click", volume: 0.2, label: "book button press" },
];

/** Mounted once beside the VO so every format gets the same sound design. */
export const SoundFX: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <>
      {CUES.map((cue, index) => {
        const sound = SOUNDS[cue.sound];
        return (
          <Audio
            key={`${cue.at}-${index}`}
            name={`SFX · ${cue.label}`}
            src={staticFile(`${SFX_DIR}/${sound.file}`)}
            from={cue.at}
            durationInFrames={sound.frames}
            volume={cue.volume}
            premountFor={fps}
          />
        );
      })}
    </>
  );
};
