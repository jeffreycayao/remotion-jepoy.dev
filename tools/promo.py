"""Promo Studio helper CLI — asset prep before Remotion, delivery after.

    py tools/promo.py doctor
    py tools/promo.py prep-screens <slug> [--src DIR] [--apply]
    py tools/promo.py prep-logo    <slug> <file>      [--apply]
    py tools/promo.py prep-audio   <slug> <file>      [--apply]
    py tools/promo.py deliver      <slug> [--version v003]
    py tools/promo.py gif          <video> [--width 480 --fps 12]
    py tools/promo.py contact-sheet <video|folder-of-images>
    py tools/promo.py probe        <file>
    py tools/promo.py archive      <slug>

Uses tools/.venv automatically when launched via promo.bat / npm scripts.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import shutil
import subprocess
import sys
import tempfile
import zipfile
from datetime import datetime
from pathlib import Path

try:
    from PIL import Image, ImageOps
except ImportError:  # pragma: no cover
    sys.exit("Pillow missing. Run SETUP.bat (or: tools\\.venv\\Scripts\\pip install -r tools\\requirements.txt)")

ROOT = Path(__file__).resolve().parent.parent
STUDIO = ROOT / "promo-studio"
INBOX = STUDIO / "inbox"
RENDERS = STUDIO / "out" / "renders"
DELIVERY = STUDIO / "out" / "delivery"
ARCHIVE = STUDIO / "out" / "archive"

IMAGE_EXT = {".png", ".jpg", ".jpeg", ".webp", ".heic", ".bmp", ".tif", ".tiff"}
AUDIO_EXT = {".mp3", ".wav", ".m4a", ".aac", ".flac", ".ogg"}


# ── utils ────────────────────────────────────────────────────────────────
def log(msg: str) -> None:
    print(msg, flush=True)


def run(cmd: list[str]) -> str:
    res = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace")
    if res.returncode != 0:
        raise SystemExit(f"✗ Command failed: {' '.join(cmd[:4])}…\n{res.stderr[-2000:]}")
    return res.stdout


def ffmpeg(*args: str) -> None:
    run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", *args])


def probe(path: Path) -> dict:
    out = run(["ffprobe", "-v", "error", "-print_format", "json", "-show_format", "-show_streams", str(path)])
    return json.loads(out)


def has_audio(path: Path) -> bool:
    return any(s.get("codec_type") == "audio" for s in probe(path)["streams"])


def brief_path(slug: str) -> Path:
    p = STUDIO / "projects" / slug / "brief.json"
    if not p.exists():
        raise SystemExit(f"✗ No project '{slug}'. Create it with: npm run new -- {slug}")
    return p


def project_slug(value: str) -> str:
    if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", value):
        raise argparse.ArgumentTypeError("project slug must be kebab-case (letters, digits, hyphens)")
    return value


def render_version(value: str) -> str:
    if not re.fullmatch(r"v[0-9]{3}", value):
        raise argparse.ArgumentTypeError("render version must look like v001")
    return value


def update_brief(slug: str, fn) -> None:
    p = brief_path(slug)
    data = json.loads(p.read_text(encoding="utf-8"))
    fn(data["props"])
    p.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    log(f"  ✓ Updated projects/{slug}/brief.json")


def latest_version(slug: str) -> Path:
    base = RENDERS / slug
    versions = sorted(p for p in base.glob("v[0-9][0-9][0-9]") if p.is_dir()) if base.exists() else []
    if versions:
        return versions[-1]
    raise SystemExit(f"✗ No renders for '{slug}'. Run: npm run render -- {slug}")


def selected_version(slug: str, version: str | None) -> Path:
    if version is None:
        return latest_version(slug)
    candidate = RENDERS / slug / version
    if candidate.is_dir():
        return candidate
    raise SystemExit(f"✗ No render version '{version}' for '{slug}'.")


def reserve_delivery_dir(base: Path) -> Path:
    """Create a new output folder without reusing a previous delivery."""
    base.parent.mkdir(parents=True, exist_ok=True)
    for index in range(1000):
        candidate = base if index == 0 else base.with_name(f"{base.name}-{index + 1:02d}")
        try:
            candidate.mkdir()
            return candidate
        except FileExistsError:
            continue
    raise SystemExit(f"✗ Too many delivery folders for {base.name}.")


def sha1(path: Path) -> str:
    h = hashlib.sha1()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()[:12]


# ── commands ─────────────────────────────────────────────────────────────
def cmd_doctor(_: argparse.Namespace) -> None:
    checks = {
        "node": ["node", "-v"],
        "npm": ["npm.cmd" if sys.platform == "win32" else "npm", "-v"],
        "ffmpeg": ["ffmpeg", "-version"],
        "ffprobe": ["ffprobe", "-version"],
    }
    for name, cmd in checks.items():
        try:
            v = subprocess.run(cmd, capture_output=True, text=True).stdout.splitlines()[0]
            log(f"  ✓ {name:8} {v[:60]}")
        except Exception:
            log(f"  ✗ {name:8} not found on PATH")
    log(f"  ✓ python   {sys.version.split()[0]} ({sys.executable})")
    log(f"  {'✓' if (STUDIO / 'node_modules').exists() else '✗'} promo-studio/node_modules")
    for d in (INBOX, RENDERS, DELIVERY, ARCHIVE):
        log(f"  {'✓' if d.exists() else '✗'} {d.relative_to(STUDIO)}/")


def cmd_prep_screens(a: argparse.Namespace) -> None:
    """Normalize client screenshots → public/projects/<slug>/screens/screen-NN.png."""
    brief_path(a.slug)
    src = Path(a.src) if a.src else INBOX / a.slug
    files = sorted(p for p in src.rglob("*") if p.suffix.lower() in IMAGE_EXT and "logo" not in p.stem.lower())
    if not files:
        raise SystemExit(f"✗ No images found in {src}")
    dest = STUDIO / "public" / "projects" / a.slug / "screens"
    dest.mkdir(parents=True, exist_ok=True)

    # Load everything first: an unreadable file (e.g. HEIC without a decoder) is skipped, not fatal.
    images = []
    for f in files:
        try:
            images.append((f, ImageOps.exif_transpose(Image.open(f)).convert("RGB")))
        except Exception as err:  # noqa: BLE001 — any decode error means "skip this file"
            log(f"  ! Skipping {f.name}: can't read it ({type(err).__name__}). Convert it to PNG or JPG.")
    if not images:
        raise SystemExit(f"✗ None of the images in {src} could be read")

    # Remove the previous set so a smaller re-drop doesn't leave stale screen-NN files behind.
    for old in dest.glob("screen-*.png"):
        old.unlink()

    rel_paths = []
    for i, (f, img) in enumerate(images, 1):
        # Cap height at 2400px: crisp in a phone frame at 4K, light on render memory.
        if img.height > 2400:
            img = img.resize((round(img.width * 2400 / img.height), 2400), Image.LANCZOS)
        out = dest / f"screen-{i:02d}.png"
        img.save(out, optimize=True)
        rel = f"projects/{a.slug}/screens/{out.name}"
        rel_paths.append(rel)
        log(f"  ✓ {f.name} → {rel} ({img.width}×{img.height})")

    if a.apply:
        def apply(props):
            for feat, rel in zip(props["features"], rel_paths):
                feat["screenshot"] = rel
        update_brief(a.slug, apply)
    else:
        log("  ℹ Add --apply to assign these to features in order.")


def cmd_prep_logo(a: argparse.Namespace) -> None:
    brief_path(a.slug)
    src = Path(a.file)
    dest_dir = STUDIO / "public" / "projects" / a.slug
    dest_dir.mkdir(parents=True, exist_ok=True)
    if src.suffix.lower() == ".svg":
        out = dest_dir / "logo.svg"
        shutil.copy2(src, out)
    else:
        img = Image.open(src).convert("RGBA")
        bbox = img.getbbox()  # trim transparent padding so sizing is consistent
        if bbox:
            img = img.crop(bbox)
        img.thumbnail((1024, 1024), Image.LANCZOS)
        out = dest_dir / "logo.png"
        img.save(out, optimize=True)
    rel = f"projects/{a.slug}/{out.name}"
    log(f"  ✓ Logo → public/{rel}")
    if a.apply:
        update_brief(a.slug, lambda p: p.__setitem__("logo", rel))


def cmd_prep_audio(a: argparse.Namespace) -> None:
    """Loudness-normalize music bed to -16 LUFS (sits under VO / platform-safe)."""
    brief_path(a.slug)
    dest = STUDIO / "public" / "projects" / a.slug / "audio" / "music.m4a"
    dest.parent.mkdir(parents=True, exist_ok=True)
    ffmpeg("-i", a.file, "-vn", "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-c:a", "aac", "-b:a", "256k", str(dest))
    rel = f"projects/{a.slug}/audio/music.m4a"
    log(f"  ✓ Music → public/{rel} (normalized to -16 LUFS)")
    if a.apply:
        update_brief(a.slug, lambda p: p["audio"].__setitem__("music", rel))


def make_gif(video: Path, out: Path, width: int = 480, fps: int = 12) -> None:
    with tempfile.TemporaryDirectory() as tmp:
        palette = Path(tmp) / "palette.png"
        vf = f"fps={fps},scale={width}:-1:flags=lanczos"
        ffmpeg("-i", str(video), "-vf", f"{vf},palettegen=stats_mode=diff", str(palette))
        ffmpeg("-i", str(video), "-i", str(palette), "-lavfi", f"{vf}[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=5", str(out))


def make_contact_sheet(source: Path, out: Path, cols: int = 4, count: int = 12, tile_w: int = 480) -> None:
    with tempfile.TemporaryDirectory() as tmp:
        if source.is_dir():
            frames = sorted(p for p in source.iterdir() if p.suffix.lower() in IMAGE_EXT)
        else:
            dur = float(probe(source)["format"]["duration"])
            frames = []
            for i in range(count):
                t = dur * (i + 0.5) / count
                f = Path(tmp) / f"f{i:02d}.jpg"
                ffmpeg("-ss", f"{t:.2f}", "-i", str(source), "-frames:v", "1", "-q:v", "3", str(f))
                frames.append(f)
        if not frames:
            raise SystemExit("✗ No frames to tile.")
        imgs = [Image.open(f).convert("RGB") for f in frames]
        th = round(imgs[0].height * tile_w / imgs[0].width)
        rows = -(-len(imgs) // cols)
        pad = 8
        sheet = Image.new("RGB", (cols * (tile_w + pad) + pad, rows * (th + pad) + pad), (20, 20, 24))
        for i, im in enumerate(imgs):
            tile = ImageOps.contain(im, (tile_w, th), Image.LANCZOS)  # keep aspect, letterbox mixed sizes
            x = pad + (i % cols) * (tile_w + pad) + (tile_w - tile.width) // 2
            y = pad + (i // cols) * (th + pad) + (th - tile.height) // 2
            sheet.paste(tile, (x, y))
        sheet.save(out, quality=88)


def cmd_deliver(a: argparse.Namespace) -> None:
    """Platform-ready encodes + previews from a versioned render."""
    src = selected_version(a.slug, a.version)
    videos = sorted(src.glob("*.mp4"))
    if not videos:
        raise SystemExit(f"✗ No .mp4 files in {src}")
    dest = reserve_delivery_dir(DELIVERY / a.slug / f"{src.name}_{datetime.now():%Y-%m-%d}")
    (dest / "previews").mkdir()
    log(f"▸ Delivering {a.slug} {src.name} → {dest.relative_to(STUDIO)}")

    manifest = {"slug": a.slug, "version": src.name, "created": datetime.now().isoformat(timespec="seconds"), "files": []}
    for v in videos:
        out = dest / v.name.replace(f"_{src.name}", "")
        args = [
            "-i", str(v),
            "-c:v", "libx264", "-profile:v", "high", "-preset", "slow", "-crf", "19",
            "-pix_fmt", "yuv420p", "-movflags", "+faststart",
        ]
        if has_audio(v):
            # -14 LUFS integrated = loudness target used by YouTube/Instagram/TikTok/Spotify.
            args += ["-af", "loudnorm=I=-14:TP=-1:LRA=11", "-c:a", "aac", "-b:a", "192k", "-ar", "48000"]
        else:
            args += ["-an"]
        ffmpeg(*args, str(out))
        make_gif(out, dest / "previews" / f"{out.stem}.gif")
        info = probe(out)
        vs = next(s for s in info["streams"] if s["codec_type"] == "video")
        manifest["files"].append({
            "file": out.name,
            "resolution": f"{vs['width']}x{vs['height']}",
            "duration_s": round(float(info["format"]["duration"]), 2),
            "size_mb": round(out.stat().st_size / 1e6, 2),
            "sha1": sha1(out),
        })
        log(f"  ✓ {out.name}  {vs['width']}×{vs['height']}  {out.stat().st_size / 1e6:.1f} MB  (+ GIF)")

    if (src / "thumbs").exists():
        shutil.copytree(src / "thumbs", dest / "thumbnails", dirs_exist_ok=True)
    make_contact_sheet(videos[0], dest / "previews" / "contact-sheet.jpg")
    (dest / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    log(f"✓ Delivery ready: {dest}")


def cmd_gif(a: argparse.Namespace) -> None:
    v = Path(a.video)
    out = v.with_suffix(".gif")
    make_gif(v, out, a.width, a.fps)
    log(f"✓ {out}")


def cmd_contact_sheet(a: argparse.Namespace) -> None:
    s = Path(a.source)
    out = (s if s.is_dir() else s.parent) / f"{s.stem}_contact-sheet.jpg"
    make_contact_sheet(s, out, cols=a.cols)
    log(f"✓ {out}")


def cmd_palette(a: argparse.Namespace) -> None:
    """Dominant colors of an image (e.g. a logo) as a JSON list of hex strings, most common first."""
    if a.image.lower().endswith(".svg"):
        # Vector logo: the colors are written in the file — count each hex fill/stroke/stop color.
        import re
        from collections import Counter

        found = Counter(h.upper() for h in re.findall(r"#[0-9a-fA-F]{6}\b", Path(a.image).read_text(encoding="utf-8", errors="ignore")))
        print(json.dumps([h for h, _ in found.most_common(a.count)]))
        return
    img = Image.open(a.image).convert("RGBA")
    img.thumbnail((256, 256))
    data = img.get_flattened_data() if hasattr(img, "get_flattened_data") else img.getdata()
    # Ignore transparent pixels so a logo's empty background doesn't count as a brand color.
    pixels = [p[:3] for p in data if p[3] > 128]
    if not pixels:
        print("[]")
        return
    flat = Image.new("RGB", (len(pixels), 1))
    flat.putdata(pixels)
    # Octree keeps small saturated accents (a lime slash) apart from large neutrals; median-cut blends them.
    q = flat.quantize(colors=16, method=Image.Quantize.FASTOCTREE)
    pal = q.getpalette()
    buckets = [(n, tuple(pal[i * 3 : i * 3 + 3])) for n, i in sorted(q.getcolors() or [], reverse=True)]
    # Merge near-identical shades (anti-aliasing, compression) so small accent colors survive.
    merged: list[list] = []
    for n, rgb in buckets:
        for m in merged:
            if sum((x - y) ** 2 for x, y in zip(rgb, m[1])) ** 0.5 < 56:
                m[0] += n
                break
        else:
            merged.append([n, rgb])
    total = sum(m[0] for m in merged)
    # Drop specks under 1% (edge blends); keep order by coverage.
    keep = [m for m in sorted(merged, key=lambda m: -m[0]) if m[0] / total >= 0.01][: a.count]
    print(json.dumps([f"#{r:02X}{g:02X}{b:02X}" for _, (r, g, b) in keep]))


def cmd_probe(a: argparse.Namespace) -> None:
    info = probe(Path(a.file))
    fmt = info["format"]
    log(f"{Path(a.file).name}: {float(fmt.get('duration', 0)):.2f}s, {int(fmt.get('bit_rate', 0)) / 1e6:.2f} Mbps")
    for s in info["streams"]:
        if s["codec_type"] == "video":
            log(f"  video {s['codec_name']} {s['width']}×{s['height']} {s.get('r_frame_rate')} {s.get('pix_fmt')}")
        elif s["codec_type"] == "audio":
            log(f"  audio {s['codec_name']} {s.get('sample_rate')}Hz {s.get('channels')}ch")


def cmd_archive(a: argparse.Namespace) -> None:
    """Zip an in-app project's raw material, brief, assets and outputs."""
    brief_path(a.slug)
    ARCHIVE.mkdir(parents=True, exist_ok=True)
    base = ARCHIVE / f"{a.slug}_{datetime.now():%Y-%m-%d_%H%M%S}.zip"
    sources = [
        INBOX / a.slug,
        STUDIO / "projects" / a.slug,
        STUDIO / "public" / "projects" / a.slug,
        RENDERS / a.slug,
        DELIVERY / a.slug,
    ]
    for index in range(1000):
        out = base if index == 0 else base.with_name(f"{base.stem}-{index + 1:02d}{base.suffix}")
        try:
            with zipfile.ZipFile(out, "x", zipfile.ZIP_DEFLATED) as z:
                for source in sources:
                    if source.exists():
                        for f in source.rglob("*"):
                            if f.is_file():
                                z.write(f, f.relative_to(STUDIO))
            break
        except FileExistsError:
            continue
    else:
        raise SystemExit(f"✗ Too many archives for {a.slug}.")
    log(f"✓ Archived → {out.relative_to(STUDIO)} ({out.stat().st_size / 1e6:.1f} MB). Originals left in place.")


