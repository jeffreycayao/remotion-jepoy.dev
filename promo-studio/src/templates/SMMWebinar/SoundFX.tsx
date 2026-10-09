import { Audio } from "@remotion/media";
import { ding, mouseClick, pageTurn, shutterModern, uiSwitch, whoosh } from "@remotion/sfx";
import React from "react";
import { getStaticFiles, Sequence, staticFile, useVideoConfig } from "remotion";
import { CHIP_AT } from "./components/EventScheduleCard";
import { T } from "./tokens";

/**
 * Each cue is named after the brief's SFX file. Drop that file into public/shared/sfx/ (e.g.
 * public/shared/sfx/warm-chime.mp3) and it replaces the built-in @remotion/sfx stand-in.
 * Cues sit on the measured voiceover beats, not the script's estimated frames.
 */
type Cue = { at: number; name: string; fallback: string; volume: number; label: string };

const CUES: Cue[] = [
  { at: 0, name: "warm-chime", fallback: ding, volume: 0.5, label: "Open" },
  { at: T.headline - 3, name: "smooth-swoosh", fallback: whoosh, volume: 0.4, label: "Headline reveal" },
  { at: T.learning, name: "soft-sparkle", fallback: ding, volume: 0.35, label: "LEARNING" },
  { at: T.speaker - 2, name: "paper-slide", fallback: pageTurn, volume: 0.45, label: "Arch reveal" },
  { at: T.speaker + 16, name: "camera-shutter-soft", fallback: shutterModern, volume: 0.3, label: "Portrait" },
  { at: T.badge, name: "pop-warm", fallback: uiSwitch, volume: 0.5, label: "FREE SMM WEBINAR badge" },
  { at: T.schedule - 3, name: "whoosh-soft", fallback: whoosh, volume: 0.4, label: "Schedule scene" },
  ...CHIP_AT.map((at, i) => ({ at, name: "tap-light", fallback: mouseClick, volume: 0.3, label: `Chip ${i + 1}` })),
  { at: T.date, name: "bell-chime", fallback: ding, volume: 0.45, label: "October 9" },
  { at: T.cta - 6, name: "warm-riser", fallback: whoosh, volume: 0.5, label: "Into the CTA" },
  { at: T.press, name: "button-click", fallback: mouseClick, volume: 0.55, label: "Register click" },
];

/** SFX layer: one <Sequence> per cue, mounted beside (never inside) the continuous voiceover. */
export const SoundFX: React.FC = () => {
  const { fps } = useVideoConfig();
  const own = new Set(getStaticFiles().map((f) => f.name.replace(/\\/g, "/")));
  return (
    <>
      {CUES.map((cue, i) => {
        const file = `shared/sfx/${cue.name}.mp3`;
        return (
          <Sequence key={i} name={`SFX · ${cue.label}`} from={cue.at} durationInFrames={2 * fps} layout="none">
            <Audio src={own.has(file) ? staticFile(file) : cue.fallback} volume={cue.volume} />
          </Sequence>
        );
      })}
    </>
  );
};
