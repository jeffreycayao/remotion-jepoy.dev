import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BRAND, COPY } from "../content";
import { RevealText } from "../RevealText";
import { C, clamp, FONT } from "../tokens";
import { Backdrop, Shimmer, usePick } from "../ui";
import { Logo } from "./Logos";

// Frames within Scene 4 (213 long), from the recorded voiceover:
//   4 "Kaya ano pang hinihintay mo?" · 53 "Comment ka na ng 'HELP'" · 89 "para matulungan ka namin agad!" · 130+ hold
export const BUTTON_AT = 50;
export const TYPE_AT = 62; // H-E-L-P, one letter every 5 frames
export const POST_AT = 88;
export const REPLY_AT = 104;

const WORD = "HELP";

/** Scene 4 (720–900): headline, giant lime "Comment HELP" button, a comment box that types and posts HELP. */
export const CommentCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pick = usePick();
  const z = pick({
    wide: { head: 92, btn: 64, box: 820, fs: 40, logo: 130, row: true },
    square: { head: 60, btn: 46, box: 900, fs: 28, logo: 92, row: false },
    portrait: { head: 70, btn: 52, box: 920, fs: 30, logo: 110, row: false },
    vertical: { head: 84, btn: 60, box: 940, fs: 34, logo: 140, row: false },
  });

  const btn = spring({ frame: frame - BUTTON_AT, fps, config: { damping: 9, stiffness: 140 } });
  const breathe = frame >= BUTTON_AT ? 1 + 0.03 * Math.sin((frame - BUTTON_AT) / 7) : 1;
  const glow = frame >= BUTTON_AT ? 0.45 + 0.25 * Math.sin((frame - BUTTON_AT) / 7) : 0;
  const boxIn = spring({ frame: frame - 18, fps, config: { damping: 200 }, durationInFrames: 16 });
  const typed = WORD.slice(0, Math.max(0, Math.min(WORD.length, Math.floor((frame - TYPE_AT) / 5) + 1)));
  const posted = frame >= POST_AT;
  const postP = spring({ frame: frame - POST_AT, fps, config: { damping: 13, stiffness: 180 } });
  const replyP = spring({ frame: frame - REPLY_AT, fps, config: { damping: 13, stiffness: 180 } });
  const caret = Math.floor(frame / 8) % 2 === 0;
  const logoIn = interpolate(frame, [4, 20], [0, 1], clamp);

  const avatar = (bg: string, child: React.ReactNode) => (
    <div style={{ width: z.fs * 1.7, height: z.fs * 1.7, borderRadius: 99, background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontFamily: FONT.body, fontWeight: 600, fontSize: z.fs * 0.6, color: C.ink }}>{child}</div>
  );

  const commentBox = (
    <div style={{ width: z.box, background: C.white, borderRadius: 28, padding: z.fs * 0.8, boxSizing: "border-box", boxShadow: "0 40px 90px rgba(0,0,0,0.5)", display: "flex", flexDirection: "column", gap: z.fs * 0.6, opacity: boxIn, translate: `0px ${(1 - boxIn) * 40}px` }}>
      {/* Posted comment + Automatika reply */}
      {posted && (
        <div style={{ display: "flex", gap: z.fs * 0.4, alignItems: "flex-start", opacity: postP, translate: `0px ${(1 - postP) * 20}px` }}>
          {avatar(C.blue, "You")}
          <div>
            <div style={{ background: "#F0F2F5", borderRadius: z.fs * 0.7, padding: `${z.fs * 0.35}px ${z.fs * 0.6}px` }}>
              <div style={{ fontFamily: FONT.body, fontWeight: 600, fontSize: z.fs * 0.5, color: C.ink }}>You</div>
              <div style={{ fontFamily: FONT.mono, fontWeight: 700, fontSize: z.fs * 0.9, color: C.ink }}>{WORD}</div>
            </div>
            <div style={{ fontFamily: FONT.body, fontWeight: 500, fontSize: z.fs * 0.42, color: C.inkMuted, marginTop: 4, marginLeft: 8 }}>Just now · Like · Reply</div>
          </div>
        </div>
      )}
      {frame >= REPLY_AT && (
        <div style={{ display: "flex", gap: z.fs * 0.4, alignItems: "flex-start", marginLeft: z.fs * 1.6, opacity: replyP, translate: `0px ${(1 - replyP) * 20}px` }}>
          {avatar(C.canvas, <Logo name="automatikaMark" h={z.fs * 0.8} />)}
          <div style={{ background: "#F0F2F5", borderRadius: z.fs * 0.7, padding: `${z.fs * 0.35}px ${z.fs * 0.6}px` }}>
            <div style={{ fontFamily: FONT.body, fontWeight: 600, fontSize: z.fs * 0.5, color: C.ink }}>{BRAND.name}</div>
            <div style={{ fontFamily: FONT.body, fontWeight: 500, fontSize: z.fs * 0.62, color: C.ink }}>Hi! 👋 Tutulungan ka namin agad.</div>
          </div>
        </div>
      )}
      {/* Input */}
      <div style={{ display: "flex", alignItems: "center", gap: z.fs * 0.4 }}>
        {avatar(C.blue, "You")}
        <div style={{ flex: 1, display: "flex", alignItems: "center", background: "#F0F2F5", borderRadius: 999, padding: `${z.fs * 0.4}px ${z.fs * 0.7}px`, border: `2px solid ${frame >= TYPE_AT && !posted ? C.olive : "transparent"}` }}>
          <span style={{ fontFamily: posted || !typed ? FONT.body : FONT.mono, fontWeight: posted || !typed ? 500 : 700, fontSize: z.fs * (posted || !typed ? 0.62 : 0.85), color: posted || !typed ? "#8A8D91" : C.ink }}>
            {posted || frame < TYPE_AT ? "Write a comment…" : typed}
          </span>
          {!posted && <span style={{ width: 3, height: z.fs * 0.9, background: C.ink, marginLeft: 4, opacity: caret ? 1 : 0 }} />}
        </div>
        <div style={{ width: z.fs * 1.6, height: z.fs * 1.6, borderRadius: 99, background: typed === WORD && !posted ? C.lime : C.line, display: "flex", alignItems: "center", justifyContent: "center", fontSize: z.fs * 0.7, color: C.ink, scale: frame >= POST_AT - 3 && frame < POST_AT + 3 ? "0.85" : "1" }}>➤</div>
      </div>
    </div>
  );

  const button = (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        fontFamily: FONT.head,
        fontWeight: 800,
        fontSize: z.btn,
        color: C.ink,
        background: C.lime,
        borderRadius: 999,
        padding: `${z.btn * 0.38}px ${z.btn * 0.85}px`,
        boxShadow: `0 0 ${z.btn * 1.6 * glow}px rgba(213,250,0,${glow})`,
        opacity: btn,
        scale: `${(0.4 + 0.6 * btn) * breathe}`,
        whiteSpace: "nowrap",
      }}
    >
      💬 {COPY.ctaButton}
      <Shimmer start={BUTTON_AT + 10} every={40} duration={20} strength={0.85} />
    </div>
  );

  return (
    <AbsoluteFill>
      <Backdrop tone="dark" />
      {z.row ? (
        <AbsoluteFill style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 90, padding: "0 100px" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 40, width: 860 }}>
            <Logo name="automatika" h={z.logo} style={{ opacity: logoIn }} />
            <RevealText text={COPY.ctaHeadline} delay={4} accent={["ngayon."]} style={{ fontFamily: FONT.head, fontWeight: 800, fontSize: z.head, lineHeight: 1.05, color: C.cream }} />
            {button}
            <div style={{ fontFamily: FONT.body, fontWeight: 500, fontSize: 30, color: C.muted, opacity: interpolate(frame, [90, 104], [0, 1], clamp) }}>{COPY.ctaNote}</div>
          </div>
          {commentBox}
        </AbsoluteFill>
      ) : (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: z.head * 0.45, padding: "0 60px" }}>
          <Logo name="automatika" h={z.logo} style={{ opacity: logoIn }} />
          <RevealText text={COPY.ctaHeadline} delay={4} accent={["ngayon."]} style={{ fontFamily: FONT.head, fontWeight: 800, fontSize: z.head, lineHeight: 1.05, color: C.cream, textAlign: "center" }} />
          {commentBox}
          {button}
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
