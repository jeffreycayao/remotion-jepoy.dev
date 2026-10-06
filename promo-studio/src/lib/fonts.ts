import { loadFont as loadDMSans } from "@remotion/google-fonts/DMSans";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadMontserrat } from "@remotion/google-fonts/Montserrat";
import { loadFont as loadPlusJakarta } from "@remotion/google-fonts/PlusJakartaSans";
import { loadFont as loadPoppins } from "@remotion/google-fonts/Poppins";
import { loadFont as loadSpaceGrotesk } from "@remotion/google-fonts/SpaceGrotesk";
import type { fontChoices } from "../templates/AppPromo/schema";

// loadFont() blocks rendering until the font is ready, so frames never flash a fallback font.
const opts = { subsets: ["latin" as const] };

const families: Record<(typeof fontChoices)[number], string> = {
  Inter: loadInter("normal", { ...opts, weights: ["400", "600", "800"] }).fontFamily,
  Poppins: loadPoppins("normal", { ...opts, weights: ["400", "600", "800"] }).fontFamily,
  Montserrat: loadMontserrat("normal", { ...opts, weights: ["400", "600", "800"] }).fontFamily,
  "Space Grotesk": loadSpaceGrotesk("normal", { ...opts, weights: ["400", "600", "700"] }).fontFamily,
  "DM Sans": loadDMSans("normal", { ...opts, weights: ["400", "600", "800"] }).fontFamily,
  "Plus Jakarta Sans": loadPlusJakarta("normal", { ...opts, weights: ["400", "600", "800"] }).fontFamily,
};

export const getFontFamily = (font: (typeof fontChoices)[number]) => families[font];
