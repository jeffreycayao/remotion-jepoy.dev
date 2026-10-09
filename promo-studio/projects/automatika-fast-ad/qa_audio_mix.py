"""Check the brief's frame-accurate VO + SFX mix without rendering video.

Decodes the unchanged source MP3 and each SFX via FFmpeg, places cues at the
brief's exact frames at 30 FPS, and measures additive sample peak / EBU R128
integrated loudness / true peak. Requires NumPy and FFmpeg on PATH.
"""

from __future__ import annotations

import math
import re
import subprocess
from pathlib import Path

import numpy as np


SAMPLE_RATE = 44_100
FPS = 30
DURATION_FRAMES = 1050
ASSETS = Path(__file__).resolve().parents[2] / "public" / "projects" / "automatika-fast-ad"

# Exact cue frame and Remotion volume values from the supplied FastAd brief.
CUES = (
    (0, "sub-drop", 0.70),
    (10, "record-stop", 0.55),
    (60, "alert-strobe", 0.45),
    (210, "whoosh-fast", 0.50),
    (270, "error-glitch", 0.40),
    (330, "error-glitch", 0.40),
    (390, "error-glitch", 0.40),
    (480, "heavy-whoosh", 0.60),
    (510, "anvil-impact", 0.65),
    (600, "power-lock", 0.55),
    (780, "riser", 0.60),
    (840, "mouse-click", 0.70),
)


def decode(path: Path) -> np.ndarray:
    result = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", str(path), "-ac", "1", "-ar", str(SAMPLE_RATE), "-f", "f32le", "pipe:1"],
        check=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    return np.frombuffer(result.stdout, dtype="<f4").astype(np.float64)


def dbfs(value: float) -> float:
    return 20 * math.log10(max(value, 1e-12))


def rms(signal: np.ndarray) -> float:
    return float(np.sqrt(np.mean(signal * signal)))


def main() -> None:
    count = round(DURATION_FRAMES / FPS * SAMPLE_RATE)
    voice = decode(ASSETS / "audio" / "voiceover.mp3")
    assert len(voice) <= count, "Voiceover exceeds 35-second composition"
    dialogue = np.zeros(count, dtype=np.float64)
    dialogue[: len(voice)] = voice
    effects = np.zeros(count, dtype=np.float64)
    cache: dict[str, np.ndarray] = {}

    print(f"Voice duration decoded: {len(voice) / SAMPLE_RATE:.3f}s")
    print(f"Voice sample peak: {dbfs(float(np.max(np.abs(voice)))):.2f} dBFS")
    for frame, name, volume in CUES:
        if name not in cache:
            cache[name] = decode(ASSETS / "sfx" / f"{name}.mp3")
        cue = cache[name]
        start = round(frame / FPS * SAMPLE_RATE)
        length = min(len(cue), count - start)
        effects[start : start + length] += cue[:length] * volume
        probe_length = min(length, round(0.5 * SAMPLE_RATE))
        v = rms(dialogue[start : start + probe_length])
        s = rms(cue[:probe_length] * volume)
        print(f"frame {frame:4d} {name:14s} volume={volume:.2f}, SFX/VO first 0.5s={dbfs(s / max(v, 1e-9)):+.1f} dB")

    mix = dialogue + effects
    print(f"Mixed sample peak: {dbfs(float(np.max(np.abs(mix)))):.2f} dBFS")
    print(f"Mixed sample RMS: {dbfs(rms(mix)):.2f} dBFS")
    result = subprocess.run(
        [
            "ffmpeg", "-hide_banner", "-loglevel", "info", "-f", "f32le", "-ar", str(SAMPLE_RATE),
            "-ac", "1", "-i", "pipe:0", "-af", "loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json",
            "-f", "null", "NUL",
        ],
        input=mix.astype("<f4").tobytes(),
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=True,
    )
    report = result.stderr.decode("utf-8", errors="replace")
    loudness = re.search(r'"input_i"\s*:\s*"([^\"]+)"', report)
    true_peak = re.search(r'"input_tp"\s*:\s*"([^\"]+)"', report)
    print(f"Mix EBU R128 integrated: {loudness.group(1) if loudness else 'unavailable'} LUFS")
    print(f"Mix true peak: {true_peak.group(1) if true_peak else 'unavailable'} dBTP")


if __name__ == "__main__":
    main()
