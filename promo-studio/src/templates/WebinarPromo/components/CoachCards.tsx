import React from "react";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { loadFont as loadSora } from "@remotion/google-fonts/Sora";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

const FONT = {
  display: loadSora("normal", { weights: ["700", "800"], subsets: ["latin"] }).fontFamily,
  body: loadInter("normal", { weights: ["500", "600", "700"], subsets: ["latin"] }).fontFamily,
  mono: loadMono("normal", { weights: ["600", "700"], subsets: ["latin"] }).fontFamily,
};

const C = {
  ink: "#111111",
  panel: "#1A1612",
  gold: "#FF9E16",
  amber: "#F57C00",
  orange: "#FF5722",
  cream: "#F6F1E6",
  white: "#FFFFFF",
  muted: "#BBAE9D",
};

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

type Coach = "ali" | "mary";

const COACHES = {
  ali: {
    name: "COACH ALI",
    number: "01",
    portrait: "projects/the-happy-freelancers-webinars/portraits/coach_ali.png",
    affiliation: "MEGs DIGITAL",
    date: "OCTOBER 8, 2026",
    time: "8:00–10:00 PM PHT",
    subject: "GRAPHIC DESIGN",
  },
  mary: {
    name: "COACH MARY AMORIN",
    number: "02",
    portrait: "projects/the-happy-freelancers-webinars/portraits/coach_mary.png",
    affiliation: "SOCIAL MEDIA MANAGER",
    date: "OCTOBER 9, 2026",
    time: "7:00–10:00 PM PHT",
    subject: "CONTENT PLANNING",
  },
} as const;

const useCoachLayout = () => {
  const { width, height } = useVideoConfig();
  const aspect = width / height;
  const wide = aspect > 1.3;
  const vertical = aspect < 0.7;
  const portrait = aspect < 0.9 && !vertical;
  const side = wide ? 104 : vertical ? 70 : 58;
  const safeTop = vertical ? 140 : wide ? 72 : 66;
  const safeBottom = vertical ? 150 : wide ? 72 : portrait ? 92 : 76;
  const innerWidth = width - side * 2;
  const innerHeight = height - safeTop - safeBottom;
  return { width, height, aspect, wide, vertical, portrait, side, safeTop, safeBottom, innerWidth, innerHeight };
};

