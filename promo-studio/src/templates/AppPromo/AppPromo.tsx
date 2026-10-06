import { Audio } from "@remotion/media";
import { linearTiming, springTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import React from "react";
import {
  AbsoluteFill,
  CalculateMetadataFunction,
  interpolate,
  useVideoConfig,
} from "remotion";
import { getFontFamily } from "../../lib/fonts";
import { FPS, useLayout } from "../../lib/layout";
import { captionsFromLines } from "./captions";
import { BrandBackground, resolveAsset } from "./components";
import { MovingPillCaptions } from "./moving-pill-captions.element";
import { CtaScene } from "./scenes/CtaScene";
import { FeatureScene } from "./scenes/FeatureScene";
import { HookScene } from "./scenes/HookScene";
import { StatsScene } from "./scenes/StatsScene";
import type { AppPromoProps } from "./schema";

const sec = (s: number) => Math.round(s * FPS);

/** Scene list derived from props: shared by the component and calculateMetadata. */
const buildScenes = (p: AppPromoProps) => {
  const scenes: { key: string; frames: number }[] = [
    { key: "hook", frames: sec(p.timing.hookSeconds) },
    ...p.features.map((_, i) => ({ key: `feature-${i}`, frames: sec(p.timing.featureSeconds) })),
  ];
  if (p.stats.length > 0) scenes.push({ key: "stats", frames: sec(p.timing.statsSeconds) });
  scenes.push({ key: "cta", frames: sec(p.timing.ctaSeconds) });
  return scenes;
};

/** A transition can't be as long as the scenes it joins, so cap it one frame below the shortest scene. */
const transitionFor = (p: AppPromoProps, scenes: { frames: number }[]) =>
  Math.max(0, Math.min(p.timing.transitionFrames, Math.min(...scenes.map((s) => s.frames)) - 1));

/** Total length = sum of scenes minus the overlap each transition creates. */
export const calculateAppPromoMetadata: CalculateMetadataFunction<AppPromoProps> = ({ props }) => {
  const scenes = buildScenes(props);
  const total = scenes.reduce((sum, s) => sum + s.frames, 0) - (scenes.length - 1) * transitionFor(props, scenes);
  return { durationInFrames: Math.max(1, total), fps: FPS };
};

export const AppPromo: React.FC<AppPromoProps> = (props) => {
  const { durationInFrames } = useVideoConfig();
  const { isLandscape, width, safeBottom, u } = useLayout();
  const scenes = buildScenes(props);
  const t = transitionFor(props, scenes);
  const captions = captionsFromLines(props.voiceoverLines ?? [], scenes, t, FPS);
  const music = resolveAsset(props.audio.music);

  const renderScene = (key: string) => {
    if (key === "hook") return <HookScene props={props} />;
    if (key === "stats") return <StatsScene props={props} />;
    if (key === "cta") return <CtaScene props={props} />;
    const i = Number(key.split("-")[1]);
    return <FeatureScene props={props} feature={props.features[i]} index={i} />;
  };

  // Alternate presentations so the edit doesn't feel repetitive.
  const presentationFor = (i: number) =>
    i % 2 === 0 ? slide({ direction: isLandscape ? "from-right" : "from-bottom" }) : fade();

  return (
    <>
      <AbsoluteFill
        style={{
          fontFamily: getFontFamily(props.brand.font),
          color: props.brand.text,
        }}
      >
        <BrandBackground
          background={props.brand.background}
          primary={props.brand.primary}
          secondary={props.brand.secondary}
        />
        <TransitionSeries>
          {scenes.map((scene, i) => (
            <React.Fragment key={scene.key}>
              {i > 0 && t > 0 ? (
                <TransitionSeries.Transition
                  presentation={presentationFor(i)}
                  timing={
                    i % 2 === 0
                      ? springTiming({ config: { damping: 200 }, durationInFrames: t })
                      : linearTiming({ durationInFrames: t })
                  }
                />
              ) : null}
              <TransitionSeries.Sequence durationInFrames={scene.frames} name={scene.key}>
                {renderScene(scene.key)}
              </TransitionSeries.Sequence>
            </React.Fragment>
          ))}
        </TransitionSeries>
        {music ? (
          <Audio
            src={music}
            volume={(f) =>
              props.audio.volume *
              interpolate(f, [0, 15, durationInFrames - 45, durationInFrames], [0, 1, 1, 0], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              })
            }
          />
        ) : null}
      </AbsoluteFill>
      {captions.length ? (
        // Lower third, inside the platform-safe area so it never covers the hook or platform UI.
        <MovingPillCaptions
          captions={captions}
          combineTokensWithinMilliseconds={800}
          pillColor={props.brand.primary}
          width={Math.round(width * 0.84)}
          durationInFrames={durationInFrames}
          name="Captions"
          style={{
            position: "absolute",
            left: Math.round(width * 0.08),
            bottom: Math.round(safeBottom + 24 * u),
          }}
        />
      ) : null}
    </>
  );
};
