import type React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CONTENT } from "../content";
import { C, clamp, FONT, useLayout } from "../design";

const OperatorAvatar: React.FC<{ size: number }> = ({ size }) => (
  <div style={{
    width: size, height: size, borderRadius: "50%", backgroundColor: C.cream,
    border: `3px solid ${C.olive}`, position: "relative", overflow: "hidden", flexShrink: 0,
  }}>
    <div style={{ position: "absolute", width: size * 0.3, height: size * 0.3, borderRadius: "50%", backgroundColor: C.olive, left: size * 0.35, top: size * 0.18 }} />
    <div style={{ position: "absolute", width: size * 0.6, height: size * 0.38, borderRadius: "50% 50% 0 0", backgroundColor: C.olive, left: size * 0.2, bottom: -size * 0.04 }} />
  </div>
);

const AINode: React.FC<{ size: number; frame: number }> = ({ size, frame }) => {
  const pulse = interpolate(frame % 54, [0, 27, 54], [0.55, 1, 0.55], clamp);
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.22, flexShrink: 0,
      border: `3px solid ${C.lime}`, backgroundColor: C.charcoal,
      boxShadow: `0 0 ${24 * pulse}px rgba(213,250,0,0.55)`,
      display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: size * 0.09, padding: size * 0.22,
    }}>
      {[0, 1, 2, 3].map((dot) => <div key={dot} style={{ borderRadius: "50%", backgroundColor: dot === frame % 4 ? C.lime : C.olive }} />)}
    </div>
  );
};

