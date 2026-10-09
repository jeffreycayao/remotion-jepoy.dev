"""Create the Automatika Personal Ad's original, deterministic sound effects.

Run from any directory: python generate_sfx.py
Requires NumPy and FFmpeg. The script refuses to overwrite existing assets.
All sounds are synthesized from oscillators and seeded noise; no samples are used.
"""

from __future__ import annotations

import math
import subprocess
import tempfile
import wave
from pathlib import Path

import numpy as np


SAMPLE_RATE = 44_100
OUT_DIR = Path(__file__).resolve().parents[2] / "public" / "projects" / "automatika-personal-ad" / "sfx"
TARGET_PEAK = 0.58  # -4.73 dBFS before the Remotion per-cue mix volume.


def time_axis(duration: float) -> np.ndarray:
    return np.arange(round(duration * SAMPLE_RATE), dtype=np.float64) / SAMPLE_RATE


def sweep(duration: float, start_hz: float, end_hz: float, *, curve: float = 1.0) -> np.ndarray:
    t = time_axis(duration)
    progress = np.power(t / max(duration, 1 / SAMPLE_RATE), curve)
    frequencies = start_hz * np.power(end_hz / start_hz, progress)
    return np.sin(2 * math.pi * np.cumsum(frequencies) / SAMPLE_RATE)


def tone(duration: float, frequency: float) -> np.ndarray:
    t = time_axis(duration)
    return np.sin(2 * math.pi * frequency * t)


def band_noise(duration: float, center_hz: float, width_octaves: float, rng: np.random.Generator) -> np.ndarray:
    count = round(duration * SAMPLE_RATE)
    white = rng.standard_normal(count)
    spectrum = np.fft.rfft(white)
    frequencies = np.fft.rfftfreq(count, d=1 / SAMPLE_RATE)
    distance = np.log2(np.maximum(frequencies, 1) / center_hz)
    spectrum *= np.exp(-0.5 * np.square(distance / width_octaves))
    filtered = np.fft.irfft(spectrum, n=count)
    rms = float(np.sqrt(np.mean(np.square(filtered))))
    return filtered / max(rms, 1e-8)


def bump(duration: float, position: float, width: float) -> np.ndarray:
    t = time_axis(duration)
    return np.exp(-0.5 * np.square((t - position) / width))


def edge_fade(audio: np.ndarray, attack_ms: float = 2, release_ms: float = 55) -> np.ndarray:
    result = audio.copy()
    attack = min(len(result), max(1, round(attack_ms * SAMPLE_RATE / 1000)))
    release = min(len(result), max(1, round(release_ms * SAMPLE_RATE / 1000)))
    result[:attack] *= np.linspace(0, 1, attack, endpoint=False)
    result[-release:] *= np.linspace(1, 0, release)
    return result


def bass_drop(rng: np.random.Generator) -> np.ndarray:
    d = 0.95
    t = time_axis(d)
    low = sweep(d, 145, 43) * np.exp(-3.1 * t)
    sub = sweep(d, 68, 37) * np.exp(-2.4 * t)
    attack = band_noise(d, 1550, 1.1, rng) * bump(d, 0.034, 0.025)
    return 0.72 * low + 0.45 * sub + 0.18 * attack


def record_scratch(rng: np.random.Generator) -> np.ndarray:
    d = 0.62
    t = time_axis(d)
    grain = band_noise(d, 2350, 1.15, rng)
    gestures = bump(d, 0.10, 0.045) + 0.95 * bump(d, 0.28, 0.060) + 0.82 * bump(d, 0.47, 0.065)
    vinyl = sweep(d, 520, 1670, curve=0.62) * gestures
    return 0.55 * grain * gestures + 0.23 * vinyl + 0.06 * np.sin(2 * math.pi * 55 * t)


def alert_ping(rng: np.random.Generator) -> np.ndarray:
    d = 0.42
    t = time_axis(d)
    bright = sweep(d, 1040, 820) * np.exp(-8.7 * t)
    shimmer = tone(d, 1568) * np.exp(-13 * t)
    tap = band_noise(d, 3400, 0.9, rng) * bump(d, 0.012, 0.008)
    return 0.8 * bright + 0.29 * shimmer + 0.10 * tap


def whoosh_fast(rng: np.random.Generator) -> np.ndarray:
    d = 0.52
    t = time_axis(d)
    airflow = band_noise(d, 2200, 1.55, rng)
    shape = np.power(np.sin(np.pi * np.minimum(t / d, 1)), 1.25)
    accent = sweep(d, 1150, 310) * shape
    return 0.66 * airflow * shape + 0.20 * accent


def error_beep(rng: np.random.Generator) -> np.ndarray:
    d = 0.30
    t = time_axis(d)
    two_pulses = bump(d, 0.055, 0.038) + bump(d, 0.19, 0.045)
    dissonance = tone(d, 392) + 0.57 * tone(d, 466.16)
    click = band_noise(d, 2900, 1.0, rng) * bump(d, 0.16, 0.010)
    return 0.60 * dissonance * two_pulses + 0.07 * click


def heavy_whoosh(rng: np.random.Generator) -> np.ndarray:
    d = 0.92
    t = time_axis(d)
    air = band_noise(d, 960, 1.8, rng)
    swell = np.power(np.sin(np.pi * np.minimum(t / d, 1)), 1.45)
    bass = sweep(d, 160, 59) * swell
    grit = band_noise(d, 2600, 1.0, rng) * bump(d, 0.67, 0.13)
    return 0.53 * air * swell + 0.43 * bass + 0.13 * grit


