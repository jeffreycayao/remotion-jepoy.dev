import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C } from "./tokens";

/** Word-by-word rise-in. Words listed in `accent` are painted Electric Lime. */
export const RevealText: React.FC<{
  text: string;
  delay?: number;
  stagger?: number;
  accent?: string[];
  style?: React.CSSProperties;
}> = ({ text, delay = 0, stagger = 3, accent = [], style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={style}>
      {text.split(" ").map((word, i) => {
        const p = spring({ frame: frame - delay - i * stagger, fps, config: { damping: 200 } });
        return (
          <React.Fragment key={i}>
            <span
              style={{
                display: "inline-block",
                opacity: p,
                translate: `0px ${(1 - p) * 0.45}em`,
                color: accent.includes(word) ? C.lime : undefined,
              }}
            >
              {word}
            </span>{" "}
          </React.Fragment>
        );
      })}
    </div>
  );
};
