# Automatika Fast Ad

`FastAd-16x9`, `FastAd-9x16`, `FastAd-1x1`, and `FastAd-4x5` share a bespoke `FastAd` template. The project brief owns the text, logo paths, and frame boundaries. Each composition is 1050 frames at 30 FPS (35 seconds).

## Audio

The user-supplied ElevenLabs MP3 is copied unchanged to `00_INBOX/automatika-fast-ad/` and prepared at `promo-studio/public/projects/automatika-fast-ad/audio/voiceover.mp3`. The source is 34.880 seconds, mounted once at frame 0 at normal speed and full volume. It nearly fills the 35-second composition. Do not split, trim, or tempo-adjust it.

The brief's fixed scene ranges are `0–210`, `210–480`, `480–780`, and `780–1050`. Waveform-based pauses appear around 8.4, 15.3, and 26.4 seconds, so visual transitions accommodate small narration overlap while retaining those exact cuts.

The dedicated SFX layer uses 12 timed cues from 10 original assets. See `SFX-PROVENANCE.md` for their origin. Check the final encoded mix after rendering.

## Claims

`Waiting 2h`, `-24 items`, and `Zero Desync` are illustrative interface examples, not verified performance results. The visual mockups carry an illustrative label. Confirm any absolute claim and the booking destination against approved Automatika sales material before paid publication. The supplied brief's citation tags are placeholders; they do not substantiate claims. [Automatika's website](https://www.automatika.ph/) describes the partner relationship, product offering, and staff training.

## Preview and validation

From `promo-studio/`, run `npm run lint` and `npm run frames -- automatika-fast-ad 9x16 60,150,300`. The Studio composition IDs use the `FastAd` prefix. The project guide calls for `npm run render -- automatika-fast-ad` only when final output is requested.
