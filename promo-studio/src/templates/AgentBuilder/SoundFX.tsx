import { Audio } from "@remotion/media";
import { ding, mouseClick, uiSwitch, whip, whoosh } from "@remotion/sfx";
import React from "react";
import { Sequence } from "remotion";
import { MESSY_DOC } from "./content";
import { STRIKE_START, STRIKE_STEP } from "./scenes/Scene1Pain";
import { PROFILE_IN, UNLOCK } from "./scenes/Scene2Gift";
import { CLICK_GENERATE, CLICKS } from "./scenes/Scene3Demo";
import { CHECKS_AT, FIVE_MIN, SLASH, VALIDATE_CLICK } from "./scenes/Scene4Speed";
import { PILL_AT } from "./scenes/Scene5CTA";
import { T } from "./tokens";

// @remotion/sfx: CC0 UI sounds served from remotion.media (renders need network).
// Levels sit well under the voiceover (1.0).
const MIX = { cut: 0.32, ui: 0.26, tick: 0.1, accent: 0.42 };

type Cue = { at: number; src: string; volume: number; label: string };

const cues = (): Cue[] => {
  const list: Cue[] = [];
  const add = (at: number, src: string, volume: number, label: string) => list.push({ at, src, volume, label });

  // Scene cuts.
  add(T.gift - 4, whoosh, MIX.cut, "→ Gift");
  add(T.demo - 6, whoosh, MIX.cut, "→ Demo");
  add(T.speed - 6, whoosh, MIX.cut, "→ Speed");
  add(T.cta - 6, whoosh, MIX.cut, "→ CTA");

  // Scene 1 — every red-pen strike scratches.
  MESSY_DOC.forEach((_, i) => {
    const at = T.pain + STRIKE_START + i * STRIKE_STEP;
    if (at < T.gift - 10) add(at, mouseClick, MIX.tick, `edit ${i + 1}`);
  });

  // Scene 2 — profile slides in, the lock opens.
  add(T.gift + PROFILE_IN, uiSwitch, MIX.ui, "profile card");
  add(T.gift + UNLOCK, ding, MIX.accent, "PRO feature unlocked");

  // Scene 3 — every cursor click; Generate gets a ding as the instructions land.
  CLICKS.forEach((c) => add(T.demo + c, mouseClick, MIX.ui, `click @${c}`));
  add(T.demo + CLICK_GENERATE + 6, ding, MIX.accent, "instructions generated");

  // Scene 4 — slash, 5 MINUTES, checklist, Validate.
  add(T.speed + SLASH, whip, MIX.ui, "1–2 hours slashed");
  add(T.speed + FIVE_MIN, ding, MIX.accent, "5 MINUTES");
  for (let i = 0; i < 5; i++) add(T.speed + CHECKS_AT + i * 12, uiSwitch, MIX.tick, `check ${i + 1}`);
  add(T.speed + VALIDATE_CLICK, mouseClick, MIX.ui, "Validate on ChatGPT");

  // Scene 5 — login pill.
  add(T.cta + PILL_AT, whip, MIX.ui, "login pill");
  return list;
};

export const SoundFX: React.FC = () => (
  <>
    {cues().map((cue, i) => (
      <Sequence key={i} name={`SFX · ${cue.label}`} from={Math.max(0, cue.at)} durationInFrames={60} layout="none">
        <Audio src={cue.src} volume={cue.volume} />
      </Sequence>
    ))}
  </>
);