def impact_hit(rng: np.random.Generator) -> np.ndarray:
    d = 0.77
    t = time_axis(d)
    body = sweep(d, 195, 48) * np.exp(-4.7 * t)
    click = band_noise(d, 3200, 1.5, rng) * bump(d, 0.028, 0.018)
    metal = tone(d, 680) * np.exp(-10.5 * t)
    return 0.69 * body + 0.25 * click + 0.18 * metal


def lock_snap(rng: np.random.Generator) -> np.ndarray:
    d = 0.43
    t = time_axis(d)
    tick = band_noise(d, 4000, 1.35, rng) * bump(d, 0.038, 0.012)
    latch = band_noise(d, 1150, 0.9, rng) * bump(d, 0.13, 0.029)
    ring = tone(d, 760) * np.exp(-13 * np.maximum(t - 0.13, 0)) * (t >= 0.13)
    return 0.31 * tick + 0.41 * latch + 0.26 * ring


def smooth_slide(rng: np.random.Generator) -> np.ndarray:
    d = 0.70
    t = time_axis(d)
    soft_air = band_noise(d, 1120, 1.35, rng)
    ease = np.square(np.sin(np.pi * np.minimum(t / d, 1)))
    gliss = sweep(d, 640, 235) * ease
    return 0.49 * soft_air * ease + 0.17 * gliss


def tech_chime(rng: np.random.Generator) -> np.ndarray:
    d = 0.88
    t = time_axis(d)
    first = (tone(d, 659.25) + 0.28 * tone(d, 1318.5)) * np.exp(-7.5 * t)
    delay = 0.105
    shifted_t = np.maximum(t - delay, 0)
    second = (tone(d, 783.99) + 0.21 * tone(d, 1567.98)) * np.exp(-6.7 * shifted_t) * (t >= delay)
    sparkle = band_noise(d, 5500, 0.75, rng) * bump(d, 0.11, 0.012)
    return 0.40 * first + 0.34 * second + 0.05 * sparkle


def success_ding(rng: np.random.Generator) -> np.ndarray:
    d = 1.03
    t = time_axis(d)
    notes = np.zeros_like(t)
    for at, pitch, level in ((0.0, 587.33, 0.55), (0.12, 739.99, 0.42), (0.24, 880.0, 0.55)):
        local = np.maximum(t - at, 0)
        notes += level * (np.sin(2 * math.pi * pitch * local) + 0.18 * np.sin(2 * math.pi * pitch * 2 * local)) * np.exp(-5.5 * local) * (t >= at)
    shine = band_noise(d, 5600, 0.8, rng) * bump(d, 0.24, 0.014)
    return notes + 0.04 * shine


def whoosh_riser(rng: np.random.Generator) -> np.ndarray:
    d = 1.15
    t = time_axis(d)
    ramp = np.power(np.minimum(t / 0.95, 1), 1.6) * np.exp(-19 * np.maximum(t - 0.96, 0))
    air = band_noise(d, 2150, 1.8, rng)
    whistle = sweep(d, 290, 1980, curve=1.4)
    tip = band_noise(d, 5200, 1.2, rng) * bump(d, 0.95, 0.06)
    return 0.55 * air * ramp + 0.26 * whistle * ramp + 0.13 * tip


def mouse_click(rng: np.random.Generator) -> np.ndarray:
    d = 0.21
    t = time_axis(d)
    attack = band_noise(d, 3800, 1.45, rng) * bump(d, 0.025, 0.0045)
    release = band_noise(d, 3200, 1.35, rng) * bump(d, 0.095, 0.0055)
    plastic = tone(d, 980) * bump(d, 0.041, 0.019)
    return 0.55 * attack + 0.30 * release + 0.20 * plastic


SOUNDS = {
    "bass-drop": bass_drop,
    "record-scratch": record_scratch,
    "alert-ping": alert_ping,
    "whoosh-fast": whoosh_fast,
    "error-beep": error_beep,
    "heavy-whoosh": heavy_whoosh,
    "impact-hit": impact_hit,
    "lock-snap": lock_snap,
    "smooth-slide": smooth_slide,
    "tech-chime": tech_chime,
    "success-ding": success_ding,
    "whoosh-riser": whoosh_riser,
    "mouse-click": mouse_click,
}


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    existing = [str(OUT_DIR / f"{name}.mp3") for name in SOUNDS if (OUT_DIR / f"{name}.mp3").exists()]
    if existing:
        raise FileExistsError("Refusing to replace existing SFX: " + ", ".join(existing))

    with tempfile.TemporaryDirectory(prefix="automatika-sfx-") as temp:
        for index, (name, synth) in enumerate(SOUNDS.items()):
            audio = edge_fade(synth(np.random.default_rng(42_008 + index)))
            peak = float(np.max(np.abs(audio)))
            if peak < 1e-5:
                raise ValueError(f"{name} was silent")
            audio = audio * (TARGET_PEAK / peak)
            pcm = np.round(audio * 32767).astype("<i2")
            wav_path = Path(temp) / f"{name}.wav"
            with wave.open(str(wav_path), "wb") as wav:
                wav.setnchannels(1)
                wav.setsampwidth(2)
                wav.setframerate(SAMPLE_RATE)
                wav.writeframes(pcm.tobytes())

            target = OUT_DIR / f"{name}.mp3"
            subprocess.run(
                ["ffmpeg", "-hide_banner", "-loglevel", "error", "-n", "-i", str(wav_path), "-c:a", "libmp3lame", "-b:a", "192k", str(target)],
                check=True,
            )
            print(f"{name}.mp3: {len(audio) / SAMPLE_RATE:.3f}s")


if __name__ == "__main__":
    main()
