import React from "react";
import { Img, staticFile } from "remotion";
import { LOGOS } from "../content";
import { C, FONT } from "../tokens";

type LogoKey = keyof typeof LOGOS;

/** A logo sized by height (logical px), keeping its real aspect ratio. */
export const Logo: React.FC<{ name: LogoKey; h: number; style?: React.CSSProperties }> = ({ name, h, style }) => (
  <Img src={staticFile(LOGOS[name].src)} style={{ height: h, width: h * LOGOS[name].aspect, display: "block", ...style }} />
);

/** Co-brand lockup for the end card: Automatika logo × Pancake mark + name. Dark surfaces only. */
export const CoBrand: React.FC<{ h: number; stacked?: boolean }> = ({ h, stacked }) => (
  <div style={{ display: "flex", flexDirection: stacked ? "column" : "row", alignItems: "center", gap: h * 0.28 }}>
    <Logo name="automatika" h={h} />
    <span style={{ fontFamily: FONT.body, fontWeight: 500, fontSize: h * 0.32, color: C.muted }}>×</span>
    <div style={{ display: "flex", alignItems: "center", gap: h * 0.14 }}>
      <Logo name="pancake" h={h * 0.62} />
      <div style={{ fontFamily: FONT.head, fontWeight: 800, fontSize: h * 0.26, lineHeight: 1.05, color: C.cream }}>
        Pancake
        <div style={{ fontFamily: FONT.body, fontWeight: 500, fontSize: h * 0.15, color: C.blue }}>Philippines</div>
      </div>
    </div>
  </div>
);
