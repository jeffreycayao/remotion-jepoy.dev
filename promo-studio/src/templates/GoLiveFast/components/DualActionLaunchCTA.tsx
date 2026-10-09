import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { CONTENT, LOGOS } from "../content";
import { C, clamp, FONT, useLayout } from "../design";
import { Icon } from "../Icons";

// Local frames (scene starts at abs 734). Voice: 0.13 s "Magbenta ka na agad…" · 2.7 s "Comment 'LAUNCH'" ·
// ~3.8 s "o i-click ang link" · ~5.6 s "…with Automatika today!" (ends 6.7 s, then the CTA holds).
export const HEAD_AT = 6;
export const COMMENT_AT = 78;
export const BOOK_AT = 112;
export const CLICK_AT = 142;
const LOCKUP_AT = 168;

const Pill: React.FC<{ label: string; icon: "comment" | "calendar"; color: string; at: number; fs: number; h: number; w: number; primary?: boolean }> = ({ label, icon, color, at, fs, h, w, primary }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: frame - at, fps, config: { damping: 9, stiffness: 170 } });
  const press = primary ? interpolate(frame, [CLICK_AT - 2, CLICK_AT + 2, CLICK_AT + 9], [0, 1, 0], clamp) : 0;
  const pulse = primary && frame > CLICK_AT + 10 ? 1 + Math.sin((frame - CLICK_AT) / 8) * 0.018 : 1;
  // Cursor glides in from bottom-right and clicks the booking button.
  const glide = interpolate(frame, [BOOK_AT + 6, CLICK_AT - 3], [1, 0], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const cursorOn = primary && frame >= BOOK_AT + 6 && frame < CLICK_AT + 40;
  const cursorFade = interpolate(frame, [CLICK_AT + 24, CLICK_AT + 40], [1, 0], clamp);
  return (
    <div style={{ position: "relative", width: w, height: h, flexShrink: 0, opacity: Math.min(1, enter * 1.6), transform: `translateY(${(1 - enter) * 50}px) scale(${(0.7 + 0.3 * enter) * pulse * (1 - 0.05 * press)})` }}>
      {primary &&
        [0, 22].map((off) => {
          const t = frame - CLICK_AT - off;
          const ph = t < 0 ? 0 : (t % 44) / 44;
          return <div key={off} style={{ position: "absolute", inset: -8, borderRadius: 999, border: `4px solid ${C.lime}`, opacity: t < 0 ? 0 : (1 - ph) * 0.65, transform: `scale(${1 + ph * 0.2})` }} />;
        })}
      <div style={{ width: "100%", height: "100%", borderRadius: 999, background: color, color: C.ink, display: "flex", alignItems: "center", justifyContent: "center", gap: fs * 0.45, fontFamily: FONT.body, fontWeight: 700, fontSize: fs, whiteSpace: "nowrap", boxShadow: primary ? `0 0 ${50 + 25 * press}px rgba(213,250,0,0.5), 0 18px 40px rgba(0,0,0,0.4)` : "0 18px 40px rgba(0,0,0,0.4)" }}>
        <Icon name={icon} size={fs * 1.05} color={C.ink} />
        {label}
      </div>
      {cursorOn && (
        <svg width={fs * 1.3} height={fs * 1.3} viewBox="0 0 24 24" style={{ position: "absolute", left: w * 0.62 + glide * 260, top: h * 0.5 + glide * 220, transform: `scale(${1 - 0.15 * press})`, opacity: cursorFade, filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.5))" }}>
          <path d="M3 2l7.5 19 2.6-7.9L21 10.5 3 2Z" fill={C.white} stroke={C.ink} strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
      )}
    </div>
  );
};

