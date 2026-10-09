import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { CONTENT, LOGOS } from "../content";
import { C, clamp, FONT, useLayout } from "../design";

type Box = { x: number; y: number; w: number; h: number };
type VisualProps = { w: number; h: number; frame: number; compact: boolean };

const mono: React.CSSProperties = { fontFamily: FONT.mono, fontWeight: 600 };
const body: React.CSSProperties = { fontFamily: FONT.body, fontWeight: 600 };
const border = `2px solid ${C.olive}33`;

const WebcakeVisual: React.FC<VisualProps> = ({ w, h, frame, compact }) => {
  const phoneH = Math.min(h - 12, compact ? h * 0.91 : 335);
  const phoneW = phoneH * 0.48;
  const tickerTarget = Number.parseInt(CONTENT.illustrativeMetric, 10);
  const ticker = Math.round(tickerTarget * interpolate(frame, [42, 104], [0, 1], clamp));
  const restW = Math.max(98, w - phoneW - 26);
  return (
    <div style={{ width: w, height: h, display: "flex", alignItems: "center", justifyContent: "center", gap: 20, overflow: "hidden" }}>
      <div style={{ width: phoneW, height: phoneH, flexShrink: 0, borderRadius: Math.min(24, phoneW * 0.15), border: `5px solid ${C.ink}`, background: C.white, padding: 8, boxShadow: "0 12px 22px #27231B24", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 5 }}>
        <div style={{ width: "29%", height: 4, borderRadius: 4, background: C.ink, alignSelf: "center" }} />
        <div style={{ height: phoneH * 0.16, borderRadius: 5, background: C.blue, display: "flex", alignItems: "center", paddingLeft: 7, color: C.ink, fontFamily: FONT.head, fontSize: Math.max(10, phoneW * 0.09), fontWeight: 800 }}>WEBCAKE</div>
        <div style={{ height: phoneH * 0.17, borderRadius: 5, background: C.cream, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: "70%", height: 6, borderRadius: 5, background: C.olive, opacity: 0.7 }} />
        </div>
        <div style={{ width: "85%", height: 5, borderRadius: 5, background: C.ink, opacity: 0.72 }} />
        <div style={{ width: "65%", height: 5, borderRadius: 5, background: C.ink, opacity: 0.25 }} />
        <div style={{ width: "80%", height: 5, borderRadius: 5, background: C.ink, opacity: 0.25 }} />
        <div style={{ flex: 1 }} />
        <div style={{ height: Math.max(16, phoneH * 0.095), borderRadius: 6, background: C.lime, display: "flex", alignItems: "center", justifyContent: "center", color: C.ink, fontFamily: FONT.body, fontWeight: 700, fontSize: Math.max(8, phoneW * 0.075) }}>SHOP NOW</div>
      </div>
      <div style={{ width: restW, flexShrink: 0, minWidth: 0 }}>
        <div style={{ ...mono, color: C.olive, fontSize: compact ? 20 : 22, letterSpacing: 0.2 }}>ILLUSTRATIVE LIFT</div>
        <div style={{ fontFamily: FONT.head, fontWeight: 800, fontSize: Math.min(compact ? 46 : 70, restW * 0.48), lineHeight: 1.05, color: C.ink, whiteSpace: "nowrap", marginTop: compact ? 3 : 9 }}>+{ticker}%</div>
        <div style={{ ...body, fontSize: compact ? 16 : 29, color: C.ink }}>Lift*</div>
        <div style={{ ...mono, fontSize: compact ? 8 : 12, color: C.olive, marginTop: 8 }}>*{compact ? "ILLUSTRATIVE" : CONTENT.illustrativeNote.toUpperCase()}</div>
      </div>
    </div>
  );
};

