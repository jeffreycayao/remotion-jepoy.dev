# Pancake-end-to-end

This project uses the `PancakeEcosystem` bespoke template. The four registered IDs are `PancakeAd-16x9`, `PancakeAd-9x16`, `PancakeAd-1x1`, and `PancakeAd-4x5` (1050 frames at 30 FPS).

## Narration and render readiness

The user-supplied 32.080-second Taglish MP3 is preserved unchanged in `00_INBOX/pancake-end-to-end/`. Its prepared copy is `promo-studio/public/projects/pancake-end-to-end/audio/pancake_ecosystem_ad.mp3`; the source, inbox, and prepared copies have matching SHA-256 hashes. Source audio preflight measured −19.3 LUFS integrated and −2.5 dBFS true peak, with no clipping. Local transcription broadly matched all four scripted sections; Taglish and product names were too noisy for a word-for-word check.

`promo-studio/public/projects/pancake-end-to-end/audio/pancake_ecosystem_ad_aligned.wav` is a 35-second derivative of that MP3, shared by all four compositions. It places the four spoken sections at 0, 7, 17, and 26 seconds; only section 2 plays at 1.163× to finish before the scene-3 cut. `MainCommercial.tsx` mounts this as one audio track starting at frame 0 so Studio preview and exports use the same complete narration. The scene-4 narration ends near frame 985, leaving the final call to action visible through frame 1050.

| Visual scene | Frames | Source MP3 frames | Playback |
| --- | ---: | ---: | ---: |
| Multi-channel grind | 0–210 | 0–181 | 1×, then visual hold |
| Inbox + Botcake | 210–510 | 181–530 | 1.163× |
| Webcake → POS → CRM | 510–780 | 530–757 | 1×, then visual hold |
| Setup + CTA | 780–1050 | 757–962 | 1×, then CTA hold |

All source-frame values assume 30 FPS and should be remeasured if the MP3 is replaced. From `promo-studio/`, run `npm run lint` and `npm run frames -- pancake-end-to-end 9x16 60,150,300` for preflight. When final output is requested, run `npm run render -- pancake-end-to-end`; the project brief already lists all four sizes.

## Sound effects

`SoundFX.tsx` adds 22 low-volume, frame-cued accents across the four scenes. They mark incoming channels, the exposed-data warning, the inbox reveal, Botcake actions, the Webcake/POS/CRM flow, the courier waybill, and both response buttons. It is mounted once beside the narration in the shared composition, so all four sizes receive the same mix. There is no continuous music bed.

The six WAVs in `promo-studio/public/projects/pancake-end-to-end/sfx/` are local copies of Remotion's documented CC0 sounds: [whoosh](https://www.remotion.dev/docs/sfx/whoosh), [whip](https://www.remotion.dev/docs/sfx/whip), [uiSwitch](https://www.remotion.dev/docs/sfx/ui-switch), [mouseClick](https://www.remotion.dev/docs/sfx/mouse-click), [shutterModern](https://www.remotion.dev/docs/sfx/shutter-modern), and [pageTurn](https://www.remotion.dev/docs/sfx/page-turn). Local copies avoid CDN requests during export. The `ding` effect is deliberately excluded because its [source has no explicit free license](https://www.remotion.dev/docs/sfx/ding). Listen to the final mux and check its true peak before delivery.

## Source assets and claims

The user's pasted brief and the supplied WebP module logos are preserved in `00_INBOX/pancake-end-to-end/`. The prepared marks in `public/projects/pancake-end-to-end/logos/` include existing Automatika/Pancake artwork from the earlier partner promo and the [official Botcake SVG](https://botcake.io/static/images/botcake-logo-2025.svg).

The `+30% Lift` ticker is explicitly an illustrative interface metric; no campaign result was supplied. The official-partner wording is supplied by the user and appears on [Automatika's site](https://www.automatika.ph/). Review quantified claims and courier coverage against approved sales material before publishing the paid ad.