/** Scene 4 (734–1050): "Launch Fast. Scale Without The Wait." + Comment 'LAUNCH' / Book Quick Onboarding. */
export const DualActionLaunchCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { w, h, wide, pick } = useLayout();

  const S = pick({
    wide: { head: 118, sub: 32, pill: 46, pillH: 112, pillW: 640, gap: 44, logo: 54 },
    square: { head: 82, sub: 25, pill: 38, pillH: 92, pillW: 760, gap: 26, logo: 44 },
    portrait: { head: 92, sub: 27, pill: 40, pillH: 100, pillW: 800, gap: 32, logo: 48 },
    vertical: { head: 104, sub: 31, pill: 44, pillH: 122, pillW: 880, gap: 52, logo: 58 },
  });

  const head1 = spring({ frame: frame - HEAD_AT, fps, config: { damping: 11, stiffness: 160 } });
  const head2 = spring({ frame: frame - HEAD_AT - 12, fps, config: { damping: 13, stiffness: 140 } });
  const sub = interpolate(frame, [HEAD_AT + 30, HEAD_AT + 48], [0, 1], clamp);
  const lockup = spring({ frame: frame - LOCKUP_AT, fps, config: { damping: 14, stiffness: 130 } });
  const s = Math.min(w, h);
  const accent = CONTENT.cta.headlineAccent;

  return (
    <AbsoluteFill style={{ background: C.charcoal, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 70% 70%, rgba(213,250,0,0.13), transparent 40%), radial-gradient(circle at 15% 15%, rgba(104,115,35,0.25), transparent 35%)" }} />
      {/* Velocity tracks: olive rings drifting behind the copy. */}
      <div style={{ position: "absolute", width: s * 1.2, height: s * 1.2, borderRadius: "50%", border: `2px solid rgba(104,115,35,0.5)`, top: -s * 0.45, right: -s * 0.4, transform: `rotate(${frame * 0.05}deg)` }} />
      <div style={{ position: "absolute", width: s * 0.7, height: s * 0.7, borderRadius: "50%", border: `2px solid rgba(104,115,35,0.35)`, bottom: -s * 0.4, left: -s * 0.2 }} />

      <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 60px" }}>
        <div style={{ fontFamily: FONT.head, fontWeight: 800, fontSize: S.head, lineHeight: 1.06, letterSpacing: -3, color: C.cream }}>
          <div style={{ transform: `translateY(${(1 - head1) * 60}px) scale(${0.85 + 0.15 * head1})`, opacity: Math.min(1, head1 * 1.5) }}>{CONTENT.cta.headline}</div>
          <div style={{ color: C.lime, transform: `translateY(${(1 - head2) * 60}px)`, opacity: Math.min(1, head2 * 1.5) }}>{wide ? accent : <>{accent.split(" ").slice(0, 2).join(" ")}<br />{accent.split(" ").slice(2).join(" ")}</>}</div>
        </div>
        <div style={{ fontFamily: FONT.body, fontWeight: 500, fontSize: S.sub, color: C.cream, opacity: sub * 0.8, marginTop: S.gap * 0.6, maxWidth: wide ? 1300 : 900, lineHeight: 1.3 }}>{CONTENT.cta.sub}</div>

        <div style={{ display: "flex", flexDirection: wide ? "row" : "column", gap: wide ? 36 : S.gap * 0.55, alignItems: "center", marginTop: S.gap * 1.2 }}>
          <Pill label={CONTENT.cta.comment} icon="comment" color={C.blue} at={COMMENT_AT} fs={S.pill} h={S.pillH} w={S.pillW} />
          <Pill label={CONTENT.cta.booking} icon="calendar" color={C.lime} at={BOOK_AT} fs={S.pill} h={S.pillH} w={S.pillW} primary />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: S.gap * 1.1, opacity: lockup, transform: `translateY(${(1 - lockup) * 24}px)` }}>
          <Img src={staticFile(LOGOS.mark)} style={{ height: S.logo, width: S.logo * 1.24, objectFit: "contain" }} />
          <span style={{ fontFamily: FONT.head, fontWeight: 800, fontSize: S.logo * 0.62, color: C.cream, letterSpacing: 1 }}>AUTOMATIKA</span>
          <span style={{ fontFamily: FONT.mono, fontWeight: 600, fontSize: S.logo * 0.45, color: C.blue }}>{CONTENT.url}</span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
