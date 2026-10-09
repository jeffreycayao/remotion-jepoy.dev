import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { CONTENT, LOGOS } from "../content";
import { C, clamp, FONT, useLayout } from "../design";
import { Icon } from "../Icons";

// Local frames (scene starts at abs 199). Voice: 0.13 s "Huwag mo nang daanin sa trial-and-error." ·
// 2.4 s "Sa Automatika," · 3.6 s "kami ang certified implementor … sa bilis ng kidlat."
export const STRIKE_AT = 50; // "trial-and-error" struck out
export const PARTNER_AT = 74; // "Sa Automatika" — badge snaps in
const SPLIT_AT = 96; // logo moves aside, dial arrives
export const STEP_AT = [120, 145, 170]; // BUILD · WIRE · TEST tick during "magtatayo ng buong system mo"
export const LAUNCH_AT = 205; // "sa bilis ng kidlat" — dial launches 0 → 100 % in 0.8 s
export const READY_AT = LAUNCH_AT + 24;

const LOGO_RATIO = 1024 / 810;

type Pt = { x: number; y: number };

/** Semicircle speedometer: olive track, lime fill, needle, mono readout. */
const Dial: React.FC<{ r: number; value: number; ready: number }> = ({ r, value, ready }) => {
  const stroke = r * 0.13;
  const size = r * 2 + stroke;
  const angle = -180 + 180 * value; // −180 = 0 %, 0 = 100 %
  const arc = (to: number) => {
    const a = (Math.PI * to) / 180;
    const cx = size / 2;
    const cy = r + stroke / 2;
    return `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r * Math.cos(a)} ${cy + r * Math.sin(a)}`;
  };
  const ticks = new Array(11).fill(0).map((_, i) => {
    const a = (Math.PI * (-180 + i * 18)) / 180;
    const cx = size / 2;
    const cy = r + stroke / 2;
    const r1 = r - stroke * 0.9;
    const r2 = r - stroke * (i % 5 === 0 ? 1.9 : 1.4);
    return <line key={i} x1={cx + r1 * Math.cos(a)} y1={cy + r1 * Math.sin(a)} x2={cx + r2 * Math.cos(a)} y2={cy + r2 * Math.sin(a)} stroke={C.muted} strokeWidth={3} strokeLinecap="round" />;
  });
  const cx = size / 2;
  const cy = r + stroke / 2;
  const na = (Math.PI * angle) / 180;
  return (
    <svg width={size} height={r + stroke * 1.4} style={{ overflow: "visible" }}>
      <path d={arc(0)} stroke={C.panel} strokeWidth={stroke} fill="none" strokeLinecap="round" />
      <path d={arc(0)} stroke={C.olive} strokeWidth={stroke * 0.2} fill="none" strokeLinecap="round" opacity={0.8} />
      {value > 0.001 && <path d={arc(angle)} stroke={C.lime} strokeWidth={stroke} fill="none" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 ${10 + ready * 20}px rgba(213,250,0,0.6))` }} />}
      {ticks}
      <line x1={cx} y1={cy} x2={cx + (r - stroke * 1.6) * Math.cos(na)} y2={cy + (r - stroke * 1.6) * Math.sin(na)} stroke={C.cream} strokeWidth={stroke * 0.32} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={stroke * 0.55} fill={C.cream} />
    </svg>
  );
};

/** Scene 2 (199–455): huge Automatika logo, implementation-partner badge, speedometer to 100 % READY. */
export const AutomatikaImplementorBadge: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { w, h, kind, pick } = useLayout();

  const L = pick<{ logo: [number, number]; logoAt: [Pt, Pt]; dialAt: Pt; r: number; badge: number; struck: number; num: number; step: number }>({
    wide: { logo: [470, 360], logoAt: [{ x: w / 2, y: h / 2 - 20 }, { x: 560, y: 470 }], dialAt: { x: 1370, y: 540 }, r: 270, badge: 30, struck: 34, num: 86, step: 26 },
    square: { logo: [420, 230], logoAt: [{ x: w / 2, y: h / 2 - 40 }, { x: w / 2, y: 190 }], dialAt: { x: w / 2, y: 700 }, r: 200, badge: 25, struck: 30, num: 64, step: 22 },
    portrait: { logo: [460, 280], logoAt: [{ x: w / 2, y: h / 2 - 50 }, { x: w / 2, y: 240 }], dialAt: { x: w / 2, y: 870 }, r: 230, badge: 26, struck: 32, num: 72, step: 24 },
    vertical: { logo: [560, 390], logoAt: [{ x: w / 2, y: h / 2 - 80 }, { x: w / 2, y: 470 }], dialAt: { x: w / 2, y: 1250 }, r: 300, badge: 30, struck: 36, num: 92, step: 28 },
  });

  const logoIn = spring({ frame: frame - 2, fps, config: { damping: 12, stiffness: 120 } });
  const split = spring({ frame: frame - SPLIT_AT, fps, config: { damping: 16, stiffness: 90 } });
  const partner = spring({ frame: frame - PARTNER_AT, fps, config: { damping: 10, stiffness: 190 } });
  const pulse = interpolate(frame, [PARTNER_AT, PARTNER_AT + 8, PARTNER_AT + 30], [0, 1, 0], clamp);
  const struckIn = interpolate(frame, [10, 22], [0, 1], clamp);
  const struckLine = interpolate(frame, [STRIKE_AT, STRIKE_AT + 8], [0, 1], { ...clamp, easing: Easing.out(Easing.quad) });
  const struckOut = interpolate(frame, [PARTNER_AT - 6, PARTNER_AT + 4], [1, 0], clamp);
  const dialIn = spring({ frame: frame - SPLIT_AT - 8, fps, config: { damping: 14, stiffness: 110 } });
  const value = interpolate(frame, [LAUNCH_AT, READY_AT], [0, 1], { ...clamp, easing: Easing.bezier(0.5, 0, 0.2, 1) });
  const ready = spring({ frame: frame - READY_AT, fps, config: { damping: 9, stiffness: 200 } });
  const flash = interpolate(frame, [READY_AT, READY_AT + 3, READY_AT + 14], [0, 0.5, 0], clamp);

  const logoH = interpolate(split, [0, 1], L.logo);
  const at = { x: interpolate(split, [0, 1], [L.logoAt[0].x, L.logoAt[1].x]), y: interpolate(split, [0, 1], [L.logoAt[0].y, L.logoAt[1].y]) };
  const steps = CONTENT.implementor.steps;
  const stepOn = (i: number) => frame >= (i < STEP_AT.length ? STEP_AT[i] : READY_AT);

  return (
    <AbsoluteFill style={{ background: C.charcoal, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at ${(at.x / w) * 100}% ${(at.y / h) * 100}%, rgba(213,250,0,${0.1 + 0.18 * pulse}), transparent 45%)` }} />
      <AbsoluteFill style={{ background: `radial-gradient(circle at ${(L.dialAt.x / w) * 100}% ${(L.dialAt.y / h) * 100}%, rgba(104,115,35,${0.22 * dialIn}), transparent 28%)` }} />

      {/* Logo lockup + partner badge + struck "trial-and-error". */}
      <div style={{ position: "absolute", left: at.x, top: at.y, transform: "translate(-50%, -50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
        <Img
          src={staticFile(LOGOS.automatika)}
          style={{ height: logoH, width: logoH * LOGO_RATIO, objectFit: "contain", transform: `scale(${(0.6 + 0.4 * logoIn) * (1 + 0.04 * pulse)})`, opacity: Math.min(1, logoIn * 1.4), filter: `drop-shadow(0 0 ${30 * pulse}px rgba(213,250,0,0.6))` }}
        />
        <div style={{ height: L.badge * 2.2, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
          <div style={{ position: "absolute", fontFamily: FONT.mono, fontWeight: 600, fontSize: L.struck, color: C.red, letterSpacing: 3, opacity: struckIn * struckOut, whiteSpace: "nowrap" }}>
            {CONTENT.implementor.struck}
            <div style={{ position: "absolute", left: -10, top: "50%", height: 5, width: `calc(${struckLine * 100}% + 20px)`, background: C.red, borderRadius: 3 }} />
          </div>
          <div style={{ fontFamily: FONT.mono, fontWeight: 600, fontSize: L.badge, letterSpacing: 2, color: C.ink, background: C.blue, borderRadius: 999, padding: `${L.badge * 0.4}px ${L.badge * 0.9}px`, whiteSpace: "nowrap", transform: `scale(${partner})`, opacity: partner }}>
            [{CONTENT.implementor.badge}]
          </div>
        </div>
      </div>

      {/* Speedometer: launches 0 → 100 % READY in 0.8 s on "sa bilis ng kidlat". */}
      <div style={{ position: "absolute", left: L.dialAt.x, top: L.dialAt.y, transform: `translate(-50%, -50%) scale(${0.7 + 0.3 * dialIn})`, opacity: dialIn, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ position: "relative" }}>
          <Dial r={L.r} value={value} ready={ready} />
          <div style={{ position: "absolute", left: 0, right: 0, bottom: L.r * 0.18, textAlign: "center", fontFamily: FONT.mono, fontWeight: 600, fontSize: L.num, color: value >= 1 ? C.lime : C.cream, fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>
            {Math.round(value * 100)}%
          </div>
        </div>
        <div style={{ height: L.step * 2.6, display: "flex", alignItems: "center", marginTop: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, background: C.lime, color: C.ink, borderRadius: 999, padding: `${L.step * 0.35}px ${L.step}px`, fontFamily: FONT.mono, fontWeight: 600, fontSize: L.step * 1.25, transform: `scale(${ready})`, opacity: ready, whiteSpace: "nowrap" }}>
            <Icon name="bolt" size={L.step * 1.3} color={C.ink} />
            {CONTENT.implementor.ready}
          </div>
        </div>
        <div style={{ display: "flex", gap: kind === "wide" ? 14 : 10, marginTop: 14 }}>
          {steps.map((s, i) => {
            const on = stepOn(i);
            const pop = spring({ frame: frame - (i < STEP_AT.length ? STEP_AT[i] : READY_AT), fps, config: { damping: 10, stiffness: 220 } });
            return (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: FONT.mono, fontWeight: 600, fontSize: L.step, letterSpacing: 1.5, color: on ? C.ink : C.muted, background: on ? C.lime : "transparent", border: `2px solid ${on ? C.lime : C.olive}`, borderRadius: 999, padding: `${L.step * 0.3}px ${L.step * 0.65}px`, transform: `scale(${on ? 0.9 + 0.1 * pop : 1})` }}>
                {on && <Icon name="check" size={L.step * 0.9} color={C.ink} stroke={4} />}
                {s}
              </div>
            );
          })}
        </div>
      </div>

      <AbsoluteFill style={{ background: C.lime, opacity: flash * 0.35, mixBlendMode: "screen", pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};