/** Fully synthetic poster texture so no portrait asset or external image is implied. */
const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse 75% 67% at 72% 25%, rgba(255,158,22,0.15), transparent 67%), radial-gradient(ellipse 50% 54% at 8% 93%, rgba(245,124,0,0.12), transparent 75%), linear-gradient(140deg, #111111 0%, #1A1612 54%, #100E0C 100%)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.1,
          backgroundImage:
            "repeating-linear-gradient(18deg, transparent 0 12px, rgba(255,158,22,0.11) 13px, transparent 14px), repeating-linear-gradient(108deg, transparent 0 29px, rgba(246,241,230,0.05) 30px, transparent 31px)",
        }}
      />
      {Array.from({ length: 30 }, (_, i) => {
        const x = ((i * 137 + 31) % 1000) / 1000;
        const y = ((i * 251 + 73) % 1000) / 1000;
        const drift = Math.sin(frame / 39 + i * 2.1) * 9;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x * width + drift,
              top: y * height - frame * (0.1 + (i % 3) * 0.04),
              width: i % 5 === 0 ? 4 : 2,
              height: i % 5 === 0 ? 4 : 2,
              borderRadius: "50%",
              background: C.gold,
              opacity: 0.2 + (i % 4) * 0.08,
              boxShadow: "0 0 12px #FF9E16",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const Kicker: React.FC<{ number: string; compact?: boolean }> = ({ number, compact = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const L = useCoachLayout();
  const fs = L.wide ? 28 : L.vertical ? 34 : 24;
  const logoWidth = L.vertical ? 300 : L.wide ? 245 : 226;
  const logoHeight = L.vertical ? 110 : L.wide ? 95 : 86;
  const inP = spring({ frame: frame - 2, fps, config: { damping: 16, stiffness: 150 } });
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 24,
        width: "100%",
        minHeight: logoHeight,
        opacity: inP,
        fontFamily: FONT.mono,
        fontSize: fs,
        fontWeight: 700,
        letterSpacing: "0.06em",
        color: C.cream,
      }}
    >
      <Img
        src={staticFile("projects/the-happy-freelancers-webinars/logos/happy-freelancers-logo.webp")}
        style={{ width: logoWidth, height: logoHeight, objectFit: "contain", flex: "0 0 auto" }}
      />
      {!compact && <span style={{ color: C.gold, whiteSpace: "nowrap" }}>NIGHT {number} / 02</span>}
    </div>
  );
};

/** Coach portrait inside its complete circular gold frame. */
const CoachArtwork: React.FC<{ coach: Coach; compact?: boolean }> = ({ coach, compact = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const L = useCoachLayout();
  const d = COACHES[coach];
  const enter = spring({ frame: frame - (compact ? 4 : 7), fps, config: { damping: 15, stiffness: 100 } });
  const artHeight = compact
    ? L.vertical
      ? 330
      : L.wide
        ? 225
        : L.portrait
          ? 315
          : 200
    : L.wide
      ? "100%"
      : L.vertical
        ? 390
        : L.portrait
          ? 335
          : 265;
  const photoSize = compact
    ? L.vertical
      ? 290
      : L.wide
        ? 205
        : L.portrait
          ? 285
          : 180
    : L.wide
      ? Math.min(L.innerWidth * 0.35 - 34, 610)
      : L.vertical
        ? 360
        : L.portrait
          ? 305
          : 235;
  return (
    <div
      style={{
        position: "relative",
        flex: compact ? undefined : L.wide ? "0 0 35%" : "0 0 auto",
        width: "100%",
        height: artHeight,
        minHeight: 0,
        border: `2px solid rgba(255,158,22,${compact ? 0.7 : 0.58})`,
        borderRadius: compact ? 25 : 31,
        background:
          "radial-gradient(circle at 50% 39%, rgba(255,158,22,0.26), transparent 36%), linear-gradient(145deg, #302011 0%, #191510 58%, #0F0F0E 100%)",
        boxShadow: `0 28px 80px rgba(0,0,0,0.42), 0 0 48px rgba(255,158,22,${0.09 + 0.05 * Math.sin(frame / 18)})`,
        overflow: "hidden",
        opacity: enter,
        translate: `${(1 - enter) * (coach === "ali" ? -78 : 78)}px 0px`,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: "10% 10% 15%",
          border: "1px solid rgba(246,241,230,0.13)",
          rotate: "-7deg",
        }}
      />
      <Img
        src={staticFile(d.portrait)}
        style={{
          position: "absolute",
          width: photoSize,
          height: photoSize,
          left: L.wide && !compact ? "50%" : undefined,
          right: L.wide && !compact ? undefined : compact && L.vertical ? 3 : 18,
          top: "50%",
          translate: L.wide && !compact ? "-50% -50%" : "0 -50%",
          objectFit: "contain",
          filter: "drop-shadow(0 12px 25px rgba(0,0,0,0.32))",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: compact ? 24 : 32,
          top: compact ? 22 : 30,
          fontFamily: FONT.mono,
          fontWeight: 700,
          fontSize: compact ? 25 : L.wide ? 37 : 27,
          color: C.gold,
          letterSpacing: "0.08em",
        }}
      >
        {d.number} / 02
      </div>
      {!compact && <div
        style={{
          position: "absolute",
          left: compact ? 24 : 32,
          right: L.wide ? 32 : photoSize + 31,
          bottom: compact ? 22 : 31,
          borderTop: "1px solid rgba(255,158,22,0.45)",
          paddingTop: compact ? 15 : 21,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 10,
          fontFamily: FONT.mono,
          color: C.cream,
          fontWeight: 700,
          fontSize: L.wide ? 24 : L.vertical ? 30 : 22,
          letterSpacing: "0.03em",
        }}
      >
        <span>{d.name}</span>
        {L.wide && <span style={{ color: C.gold }}>{d.affiliation}</span>}
      </div>
      }
    </div>
  );
};

const ScheduleBadge: React.FC<{ coach: Coach; compact?: boolean }> = ({ coach, compact = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const L = useCoachLayout();
  const d = COACHES[coach];
  const start = compact ? 38 : coach === "ali" ? 151 : 161;
  const enter = spring({ frame: frame - start, fps, config: { damping: 14, stiffness: 125 } });
  const dateFs = compact ? (L.wide ? 22 : L.vertical ? 26 : 20) : L.wide ? 29 : L.vertical ? 38 : 26;
  const timeFs = compact ? (L.wide ? 20 : L.vertical ? 22 : 19) : L.wide ? 26 : L.vertical ? 34 : 24;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: L.vertical || compact ? "column" : "row",
        alignItems: L.vertical || compact ? "flex-start" : "center",
        justifyContent: "space-between",
        gap: compact ? 8 : 14,
        padding: compact ? (L.vertical ? "20px 24px" : "17px 21px") : L.vertical ? "25px 33px" : "21px 29px",
        borderRadius: compact ? 17 : 22,
        width: "100%",
        background: "linear-gradient(110deg, #FFB335, #F57C00)",
        boxShadow: `0 0 ${18 + Math.max(0, Math.sin(frame / 9)) * 18}px rgba(255,158,22,0.29)`,
        color: C.ink,
        opacity: enter,
        scale: `${0.87 + enter * 0.13}`,
        translate: `0px ${(1 - enter) * 27}px`,
        boxSizing: "border-box",
      }}
    >
      <span style={{ fontFamily: FONT.mono, fontWeight: 700, fontSize: dateFs, whiteSpace: "nowrap" }}>{d.date}</span>
      <span style={{ fontFamily: FONT.mono, fontWeight: 700, fontSize: timeFs, whiteSpace: "nowrap" }}>{d.time}</span>
    </div>
  );
};