/** Training and AI support are shown as one connected operator workflow. */
export const StaffEnablement: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { h, vertical, wide, side, safeTop, safeBottom, scale } = useLayout();
  const cardIn = spring({ frame, fps, config: { damping: 18, stiffness: 130 } });
  const operatorIn = spring({ frame: frame - 27, fps, config: { damping: 17 } });
  const aiIn = spring({ frame: frame - 47, fps, config: { damping: 17 } });
  const linkIn = interpolate(frame, [75, 115], [0, 1], clamp);
  const statusIn = spring({ frame: frame - 115, fps, config: { damping: 16 } });
  const cardHeight = h - safeTop - safeBottom;
  const headlineSize = vertical ? 72 : wide ? 72 : 62;
  const nodeSize = vertical ? 110 : wide ? 100 : 86;

  return (
    <AbsoluteFill style={{ backgroundColor: C.charcoal, padding: `${safeTop}px ${side}px ${safeBottom}px`, boxSizing: "border-box" }}>
      <div style={{
        width: "100%", height: cardHeight, boxSizing: "border-box", overflow: "hidden",
        borderRadius: 42 * scale, backgroundColor: C.cream,
        border: `2px solid ${C.white}`, boxShadow: "0 28px 90px rgba(0,0,0,.28)",
        padding: vertical ? 68 : wide ? 68 : 54,
        display: "flex", flexDirection: "column", justifyContent: "space-between", gap: vertical ? 36 : 20,
        transform: `scale(${0.86 + cardIn * 0.14})`, opacity: interpolate(frame, [0, 15], [0, 1], clamp),
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 24 }}>
          <div style={{ fontFamily: FONT.mono, color: C.olive, fontSize: wide ? 22 : 19, letterSpacing: 3, fontWeight: 600 }}>TEAM ENABLEMENT / 04</div>
          <div style={{ width: 58, height: 10, borderRadius: 10, backgroundColor: C.olive }} />
        </div>

        <div style={{ maxWidth: wide ? 1320 : 900 }}>
          <div style={{ fontFamily: FONT.head, fontSize: headlineSize, fontWeight: 800, lineHeight: 1.07, letterSpacing: -2.5, color: C.charcoal }}>
            {CONTENT.training.headline}
          </div>
          <div style={{ fontFamily: FONT.body, fontSize: vertical ? 32 : wide ? 30 : 25, fontWeight: 600, lineHeight: 1.3, color: C.olive, marginTop: 14 }}>
            {CONTENT.training.body}
          </div>
        </div>

        <div style={{
          flex: 1, minHeight: 0, display: "flex", flexDirection: vertical ? "column" : "row",
          alignItems: "stretch", justifyContent: "center", gap: vertical ? 16 : 20,
        }}>
          <div style={{
            flex: 1, minHeight: 0, backgroundColor: C.white, borderRadius: 28,
            border: `2px solid rgba(104,115,35,.3)`, padding: vertical ? 30 : 26,
            display: "flex", flexDirection: "column", justifyContent: "space-between",
            transform: `translateY(${(1 - operatorIn) * 42}px)`, opacity: Math.max(0, Math.min(1, operatorIn)),
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
              <OperatorAvatar size={nodeSize} />
              <div>
                <div style={{ fontFamily: FONT.mono, fontSize: vertical ? 19 : 17, fontWeight: 600, color: C.olive, letterSpacing: 1.6 }}>STAFF OPERATOR</div>
                <div style={{ fontFamily: FONT.head, fontSize: vertical ? 42 : wide ? 38 : 32, fontWeight: 700, color: C.charcoal, marginTop: 8 }}>Human judgment</div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: vertical ? 10 : 8, margin: "18px 0", flex: 1, justifyContent: "center" }}>
              {["New order", "Shipping note", "Customer reply"].map((task, index) => (
                <div key={task} style={{ display: "flex", alignItems: "center", gap: 12, borderRadius: 12, backgroundColor: C.cream, padding: vertical ? "9px 13px" : "7px 12px", fontFamily: FONT.mono, fontSize: vertical ? 20 : wide ? 18 : 16, fontWeight: 600, color: C.charcoal, opacity: interpolate(frame, [53 + index * 9, 70 + index * 9], [0, 1], clamp) }}>
                  <span style={{ width: 13, height: 13, borderRadius: "50%", border: `2px solid ${C.olive}`, flexShrink: 0 }} />{task}
                </div>
              ))}
            </div>
            <div style={{ fontFamily: FONT.body, fontWeight: 600, fontSize: vertical ? 26 : 22, color: C.charcoal, lineHeight: 1.4, marginTop: 18 }}>Orders · service · fulfillment</div>
          </div>

          <div style={{ position: "relative", width: vertical ? "100%" : 102, height: vertical ? 74 : "auto", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: vertical ? 4 : "100%", height: vertical ? "100%" : 4, borderRadius: 4, backgroundColor: C.olive, transform: vertical ? `scaleY(${linkIn})` : `scaleX(${linkIn})` }} />
            <div style={{ position: "absolute", width: 20, height: 20, backgroundColor: C.lime, borderRadius: "50%", border: `3px solid ${C.olive}`, left: vertical ? "calc(50% - 10px)" : `${interpolate(frame % 45, [0, 45], [0, 82])}px`, top: vertical ? `${interpolate(frame % 45, [0, 45], [0, 54])}px` : "calc(50% - 10px)", opacity: linkIn }} />
          </div>

          <div style={{
            flex: 1, minHeight: 0, backgroundColor: C.charcoal, borderRadius: 28,
            border: `2px solid ${C.olive}`, padding: vertical ? 30 : 26,
            display: "flex", flexDirection: "column", justifyContent: "space-between",
            transform: `translateY(${(1 - aiIn) * 42}px)`, opacity: Math.max(0, Math.min(1, aiIn)),
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
              <AINode size={nodeSize} frame={frame} />
              <div>
                <div style={{ fontFamily: FONT.mono, fontSize: vertical ? 19 : 17, fontWeight: 600, color: C.lime, letterSpacing: 1.6 }}>AI CO-PILOT</div>
                <div style={{ fontFamily: FONT.head, fontSize: vertical ? 42 : wide ? 38 : 32, fontWeight: 700, color: C.cream, marginTop: 8 }}>Instant context</div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: vertical ? 10 : 8, margin: "18px 0", flex: 1, justifyContent: "center" }}>
              {["Context synced", "Reply draft ready", "Handoff routed"].map((task, index) => (
                <div key={task} style={{ display: "flex", alignItems: "center", gap: 12, borderRadius: 12, backgroundColor: C.panel, padding: vertical ? "9px 13px" : "7px 12px", fontFamily: FONT.mono, fontSize: vertical ? 20 : wide ? 18 : 16, fontWeight: 600, color: C.cream, opacity: interpolate(frame, [78 + index * 9, 95 + index * 9], [0, 1], clamp) }}>
                  <span style={{ width: 13, height: 13, borderRadius: "50%", backgroundColor: C.lime, flexShrink: 0 }} />{task}
                </div>
              ))}
            </div>
            <div style={{ fontFamily: FONT.body, fontWeight: 600, fontSize: vertical ? 26 : 22, color: C.cream, lineHeight: 1.4, marginTop: 18 }}>Answers · follow-ups · handoffs</div>
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, transform: `translateY(${(1 - statusIn) * 24}px)`, opacity: Math.max(0, Math.min(1, statusIn)) }}>
          {[CONTENT.training.status, CONTENT.training.maintenance].map((label) => (
            <div key={label} style={{ backgroundColor: C.white, color: C.charcoal, border: `2px solid ${C.olive}`, borderRadius: 100, padding: vertical ? "15px 21px" : "12px 18px", fontFamily: FONT.mono, fontSize: vertical ? 23 : wide ? 23 : 19, fontWeight: 600 }}>
              <span style={{ color: C.olive, marginRight: 10 }}>●</span>{label}
            </div>
          ))}
          <div style={{ marginLeft: "auto", alignSelf: "center", fontFamily: FONT.mono, fontSize: vertical ? 17 : 15, color: C.olive }}>{CONTENT.illustrativeNote}</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
