import brief from "../../../projects/pancake-end-to-end/brief.json";

/** Campaign copy and VO cue sheet live in the project brief. */
export const CONTENT = brief.props;

export const LOGOS = {
  automatika: "projects/pancake-end-to-end/logos/automatika-logo.png",
  automatikaMark: "projects/pancake-end-to-end/logos/automatika-mark.png",
  pancake: "projects/pancake-end-to-end/logos/pancake-logo.png",
  botcake: "projects/pancake-end-to-end/logos/botcake-logo-2025.svg",
  webcake: "projects/pancake-end-to-end/logos/logo-landing-v3.webp",
  pos: "projects/pancake-end-to-end/logos/logo-pos.webp",
  crm: "projects/pancake-end-to-end/logos/logo-crm.webp",
} as const;
