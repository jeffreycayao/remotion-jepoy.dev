import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { useLayout } from "../../../lib/layout";
import { Logo, useEnter } from "../components";
import type { AppPromoProps } from "../schema";

export const HookScene: React.FC<{ props: AppPromoProps }> = ({ props }) => {
  const { u, isLandscape, safeTop, safeBottom } = useLayout();
  const logoIn = useEnter(0, 12);
  const words = props.hook.headline.split(" ");
  const subIn = useEnter(10 + words.length * 4);

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 48 * u,
        paddingTop: safeTop,
        paddingBottom: safeBottom,
        paddingLeft: 90 * u,
        paddingRight: 90 * u,
        textAlign: "center",
      }}
    >
      <div style={{ scale: String(logoIn), rotate: `${interpolate(logoIn, [0, 1], [-20, 0])}deg` }}>
        <Logo
          src={props.logo}
          appName={props.appName}
          size={180 * u}
          primary={props.brand.primary}
          secondary={props.brand.secondary}
        />
      </div>
      <div
        style={{
          fontSize: (isLandscape ? 112 : 104) * u,
          fontWeight: 800,
          lineHeight: 1.05,
          letterSpacing: "-0.03em",
          maxWidth: isLandscape ? 1500 * u : 940 * u,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          columnGap: "0.25em",
        }}
      >
        {words.map((word, i) => (
          <WordIn key={i} delay={8 + i * 4} word={word} />
        ))}
      </div>
      <div
        style={{
          fontSize: 44 * u,
          opacity: subIn * 0.8,
          translate: `0 ${interpolate(subIn, [0, 1], [30, 0]) * u}px`,
          maxWidth: 900 * u,
          lineHeight: 1.3,
        }}
      >
        {props.hook.subheadline}
      </div>
    </AbsoluteFill>
  );
};

const WordIn: React.FC<{ word: string; delay: number }> = ({ word, delay }) => {
  const p = useEnter(delay);
  return (
    <span
      style={{
        display: "inline-block",
        opacity: p,
        translate: `0 ${interpolate(p, [0, 1], [0.4, 0])}em`,
        filter: `blur(${interpolate(p, [0, 1], [8, 0])}px)`,
      }}
    >
      {word}
    </span>
  );
};
