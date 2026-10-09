import { Audio } from "@remotion/media";
import React from "react";
import { Sequence, staticFile } from "remotion";
import { BADGE_AT, COUNT_END, STRIKE_AT as HOOK_STRIKE } from "./components/SpeedInterruptionHook";
import { LAUNCH_AT, PARTNER_AT, READY_AT, STEP_AT, STRIKE_AT } from "./components/AutomatikaImplementorBadge";
import { ALL_LIVE_AT, CARD_AT, MODULE_AT, READY_DELAY } from "./components/MultiNicheMatrix";
import { BOOK_AT, CLICK_AT, COMMENT_AT } from "./components/DualActionLaunchCTA";
import { SFX_DIR } from "./content";
import { T } from "./design";

type Cue = { at: number; file: string; volume: number; label: string };

/** Absolute-frame cues, each tied to the visual beat it punctuates. Levels 0.3–0.7 keep the voice on top. */
const CUES: Cue[] = [
  // Scene 1 — slam, counter decelerates into a stall, strike, badge.
  { at: T.hook, file: "bass-boom.wav", volume: 0.65, label: "slam" },
  { at: T.hook + COUNT_END - 18, file: "fast-tape-stop.wav", volume: 0.5, label: "counter stalls" },
  { at: T.hook + HOOK_STRIKE, file: "speed-glitch.wav", volume: 0.45, label: "strikethrough" },
  { at: T.hook + BADGE_AT, file: "tech-snap.wav", volume: 0.45, label: "GO-LIVE badge" },

  // Scene 2 — logo, partner badge, build steps, dial launch, READY.
  { at: T.implementor, file: "heavy-whoosh.wav", volume: 0.55, label: "Automatika logo" },
  { at: T.implementor + STRIKE_AT, file: "tech-snap.wav", volume: 0.3, label: "trial-and-error struck" },
  { at: T.implementor + PARTNER_AT, file: "tech-snap.wav", volume: 0.4, label: "partner badge" },
  ...STEP_AT.map((at, i) => ({ at: T.implementor + at, file: "tech-snap.wav", volume: 0.3, label: `step ${i + 1}` })),
  { at: T.implementor + LAUNCH_AT - 12, file: "warp-drive.wav", volume: 0.6, label: "dial launch" },
  { at: T.implementor + READY_AT, file: "speed-ding.wav", volume: 0.5, label: "100% READY" },

  // Scene 3 — cards shuffle in and snap READY, modules connect, engine online.
  { at: T.niches, file: "card-shuffle.wav", volume: 0.5, label: "niche cards" },
  ...CARD_AT.map((at, i) => ({ at: T.niches + at + READY_DELAY, file: "tech-snap.wav", volume: 0.35, label: `niche ${i + 1} READY` })),
  ...MODULE_AT.map((at, i) => ({ at: T.niches + at, file: "mouse-click.wav", volume: 0.35, label: `module ${i + 1} connected` })),
  { at: T.niches + ALL_LIVE_AT - 4, file: "engine-online.wav", volume: 0.55, label: "all systems live" },

  // Scene 4 — riser, pills, click.
  { at: T.cta, file: "energy-riser.wav", volume: 0.6, label: "outro riser" },
  { at: T.cta + COMMENT_AT, file: "tech-snap.wav", volume: 0.4, label: "comment pill" },
  { at: T.cta + BOOK_AT, file: "tech-snap.wav", volume: 0.4, label: "booking pill" },
  { at: T.cta + CLICK_AT, file: "mouse-click.wav", volume: 0.7, label: "booking click" },
];

/** Each effect sits in its own <Sequence> at the frame of its visual event. */
export const SoundFX: React.FC = () => (
  <>
    {CUES.map((cue, i) => (
      <Sequence key={i} name={`SFX · ${cue.label}`} from={cue.at} durationInFrames={50} layout="none">
        <Audio src={staticFile(`${SFX_DIR}/${cue.file}`)} volume={cue.volume} />
      </Sequence>
    ))}
  </>
);
