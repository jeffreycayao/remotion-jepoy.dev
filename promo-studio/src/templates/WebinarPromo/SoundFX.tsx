import {Audio} from "@remotion/media";
import {ding, mouseClick, shutterModern, uiSwitch, whoosh} from "@remotion/sfx";
import type React from "react";
import {Sequence, useVideoConfig} from "remotion";

type Cue = {
  at: number;
  src: string;
  volume: number;
  label: string;
};

// Intentionally sparse, low-level accents. The ElevenLabs voiceover is the lead.
const CUES: Cue[] = [
  // Scene 1: the five-second meter changes at local frames 28, 58, 88, 118 and 148.
  ...[28, 58, 88, 118, 148].map((at, index) => ({
    at,
    src: mouseClick,
    volume: 0.075,
    label: `Countdown ${5 - index}`,
  })),
  {at: 179, src: shutterModern, volume: 0.19, label: "Rejected stamp"},

  // The whooshes lead each visual cut by four frames.
  {at: 236, src: whoosh, volume: 0.21, label: "Transition to Coach Ali"},
  {at: 476, src: whoosh, volume: 0.21, label: "Transition to Coach Mary"},
  {at: 716, src: whoosh, volume: 0.22, label: "Transition to both coaches"},
  {at: 896, src: whoosh, volume: 0.23, label: "Transition to registration"},

  // Scene 2: the problem tags break, then the October 8 schedule appears.
  {at: 240 + 116, src: uiSwitch, volume: 0.105, label: "Messy fonts corrected"},
  {at: 240 + 125, src: uiSwitch, volume: 0.105, label: "Bad layout corrected"},
  {at: 240 + 134, src: uiSwitch, volume: 0.105, label: "AI reliance corrected"},
  {at: 240 + 151, src: ding, volume: 0.16, label: "October 8 schedule"},

  // Scene 3: one quiet confirmation per calendar cell, followed by the schedule.
  ...Array.from({length: 7}, (_, index) => ({
    at: 480 + 54 + index * 15,
    src: uiSwitch,
    volume: 0.085,
    label: `Content day ${index + 1} unlocked`,
  })),
  {at: 480 + 161, src: ding, volume: 0.16, label: "October 9 schedule"},

  // Scenes 4 and 5: positive free offer, restrained urgency, and the final CTA.
  {at: 720 + 29, src: ding, volume: 0.2, label: "Free webinar badge"},
  {at: 720 + 50, src: uiSwitch, volume: 0.15, label: "Slots filling fast"},
  {at: 900 + 24, src: ding, volume: 0.21, label: "Registration button"},
  {at: 900 + 47, src: mouseClick, volume: 0.13, label: "Registration ripple"},
];

/** SFX layer for the complete 1050-frame promo; mount once beside the scenes. */
export const SoundFX: React.FC = () => {
  const {fps} = useVideoConfig();

  return (
    <>
      {CUES.map((cue, index) => (
        <Sequence
          key={`${cue.at}-${index}`}
          name={`SFX · ${cue.label}`}
          from={cue.at}
          durationInFrames={45}
          layout="none"
        >
          <Audio src={cue.src} volume={cue.volume} premountFor={fps} />
        </Sequence>
      ))}
    </>
  );
};
