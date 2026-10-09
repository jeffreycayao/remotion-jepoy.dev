"""Synthesize the original sound cues for Automatika FastAd.

Run with ``python generate_sfx.py`` from any directory. Requires NumPy and
FFmpeg on PATH. No samples or third-party audio are used. Existing assets are
never overwritten.
"""

from __future__ import annotations

import math
import subprocess
import tempfile
import wave
from pathlib import Path

import numpy as np


SAMPLE_RATE = 44_100
TARGET_PEAK = 0.46  # About -6.7 dBFS before each cue's Remotion volume.
OUT_DIR = Path(__file__).resolve().parents[2] / "public" / "projects" / "automatika-fast-ad" / "sfx"


def axis(duration: float) -> np.ndarray:
    return np.arange(round(duration * SAMPLE_RATE), dtype=np.float64) / SAMPLE_RATE


def oscillator(duration: float, start_hz: float, end_hz: float | None = None, curve: float = 1) -> np.ndarray:
    t = axis(duration)
    end_hz = start_hz if end_hz is None else end_hz
    progress = np.power(t / duration, curve)
    frequency = start_hz * np.power(end_hz / start_hz, progress)
    return np.sin(2 * math.pi * np.cumsum(frequency) / SAMPLE_RATE)


def noise(duration: float, center_hz: float, width: float, rng: np.random.Generator) -> np.ndarray:
    count = round(duration * SAMPLE_RATE)
    spectrum = np.fft.rfft(rng.standard_normal(count))
    frequencies = np.fft.rfftfreq(count, 1 / SAMPLE_RATE)
    distance = np.log2(np.maximum(frequencies, 1) / center_hz)
    spectrum *= np.exp(-0.5 * np.square(distance / width))
    signal = np.fft.irfft(spectrum, count)
    return signal / max(float(np.sqrt(np.mean(signal * signal))), 1e-9)


def pulse(duration: float, at: float, spread: float) -> np.ndarray:
    return np.exp(-0.5 * np.square((axis(duration) - at) / spread))


def soften_edges(signal: np.ndarray, attack_ms: float = 2, release_ms: float = 45) -> np.ndarray:
    signal = signal.copy()
    attack = max(1, min(len(signal), round(attack_ms * SAMPLE_RATE / 1000)))
    release = max(1, min(len(signal), round(release_ms * SAMPLE_RATE / 1000)))
    signal[:attack] *= np.linspace(0, 1, attack, endpoint=False)
    signal[-release:] *= np.linspace(1, 0, release)
    return signal


def sub_drop(rng: np.random.Generator) -> np.ndarray:
    d = 0.94
    t = axis(d)
    kick = oscillator(d, 132, 43, 0.70) * np.exp(-4.5 * t)
    sub = oscillator(d, 67, 34, 1.25) * np.exp(-2.75 * t)
    snap = noise(d, 1550, 1.05, rng) * pulse(d, 0.020, 0.012)
    return 0.77 * kick + 0.49 * sub + 0.22 * snap


def record_stop(rng: np.random.Generator) -> np.ndarray:
    d = 0.66
    t = axis(d)
    braking = oscillator(d, 850, 77, 1.65) * np.exp(-3.9 * t)
    scrape = noise(d, 2300, 1.15, rng) * (pulse(d, 0.12, 0.065) + 0.66 * pulse(d, 0.32, 0.092))
    motor = oscillator(d, 160, 36, 1.35) * np.exp(-5.5 * t)
    return 0.42 * braking + 0.31 * scrape + 0.27 * motor


def alert_strobe(rng: np.random.Generator) -> np.ndarray:
    d = 0.62
    t = axis(d)
    on_off = pulse(d, 0.058, 0.041) + 0.8 * pulse(d, 0.255, 0.041) + 0.65 * pulse(d, 0.46, 0.044)
    siren = oscillator(d, 1120, 920) + 0.31 * oscillator(d, 1680, 1390)
    tick = noise(d, 3900, 0.85, rng) * (pulse(d, 0.037, 0.007) + pulse(d, 0.242, 0.007))
    return 0.52 * siren * on_off + 0.09 * tick * np.exp(-0.35 * t)


def whoosh_fast(rng: np.random.Generator) -> np.ndarray:
    d = 0.53
    t = axis(d)
    envelope = np.power(np.sin(np.pi * t / d), 1.6)
    air = noise(d, 1950, 1.45, rng) * envelope
    glide = oscillator(d, 1230, 260) * envelope
    return 0.64 * air + 0.19 * glide


