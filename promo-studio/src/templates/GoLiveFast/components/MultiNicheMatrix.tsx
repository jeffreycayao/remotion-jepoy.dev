import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { CONTENT, LOGOS, type LogoKey } from "../content";
import { C, clamp, FONT, useLayout } from "../design";
import { Icon, type IconName } from "../Icons";

// Local frames (scene starts at abs 455). Each card lands on its spoken niche
// ("E-commerce, jewelry, solar, clinics, o education…"); each module connects as it is named
// ("…sa CRM, Webcake funnels, Botcake AI, at POS mo").
export const CARD_AT = [6, 27, 47, 80];
export const READY_DELAY = 12;
export const MODULE_AT = [161, 188, 221, 251];
export const ALL_LIVE_AT = 256;

type Box = { x: number; y: number; w: number; h: number };

const NicheCard: React.FC<{ box: Box; i: number; fs: number }> = ({ box, i, fs }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const niche = CONTENT.niches[i];
  const at = CARD_AT[i];
  const enter = spring({ frame: frame - at, fps, config: { damping: 13, stiffness: 150 } });
  const ready = frame >= at + READY_DELAY;
  const readyPop = spring({ frame: frame - at - READY_DELAY, fps, config: { damping: 9, stiffness: 240 } });
  // The lime focus ring cycles from card to card as each one goes live.
  const nextAt = i + 1 < CARD_AT.length ? CARD_AT[i + 1] + READY_DELAY : MODULE_AT[0];
  const focus = ready && frame < nextAt ? 1 : 0;
  const row = box.h < box.w * 0.5;
  return (
    <div
      style={{
        position: "absolute",
        left: box.x,
        top: box.y,
        width: box.w,
        height: box.h,
        boxSizing: "border-box",
        background: C.cream,
        borderRadius: 26,
        padding: fs * 0.8,
        display: "flex",
        flexDirection: row ? "row" : "column",
        alignItems: row ? "center" : "flex-start",
        justifyContent: row ? "flex-start" : "space-between",
        gap: fs * 0.7,
        opacity: Math.min(1, enter * 1.5),
        transform: `translateY(${(1 - enter) * 90}px) rotate(${(1 - enter) * (i % 2 ? 4 : -4)}deg) scale(${1 + 0.03 * focus})`,
        boxShadow: focus ? `0 0 0 5px ${C.lime}, 0 0 50px rgba(213,250,0,0.45)` : "0 24px 50px rgba(0,0,0,0.35)",
      }}
    >
      <div style={{ width: fs * 2.8, height: fs * 2.8, borderRadius: "50%", background: C.blue, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon name={niche.icon as IconName} size={fs * 1.6} color={C.ink} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: fs * 0.45, minWidth: 0 }}>
        <div style={{ fontFamily: FONT.body, fontWeight: 700, fontSize: fs * 1.15, lineHeight: 1.15, color: C.ink }}>{niche.title}</div>
        <div style={{ display: "flex", gap: fs * 0.4, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontFamily: FONT.mono, fontWeight: 600, fontSize: fs * 0.8, color: C.ink, background: C.blue, borderRadius: 999, padding: `${fs * 0.15}px ${fs * 0.5}px`, whiteSpace: "nowrap" }}>[{niche.tag}]</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: fs * 0.25, fontFamily: FONT.mono, fontWeight: 600, fontSize: fs * 0.8, borderRadius: 999, padding: `${fs * 0.15}px ${fs * 0.5}px`, whiteSpace: "nowrap", color: ready ? C.ink : C.olive, background: ready ? C.lime : "transparent", border: `2px solid ${ready ? C.lime : C.olive}`, transform: `scale(${ready ? 0.85 + 0.15 * readyPop : 1})` }}>
            {ready && <Icon name="check" size={fs * 0.8} color={C.ink} stroke={4} />}
            {ready ? "READY" : "SETTING UP…"}
          </span>
        </div>
      </div>
    </div>
  );
};

