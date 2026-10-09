import { Audio } from "@remotion/media";
import { ding, mouseClick, uiSwitch, whip, whoosh, windowsXpError } from "@remotion/sfx";
import React from "react";
import { Sequence } from "remotion";
import { ASK, ERROR, REWRITE, WIN } from "./scenes/Scene1RoboticVsNLP";
import { PANEL_IN, RUN_END, RUN_START, STEP } from "./scenes/Scene2SidePanelQA";
import { CALLOUT_AT, CELL_START, CELL_STEP, DIAL_LOCK } from "./scenes/Scene3TestMatrix";
import { PILL_AT } from "./scenes/Scene4CTA";
import { CALLOUTS, CATEGORIES } from "./content";
import { T } from "./tokens";

// @remotion/sfx: CC0, pre-normalised UI sounds (served from remotion.media — renders need network).
// Volumes sit well under the voiceover (1.0) so the voice always leads.
type Cue = { at: number; src: string; volume: number; label: string };

const MIX = { cut: 0.32, ui: 0.28, tick: 0.12, accent: 0.4 };

/** Every sound, in absolute frames, derived from the same beat constants the visuals use. */
const cues = (): Cue[] => {
  const list: Cue[] = [];
  const add = (at: number, src: string, volume: number, label: string) => list.push({ at, src, volume, label });

  // Scene cuts — the whoosh leads each cut by a few frames.
  add(T.qa - 6, whoosh, MIX.cut, "→ Scene 2");
  add(T.matrix - 6, whoosh, MIX.cut, "→ Scene 3");
  add(T.cta - 6, whoosh, MIX.cut, "→ CTA");

  // Scene 1 — robotic vs NLP.
  add(T.robotic + ASK, mouseClick, MIX.ui, "customer message");
  add(T.robotic + ERROR, windowsXpError, 0.22, "generic-answer error");
  add(T.robotic + REWRITE, whoosh, 0.22, "NLP rewrite scan");
  add(T.robotic + WIN, ding, MIX.ui, "customer says yes");

  // Scene 2 — side panel QA: panel opens, every prompt send clicks, run completes.
  add(T.qa + PANEL_IN, uiSwitch, MIX.accent, "side panel opens");
  for (let k = 0; RUN_START + k * STEP + 9 < RUN_END; k++) add(T.qa + RUN_START + k * STEP + 9, mouseClick, MIX.tick, `prompt send ${k + 1}`);
  add(T.qa + RUN_END, ding, MIX.accent, "303/303 complete");

  // Scene 3 — matrix passes tick, callouts click, dials lock with a ding.
  CATEGORIES.forEach((name, i) => add(T.matrix + CELL_START + i * CELL_STEP + 20, uiSwitch, MIX.tick, `${name} pass`));
  CALLOUTS.forEach((c, i) => add(T.matrix + CALLOUT_AT + i * 7, mouseClick, MIX.ui, c));
  add(T.matrix + DIAL_LOCK, ding, MIX.accent, "scores lock");

  // Scene 4 — URL pill snaps in.
  add(T.cta + PILL_AT, whip, MIX.ui, "URL pill");

  return list;
};

/** Sound-effects bed for MainPromo. Each cue is a short Sequence so it shows up named in the Studio timeline. */
export const SoundFX: React.FC = () => (
  <>
    {cues().map((cue, i) => (
      <Sequence key={i} name={`SFX · ${cue.label}`} from={Math.max(0, cue.at)} durationInFrames={60} layout="none">
        <Audio src={cue.src} volume={cue.volume} />
      </Sequence>
    ))}
  </>
);