const PosVisual: React.FC<VisualProps> = ({ w, h, frame, compact }) => {
  const shipped = interpolate(frame, [115, 138], [0, 1], clamp);
  const gap = compact ? 8 : 14;
  const paneW = (w - gap - 28) / 2;
  const titleSize = compact ? 16 : 23;
  return (
    <div style={{ width: w, height: h, display: "flex", alignItems: "center", justifyContent: "center", gap, overflow: "hidden" }}>
      <div style={{ width: paneW, height: Math.min(h - 8, compact ? 145 : 300), borderRadius: 13, background: C.white, border, padding: compact ? 8 : 16, boxSizing: "border-box", display: "flex", flexDirection: "column", gap: compact ? 5 : 10 }}>
        <div style={{ ...mono, color: C.olive, fontSize: titleSize * 0.75 }}>LIVESTREAM ORDER</div>
        <div style={{ ...body, color: C.ink, fontSize: titleSize, whiteSpace: "nowrap" }}>#PCK-0842</div>
        <div style={{ height: 5, width: "84%", background: C.cream, borderRadius: 5 }} />
        <div style={{ height: 5, width: "61%", background: C.cream, borderRadius: 5 }} />
        <div style={{ flex: 1 }} />
        <div style={{ background: C.blue, borderRadius: 7, padding: compact ? "5px 3px" : "9px 5px", ...mono, fontSize: compact ? 9 : 14, textAlign: "center", whiteSpace: "nowrap", color: C.ink }}>STOCK SYNCED</div>
      </div>
      <div style={{ width: compact ? 16 : 25, height: compact ? 16 : 25, flexShrink: 0, borderRight: `5px solid ${C.olive}`, borderTop: `5px solid ${C.olive}`, transform: `rotate(45deg) translateX(${(1 - shipped) * -8}px)`, opacity: shipped }} />
      <div style={{ width: paneW, height: Math.min(h - 8, compact ? 145 : 300), borderRadius: 13, background: C.white, border: `2px dashed ${C.olive}`, padding: compact ? 8 : 16, boxSizing: "border-box", display: "flex", flexDirection: "column", gap: compact ? 4 : 9, opacity: 0.25 + 0.75 * shipped, transform: `translateY(${(1 - shipped) * 14}px)` }}>
        <div style={{ ...mono, color: C.olive, fontSize: titleSize * 0.72 }}>WAYBILL READY</div>
        <div style={{ ...body, color: C.ink, fontSize: titleSize * 0.9 }}>1-click dispatch</div>
        <div style={{ flex: 1, minHeight: 4, display: "flex", flexDirection: "column", gap: 3, justifyContent: "center" }}>
          {[0, 1, 2, 3, 4].map((i) => <div key={i} style={{ height: compact ? 3 : 5, width: `${76 - (i % 3) * 15}%`, borderRadius: 4, background: C.ink, opacity: 0.13 }} />)}
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {["J&T", "Flash"].map((courier) => <div key={courier} style={{ flex: 1, textAlign: "center", background: C.lime, color: C.ink, borderRadius: 5, padding: compact ? "4px 1px" : "9px 2px", ...mono, fontSize: compact ? 14 : 22, whiteSpace: "nowrap" }}>{courier}</div>)}
        </div>
      </div>
    </div>
  );
};