def error_glitch(rng: np.random.Generator) -> np.ndarray:
    d = 0.39
    t = axis(d)
    gates = pulse(d, 0.047, 0.028) + pulse(d, 0.133, 0.017) + 0.9 * pulse(d, 0.245, 0.038)
    discord = oscillator(d, 347) + 0.57 * oscillator(d, 462) + 0.24 * oscillator(d, 925)
    static = noise(d, 3000, 1.55, rng) * (pulse(d, 0.12, 0.016) + pulse(d, 0.274, 0.016))
    return 0.40 * discord * gates + 0.17 * static * np.exp(-1.2 * t)


def heavy_whoosh(rng: np.random.Generator) -> np.ndarray:
    d = 0.94
    t = axis(d)
    envelope = np.power(np.sin(np.pi * t / d), 1.25)
    low = oscillator(d, 220, 51, 0.9) * envelope
    air = noise(d, 1100, 1.8, rng) * envelope
    trail = noise(d, 2800, 0.9, rng) * pulse(d, 0.72, 0.12)
    return 0.50 * air + 0.49 * low + 0.09 * trail


def anvil_impact(rng: np.random.Generator) -> np.ndarray:
    d = 1.02
    t = axis(d)
    bass = oscillator(d, 180, 40, 0.55) * np.exp(-4.35 * t)
    clang = (oscillator(d, 523) + 0.62 * oscillator(d, 831) + 0.27 * oscillator(d, 1317)) * np.exp(-7.4 * t)
    hit = noise(d, 2400, 1.6, rng) * pulse(d, 0.024, 0.019)
    return 0.69 * bass + 0.24 * clang + 0.32 * hit


def power_lock(rng: np.random.Generator) -> np.ndarray:
    d = 0.54
    t = axis(d)
    latch = noise(d, 4200, 1.0, rng) * pulse(d, 0.041, 0.009)
    bolt = noise(d, 970, 0.75, rng) * pulse(d, 0.138, 0.029)
    powered = oscillator(d, 410, 870) * np.exp(-11 * np.maximum(t - 0.138, 0)) * (t >= 0.138)
    return 0.24 * latch + 0.44 * bolt + 0.29 * powered


def riser(rng: np.random.Generator) -> np.ndarray:
    d = 1.28
    t = axis(d)
    envelope = np.power(np.minimum(t / 1.04, 1), 1.7) * np.exp(-14 * np.maximum(t - 1.05, 0))
    air = noise(d, 1800, 1.75, rng)
    whistle = oscillator(d, 275, 1750, 1.5)
    burst = noise(d, 4500, 1.0, rng) * pulse(d, 1.06, 0.045)
    return 0.55 * air * envelope + 0.22 * whistle * envelope + 0.10 * burst


def mouse_click(rng: np.random.Generator) -> np.ndarray:
    d = 0.22
    attack = noise(d, 3900, 1.28, rng) * pulse(d, 0.022, 0.0045)
    release = noise(d, 3300, 1.1, rng) * pulse(d, 0.102, 0.006)
    plastic = oscillator(d, 1030) * pulse(d, 0.044, 0.019)
    return 0.60 * attack + 0.31 * release + 0.22 * plastic


SOUNDS = {
    "sub-drop": sub_drop,
    "record-stop": record_stop,
    "alert-strobe": alert_strobe,
    "whoosh-fast": whoosh_fast,
    "error-glitch": error_glitch,
    "heavy-whoosh": heavy_whoosh,
    "anvil-impact": anvil_impact,
    "power-lock": power_lock,
    "riser": riser,
    "mouse-click": mouse_click,
}


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    existing = [OUT_DIR / f"{name}.mp3" for name in SOUNDS if (OUT_DIR / f"{name}.mp3").exists()]
    if existing:
        raise FileExistsError(f"Refusing to overwrite existing SFX: {existing}")

    with tempfile.TemporaryDirectory(prefix="automatika-fast-sfx-") as temp:
        for index, (name, synth) in enumerate(SOUNDS.items()):
            signal = soften_edges(synth(np.random.default_rng(64_008 + index)))
            peak = float(np.max(np.abs(signal)))
            if peak < 1e-5:
                raise ValueError(f"Synthesized {name} is silent")
            pcm = np.round(signal * (TARGET_PEAK / peak) * 32767).astype("<i2")
            wav_path = Path(temp) / f"{name}.wav"
            with wave.open(str(wav_path), "wb") as wav:
                wav.setnchannels(1)
                wav.setsampwidth(2)
                wav.setframerate(SAMPLE_RATE)
                wav.writeframes(pcm.tobytes())

            output = OUT_DIR / f"{name}.mp3"
            subprocess.run(
                ["ffmpeg", "-hide_banner", "-loglevel", "error", "-n", "-i", str(wav_path), "-c:a", "libmp3lame", "-b:a", "192k", str(output)],
                check=True,
            )
            print(f"{name}.mp3: {len(signal) / SAMPLE_RATE:.3f}s")


if __name__ == "__main__":
    main()