const ModuleChip: React.FC<{ box: Box; i: number; fs: number }> = ({ box, i, fs }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const mod = CONTENT.modules[i];
  const appear = spring({ frame: frame - (MODULE_AT[0] - 18) - i * 4, fps, config: { damping: 14, stiffness: 140 } });
  const on = frame >= MODULE_AT[i];
  const pop = spring({ frame: frame - MODULE_AT[i], fps, config: { damping: 9, stiffness: 230 } });
  const stacked = box.w < box.h * 1.6;
  return (
    <div
      style={{
        position: "absolute",
        left: box.x,
        top: box.y,
        width: box.w,
        height: box.h,
        boxSizing: "border-box",
        borderRadius: 22,
        background: on ? C.white : C.panel,
        border: `3px solid ${on ? C.lime : C.olive}`,
        display: "flex",
        flexDirection: stacked ? "column" : "row",
        alignItems: "center",
        justifyContent: "center",
        gap: fs * 0.5,
        padding: fs * 0.5,
        opacity: appear,
        transform: `translateY(${(1 - appear) * 40}px) scale(${on ? 0.92 + 0.08 * pop : 0.96})`,
        boxShadow: on ? "0 0 36px rgba(213,250,0,0.4)" : "none",
      }}
    >
      <div style={{ width: fs * (mod.logo === "botcake" ? 4.6 : 2.4), height: fs * 2.4, borderRadius: 14, background: C.white, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, opacity: on ? 1 : 0.55 }}>
        <Img src={staticFile(LOGOS[mod.logo as LogoKey])} style={{ width: "86%", height: "80%", objectFit: "contain" }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: stacked ? "center" : "flex-start", gap: 4 }}>
        <div style={{ fontFamily: FONT.body, fontWeight: 700, fontSize: fs, color: on ? C.ink : C.cream, whiteSpace: "nowrap", textAlign: "center" }}>{mod.name}</div>
        <div style={{ fontFamily: FONT.mono, fontWeight: 600, fontSize: fs * 0.7, color: on ? C.olive : C.muted, letterSpacing: 1.5 }}>{on ? "● CONNECTED" : "○ STANDBY"}</div>
      </div>
    </div>
  );
};