const CrmVisual: React.FC<VisualProps> = ({ w, h, frame, compact }) => {
  const lock = spring({ frame: frame - 177, fps: 30, config: { damping: 13, stiffness: 160 } });
  const orb = Math.min(h * 0.52, compact ? 86 : 160);
  return (
    <div style={{ width: w, height: h, display: "flex", alignItems: "center", justifyContent: "center", gap: compact ? 12 : 20, padding: "0 8px", boxSizing: "border-box", overflow: "hidden" }}>
      <div style={{ width: orb, height: orb, flexShrink: 0, borderRadius: "50%", background: C.lime, border: `${compact ? 5 : 8}px solid ${C.olive}`, boxSizing: "border-box", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", transform: `scale(${0.74 + lock * 0.26})`, boxShadow: `0 0 ${lock * 26}px #D5FA0077` }}>
        <div style={{ fontFamily: FONT.head, fontWeight: 800, fontSize: compact ? 26 : 46, color: C.ink, lineHeight: 1 }}>360°</div>
        <div style={{ ...mono, color: C.ink, fontSize: compact ? 7 : 13 }}>CUSTOMER</div>
      </div>
      <div style={{ width: Math.max(100, w - orb - (compact ? 28 : 40)), minWidth: 0, background: C.white, borderRadius: 13, border, padding: compact ? 9 : 17, boxSizing: "border-box", transform: `translateX(${(1 - lock) * 15}px)`, opacity: 0.3 + 0.7 * lock }}>
        <div style={{ ...mono, color: C.olive, fontSize: compact ? 10 : 16 }}>CUSTOMER PROFILE</div>
        <div style={{ ...body, color: C.ink, fontSize: compact ? 17 : 29, marginTop: compact ? 1 : 5, whiteSpace: "nowrap", overflow: "hidden" }}>Mia Santos</div>
        <div style={{ height: 2, background: C.cream, margin: compact ? "4px 0" : "12px 0" }} />
        <div style={{ ...mono, color: C.ink, fontSize: compact ? 9 : 15 }}>ORDERS  ·  08</div>
        <div style={{ ...mono, color: C.olive, fontSize: compact ? 9 : 15, marginTop: compact ? 2 : 9 }}>AUTO RETENTION ON</div>
      </div>
    </div>
  );
};

const cards = [
  { eyebrow: "01 / ACQUIRE", title: "Webcake", sub: CONTENT.featureLabels.webcake, logo: LOGOS.webcake },
  { eyebrow: "02 / FULFILL", title: "Pancake POS", sub: CONTENT.featureLabels.pos, logo: LOGOS.pos },
  { eyebrow: "03 / RETAIN", title: "Pancake CRM", sub: CONTENT.featureLabels.crm, logo: LOGOS.crm },
] as const;

const PipelineCard: React.FC<{ box: Box; index: number; frame: number; wide: boolean; fps: number }> = ({ box, index, frame, wide, fps }) => {
  const compact = !wide && box.h < 310;
  const delay = [12, 78, 150][index];
  const enter = spring({ frame: frame - delay, fps, config: { damping: 15, stiffness: 125 } });
  const hot = interpolate(frame, [delay, delay + 18, delay + 95, delay + 125], [0, 1, 1, 0.4], clamp);
  const headerX = wide ? 28 : 25;
  const titleSize = wide ? 47 : compact ? 37 : 48;
  const visualBox = wide
    ? { x: 22, y: 245, w: box.w - 44, h: box.h - 271 }
    : { x: box.w * 0.46, y: compact ? 12 : 22, w: box.w * 0.52 - 18, h: box.h - (compact ? 24 : 44) };
  const card = cards[index];
  return (
    <div style={{ position: "absolute", left: box.x, top: box.y, width: box.w, height: box.h, borderRadius: wide ? 32 : 25, background: C.cream, border: `3px solid ${C.olive}`, boxShadow: `0 18px 40px #00000035, 0 0 ${hot * 26}px #D5FA0033`, boxSizing: "border-box", opacity: enter, transform: `translateY(${(1 - enter) * 29}px) scale(${0.95 + 0.05 * enter})`, overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, right: 0, width: 112, height: 112, background: C.lime, borderBottomLeftRadius: 110, opacity: hot * 0.42 }} />
      <div style={{ position: "absolute", left: headerX, top: wide ? 28 : compact ? 20 : 26, width: wide ? box.w - 56 : box.w * 0.42 }}>
        <div style={{ display: "flex", alignItems: "center", gap: compact ? 7 : 11 }}>
          <Img src={staticFile(card.logo)} style={{ width: wide ? 44 : compact ? 31 : 40, height: wide ? 44 : compact ? 31 : 40, objectFit: "contain", flexShrink: 0 }} />
          <div style={{ ...mono, color: C.olive, fontSize: wide ? 20 : compact ? 15 : 19, letterSpacing: wide ? 1.4 : 0.4, whiteSpace: "nowrap" }}>{card.eyebrow}</div>
        </div>
        <div style={{ fontFamily: FONT.head, fontWeight: 800, color: C.ink, fontSize: titleSize, lineHeight: 1.05, marginTop: compact ? 8 : 16 }}>{card.title}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: wide ? 3 : compact ? 2 : 5, marginTop: compact ? 7 : 10 }}>
          {card.sub.split(" · ").map((feature) => (
            <div key={feature} style={{ ...body, color: C.ink, fontSize: wide ? 22 : compact ? 18 : 23, lineHeight: 1.1, whiteSpace: "nowrap" }}>
              <span style={{ color: C.olive, marginRight: 7 }}>•</span>{feature}
            </div>
          ))}
        </div>
      </div>
      <div style={{ position: "absolute", left: visualBox.x, top: visualBox.y, width: visualBox.w, height: visualBox.h, borderRadius: wide ? 22 : 16, background: C.white, border, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        {index === 0 ? <WebcakeVisual w={visualBox.w - 18} h={visualBox.h - 18} frame={frame} compact={compact} /> : index === 1 ? <PosVisual w={visualBox.w - 18} h={visualBox.h - 18} frame={frame} compact={compact} /> : <CrmVisual w={visualBox.w - 18} h={visualBox.h - 18} frame={frame} compact={compact} />}
      </div>
    </div>
  );
};

const Connector: React.FC<{ from: Box; to: Box; wide: boolean; frame: number; start: number; index: number }> = ({ from, to, wide, frame, start, index }) => {
  const x1 = wide ? from.x + from.w - 5 : from.x + from.w * 0.5;
  const y1 = wide ? from.y + from.h * 0.55 : from.y + from.h - 2;
  const x2 = wide ? to.x + 5 : to.x + to.w * 0.5;
  const y2 = wide ? to.y + to.h * 0.55 : to.y + 2;
  const d = wide
    ? `M ${x1} ${y1} C ${x1 + 18} ${y1 - 38}, ${x2 - 18} ${y2 + 38}, ${x2} ${y2}`
    : `M ${x1} ${y1} C ${x1 + 60} ${y1 + 14}, ${x2 - 60} ${y2 - 14}, ${x2} ${y2}`;
  const draw = interpolate(frame, [start, start + 27], [0, 1], clamp);
  const packet = interpolate(frame, [start + 18, start + 48], [0, 1], clamp);
  const px = x1 + (x2 - x1) * packet;
  const py = y1 + (y2 - y1) * packet;
  return (
    <g key={index}>
      <path d={d} fill="none" stroke={C.olive} strokeWidth={9} strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - draw} />
      {frame >= start + 18 && frame <= start + 50 && <circle cx={px} cy={py} r={11} fill={C.lime} stroke={C.olive} strokeWidth={4} />}
    </g>
  );
};

/** Frames 510–779, with a local frame from its parent Sequence. */
export const EcosystemPipeline: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { w, h, wide, vertical, safeTop, safeBottom, scale } = useLayout();
  const padX = wide ? 105 * scale : 76 * scale;
  const headerH = wide ? 163 * scale : vertical ? 235 * scale : 190 * scale;
  const footerH = wide ? 52 * scale : vertical ? 85 * scale : 45 * scale;
  const gap = wide ? 36 * scale : vertical ? 28 * scale : 20 * scale;
  const cardsY = safeTop + headerH;
  const cardsW = w - padX * 2;
  const cardsH = h - safeTop - safeBottom - headerH - footerH;
  const cardW = wide ? (cardsW - gap * 2) / 3 : cardsW;
  const cardH = wide ? cardsH : (cardsH - gap * 2) / 3;
  const boxes: Box[] = [0, 1, 2].map((i) => ({ x: wide ? padX + i * (cardW + gap) : padX, y: wide ? cardsY : cardsY + i * (cardH + gap), w: cardW, h: cardH }));
  const headingIn = spring({ frame: frame - 3, fps, config: { damping: 16, stiffness: 115 } });
  const end = interpolate(frame, [249, 270], [1, 0], clamp);

  return (
    <AbsoluteFill style={{ background: C.canvas, overflow: "hidden", opacity: end }}>
      <AbsoluteFill style={{ backgroundImage: `linear-gradient(${C.olive}22 1px, transparent 1px), linear-gradient(90deg, ${C.olive}22 1px, transparent 1px)`, backgroundSize: `${70 * scale}px ${70 * scale}px`, opacity: 0.28 }} />
      <div style={{ position: "absolute", left: padX, top: safeTop, width: cardsW, opacity: headingIn, transform: `translateY(${(1 - headingIn) * 24}px)` }}>
        <div style={{ ...mono, color: C.lime, fontSize: wide ? 26 : 22, letterSpacing: 3 }}>THE CONNECTED STACK / 03</div>
        <div style={{ fontFamily: FONT.head, fontWeight: 800, fontSize: wide ? 90 : vertical ? 76 : 68, lineHeight: 1.07, color: C.cream, marginTop: wide ? 12 : 8 }}>{CONTENT.scenes[2].title}</div>
      </div>
      <svg width={w} height={h} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <Connector from={boxes[0]} to={boxes[1]} wide={wide} frame={frame} start={85} index={0} />
        <Connector from={boxes[1]} to={boxes[2]} wide={wide} frame={frame} start={157} index={1} />
      </svg>
      {boxes.map((box, index) => <PipelineCard key={index} box={box} index={index} frame={frame} wide={wide} fps={fps} />)}
      <div style={{ position: "absolute", left: padX, right: padX, top: cardsY + cardsH + (wide ? 17 : 15) * scale, color: C.blue, ...mono, fontSize: wide ? 22 : vertical ? 21 : 16, letterSpacing: 1.2, textAlign: "center", opacity: interpolate(frame, [184, 205], [0, 1], clamp) }}>WEBCAKE  →  PANCAKE POS  →  PANCAKE CRM</div>
    </AbsoluteFill>
  );
};
