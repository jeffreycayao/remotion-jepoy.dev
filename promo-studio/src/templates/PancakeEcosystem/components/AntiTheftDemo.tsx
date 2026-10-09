import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT, clamp, useLayout } from "../design";
import { CONTENT, LOGOS } from "../content";

const CHANNELS = CONTENT.channels;

const Shield: React.FC<{ size: number; glow?: boolean }> = ({ size, glow = false }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true" style={{ filter: glow ? `drop-shadow(0 0 14px ${C.lime})` : undefined }}>
    <path d="M32 4 55 13v17c0 15-10 25-23 31C19 55 9 45 9 30V13L32 4Z" fill={C.lime} />
    <path d="m22 32 7 7 14-16" stroke={C.charcoal} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ChatBubble: React.FC<{ text: string; right?: boolean; fontSize: number; tone?: "cream" | "blue" }> = ({ text, right = false, fontSize, tone = "cream" }) => (
  <div style={{ display: "inline-block", maxWidth: "86%", alignSelf: right ? "flex-end" : "flex-start", padding: `${fontSize * 0.6}px ${fontSize * 0.78}px`, borderRadius: fontSize * 0.8, borderBottomLeftRadius: right ? fontSize * 0.8 : 5, borderBottomRightRadius: right ? 5 : fontSize * 0.8, background: tone === "blue" ? C.blue : C.cream, color: C.charcoal, fontFamily: FONT.body, fontSize, lineHeight: 1.26, fontWeight: 600 }}>{text}</div>
);

/** Scene 2, local frames 0–299: unified inbox, anti-theft masking, then comment → DM. */
export const AntiTheftDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { w, h, wide, vertical, square, side, safeTop, safeBottom, scale } = useLayout();
  const portrait = !wide && !square && !vertical;
  const fs = scale;
  const app = wide
    ? { x: w * 0.42, y: safeTop + 26, w: w * 0.53 - side * 0.55, h: h - safeTop - safeBottom - 38 }
    : vertical
      ? { x: side, y: safeTop + 365, w: w - 2 * side, h: h - safeTop - safeBottom - 505 }
      : portrait
        ? { x: side, y: safeTop + 290, w: w - 2 * side, h: h - safeTop - safeBottom - 340 }
        : { x: side, y: safeTop + 230, w: w - 2 * side, h: h - safeTop - safeBottom - 285 };
  const appIn = spring({ frame: frame - 1, fps, config: { damping: 18, stiffness: 125 } });
  const mask = interpolate(frame, [95, 112], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const shieldIn = spring({ frame: frame - 100, fps, config: { damping: 13, stiffness: 230 } });
  const commentIn = spring({ frame: frame - 170, fps, config: { damping: 15, stiffness: 210 } });
  const arrow = interpolate(frame, [173, 181], [0, 1], clamp);
  const dmIn = spring({ frame: frame - 179, fps, config: { damping: 15, stiffness: 205 } });
  const orderIn = spring({ frame: frame - 232, fps, config: { damping: 16, stiffness: 205 } });
  const broadcastIn = spring({ frame: frame - 245, fps, config: { damping: 17, stiffness: 195 } });
  const broadcastLabel = CONTENT.featureLabels.botcake.split("·").slice(-1)[0]?.trim().toUpperCase() ?? "REACTIVATION BROADCASTS";
  const paneTop = 142 * fs;
  const paneH = app.h - paneTop;
  const listW = app.w * 0.295;
  const chatW = app.w - listW;
  const securityY = paneH * 0.285;
  const securityH = paneH * 0.285;
  const botY = securityY + securityH + 17 * fs;
  const botH = paneH - botY - 20 * fs;
  const ui = wide ? 22 * fs : 21 * fs;

  return (
    <AbsoluteFill style={{ background: C.charcoal, color: C.cream, overflow: "hidden" }}>
      <AbsoluteFill style={{ backgroundImage: `radial-gradient(${C.olive}38 1.5px, transparent 1.6px)`, backgroundSize: "42px 42px", opacity: 0.4 }} />
      <div style={{ position: "absolute", right: -w * 0.1, top: -h * 0.15, width: w * 0.65, height: w * 0.65, borderRadius: "50%", background: `radial-gradient(circle, ${C.olive}45, transparent 68%)` }} />

      <div style={{ position: "absolute", left: side, top: safeTop + (wide ? 33 : 8), width: wide ? w * 0.36 : w - 2 * side }}>
        <div style={{ fontFamily: FONT.mono, fontWeight: 600, fontSize: 21 * fs, color: C.blue, letterSpacing: 2.1 * fs, marginBottom: 31 * fs }}>PANCAKE ECOSYSTEM / 02</div>
        <div style={{ fontFamily: FONT.head, fontWeight: 800, fontSize: (wide ? 78 : vertical ? 82 : portrait ? 79 : 74) * fs, letterSpacing: -3.8 * fs, lineHeight: 1.05, opacity: interpolate(frame, [0, 18], [0.82, 1], clamp), translate: `0px ${interpolate(frame, [0, 20], [12, 0], clamp)}px` }}>
          ONE INBOX.<br /><span style={{ color: C.lime }}>ZERO LEAKS.</span>
        </div>
        {!square && <div style={{ marginTop: (portrait ? 8 : 26) * fs, fontFamily: FONT.body, fontWeight: 600, fontSize: (portrait ? 25 : wide ? 30 : 29) * fs, lineHeight: 1.28, color: C.blue, opacity: interpolate(frame, [14, 34], [0, 1], clamp) }}>{portrait ? "Pancake App + Botcake AI" : `${CONTENT.scenes[1].title} Pancake App + Botcake AI.`}</div>}
        {wide && <div style={{ display: "flex", flexDirection: "column", gap: 19 * fs, marginTop: 72 * fs }}>
          {[
            ["01", "Every channel, one conversation."],
            ["02", "Private details stay protected."],
            ["03", "Comments become instant DMs."],
          ].map(([number, label], i) => <div key={number} style={{ display: "flex", alignItems: "center", gap: 18 * fs, fontFamily: FONT.body, fontSize: 27 * fs, fontWeight: 600, opacity: interpolate(frame, [30 + i * 22, 46 + i * 22], [0, 1], clamp), translate: `${interpolate(frame, [30 + i * 22, 46 + i * 22], [-26, 0], clamp)}px 0px` }}><span style={{ color: C.lime, fontFamily: FONT.mono, fontWeight: 600 }}>{number}</span>{label}</div>)}
        </div>}
      </div>

      <div style={{ position: "absolute", left: app.x, top: app.y, width: app.w, height: app.h, overflow: "hidden", borderRadius: 30 * fs, background: C.white, color: C.charcoal, boxShadow: `0 28px 85px ${C.charcoal}`, opacity: appIn, scale: `${0.9 + 0.1 * appIn}` }}>
        <div style={{ height: 70 * fs, background: C.cream, display: "flex", alignItems: "center", gap: 15 * fs, boxSizing: "border-box", padding: `0 ${25 * fs}px` }}>
          <Img src={staticFile(LOGOS.pancake)} style={{ width: 41 * fs, height: 41 * fs, objectFit: "contain" }} />
          <div style={{ fontFamily: FONT.head, fontSize: 26 * fs, fontWeight: 800 }}>PANCAKE <span style={{ fontWeight: 700 }}>INBOX</span></div>
          <div style={{ marginLeft: "auto", borderRadius: 999, padding: `${7 * fs}px ${15 * fs}px`, background: C.lime, fontFamily: FONT.mono, fontWeight: 600, fontSize: 18 * fs }}>ALL MESSAGES / LIVE</div>
        </div>

        <div style={{ position: "absolute", top: 70 * fs, left: 0, right: 0, height: 72 * fs, boxSizing: "border-box", background: C.white, borderBottom: `2px solid ${C.cream}`, display: "flex", alignItems: "center", gap: 10 * fs, padding: `0 ${24 * fs}px` }}>
          {CHANNELS.map((name, i) => <span key={name} style={{ borderRadius: 11 * fs, background: i === 1 ? C.lime : C.blue, color: C.charcoal, padding: `${9 * fs}px ${12 * fs}px`, fontFamily: FONT.mono, fontWeight: 600, fontSize: (name.length > 6 ? 17 : 19) * fs, opacity: spring({ frame: frame - 16 - i * 5, fps, config: { damping: 17, stiffness: 190 } }), whiteSpace: "nowrap" }}>{name}</span>)}
        </div>

        <div style={{ position: "absolute", left: 0, top: paneTop, bottom: 0, width: listW, background: C.cream, borderRight: `2px solid ${C.olive}55` }}>
          <div style={{ fontFamily: FONT.mono, fontWeight: 600, fontSize: 17 * fs, color: C.olive, padding: `${21 * fs}px ${19 * fs}px ${12 * fs}px` }}>CONVERSATIONS</div>
          {[
            ["MS", "Mika S.", "How much is this?", "IG"],
            ["JL", "Jon L.", "Mine po!", "FB"],
            ["RA", "Rae A.", "Order follow-up", "WA"],
          ].map(([initials, name, preview, channel], i) => <div key={name} style={{ display: "flex", alignItems: "center", gap: 10 * fs, height: 89 * fs, padding: `0 ${13 * fs}px`, boxSizing: "border-box", background: i === 0 ? C.blue : C.cream, borderBottom: `1px solid ${C.olive}38` }}>
            <span style={{ width: 39 * fs, height: 39 * fs, borderRadius: "50%", flexShrink: 0, display: "grid", placeItems: "center", fontFamily: FONT.mono, fontWeight: 600, fontSize: 16 * fs, background: i === 0 ? C.white : C.blue }}>{initials}</span>
            <span style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 4 * fs }}><span style={{ fontFamily: FONT.body, fontSize: 18 * fs, fontWeight: 700, whiteSpace: "nowrap" }}>{name}</span><span style={{ fontFamily: FONT.body, fontSize: 16 * fs, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: listW - 80 * fs }}>{preview}</span></span>
            <span style={{ marginLeft: "auto", fontFamily: FONT.mono, fontSize: 13 * fs, fontWeight: 600, color: C.olive }}>{channel}</span>
          </div>)}
          <div style={{ position: "absolute", left: 16 * fs, right: 16 * fs, bottom: 18 * fs, background: C.charcoal, color: C.lime, borderRadius: 13 * fs, textAlign: "center", padding: `${11 * fs}px ${5 * fs}px`, fontFamily: FONT.mono, fontSize: 16 * fs, fontWeight: 600 }}>5 CHANNELS · 1 VIEW</div>
        </div>

        <div style={{ position: "absolute", left: listW, top: paneTop, width: chatW, height: paneH, overflow: "hidden" }}>
          <div style={{ height: 72 * fs, boxSizing: "border-box", padding: `0 ${25 * fs}px`, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `2px solid ${C.cream}` }}>
            <span style={{ fontFamily: FONT.body, fontWeight: 700, fontSize: 23 * fs }}>Mika S. <span style={{ color: C.olive, fontSize: 18 * fs, fontWeight: 600 }}>· IG comment</span></span>
            <span style={{ background: C.lime, borderRadius: 9 * fs, padding: `${6 * fs}px ${10 * fs}px`, fontFamily: FONT.mono, fontSize: 16 * fs, fontWeight: 600, whiteSpace: "nowrap" }}>+ CREATE ORDER</span>
          </div>
          <div style={{ position: "absolute", left: 25 * fs, right: 25 * fs, top: 84 * fs, display: "flex", flexDirection: "column", gap: 8 * fs }}>
            <div style={{ fontFamily: FONT.mono, fontWeight: 600, fontSize: 16 * fs, color: C.olive }}>PUBLIC COMMENT</div>
            <ChatBubble text="Price please. DM me." fontSize={ui} tone="blue" />
          </div>

          <div style={{ position: "absolute", left: 20 * fs, right: 20 * fs, top: securityY, height: securityH, borderRadius: 20 * fs, boxSizing: "border-box", border: `2px solid ${mask > 0 ? C.lime : C.olive}`, background: C.cream, padding: `${15 * fs}px ${18 * fs}px`, boxShadow: mask > 0 ? `0 0 0 ${3 + 6 * Math.sin(frame * 0.2) ** 2}px ${C.lime}44` : undefined }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 * fs }}>
              <span style={{ width: 42 * fs, height: 42 * fs, display: "grid", placeItems: "center", scale: `${0.8 + 0.2 * shieldIn}` }}><Shield size={42 * fs} glow={frame >= 100 && frame < 145} /></span>
              <span style={{ fontFamily: FONT.mono, fontWeight: 600, fontSize: 19 * fs }}>ANTI-THEFT PROTECTION</span>
              <span style={{ marginLeft: "auto", color: C.olive, fontFamily: FONT.mono, fontSize: 15 * fs, fontWeight: 600 }}>{mask < 0.95 ? "SCANNING" : "SECURED"}</span>
            </div>
            <div style={{ marginTop: 14 * fs, display: "flex", flexDirection: "column", gap: 9 * fs }}>
              {[
                ["PHONE", "09XX XXX XXXX"],
                ["ADDRESS", "Customer delivery address"],
              ].map(([label, exposed]) => <div key={label} style={{ display: "flex", alignItems: "center", gap: 15 * fs, whiteSpace: "nowrap", overflow: "hidden" }}><span style={{ flex: "0 0 auto", fontFamily: FONT.mono, fontWeight: 600, fontSize: 17 * fs, color: C.olive, width: 84 * fs }}>{label}</span><span style={{ position: "relative", fontFamily: FONT.body, fontSize: 20 * fs, fontWeight: 700, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }}><span style={{ opacity: 1 - mask }}>{exposed}</span><span style={{ position: "absolute", left: 0, top: 0, color: C.olive, opacity: mask }}>[PROTECTED]</span></span></div>)}
            </div>
          </div>

          <div style={{ position: "absolute", left: 20 * fs, right: 20 * fs, top: botY, height: botH, minHeight: 145 * fs, borderRadius: 20 * fs, background: C.charcoal, color: C.cream, boxSizing: "border-box", padding: `${16 * fs}px ${20 * fs}px`, overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 * fs, fontFamily: FONT.mono, fontSize: 19 * fs, fontWeight: 600, color: C.lime }}><span style={{ width: 13 * fs, height: 13 * fs, background: C.lime, borderRadius: "50%" }} /> BOTCAKE AI <span style={{ marginLeft: "auto", color: C.blue, fontSize: 16 * fs, whiteSpace: "nowrap", opacity: broadcastIn }}>{broadcastLabel}</span><span style={{ padding: `${5 * fs}px ${9 * fs}px`, borderRadius: 9 * fs, color: C.charcoal, background: C.lime, fontSize: 16 * fs }}>24/7</span></div>
            <div style={{ display: "flex", alignItems: "center", gap: 11 * fs, marginTop: 17 * fs, opacity: commentIn }}>
              <div style={{ background: C.blue, color: C.charcoal, borderRadius: 10 * fs, fontFamily: FONT.body, fontWeight: 700, fontSize: 18 * fs, padding: `${9 * fs}px ${11 * fs}px`, whiteSpace: "nowrap" }}>Comment: PANCAKE</div>
              <div style={{ height: 3 * fs, flex: 1, background: C.olive, transformOrigin: "left center", scale: `${arrow} 1` }} />
              <span style={{ color: C.lime, fontFamily: FONT.mono, fontSize: 18 * fs, fontWeight: 600 }}>DM</span>
            </div>
            <div style={{ position: "absolute", left: 20 * fs, right: 20 * fs, top: Math.min(125 * fs, botH * 0.53), textAlign: "center", fontFamily: FONT.head, fontSize: 25 * fs, fontWeight: 800, color: C.blue, letterSpacing: -0.5 * fs, opacity: interpolate(frame, [58, 79, 160, 174], [0, 0.92, 0.92, 0], clamp) }}>COMMENT → AUTOMATIC DM</div>
            <div style={{ opacity: dmIn * (botH > 240 * fs ? 1 : 1 - orderIn), translate: `0px ${(1 - dmIn) * 19}px`, marginTop: 15 * fs, maxWidth: "100%" }}><ChatBubble text="Hi! Let's get your order started." fontSize={20 * fs} /></div>
            <div style={{ position: "absolute", left: 20 * fs, right: 20 * fs, top: botH > 240 * fs ? 180 * fs : 102 * fs, background: C.cream, color: C.charcoal, borderRadius: 12 * fs, padding: `${10 * fs}px ${15 * fs}px`, fontFamily: FONT.body, fontSize: 18 * fs, fontWeight: 700, opacity: orderIn, translate: `0px ${(1 - orderIn) * 18}px` }}><span style={{ color: C.olive, fontFamily: FONT.mono, fontSize: 16 * fs }}>IN-CHAT ORDER</span><br />Item × 1 · Draft ready</div>
          </div>
        </div>
      </div>

      {vertical && <div style={{ position: "absolute", left: side, right: side, bottom: safeBottom + 35 * fs, textAlign: "center", color: C.lime, fontFamily: FONT.mono, fontWeight: 600, fontSize: 25 * fs, opacity: interpolate(frame, [181, 205], [0, 1], clamp) }}>COMMENT → DM → CONVERSATION</div>}
    </AbsoluteFill>
  );
};
