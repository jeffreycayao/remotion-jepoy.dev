import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { CONTENT, LOGOS } from "../content";
import { C, FONT, clamp, useLayout } from "../design";

/** Scene 3, local frames 0–329: Automatika brings the four Pancake tools into one setup. */
export const PancakeEcosystemStack: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { w, h, scale, vertical, wide, square, side, safeTop, safeBottom } = useLayout();
  const contentWidth = w - side * 2;
  const columns = wide ? 4 : 2;
  const gap = (wide ? 22 : vertical ? 26 : 20) * scale;
  const cardWidth = (contentWidth - gap * (columns - 1)) / columns;
  const cardHeight = (wide ? 310 : vertical ? 360 : square ? 205 : 276) * scale;
  const cardsTop = (wide ? 478 : vertical ? 658 : square ? 424 : 478) * scale;
  const brandTop = (wide ? 260 : vertical ? 420 : square ? 248 : 275) * scale;
  const brandHeight = (wide ? 150 : vertical ? 155 : square ? 105 : 126) * scale;
  const brandWidth = (wide ? 550 : vertical ? 610 : square ? 475 : 540) * scale;
  const assuranceTop = (wide ? 864 : vertical ? 1538 : square ? 920 : 1155) * scale;
  const cardCenters = CONTENT.pillars.map((_, index) =>
    side + (index % columns) * (cardWidth + gap) + cardWidth / 2,
  );
  const lineProgress = interpolate(frame, [42, 96], [0, 1], clamp);
  const badgeIn = spring({ frame: frame - 5, fps, config: { damping: 16, stiffness: 125 } });
  const headingIn = spring({ frame: frame - 12, fps, config: { damping: 18, stiffness: 110 } });
  const brandIn = spring({ frame: frame - 25, fps, config: { damping: 17, stiffness: 115 } });

  const connector = (d: string, key: string) => (
    <path
      key={key}
      d={d}
      fill="none"
      stroke={C.olive}
      strokeWidth={4 * scale}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray="2000"
      strokeDashoffset={2000 * (1 - lineProgress)}
    />
  );

  return (
    <AbsoluteFill style={{ background: C.charcoal, color: C.cream, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 47%, ${C.olive}4D 0, transparent 49%), radial-gradient(circle at 95% 95%, ${C.olive}22 0, transparent 35%)`,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${C.olive}18 1px, transparent 1px), linear-gradient(90deg, ${C.olive}18 1px, transparent 1px)`,
          backgroundSize: `${72 * scale}px ${72 * scale}px`,
          opacity: 0.56,
        }}
      />

      <div
        style={{
          position: "absolute",
          top: safeTop + (wide ? 1 : vertical ? 12 : 0) * scale,
          left: side,
          right: side,
          display: "flex",
          justifyContent: "center",
          opacity: Math.max(0, Math.min(1, badgeIn)),
          translate: `0px ${(1 - badgeIn) * -23 * scale}px`,
        }}
      >
        <div
          style={{
            boxSizing: "border-box",
            maxWidth: "100%",
            borderRadius: 100 * scale,
            background: C.lime,
            color: C.charcoal,
            padding: `${(vertical ? 19 : square ? 11 : 15) * scale}px ${(vertical ? 29 : 25) * scale}px`,
            boxShadow: `0 0 ${36 * scale}px ${C.lime}55`,
            fontFamily: FONT.mono,
            fontWeight: 600,
            fontSize: (wide ? 23 : vertical ? 22 : square ? 18 : 21) * scale,
            lineHeight: 1.15,
            letterSpacing: 1.1 * scale,
            textAlign: "center",
          }}
        >
          {CONTENT.partnerBadge}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          top: (wide ? 160 : vertical ? 242 : square ? 153 : 166) * scale,
          left: side,
          width: contentWidth,
          textAlign: "center",
          fontFamily: FONT.head,
          fontWeight: 800,
          fontSize: (wide ? 72 : vertical ? 72 : square ? 54 : 64) * scale,
          lineHeight: 1.05,
          letterSpacing: -2.4 * scale,
          opacity: Math.max(0, Math.min(1, headingIn)),
          translate: `0px ${(1 - headingIn) * 28 * scale}px`,
        }}
      >
        One connected stack.
      </div>

      <div
        style={{
          position: "absolute",
          top: brandTop,
          left: (w - brandWidth) / 2,
          width: brandWidth,
          height: brandHeight,
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: (wide ? 29 : square ? 19 : 26) * scale,
          borderRadius: 28 * scale,
          border: `2px solid ${C.olive}`,
          background: `${C.panel}F2`,
          boxShadow: `0 20px 48px ${C.charcoal}77`,
          opacity: Math.max(0, Math.min(1, brandIn)),
          scale: `${0.9 + 0.1 * brandIn}`,
        }}
      >
        <Img
          src={staticFile(LOGOS.automatika)}
          style={{ width: (wide ? 184 : vertical ? 190 : square ? 132 : 167) * scale, height: brandHeight * 0.87, objectFit: "contain" }}
        />
        <span style={{ color: C.olive, fontFamily: FONT.mono, fontSize: (wide ? 38 : square ? 28 : 36) * scale, fontWeight: 600 }}>×</span>
        <Img
          src={staticFile(LOGOS.pancake)}
          style={{ width: (wide ? 108 : vertical ? 112 : square ? 77 : 95) * scale, height: brandHeight * 0.75, objectFit: "contain" }}
        />
      </div>

      <svg style={{ position: "absolute", inset: 0, width: w, height: h, overflow: "visible", pointerEvents: "none" }} viewBox={`0 0 ${w} ${h}`}>
        {wide ? (
          <>
            {connector(`M ${w / 2} ${brandTop + brandHeight} V ${cardsTop - 42 * scale}`, "wide-trunk")}
            {connector(`M ${cardCenters[0]} ${cardsTop - 42 * scale} H ${cardCenters[3]}`, "wide-rail")}
            {cardCenters.map((center, index) => connector(`M ${center} ${cardsTop - 42 * scale} V ${cardsTop + 2 * scale}`, `wide-branch-${index}`))}
          </>
        ) : (
          <>
            {connector(`M ${w / 2} ${brandTop + brandHeight} V ${cardsTop + cardHeight + gap / 2}`, "stack-trunk")}
            {connector(`M ${cardCenters[0]} ${cardsTop - 27 * scale} H ${cardCenters[1]}`, "stack-rail-one")}
            {connector(`M ${cardCenters[0]} ${cardsTop + cardHeight + gap / 2} H ${cardCenters[1]}`, "stack-rail-two")}
            {[0, 1].map((index) => connector(`M ${cardCenters[index]} ${cardsTop - 27 * scale} V ${cardsTop + 2 * scale}`, `stack-upper-${index}`))}
            {[2, 3].map((index) => connector(`M ${cardCenters[index]} ${cardsTop + cardHeight + gap / 2} V ${cardsTop + cardHeight + gap + 2 * scale}`, `stack-lower-${index}`))}
          </>
        )}
      </svg>

      {CONTENT.pillars.map((pillar, index) => {
        const row = Math.floor(index / columns);
        const col = index % columns;
        const enter = spring({ frame: frame - 66 - index * 15, fps, config: { damping: 15, stiffness: 135 } });
        const lock = interpolate(frame, [73 + index * 15, 85 + index * 15], [0, 1], clamp);
        return (
          <div
            key={pillar.name}
            style={{
              position: "absolute",
              top: cardsTop + row * (cardHeight + gap),
              left: side + col * (cardWidth + gap),
              width: cardWidth,
              height: cardHeight,
              boxSizing: "border-box",
              padding: (wide ? 27 : vertical ? 30 : square ? 20 : 25) * scale,
              border: `${3 * scale}px solid ${C.olive}`,
              borderRadius: (wide ? 28 : 24) * scale,
              background: C.cream,
              color: C.charcoal,
              boxShadow: `0 ${25 * scale}px ${48 * scale}px ${C.charcoal}77, inset 0 ${8 * scale}px ${C.lime}B0`,
              opacity: Math.max(0, Math.min(1, enter)),
              translate: `0px ${(1 - enter) * 65 * scale}px`,
              scale: `${0.89 + 0.11 * enter}`,
              overflow: "hidden",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div
                style={{
                  width: 78 * scale,
                  height: 78 * scale,
                  flexShrink: 0,
                  display: "grid",
                  placeItems: "center",
                  borderRadius: 20 * scale,
                  border: `2px solid ${C.olive}44`,
                  background: C.white,
                }}
              >
                <Img src={staticFile(pillar.logo)} style={{ width: 64 * scale, height: 64 * scale, objectFit: "contain" }} />
              </div>
              <span style={{ color: C.olive, fontFamily: FONT.mono, fontWeight: 600, fontSize: (wide ? 20 : square ? 15 : 18) * scale, letterSpacing: 1 * scale }}>
                0{index + 1} / 04
              </span>
            </div>
            <div
              style={{
                marginTop: (wide ? 41 : vertical ? 68 : square ? 12 : 35) * scale,
                fontFamily: FONT.head,
                fontSize: (wide ? 39 : vertical ? 36 : square ? 32 : 36) * scale,
                fontWeight: 800,
                letterSpacing: -1.4 * scale,
                lineHeight: 1.08,
                overflowWrap: "break-word",
              }}
            >
              {pillar.name}
            </div>
            <div style={{ marginTop: 9 * scale, color: C.olive, fontFamily: FONT.body, fontWeight: 600, fontSize: (wide ? 23 : vertical ? 23 : square ? 18 : 21) * scale, lineHeight: 1.2 }}>
              {pillar.detail}
            </div>
            <div
              style={{
                position: "absolute",
                right: 22 * scale,
                bottom: 18 * scale,
                width: 13 * scale,
                height: 13 * scale,
                borderRadius: "50%",
                background: C.lime,
                border: `2px solid ${C.olive}`,
                opacity: lock,
                boxShadow: `0 0 ${14 * scale}px ${C.lime}`,
              }}
            />
          </div>
        );
      })}

      <div
        style={{
          position: "absolute",
          top: assuranceTop,
          left: side,
          width: contentWidth,
          display: "flex",
          justifyContent: "center",
          gap: (wide ? 18 : 12) * scale,
          opacity: interpolate(frame, [171, 195], [0, 1], clamp),
        }}
      >
        {CONTENT.assuranceBadges.map((label, index) => (
          <div
            key={label}
            style={{
              boxSizing: "border-box",
              flex: wide ? "0 1 auto" : 1,
              borderRadius: 100 * scale,
              background: C.blue,
              color: C.charcoal,
              padding: `${(square ? 10 : 14) * scale}px ${(wide ? 23 : 13) * scale}px`,
              textAlign: "center",
              fontFamily: FONT.mono,
              fontWeight: 600,
              fontSize: (wide ? 20 : vertical ? 18 : square ? 15 : 17) * scale,
              lineHeight: 1.2,
              translate: `0px ${Math.max(0, 1 - spring({ frame: frame - 177 - index * 9, fps, config: { damping: 17, stiffness: 130 } })) * 24 * scale}px`,
            }}
          >
            {label}
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: side, right: side, bottom: Math.max(safeBottom, 35 * scale), borderTop: `2px solid ${C.olive}99`, opacity: 0.75 }} />
      <div style={{ position: "absolute", left: side, bottom: safeBottom + 13 * scale, fontFamily: FONT.mono, fontSize: (vertical ? 16 : wide ? 16 : 13) * scale, color: C.muted }}>
        {CONTENT.illustrativeNote}
      </div>
    </AbsoluteFill>
  );
};
