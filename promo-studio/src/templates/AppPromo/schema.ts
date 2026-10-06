import { zColor } from "@remotion/zod-types";
import { z } from "zod";

// Fonts that are pre-wired in src/lib/fonts.ts. Add a font there before adding it here.
export const fontChoices = [
  "Inter",
  "Poppins",
  "Montserrat",
  "Space Grotesk",
  "DM Sans",
  "Plus Jakarta Sans",
] as const;

// Asset paths are relative to promo-studio/public, e.g. "projects/my-app/logo.png".
// Leave empty ("") to use the built-in placeholder.
const assetPath = z.string();

export const featureSchema = z.object({
  title: z.string(),
  description: z.string(),
  icon: z.string(), // emoji or 1-2 characters, used when no screenshot is set
  screenshot: assetPath,
});

export const statSchema = z.object({
  value: z.number(),
  prefix: z.string(),
  suffix: z.string(),
  label: z.string(),
});

export const appPromoSchema = z.object({
  appName: z.string(),
  tagline: z.string(),
  logo: assetPath,
  brand: z.object({
    primary: zColor(),
    secondary: zColor(),
    background: zColor(),
    text: zColor(),
    font: z.enum(fontChoices),
  }),
  hook: z.object({
    headline: z.string(),
    subheadline: z.string(),
  }),
  features: z.array(featureSchema).min(1).max(6),
  stats: z.array(statSchema).max(4),
  cta: z.object({
    headline: z.string(),
    button: z.string(),
    url: z.string(),
  }),
  audio: z.object({
    music: assetPath,
    volume: z.number().min(0).max(1),
  }),
  timing: z.object({
    hookSeconds: z.number().min(1),
    featureSeconds: z.number().min(1),
    statsSeconds: z.number().min(1),
    ctaSeconds: z.number().min(1),
    transitionFrames: z.number().int().min(0).max(30),
  }),
  // Spoken line per scene, in scene order. Filled from projects/<slug>/voiceover.json by Root.tsx
  // (not stored in brief.json); shown as moving-pill captions. Missing/empty = no captions.
  voiceoverLines: z.array(z.string()).optional(),
});

export type AppPromoProps = z.infer<typeof appPromoSchema>;
export type Feature = z.infer<typeof featureSchema>;
export type Stat = z.infer<typeof statSchema>;