const BadPracticeTags: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const L = useCoachLayout();
  const tags = ["MESSY FONTS", "BAD LAYOUT", "AI RELIANCE"] as const;
  const fs = L.wide ? 28 : L.vertical ? 34 : 23;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: L.vertical ? 16 : 12, minHeight: L.vertical ? 76 : 61, alignItems: "center" }}>
      {tags.map((tag, i) => {
        const enter = spring({ frame: frame - 42 - i * 11, fps, config: { damping: 13, stiffness: 155 } });
        const breakP = interpolate(frame, [116 + i * 9, 141 + i * 9], [0, 1], clamp);
        const reform = spring({ frame: frame - 139 - i * 5, fps, config: { damping: 15, stiffness: 190 } });
        return (
          <div key={tag} style={{ position: "relative", display: "inline-block", opacity: enter, minWidth: L.wide ? 170 : undefined }}>
            <span
              style={{
                display: "inline-block",
                fontFamily: FONT.mono,
                fontWeight: 700,
                fontSize: fs,
                letterSpacing: "-0.025em",
                padding: L.vertical ? "16px 18px" : "13px 16px",
                color: C.cream,
                border: `2px solid ${C.orange}`,
                borderRadius: 10,
                whiteSpace: "nowrap",
                background: "rgba(255,87,34,0.1)",
                opacity: 1 - breakP,
                scale: `${1 - 0.18 * breakP}`,
                rotate: `${(i % 2 ? 1 : -1) * breakP * 9}deg`,
                filter: `blur(${breakP * 8}px)`,
              }}
            >
              [{tag}]
            </span>
            <span
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: FONT.mono,
                fontWeight: 700,
                fontSize: fs,
                whiteSpace: "nowrap",
                color: C.ink,
                background: C.gold,
                borderRadius: 10,
                opacity: reform,
                scale: `${0.7 + 0.3 * reform}`,
              }}
            >
              ✓ FIX IT
            </span>
          </div>
        );
      })}
    </div>
  );
};

