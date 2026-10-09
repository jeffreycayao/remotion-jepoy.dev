import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, clamp, FONT, T, useLayout } from "../tokens";

const ease = Easing.bezier(0.16, 1, 0.3, 1);

/** A line that rises out of its own baseline mask at `at`. */
export const RevealLine: React.FC<{ at: number; children: React.ReactNode; style?: React.CSSProperties }> = ({
  at,
  children,
  style,
}) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ overflow: "hidden", paddingBottom: "0.08em" }}>
      <div
        style={{
          translate: `0 ${interpolate(frame, [at, at + 22], [110, 0], { ...clamp, easing: ease })}%`,
          ...style,
        }}
      >
        {children}
      </div>
    </div>
  );
};

/** Scene 1a — the three paths named in the first line of the voiceover, one per spoken phrase. */
const OpeningQuestions: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u, s, landscape } = useLayout();
  const words = [
    { at: T.freelancing, text: "Freelancing?" },
    { at: T.careerShift, text: "Career shift?" },
    { at: T.business, text: "Grow your business?" },
  ];
  const leave = interpolate(frame, [T.headline - 14, T.headline], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        gap: 18 * u,
        opacity: 1 - leave,
        translate: `0 ${-leave * 60 * u}px`,
      }}
    >
      {words.map((w, i) => {
        const pop = spring({ frame: frame - w.at, fps, config: { damping: 200 }, durationInFrames: 22 });
        return (
          <div
            key={w.text}
            style={{
              fontFamily: FONT.serif,
              fontStyle: "italic",
              fontWeight: 500,
              fontSize: (landscape ? 92 : 96 * Math.min(s, 1.06)) * u,
              whiteSpace: "nowrap",
              textAlign: "center",
              color: i === 2 ? C.terracotta : C.ink,
              opacity: pop,
              translate: `${(1 - pop) * (i % 2 ? 60 : -60) * u}px 0`,
              lineHeight: 1.1,
            }}
          >
            {w.text}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/** Scene 1b — "YOUR NEXT CHAPTER STARTS WITH LEARNING", LEARNING landing on "matuto". */
const ChapterHeadline: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u, s, landscape } = useLayout();
  const size = (landscape ? 104 : 96 * Math.min(s, 1.1)) * u;
  const learn = spring({ frame: frame - T.learning, fps, config: { damping: 12, stiffness: 120 } });
  const underline = interpolate(frame, [T.learning + 8, T.learning + 30], [0, 1], { ...clamp, easing: ease });
  const glow = frame >= T.learning ? 0.35 + 0.15 * Math.sin((frame - T.learning) / 6) : 0;
  const line: React.CSSProperties = {
    fontFamily: FONT.serif,
    fontWeight: 800,
    fontSize: size,
    letterSpacing: "0.01em",
    lineHeight: 1.04,
    color: C.ink,
    textAlign: "center",
  };

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: `0 ${80 * u}px` }}>
      <RevealLine at={T.headline} style={line}>
        YOUR NEXT CHAPTER
      </RevealLine>
      <RevealLine at={T.headline + 7} style={line}>
        STARTS WITH
      </RevealLine>
      <div style={{ position: "relative", marginTop: 14 * u }}>
        <div
          style={{
            ...line,
            fontSize: size * 1.42,
            color: C.terracotta,
            opacity: Math.min(1, learn * 1.5),
            scale: interpolate(learn, [0, 1], [0.7, 1]),
            textShadow: `0 0 ${60 * u}px rgba(208, 90, 34, ${glow})`,
            letterSpacing: "0.03em",
          }}
        >
          LEARNING
        </div>
        <div
          style={{
            position: "absolute",
            left: "6%",
            right: "6%",
            bottom: -6 * u,
            height: 6 * u,
            borderRadius: 99,
            background: C.gold,
            scale: `${underline} 1`,
            transformOrigin: "left center",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

/** Scene 1 (frames 0 → T.speaker): the questions, then the chapter headline. */
export const EditorialOpening: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      {frame < T.headline && <OpeningQuestions />}
      {frame >= T.headline - 2 && <ChapterHeadline />}
    </AbsoluteFill>
  );
};
