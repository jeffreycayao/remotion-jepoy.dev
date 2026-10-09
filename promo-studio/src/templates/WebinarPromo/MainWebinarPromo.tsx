import { Audio } from "@remotion/media";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { loadFont as loadSora } from "@remotion/google-fonts/Sora";
import type React from "react";
import {
  AbsoluteFill,
  getStaticFiles,
  Img,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { CoachSpotlight, DualCoachCards } from "./components/CoachCards";
import { CountdownAlert } from "./components/CountdownAlert";
import { UrgencyCTA } from "./components/UrgencyCTA";
import { SoundFX } from "./SoundFX";

export const WEBINAR_DURATION = 1050;
const VOICEOVER_FILES = [
  "projects/the-happy-freelancers-webinars/audio/webinar_fomo_vo.mp3",
  "webinar_fomo_vo.mp3",
] as const;
/**
 * The supplied 37.2 s ElevenLabs take has silence near source frames
 * 240/488/756/941. Each clip selects one phrase and maps it precisely onto
 * the fixed 8/8/8/6/5 s scenes. Cuts stay inside those pauses to keep every word.
 */
const VoiceoverTrack: React.FC<{ src: string }> = ({ src }) => {
  const { fps } = useVideoConfig();
  return (
    <>
      <Audio name="VO 01 — ruin hook" src={src} durationInFrames={240} playbackRate={1} premountFor={fps} />
      <Audio name="VO 02 — Coach Ali" src={src} from={240} trimBefore={240} durationInFrames={248} playbackRate={248 / 240} premountFor={fps} />
      <Audio name="VO 03 — Coach Mary" src={src} from={480} trimBefore={488} durationInFrames={268} playbackRate={268 / 240} premountFor={fps} />
      <Audio name="VO 04 — two free nights" src={src} from={720} trimBefore={756} durationInFrames={185} playbackRate={185 / 180} premountFor={fps} />
      <Audio name="VO 05 — registration" src={src} from={900} trimBefore={941} durationInFrames={170} playbackRate={170 / 150} premountFor={fps} />
    </>
  );
};

const FONT = {
  head: loadSora("normal", { subsets: ["latin"], weights: ["700", "800"] }).fontFamily,
  body: loadInter("normal", { subsets: ["latin"], weights: ["500", "600", "700"] }).fontFamily,
  mono: loadMono("normal", { subsets: ["latin"], weights: ["600", "700"] }).fontFamily,
};

const C = {
  ink: "#111111",
  inkWarm: "#1A1612",
  gold: "#FF9E16",
  amber: "#F57C00",
  alert: "#FF5722",
  white: "#FFFFFF",
  cream: "#F6F1E6",
};

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const useFormat = () => {
  const { width, height } = useVideoConfig();
  const ratio = width / height;
  return {
    width,
    height,
    wide: ratio > 1.3,
    square: ratio >= 0.9 && ratio <= 1.3,
    vertical: ratio < 0.7,
    side: ratio > 1.3 ? 112 : 72,
    safeTop: ratio < 0.7 ? 140 : ratio > 1.3 ? 76 : 60,
    safeBottom: ratio < 0.7 ? 140 : ratio > 1.3 ? 72 : 60,
  };
};

/** Deterministic texture: no random positions or CSS keyframes, so still renders are repeatable. */
const GoldDust: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ overflow: "hidden", pointerEvents: "none" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 12% 20%, rgba(255,158,22,.13), transparent 30%),
            radial-gradient(circle at 86% 82%, rgba(245,124,0,.12), transparent 32%),
            linear-gradient(138deg, ${C.ink} 0%, ${C.inkWarm} 58%, #0E0C0B 100%)`,
        }}
      />
      <AbsoluteFill
        style={{
          opacity: 0.13,
          backgroundImage: "repeating-linear-gradient(0deg, transparent 0 3px, rgba(255,255,255,.08) 3px 4px)",
          backgroundSize: "100% 6px",
        }}
      />
      {Array.from({ length: 46 }, (_, i) => {
        const x = (((i * 67 + 19) * 137) % 997) / 997;
        const y = (((i * 31 + 83) * 419) % 991) / 991;
        const drift = Math.sin(frame / (50 + (i % 6) * 18) + i * 1.8);
        const size = i % 9 === 0 ? 5 : i % 3 === 0 ? 3 : 2;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x * width + drift * 17,
              top: y * height + Math.cos(frame / 65 + i) * 12,
              width: size,
              height: size,
              borderRadius: "50%",
              backgroundColor: C.gold,
              opacity: (0.12 + (i % 5) * 0.055) * (0.8 + drift * 0.2),
              boxShadow: i % 5 === 0 ? `0 0 14px ${C.gold}` : undefined,
            }}
          />
        );
      })}
      <AbsoluteFill
        style={{
          background: "radial-gradient(ellipse at center, transparent 32%, rgba(0,0,0,.47) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

const BrandLogo: React.FC = () => {
  const { wide, vertical } = useFormat();
  const width = wide ? 322 : vertical ? 306 : 284;
  return (
    <Img
      src={staticFile("projects/the-happy-freelancers-webinars/logos/happy-freelancers-logo.webp")}
      style={{
        display: "block",
        width,
        height: width * (464 / 1200),
        objectFit: "contain",
        filter: "drop-shadow(0 3px 16px rgba(255,158,22,.18))",
      }}
    />
  );
};

const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { wide, square, vertical, side, safeTop, safeBottom, width, height } = useFormat();
  const jitter = frame < 94 && frame % 9 < 2 ? (frame % 2 ? 4 : -4) : 0;
  const entrance = interpolate(frame, [0, 14], [0.84, 1], clamp);
  const subOpacity = interpolate(frame, [45, 70], [0, 1], clamp);
  const titleSize = wide ? 105 : vertical ? 91 : square ? 66 : 86;

  return (
    <AbsoluteFill style={{ color: C.white, fontFamily: FONT.body, overflow: "hidden" }}>
      <GoldDust />
      <div
        style={{
          position: "absolute",
          left: side,
          right: side,
          top: safeTop,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          zIndex: 2,
        }}
      >
        <BrandLogo />
        {wide && (
          <span style={{ color: C.cream, fontFamily: FONT.mono, fontSize: 23, letterSpacing: 1.4 }}>
            FREE WEBINAR SERIES / OCT 08—09
          </span>
        )}
      </div>

      <div
        style={{
          position: "absolute",
          left: side,
          right: side,
          top: wide ? 250 : vertical ? 320 : square ? 190 : 256,
          bottom: safeBottom + (wide ? 50 : vertical ? 50 : 32),
          display: "flex",
          flexDirection: wide ? "row" : "column",
          alignItems: wide ? "center" : "stretch",
          justifyContent: wide ? "space-between" : "space-evenly",
          gap: wide ? 72 : square ? 16 : 24,
        }}
      >
        <div style={{ width: wide ? "57%" : "100%", position: "relative", flexShrink: 0 }}>
          <div style={{ position: "absolute", top: -26, left: 0, width: wide ? 570 : 460, height: 12, background: C.gold, boxShadow: `0 0 35px ${C.amber}` }} />
          <h1
            style={{
              fontFamily: FONT.head,
              fontWeight: 800,
              fontSize: titleSize,
              lineHeight: 0.97,
              letterSpacing: -titleSize * 0.055,
              margin: 0,
              textTransform: "uppercase",
              textShadow: `0 7px 0 rgba(0,0,0,.55), 0 0 36px rgba(255,158,22,.2)`,
              transform: `translateX(${jitter}px) scale(${entrance})`,
              transformOrigin: "left center",
            }}
          >
            HOW TO <span style={{ color: C.alert }}>RUIN</span>
            <br />
            YOUR GRAPHIC
            <br />
            DESIGN CAREER
            <br />
            <span style={{ color: C.gold }}>IN 5 SECS</span>
          </h1>
          <div
            style={{
              opacity: subOpacity,
              marginTop: wide ? 33 : 22,
              fontSize: wide ? 32 : vertical ? 38 : 30,
              lineHeight: 1.2,
              fontWeight: 700,
              color: C.cream,
              maxWidth: 810,
            }}
          >
            Isang maling habit. Isang palpak na layout. <span style={{ color: C.alert }}>Ekis ka agad sa client.</span>
          </div>
        </div>
        <div
          style={{
            width: wide ? "37%" : "100%",
            maxWidth: wide ? 630 : 830,
            alignSelf: wide ? "center" : "center",
            position: "relative",
            zIndex: 3,
          }}
        >
          <CountdownAlert />
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: side,
          bottom: safeBottom,
          width: width - side * 2,
          display: "flex",
          justifyContent: "space-between",
          color: "rgba(246,241,230,.58)",
          fontFamily: FONT.mono,
          fontSize: vertical ? 21 : 22,
          letterSpacing: 1.3,
        }}
      >
        <span>LIVE • TWO NIGHTS • TWO COACHES</span>
        {wide && <span>0:00 / 0:35</span>}
      </div>

      <div
        style={{
          position: "absolute",
          right: -height * 0.1,
          top: height * 0.18,
          width: height * 0.48,
          height: height * 0.48,
          border: "2px solid rgba(255,158,22,.12)",
          borderRadius: "50%",
          boxShadow: `0 0 0 70px rgba(255,158,22,.02), 0 0 0 140px rgba(255,158,22,.02)`,
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};

/** Five exact non-overlapping scene ranges, matching the supplied VO timecodes. */
export const MainWebinarPromo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const staticFiles = new Set(getStaticFiles().map((file) => file.name.replace(/\\/g, "/")));
  const voiceover = VOICEOVER_FILES.find((file) => staticFiles.has(file));
  const cut = [240, 480, 720, 900].find((boundary) => frame >= boundary && frame < boundary + 5);

  return (
    <AbsoluteFill style={{ backgroundColor: C.ink, color: C.white, overflow: "hidden" }}>
      {voiceover && <VoiceoverTrack src={staticFile(voiceover)} />}
      <SoundFX />
      <Sequence name="01 — Five-second ruin hook" durationInFrames={240} premountFor={fps}>
        <HookScene />
      </Sequence>
      <Sequence name="02 — October 8 / Coach Ali" from={240} durationInFrames={240} premountFor={fps}>
        <CoachSpotlight coach="ali" />
      </Sequence>
      <Sequence name="03 — October 9 / Coach Mary Amorin" from={480} durationInFrames={240} premountFor={fps}>
        <CoachSpotlight coach="mary" />
      </Sequence>
      <Sequence name="04 — Two coaches / free / urgency" from={720} durationInFrames={180} premountFor={fps}>
        <DualCoachCards />
      </Sequence>
      <Sequence name="05 — Registration CTA" from={900} durationInFrames={150} premountFor={fps}>
        <UrgencyCTA />
      </Sequence>
      {cut !== undefined && (
        <AbsoluteFill
          style={{
            pointerEvents: "none",
            background: `linear-gradient(104deg, transparent 20%, rgba(255,158,22,${0.35 * (1 - (frame - cut) / 5)}) 50%, transparent 78%)`,
            mixBlendMode: "screen",
          }}
        />
      )}
    </AbsoluteFill>
  );
};
