# Sound effects provenance

The 13 MP3 cues in `public/projects/automatika-personal-ad/sfx/` were created for this ad with `generate_sfx.py`. The script combines oscillators, filtered seeded noise, and short amplitude envelopes; it does not sample or transform recordings from third parties. Each cue is normalized to a peak below −4 dBFS before Remotion's per-cue volume setting. The script refuses to overwrite an existing cue.

Run `python promo-studio/projects/automatika-personal-ad/generate_sfx.py` from the workspace root to reproduce the set in a clean checkout with NumPy and FFmpeg installed.
