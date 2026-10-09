import { Audio } from "@remotion/media";
import { ding, mouseClick, uiSwitch, whip, whoosh, windowsXpError } from "@remotion/sfx";
import React from "react";
import { Sequence } from "remotion";
import { BOOK_AT, CHAT_AT, CLICK_AT } from "./components/CTALockup";
import { BADGE_AT, PILLAR_AT } from "./components/PancakePillars";
import { BLOCK_IN, COUNTER } from "./components/SetupHeadache";
import { COUNT, INDUSTRY_AT, NODES_IN, STEP_AT } from "./components/TrainingAndProof";
import { BROKEN } from "./content";
import { T } from "./tokens";

// @remotion/sfx: CC0 UI sounds served from remotion.media (renders need network).
// Levels sit well under the voiceover (1.0).
const MIX = { cut: 0.32, ui: 0.26, tick: 0.12, accent: 0.42 };

type Cue = { at: number; src: string; volume: number; label: string };

const cues = (): Cue[] => {
  const list: Cue[] = [];
  const add = (at: number, src: string, volume: number, label: string) => list.push({ at, src, volume, label });

  add(T.partner - 6, whoosh, MIX.cut, "→ Partner");
  add(T.proof - 6, whoosh, MIX.cut, "→ Proof");
  add(T.cta - 6, whoosh, MIX.cut, "→ CTA");

  // Scene 1 — broken blocks thud in; a soft error when time-lost maxes out.
  BROKEN.forEach((_, i) => add(T.headache + BLOCK_IN + 2 + i * 5, mouseClick, MIX.ui, `block ${i + 1}`));
  add(T.headache + COUNTER[1], windowsXpError, 0.18, "80+ hours lost");

  // Scene 2 — partner badge lands, each pillar locks.
  add(T.partner + BADGE_AT + 6, ding, MIX.accent, "official partner badge");
  PILLAR_AT.forEach((at, i) => add(T.partner + at + 4, uiSwitch, MIX.ui, `pillar ${i + 1} locks`));

  // Scene 3 — nodes, training steps, counter lands, industries pop.
  add(T.proof + NODES_IN, whip, 0.2, "human ⟷ AI");
  STEP_AT.forEach((at, i) => add(T.proof + at, mouseClick, MIX.tick, `training step ${i + 1}`));
  add(T.proof + COUNT[1], ding, MIX.accent, "90+ businesses");
  INDUSTRY_AT.forEach((at, i) => add(T.proof + at, uiSwitch, MIX.tick, `industry ${i + 1}`));

  // Scene 4 — the two CTAs, then the click on Book.
  add(T.cta + CHAT_AT, whip, MIX.ui, "chat pill");
  add(T.cta + BOOK_AT, whip, MIX.ui, "book pill");
  add(T.cta + CLICK_AT, mouseClick, MIX.accent, "book click");
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
