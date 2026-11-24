"""Turns Dheer's Maatik screen recordings in context/videos/ into what the site plays.

    pip install av pillow
    python scripts/prepare-videos.py

Each recording draws one piece of Maatik from a line to a finished render. The roof becomes the
frames the process section scrubs; the worktable and the meeting table become short loops for the
Maatik page. The flashes between his takes (black, magenta, a green ground) are cut out.
"""

import shutil
from pathlib import Path

import av
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "context" / "videos"
PUBLIC = ROOT / "public"


def frames(name: str, keep: list[tuple[float, float]]):
    """Yields the kept stretches of a recording as pictures, with their time. The screen
    recordings have a black hairline down each side, so a few pixels come off every edge."""
    container = av.open(str(SRC / name))
    for frame in container.decode(video=0):
        t = float(frame.time)
        if any(a <= t <= b for a, b in keep):
            im = frame.to_image()
            yield t, im.crop((4, 4, im.width - 4, im.height - 4))


def scrub(name: str, keep: list[tuple[float, float]], out: Path, count: int, width: int = 1024):
    """Samples the kept stretches evenly into `count` stills for the page to scrub."""
    total = sum(b - a for a, b in keep)
    step = total / (count - 1)
    shutil.rmtree(out, ignore_errors=True)
    out.mkdir(parents=True)
    n, elapsed, last_t = 0, 0.0, None
    for t, im in frames(name, keep):
        if last_t is not None and t - last_t < 0.2:
            elapsed += t - last_t
        last_t = t
        if n < count and elapsed >= n * step - 1e-3:
            im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
            im.save(out / f"frame-{n:03d}.avif", quality=58)
            n += 1
    while n < count:
        shutil.copy(out / f"frame-{n - 1:03d}.avif", out / f"frame-{n:03d}.avif")
        n += 1
    print(name, "->", out.relative_to(ROOT), count, "frames")


def loop(name: str, keep: list[tuple[float, float]], out: Path, speed: float, hold: float = 1.6, width: int = 1080, flip: bool = False):
    """A muted loop at `speed` times, ending on the finished render for a moment. `flip` turns a
    recording made upside down the right way up."""
    out.parent.mkdir(parents=True, exist_ok=True)
    container = av.open(str(out), "w", options={"movflags": "+faststart"})
    stream = None
    every, i, last = speed, 0.0, None
    for _, im in frames(name, keep):
        i += 1
        if i < every:
            continue
        i -= every
        im = im.resize((width, round(im.height * width / im.width / 2) * 2), Image.LANCZOS)
        if flip:
            im = im.rotate(180)
        if stream is None:
            stream = container.add_stream("libx264", rate=30)
            stream.width, stream.height = im.size
            stream.pix_fmt = "yuv420p"
            stream.options = {"crf": "27", "preset": "slow", "profile:v": "high"}
        for packet in stream.encode(av.VideoFrame.from_image(im)):
            container.mux(packet)
        last = im
    for _ in range(round(hold * 30)):
        for packet in stream.encode(av.VideoFrame.from_image(last)):
            container.mux(packet)
    for packet in stream.encode():
        container.mux(packet)
    container.close()
    last.save(out.with_suffix(".webp"), quality=80, method=6)
    print(name, "->", out.relative_to(ROOT), f"{out.stat().st_size / 1e6:.1f} MB")


def main():
    # The roof over the potters' workshop: one truss in line, repeated, framed, set on the ground.
    scrub("maatik-roof.mp4", [(1.4, 23.95), (24.1, 37.3), (47.1, 57.0)], PUBLIC / "process" / "maatik-roof", 181)
    # The worktable, drawn from क, the first letter of kumbhar.
    loop("maatik-worktable.mp4", [(1.4, 18.2), (20.7, 26.05)], PUBLIC / "work" / "maatik" / "worktable.mp4", speed=1.5)
    # The management's meeting table, under its lamps. He drew it upside down.
    loop("maatik-meeting.mp4", [(1.4, 97.9), (99.95, 106.6)], PUBLIC / "work" / "maatik" / "meeting.mp4", speed=4, flip=True)


if __name__ == "__main__":
    main()
