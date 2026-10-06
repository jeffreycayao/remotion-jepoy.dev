import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { useLayout } from "../../../lib/layout";
import { Keep, Logo, Pill, useEnter } from "../components";
import type { AppPromoProps } from "../schema";

export const CtaScene: React.FC<{ props: AppPromoProps }> = ({ props }) => {
  const frame = useCurrentFrame();
  const { u, safeTop, safeBottom } = useLayout();
  const logoIn = useEnter(0, 14);
  const nameIn = useEnter(6);
  const headIn = useEnter(12);
  const btnIn = useEnter(20, 10);
  // Soft heartbeat on the button after it lands.
  const pulse = 1 + Math.max(0, Math.sin((frame - 30) / 7)) * 0.04 * (frame > 30 ? 1 : 0);

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 40 * u,
        textAlign: "center",
        paddingTop: safeTop,
        paddingBottom: safeBottom,
        paddingLeft: 90 * u,
        paddingRight: 90 * u,
      }}
    >
      <div style={{ scale: String(logoIn) }}>
        <Logo
          src={props.logo}
          appName={props.appName}
          size={200 * u}
          primary={props.brand.primary}
          secondary={props.brand.secondary}
        />
      </div>
      <div style={{ fontSize: 64 * u, fontWeight: 800, opacity: nameIn, letterSpacing: "-0.02em" }}>
        {props.appName}
      </div>
      <div
        style={{
          fontSize: 84 * u,
          fontWeight: 800,
          lineHeight: 1.08,
          letterSpacing: "-0.03em",
          maxWidth: 1300 * u,
          opacity: headIn,
          translate: `0 ${interpolate(headIn, [0, 1], [40, 0]) * u}px`,
        }}
      >
        <Keep text={props.cta.headline} />
      </div>
      <div style={{ opacity: btnIn, marginTop: 16 * u }}>
        <Pill color={props.brand.primary} scale={interpolate(btnIn, [0, 1], [0.6, 1]) * pulse}>
          <Keep text={props.cta.button} />
        </Pill>
      </div>
      <div style={{ fontSize: 36 * u, opacity: btnIn * 0.7, fontWeight: 600 }}>{props.cta.url}</div>
    </AbsoluteFill>
  );
};
