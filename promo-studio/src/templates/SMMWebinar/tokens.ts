import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as loadJakarta } from "@remotion/google-fonts/PlusJakartaSans";
import { useVideoConfig } from "remotion";

const subsets = ["latin" as const, "latin-ext" as const];
loadPlayfair("italic", { subsets, weights: ["500", "600"] });

export const FONT = {
  serif: loadPlayfair("normal", { subsets, weights: ["700", "800"] }).fontFamily,
  body: loadJakarta("normal", { subsets, weights: ["500", "600", "700"] }).fontFamily,
};

/** Palette taken from the Happy Freelancers webinar flyer. */
export const C = {
  canvas: "#FAF7F2", // warm alabaster
  sand: "#EED9C7", // nude sand arches
  ink: "#2D1810", // espresso headlines
  terracotta: "#D05A22", // energy accent: LEARNING, badge, CTA
  peach: "#F5E8DC", // secondary surfaces
  gold: "#D9945B", // accent lines
  white: "#FFFFFF",
  inkSoft: "rgba(45, 24, 16, 0.68)",
};

export const ASSETS = {
  voiceover: "projects/the-happy-freelancers-smm-webinar/audio/smm_webinar_vo.mp3",
  portrait: "projects/the-happy-freelancers-smm-webinar/portraits/coach_mary.png",
  logo: "projects/the-happy-freelancers-smm-webinar/logos/happy-freelancers-logo.webp",
};

/**
 * Beat frames (30 fps), measured from the recorded 29.8 s voiceover by its phrase pauses
 * (ffmpeg -af silencedetect=noise=-35dB:d=0.07). Each visual lands 4 frames before its word.
 */
export const T = {
  // Scene 1 — "Thinking about freelancing, career shift, o palaguin ang business mo?"
  freelancing: 22, // 0.85 s
  careerShift: 54, // 1.95 s
  business: 86, // 3.01 s
  headline: 149, // 5.09 s "Your next chapter starts with one decision:"
  learning: 197, // 6.71 s "matuto."
  // Scene 2 — "Samahan kami sa The Happy Freelancers for a FREE … Webinar kasama si Coach Mary Amorin!"
  speaker: 246, // 8.33 s
  badge: 322, // 10.88 s "FREE Social Media Marketing Webinar"
  coach: 415, // 13.98 s "kasama si Coach Mary Amorin"
  // Scene 3 — "Matutunan ang basics at planuhin ang first seven days of content mo. Ngayong October nine…"
  schedule: 476, // 16.01 s
  planner: 520, // 17.46 s "planuhin ang first seven days of content"
  date: 598, // 20.06 s "Ngayong October nine"
  time: 633, // 21.24 s "seven to ten PM Philippine Time"
  // Scene 4 — "One hundred percent free ito, pero mabilis mapuno ang slots. Click the event link…"
  cta: 700, // 23.46 s
  slots: 740, // 24.81 s "pero mabilis mapuno ang slots"
  button: 809, // 27.11 s "Click the event link in the caption"
  press: 860, // 28.8 s "register now!"
  total: 900, // voice ends 29.7 s
};

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/**
 * One design for four formats. Landscape (16:9) puts text and visuals side by side; every other
 * format stacks them. Stacked frames shorter than 9:16 scale `u` down so the ~1500 u stack fits.
 */
export const useLayout = () => {
  const { width, height } = useVideoConfig();
  const landscape = width / height > 1.3;
  const tall = height / width > 1.4;
  const u = landscape ? height / 1080 : Math.min(width / 1080, height / (tall ? 1920 : 1500));
  return {
    width,
    height,
    u,
    landscape,
    tall,
    // Stacked elements grow on 9:16, which has ~40% more height to fill than 4:5.
    s: tall ? 1.22 : 1,
    // 9:16 keeps 120 px clear top/bottom for platform UI (Reels, TikTok).
    padY: tall ? 160 : landscape ? 90 * u : 70 * u,
    padX: landscape ? 140 * u : 80 * u,
  };
};