def main() -> None:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    p = argparse.ArgumentParser(description="Promo Studio helper CLI")
    sub = p.add_subparsers(dest="cmd", required=True)

    sub.add_parser("doctor", help="check toolchain").set_defaults(fn=cmd_doctor)

    s = sub.add_parser("prep-screens", help="normalize screenshots from inbox/<slug>")
    s.add_argument("slug", type=project_slug); s.add_argument("--src"); s.add_argument("--apply", action="store_true")
    s.set_defaults(fn=cmd_prep_screens)

    s = sub.add_parser("prep-logo", help="trim + import a logo")
    s.add_argument("slug", type=project_slug); s.add_argument("file"); s.add_argument("--apply", action="store_true")
    s.set_defaults(fn=cmd_prep_logo)

    s = sub.add_parser("prep-audio", help="loudness-normalize a music bed")
    s.add_argument("slug", type=project_slug); s.add_argument("file"); s.add_argument("--apply", action="store_true")
    s.set_defaults(fn=cmd_prep_audio)

    s = sub.add_parser("deliver", help="platform-ready encodes → out/delivery")
    s.add_argument("slug", type=project_slug); s.add_argument("--version", type=render_version)
    s.set_defaults(fn=cmd_deliver)

    s = sub.add_parser("gif", help="high-quality GIF from a video")
    s.add_argument("video"); s.add_argument("--width", type=int, default=480); s.add_argument("--fps", type=int, default=12)
    s.set_defaults(fn=cmd_gif)

    s = sub.add_parser("contact-sheet", help="grid of frames from a video or image folder")
    s.add_argument("source"); s.add_argument("--cols", type=int, default=4)
    s.set_defaults(fn=cmd_contact_sheet)

    s = sub.add_parser("palette", help="dominant colors of an image as JSON hex list")
    s.add_argument("image"); s.add_argument("--count", type=int, default=5)
    s.set_defaults(fn=cmd_palette)

    s = sub.add_parser("probe", help="show media info")
    s.add_argument("file"); s.set_defaults(fn=cmd_probe)

    s = sub.add_parser("archive", help="zip a project into out/archive")
    s.add_argument("slug", type=project_slug); s.set_defaults(fn=cmd_archive)

    a = p.parse_args()
    a.fn(a)


if __name__ == "__main__":
    main()