const SevenDayCalendar: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const L = useCoachLayout();
  const cols = L.vertical ? 4 : 7;
  const labelFs = L.wide ? 24 : L.vertical ? 32 : 22;
  const cellHeight = L.wide ? 144 : L.vertical ? 150 : L.portrait ? 105 : 91;
  const headerIn = spring({ frame: frame - 39, fps, config: { damping: 14 } });
  return (
    <div
      style={{
        background: C.cream,
        borderRadius: L.vertical ? 29 : 23,
        padding: L.wide ? 27 : L.vertical ? 30 : 23,
        boxShadow: "0 25px 55px rgba(0,0,0,0.32)",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: L.wide ? 22 : L.vertical ? 24 : 17,
          fontFamily: FONT.mono,
          fontSize: labelFs,
          fontWeight: 700,
          color: C.ink,
          opacity: headerIn,
        }}
      >
        <span>FIRST 7 DAYS</span>
        <span style={{ color: C.amber }}>CONTENT PLAN ↗</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gap: L.vertical ? 11 : 8 }}>
        {Array.from({ length: 7 }, (_, i) => {
          const unlocked = spring({ frame: frame - 54 - i * 15, fps, config: { damping: 13, stiffness: 175 } });
          return (
            <div
              key={i}
              style={{
                height: cellHeight,
                borderRadius: L.vertical ? 15 : 11,
                border: `2px solid ${unlocked > 0.5 ? C.amber : "#D5CEC2"}`,
                background: unlocked > 0.5 ? `linear-gradient(160deg, ${C.gold}, ${C.amber})` : "#E6E0D6",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
                color: C.ink,
                boxShadow: unlocked > 0.5 ? "0 6px 15px rgba(245,124,0,0.23)" : "none",
                scale: `${0.92 + 0.08 * unlocked}`,
              }}
            >
              <span style={{ fontFamily: FONT.mono, fontSize: L.wide ? 18 : L.vertical ? 23 : 17, fontWeight: 700, whiteSpace: "nowrap" }}>DAY {i + 1}</span>
              <span style={{ fontFamily: FONT.display, fontSize: L.wide ? 51 : L.vertical ? 58 : L.portrait ? 39 : 36, lineHeight: 0.9, fontWeight: 800 }}>
                {unlocked > 0.5 ? "✓" : "·"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/** Eight-second Day 1 or Day 2 scene. `frame` is local to its `<Sequence>`. */
export const CoachSpotlight: React.FC<{ coach: Coach }> = ({ coach }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const L = useCoachLayout();
  const isAli = coach === "ali";
  const titleIn = spring({ frame: frame - 16, fps, config: { damping: 15, stiffness: 130 } });
  const infoIn = spring({ frame: frame - 26, fps, config: { damping: 16, stiffness: 140 } });
  const titleFs = L.wide ? 83 : L.vertical ? 82 : L.portrait ? 76 : 66;
  const nameFs = L.wide ? 52 : L.vertical ? 69 : L.portrait ? 52 : 45;
  const bodyFs = L.wide ? 31 : L.vertical ? 42 : L.portrait ? 32 : 27;
  return (
    <AbsoluteFill style={{ color: C.white, overflow: "hidden" }}>
      <Backdrop />
      <div
        style={{
          position: "absolute",
          left: L.side,
          right: L.side,
          top: L.safeTop,
          bottom: L.safeBottom,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        }}
      >
        <Kicker number={COACHES[coach].number} />
        <div
          style={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: L.wide ? "row" : "column",
            gap: L.wide ? 65 : L.vertical ? 30 : 16,
            paddingTop: L.wide ? 17 : L.vertical ? 25 : 10,
          }}
        >
          <CoachArtwork coach={coach} />
          <div
            style={{
              display: "flex",
              flex: 1,
              minHeight: 0,
              flexDirection: "column",
              justifyContent: "space-between",
              gap: L.vertical ? 20 : 12,
            }}
          >
            <div style={{ opacity: titleIn, translate: `0px ${(1 - titleIn) * 39}px` }}>
              <div
                style={{
                  color: C.gold,
                  fontFamily: FONT.mono,
                  fontWeight: 700,
                  fontSize: L.wide ? 27 : L.vertical ? 37 : 24,
                  letterSpacing: "0.07em",
                  marginBottom: L.wide ? 18 : L.vertical ? 22 : 10,
                }}
              >
                {isAli ? "OCT 08 / GRAPHIC DESIGN" : "OCT 09 / SOCIAL MEDIA"}
              </div>
              <div
                style={{
                  fontFamily: FONT.display,
                  fontWeight: 800,
                  fontSize: titleFs,
                  lineHeight: 0.94,
                  letterSpacing: "-0.065em",
                  textTransform: "uppercase",
                  textShadow: "0 4px 30px rgba(0,0,0,0.35)",
                }}
              >
                {isAli ? (
                  <>
                    FATAL DESIGN
                    <br />
                    <span style={{ color: C.gold }}>MISTAKES.</span>
                  </>
                ) : (
                  <>
                    YOUR FIRST
                    <br />
                    <span style={{ color: C.gold }}>7 DAYS OF CONTENT.</span>
                  </>
                )}
              </div>
            </div>
            <div style={{ opacity: infoIn, translate: `0px ${(1 - infoIn) * 24}px` }}>
              <div style={{ fontFamily: FONT.display, fontSize: nameFs, fontWeight: 800, lineHeight: 1, letterSpacing: "-0.05em" }}>
                {COACHES[coach].name}
              </div>
              <div style={{ fontFamily: FONT.body, fontSize: bodyFs, fontWeight: 600, color: C.muted, marginTop: L.vertical ? 14 : 8, lineHeight: 1.16 }}>
                {isAli ? "MEGs Digital  /  Spot the habits that cost you the client." : "Plan a week of content with purpose and direction."}
              </div>
            </div>
            {isAli ? <BadPracticeTags /> : <SevenDayCalendar />}
            <ScheduleBadge coach={coach} />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const CombinedCard: React.FC<{ coach: Coach }> = ({ coach }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const L = useCoachLayout();
  const d = COACHES[coach];
  const inP = spring({ frame: frame - (coach === "ali" ? 4 : 14), fps, config: { damping: 13, stiffness: 110 } });
  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        display: "flex",
        flexDirection: L.vertical ? "row" : "column",
        gap: L.vertical ? 24 : 17,
        padding: L.vertical ? 19 : L.wide ? 23 : 17,
        border: "2px solid rgba(255,158,22,0.49)",
        borderRadius: L.vertical ? 30 : 27,
        background: "rgba(26,22,18,0.85)",
        boxShadow: "0 18px 52px rgba(0,0,0,0.35)",
        opacity: inP,
        translate: `${(1 - inP) * (coach === "ali" ? -80 : 80)}px 0px`,
      }}
    >
      <div style={{ flex: L.vertical ? "0 0 35%" : "0 0 auto", minWidth: 0 }}>
        <CoachArtwork coach={coach} compact />
      </div>
      <div style={{ minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 8, flex: 1 }}>
        <div>
          <div style={{ fontFamily: FONT.mono, fontSize: L.wide ? 23 : L.vertical ? 26 : 20, fontWeight: 700, color: C.gold, letterSpacing: "0.04em" }}>
            NIGHT {d.number} / {d.subject}
          </div>
          <div style={{ fontFamily: FONT.display, fontSize: L.wide ? 54 : L.vertical ? 56 : 38, fontWeight: 800, color: C.cream, letterSpacing: "-0.06em", lineHeight: 1.04, marginTop: 11 }}>
            {d.name}
          </div>
          <div style={{ fontFamily: FONT.body, fontSize: L.wide ? 26 : L.vertical ? 28 : 22, fontWeight: 600, color: C.muted, marginTop: 8 }}>
            {coach === "ali" ? "MEGs Digital • Graphic Design" : "7-Day Content Plan • SMM"}
          </div>
        </div>
        <ScheduleBadge coach={coach} compact />
      </div>
    </div>
  );
};

/** Six-second FOMO scene with both coaches and the required urgency badges. */
export const DualCoachCards: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const L = useCoachLayout();
  const headlineIn = spring({ frame, fps, config: { damping: 14, stiffness: 145 } });
  const freeIn = spring({ frame: frame - 29, fps, config: { damping: 11, stiffness: 160 } });
  const alertIn = spring({ frame: frame - 50, fps, config: { damping: 13, stiffness: 160 } });
  const pulse = 1 + 0.035 * Math.sin(frame / 4.8);
  return (
    <AbsoluteFill style={{ color: C.white, overflow: "hidden" }}>
      <Backdrop />
      <div
        style={{
          position: "absolute",
          left: L.side,
          right: L.side,
          top: L.safeTop,
          bottom: L.safeBottom,
          display: "flex",
          flexDirection: "column",
          gap: L.vertical ? 27 : L.wide ? 26 : 19,
          minHeight: 0,
        }}
      >
        <Kicker number="02" compact />
        <div style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: L.wide ? 82 : L.vertical ? 91 : L.portrait ? 72 : 61, lineHeight: 0.98, letterSpacing: "-0.07em", opacity: headlineIn, translate: `0px ${(1 - headlineIn) * 30}px` }}>
          TWO NIGHTS. <span style={{ color: C.gold }}>TWO COACHES.</span>
        </div>
        <div style={{ display: "flex", flexDirection: L.vertical ? "column" : "row", gap: L.vertical ? 18 : 23, flex: 1, minHeight: 0 }}>
          <CombinedCard coach="ali" />
          <CombinedCard coach="mary" />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: L.vertical ? 18 : L.wide ? 9 : 12, alignItems: "center" }}>
          <div
            style={{
              width: L.wide ? "66%" : "100%",
              textAlign: "center",
              padding: L.vertical ? "29px 34px" : L.wide ? "17px 24px" : "19px 27px",
              background: `linear-gradient(105deg, ${C.gold}, ${C.amber})`,
              borderRadius: 100,
              color: C.ink,
              fontFamily: FONT.display,
              fontWeight: 800,
              fontSize: L.wide ? 40 : L.vertical ? 58 : 36,
              letterSpacing: "-0.045em",
              whiteSpace: "nowrap",
              boxShadow: `0 0 ${31 + 17 * Math.sin(frame / 7)}px rgba(255,158,22,0.65)`,
              opacity: freeIn,
              scale: `${freeIn * pulse}`,
              boxSizing: "border-box",
            }}
          >
            100% FREE WEBINAR
          </div>
          <div
            style={{
              width: L.wide ? "46%" : "100%",
              textAlign: "center",
              padding: L.vertical ? "25px 28px" : L.wide ? "15px 22px" : "17px 23px",
              border: `3px solid ${C.orange}`,
              borderRadius: 100,
              color: C.white,
              background: "rgba(255,87,34,0.18)",
              fontFamily: FONT.mono,
              fontWeight: 700,
              fontSize: L.wide ? 24 : L.vertical ? 38 : 25,
              whiteSpace: "nowrap",
              letterSpacing: "0.02em",
              boxShadow: `0 0 ${11 + 15 * Math.max(0, Math.sin(frame / 5))}px rgba(255,87,34,0.46)`,
              opacity: alertIn,
              scale: `${alertIn * (1 + 0.02 * Math.sin(frame / 5))}`,
              boxSizing: "border-box",
            }}
          >
            SLOTS FILLING FAST
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
