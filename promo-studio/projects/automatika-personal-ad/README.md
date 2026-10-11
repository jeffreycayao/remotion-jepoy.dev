# Automatika Personal Ad

`PersonalAd-16x9`, `PersonalAd-9x16`, `PersonalAd-1x1`, and `PersonalAd-4x5` share a bespoke `PersonalAd` template. The brief owns the copy and scene boundaries. All compositions are 1350 frames at 30 FPS (45 seconds).

## Audio

The user-supplied ElevenLabs MP3 is preserved unchanged in `promo-studio/inbox/automatika-personal-ad/`. Its prepared copy is `promo-studio/public/projects/automatika-personal-ad/audio/voiceover.mp3`. It is a single 40.320-second master, mounted once at frame 0 at normal speed and full volume. Speech starts near frame 0 and finishes at about 40.14 seconds; the visual end card holds to 45 seconds. Do not split, trim, or tempo-adjust the master.

The supplied fixed scene ranges are `0–240`, `240–540`, `540–870`, `870–1140`, and `1140–1350`. The recording's likely paragraph pauses are around 9.0, 18.0, 27.3, and 34.5 seconds. Visual actions overlap the fixed cuts where useful so the shorter recording still makes narrative sense. The pause estimates are waveform-based and are not word-level transcription.

`SoundFX.tsx` mounts 15 independently timed cues using the 13 original synthesized MP3s in `public/projects/automatika-personal-ad/sfx/`. [SFX-PROVENANCE.md](./SFX-PROVENANCE.md) records their origin; `generate_sfx.py` is the reproducible generator. The mouse click uses the brief's cue-specific `0.70` gain; other cues follow the mapped volumes. Check the final mixed true peak after rendering.

## Claims and source material

The supplied brief and copied source marks are in `promo-studio/inbox/automatika-personal-ad/`. The brief's `Stock Mismatch: -14`, `Lost Time: 4.5 hrs/day`, `100% Team Onboarded`, `Zero Maintenance`, and `Zero Tech Debt` have no supplied performance evidence. The numeric values and status cards are marked as illustrative UI in the video. Confirm the absolute claims and final booking destination against approved Automatika sales material before publishing. The partner and product-stack wording also appears on [Automatika's website](https://www.automatika.ph/).

## Preview and validation

From `promo-studio/`, run `npm run lint` and `npm run frames -- automatika-personal-ad 9x16 60,150,300`. The Studio composition IDs use the `PersonalAd` prefix. The project guide requires `npm run render -- automatika-personal-ad` only after the user requests final output.
