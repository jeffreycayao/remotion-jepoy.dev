import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { useLayout } from "../../../lib/layout";
import { PhoneFrame, useEnter } from "../components";
import type { AppPromoProps, Feature } from "../schema";

export const FeatureScene: React.FC<{
  props: AppPromoProps;
  feature: Feature;
  index: number;
}> = ({ props, feature, index }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const { u, height, isLandscape, safeTop, safeBottom } = useLayout();
  const flip = isLandscape && index % 2 === 1;

  const phoneIn = useEnter(4, 18);
  const labelIn = useEnter(8);
  const titleIn = useEnter(12);
  const descIn = useEnter(18);

  // Gentle float + slow push-in keeps static screenshots alive.
  const float = Math.sin(frame / 20) * 10 * u;
  const push = interpolate(frame, [0, durationInFrames], [1, 1.04]);

  const phoneHeight = isLandscape ? height * 0.78 : (height - safeTop - safeBottom) * 0.66;
  const total = props.features.length;

  return (
    <AbsoluteFill
      style={{
        flexDirection: isLandscape ? (flip ? "row-reverse" : "row") : "column",
        alignItems: "center",
        justifyContent: "center",
        gap: (isLandscape ? 120 : 56) * u,
        paddingTop: safeTop,
        paddingBottom: safeBottom,
        paddingLeft: 100 * u,
        paddingRight: 100 * u,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 24 * u,
          maxWidth: isLandscape ? 760 * u : 920 * u,
          textAlign: isLandscape ? "left" : "center",
          alignItems: isLandscape ? "flex-start" : "center",
        }}
      >
        <div
          style={{
            fontSize: 30 * u,
            fontWeight: 600,
            letterSpacing: "0.12em",
            color: props.brand.primary,
            opacity: labelIn,
            textTransform: "uppercase",
          }}
        >
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </div>
        <div
          style={{
            fontSize: (isLandscape ? 88 : 80) * u,
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: "-0.025em",
            opacity: titleIn,
            translate: `0 ${interpolate(titleIn, [0, 1], [40, 0]) * u}px`,
          }}
        >
          {feature.title}
        </div>
        <div
          style={{
            fontSize: 40 * u,
            lineHeight: 1.35,
            opacity: descIn * 0.8,
            translate: `0 ${interpolate(descIn, [0, 1], [30, 0]) * u}px`,
          }}
        >
          {feature.description}
        </div>
      </div>
      <div
        style={{
          scale: String(push * interpolate(phoneIn, [0, 1], [0.85, 1])),
          opacity: phoneIn,
          translate: `${interpolate(phoneIn, [0, 1], [flip ? -120 : 120, 0]) * u * (isLandscape ? 1 : 0)}px ${
            interpolate(phoneIn, [0, 1], [isLandscape ? 0 : 160, 0]) * u + float
          }px`,
          rotate: `${interpolate(phoneIn, [0, 1], [flip ? -8 : 8, flip ? -2 : 2])}deg`,
        }}
      >
        <PhoneFrame
          screenshot={feature.screenshot}
          height={phoneHeight}
          primary={props.brand.primary}
          secondary={props.brand.secondary}
          icon={feature.icon}
        />
      </div>
    </AbsoluteFill>
  );
};
