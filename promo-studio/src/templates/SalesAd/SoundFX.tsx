import { Audio } from "@remotion/media";
import { ding, mouseClick, uiSwitch, whip, whoosh } from "@remotion/sfx";
import React from "react";
import { Sequence } from "remotion";
import { ASK, CLOSED, REPLY, YES } from "./components/ChatbotSimulation";
import { BUTTON_AT, POST_AT, REPLY_AT, TYPE_AT } from "./components/CommentCTA";
import { CARD_A_AT, CARD_B_AT, COUNT_FRAMES, metricAt } from "./components/SalesCards";
import { LATENCY_AT, LOGO_AT, PILLAR_AT, UPTIME_AT } from "./components/SetupPillars";
import { CARD_A, CARD_B } from "./content";
import { T } from "./tokens";

// @remotion/sfx: CC0 UI sounds served from remotion.media (renders need network).
// Levels sit well under the voiceover (1.0).
const MIX = { cut: 0.32, ui: 0.26, tick: 0.1, accent: 0.42 };

type Cue = { at: number; src: string; volume: number; label: string };

const cues = (): Cue[] => {
  const list: Cue[] = [];
  const add = (at: number, src: string, volume: number, label: string) => list.push({ at, src, volume, label });

  add(T.setup - 6, whoosh, MIX.cut, "→ Setup");
  add(T.proof - 6, whoosh, MIX.cut, "→ Proof");
  add(T.cta - 6, whoosh, MIX.cut, "→ CTA");

  // Scene 1 — message pings, instant reply, the close.
  add(T.hook + ASK, mouseClick, MIX.ui, "customer asks");
  add(T.hook + REPLY, uiSwitch, MIX.ui, "bot replies in 0.2s");
  add(T.hook + YES, mouseClick, MIX.ui, "customer: order na");
  add(T.hook + CLOSED, ding, MIX.accent, "CLIENT CLOSED");

  // Scene 2 — logo in, tiles snap, badges light.
  add(T.setup + LOGO_AT + 6, whip, 0.22, "logo in");
  PILLAR_AT.forEach((at, i) => add(T.setup + at + 6, uiSwitch, MIX.ui, `pillar ${i + 1}`));
  add(T.setup + UPTIME_AT, ding, MIX.ui, "24/7 uptime");
  add(T.setup + LATENCY_AT, ding, MIX.ui, "latency 0.4s");

  // Scene 3 — cards land, each metric lands when its count finishes.
  add(T.proof + CARD_A_AT, whip, 0.2, "card A");
  add(T.proof + CARD_B_AT, whip, 0.2, "card B");
  CARD_A.metrics.forEach((_, i) => add(T.proof + metricAt("A", i) + COUNT_FRAMES, uiSwitch, MIX.tick, `A metric ${i + 1}`));
  CARD_B.metrics.forEach((_, i) => add(T.proof + metricAt("B", i) + COUNT_FRAMES, uiSwitch, MIX.tick, `B metric ${i + 1}`));

  // Scene 4 — button, typing H-E-L-P, post, reply.
  add(T.cta + BUTTON_AT, whip, MIX.ui, "HELP button");
  for (let i = 0; i < 4; i++) add(T.cta + TYPE_AT + i * 5, mouseClick, MIX.tick, `key ${i + 1}`);
  add(T.cta + POST_AT, uiSwitch, MIX.ui, "comment posted");
  add(T.cta + REPLY_AT, ding, MIX.accent, "Automatika replies");
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