/** Scene 3 (455–734): four niche cards go READY, then CRM · Webcake · Botcake AI · POS wire into one hub. */
export const MultiNicheMatrix: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { w, pick } = useLayout();

  const L = pick<{ headY: number; head: number; cards: Box[]; cardFs: number; hub: { x: number; y: number; s: number }; mods: Box[]; modFs: number }>({
    wide: {
      headY: 70, head: 66,
      cards: [0, 1, 2, 3].map((i) => ({ x: 110 + i * 435, y: 200, w: 400, h: 330 })),
      cardFs: 34,
      hub: { x: 960, y: 650, s: 104 },
      mods: [0, 1, 2, 3].map((i) => ({ x: 110 + i * 435, y: 800, w: 400, h: 150 })),
      modFs: 32,
    },
    square: {
      headY: 50, head: 50,
      cards: [0, 1, 2, 3].map((i) => ({ x: 60 + (i % 2) * 490, y: 140 + Math.floor(i / 2) * 200, w: 470, h: 180 })),
      cardFs: 23,
      hub: { x: 540, y: 640, s: 80 },
      mods: [0, 1, 2, 3].map((i) => ({ x: 60 + i * 245, y: 760, w: 225, h: 240 })),
      modFs: 21,
    },
    portrait: {
      headY: 56, head: 56,
      cards: [0, 1, 2, 3].map((i) => ({ x: 60 + (i % 2) * 490, y: 160 + Math.floor(i / 2) * 250, w: 470, h: 230 })),
      cardFs: 26,
      hub: { x: 540, y: 760, s: 86 },
      mods: [0, 1, 2, 3].map((i) => ({ x: 60 + i * 245, y: 900, w: 225, h: 280 })),
      modFs: 21,
    },
    vertical: {
      headY: 150, head: 70,
      cards: [0, 1, 2, 3].map((i) => ({ x: 60 + (i % 2) * 490, y: 300 + Math.floor(i / 2) * 370, w: 470, h: 350 })),
      cardFs: 34,
      hub: { x: 540, y: 1160, s: 104 },
      mods: [0, 1, 2, 3].map((i) => ({ x: 60 + (i % 2) * 490, y: 1300 + Math.floor(i / 2) * 210, w: 470, h: 190 })),
      modFs: 34,
    },
  });

  const headIn = spring({ frame, fps, config: { damping: 14, stiffness: 140 } });
  const hubIn = spring({ frame: frame - (MODULE_AT[0] - 22), fps, config: { damping: 12, stiffness: 150 } });
  const allLive = spring({ frame: frame - ALL_LIVE_AT, fps, config: { damping: 9, stiffness: 200 } });
  const allOn = frame >= ALL_LIVE_AT;
  const hubR = L.hub.s / 2;

  return (
    <AbsoluteFill style={{ background: C.charcoal, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% ${(L.hub.y / (L.mods[0].y + 400)) * 100}%, rgba(213,250,0,${0.05 + 0.15 * (allOn ? allLive : 0)}), transparent 55%)` }} />

      <div style={{ position: "absolute", left: 0, right: 0, top: L.headY, display: "flex", justifyContent: "center", alignItems: "center", gap: 22, opacity: headIn, transform: `translateY(${(1 - headIn) * -30}px)` }}>
        <div style={{ fontFamily: FONT.head, fontWeight: 800, fontSize: L.head, letterSpacing: -1.5, color: C.cream, lineHeight: 1.1 }}>
          {CONTENT.nicheHeadline.split(" ").slice(0, -1).join(" ")} <span style={{ color: C.lime }}>{CONTENT.nicheHeadline.split(" ").slice(-1)}</span>
        </div>
      </div>

      {/* Wiring: olive paths from the hub draw in, then turn lime as each module connects. */}
      <svg width={w} height="100%" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {L.mods.map((m, i) => {
          const tx = m.x + m.w / 2;
          const ty = m.y + 4;
          const d = `M ${L.hub.x} ${L.hub.y + hubR} C ${L.hub.x} ${(L.hub.y + ty) / 2 + 30}, ${tx} ${(L.hub.y + ty) / 2 - 30}, ${tx} ${ty}`;
          const draw = interpolate(frame, [MODULE_AT[0] - 16 + i * 3, MODULE_AT[0] - 2 + i * 3], [0, 1], clamp);
          const on = frame >= MODULE_AT[i];
          const runner = on ? ((frame - MODULE_AT[i]) % 30) / 30 : 0;
          return (
            <g key={i}>
              <path d={d} stroke={on ? C.lime : C.olive} strokeWidth={on ? 6 : 4} fill="none" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - draw} strokeLinecap="round" />
              {on && <path d={d} stroke={C.white} strokeWidth={8} fill="none" pathLength={1} strokeDasharray="0.06 0.94" strokeDashoffset={-runner} strokeLinecap="round" opacity={0.8} />}
            </g>
          );
        })}
      </svg>

      {CONTENT.niches.map((n, i) => (
        <NicheCard key={n.title} box={L.cards[i]} i={i} fs={L.cardFs} />
      ))}
      {CONTENT.modules.map((m, i) => (
        <ModuleChip key={m.name} box={L.mods[i]} i={i} fs={L.modFs} />
      ))}

      {/* Hub: the Automatika mark, ringed lime once every system is live. */}
      <div style={{ position: "absolute", left: L.hub.x - hubR, top: L.hub.y - hubR, width: L.hub.s, height: L.hub.s, borderRadius: "50%", background: C.panel, border: `4px solid ${allOn ? C.lime : C.olive}`, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${hubIn * (1 + 0.08 * (allOn ? Math.sin((frame - ALL_LIVE_AT) / 4) * Math.max(0, 1 - (frame - ALL_LIVE_AT) / 24) : 0))})`, boxShadow: allOn ? "0 0 50px rgba(213,250,0,0.6)" : "none" }}>
        <Img src={staticFile(LOGOS.mark)} style={{ width: "58%", height: "58%", objectFit: "contain" }} />
      </div>
      <div style={{ position: "absolute", left: L.hub.x + hubR + 18, top: L.hub.y, transform: `translateY(-50%) scale(${allLive})`, transformOrigin: "0% 50%", opacity: allLive, display: "flex", alignItems: "center", gap: 10, background: C.lime, color: C.ink, borderRadius: 999, padding: `${L.modFs * 0.35}px ${L.modFs * 0.8}px`, fontFamily: FONT.mono, fontWeight: 600, fontSize: L.modFs, whiteSpace: "nowrap" }}>
        <Icon name="bolt" size={L.modFs * 1.1} color={C.ink} />
        {CONTENT.allLive}
      </div>
    </AbsoluteFill>
  );
};
