import brief from "../../../projects/automatika-go-live-fast/brief.json";

/** All on-screen copy lives in the project brief. */
export const CONTENT = brief.props;

const DIR = "projects/automatika-go-live-fast";

export const LOGOS = {
  automatika: `${DIR}/logos/automatika-logo.png`,
  mark: `${DIR}/logos/automatika-mark.png`,
  crm: `${DIR}/logos/logo-crm.webp`,
  webcake: `${DIR}/logos/logo-landing-v3.webp`,
  botcake: `${DIR}/logos/botcake-logo-2025.svg`,
  pos: `${DIR}/logos/logo-pos.webp`,
} as const;

export type LogoKey = keyof typeof LOGOS;

export const SFX_DIR = `${DIR}/sfx`;
