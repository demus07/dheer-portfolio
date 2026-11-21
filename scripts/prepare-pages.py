"""Pulls what each project page needs from Dheer's portfolio, in the order the portfolio tells it.

    pip install pymupdf pillow
    python scripts/prepare-pages.py

Run scripts/prepare-videos.py first: the Maatik loops' posters are read from public/work/maatik/.
Writes to public/work/ and src/content/pages.json, alongside what prepare-assets.py made.
Clips are in the portfolio's page units (each page is 4961 by 3508).
"""

import json
from pathlib import Path

import pymupdf
from PIL import Image, ImageChops

ROOT = Path(__file__).resolve().parent.parent
PORTFOLIO = ROOT / "context" / "Dheer_Portfolio.pdf"
PUBLIC = ROOT / "public"

doc = pymupdf.open(PORTFOLIO)
pages: dict[str, dict[str, dict]] = {}


def embedded(xref: int) -> Image.Image:
    pix = pymupdf.Pixmap(doc, xref)
    if pix.n - pix.alpha > 3:
        pix = pymupdf.Pixmap(pymupdf.csRGB, pix)
    if pix.alpha:
        pix = pymupdf.Pixmap(pix, 0)
    return Image.frombytes("RGB", (pix.width, pix.height), pix.samples)


def render(page: int, clip: tuple[int, int, int, int], width: int) -> Image.Image:
    p = doc[page - 1]
    rect = pymupdf.Rect(clip)
    zoom = width / rect.width
    pix = p.get_pixmap(matrix=pymupdf.Matrix(zoom, zoom), clip=rect, alpha=False)
    return trim(Image.frombytes("RGB", (pix.width, pix.height), pix.samples))


def trim(im: Image.Image, pad: int = 24) -> Image.Image:
    bg = Image.new(im.mode, im.size, (255, 255, 255))
    box = ImageChops.difference(im, bg).convert("L").point(lambda v: 255 if v > 18 else 0).getbbox()
    if not box:
        return im
    l, t, r, b = box
    return im.crop((max(0, l - pad), max(0, t - pad), min(im.width, r + pad), min(im.height, b + pad)))


def save(slug: str, name: str, im: Image.Image, alt: str, kind: str, max_w: int = 2400):
    out = PUBLIC / "work" / slug
    out.mkdir(parents=True, exist_ok=True)
    im = im.convert("RGB")
    if im.width > max_w:
        im = im.resize((max_w, round(im.height * max_w / im.width)), Image.LANCZOS)
    im.save(out / f"{name}.webp", quality=80, method=6)
    pages.setdefault(slug, {})[name] = {"src": f"/work/{slug}/{name}.webp", "width": im.width, "height": im.height, "alt": alt, "kind": kind}


def photo(slug: str, name: str, xref: int, alt: str, kind: str = "render"):
    save(slug, name, embedded(xref), alt, kind)


def drawing(slug: str, name: str, page: int, clip, alt: str, kind: str = "drawing", width: int = 2800):
    save(slug, name, render(page, clip, width), alt, kind)


def video(slug: str, name: str, alt: str):
    poster = Image.open(PUBLIC / "work" / slug / f"{name}.webp")
    pages.setdefault(slug, {})[name] = {
        "src": f"/work/{slug}/{name}.mp4",
        "poster": f"/work/{slug}/{name}.webp",
        "width": poster.width,
        "height": poster.height,
        "alt": alt,
        "kind": "video",
    }


def main():
    m = "maatik"
    photo(m, "site-hall", 12, "The IF BE warehouse as it stands", "photo")
    photo(m, "site-court", 13, "Under the old roof", "photo")
    photo(m, "site-stair", 14, "The stair beside the banyan", "photo")
    photo(m, "potters-kiln", 9, "Pots at a kiln in Kumbharwada", "photo")
    photo(m, "potters-shop", 11, "A potter's workshop in Dharavi", "photo")
    photo(m, "potters-wheel", 10, "A potter among his pots", "photo")
    drawing(m, "site-map", 4, (1440, 520, 2180, 1500), "IF BE in Ballard Estate", width=1400)
    video(m, "worktable", "The worktable, drawn from क")
    video(m, "meeting", "The meeting table under its lamps")
    # His plan and sections as laid out in the portfolio, without the drawing sheets' frames.
    drawing(m, "layout", 6, (230, 470, 3850, 2880), "Furniture layout", width=3400)
    photo(m, "concept-pottery", 20, "The potters' tables, for throwing, drying and curing")
    photo(m, "concept-cafe", 21, "The café, open to the workshop")
    drawing(m, "sketch-trusses", 5,(250, 2300, 1650, 3120), "Studies of the trusses", "sketch", 2000)
    drawing(m, "sketch-roof", 5, (2300, 2380, 4090, 3120), "The roof, in plan and in three dimensions", "sketch", 2000)
    photo(m, "view-bar", 44, "The café counter")
    photo(m, "view-lounge", 43, "Lounge below the stone wall")
    photo(m, "view-workshop", 47, "The potters' workshop")
    drawing(m, "section-aa", 7, (150, 2420, 4800, 3260), "Section A–A′, entrance to storage", width=3400)
    photo(m, "view-library", 63, "Reading room")
    photo(m, "view-hall", 64, "The workstations under the arches")
    photo(m, "view-shelves", 58, "Shelves beside the brick wall")
    drawing(m, "section-bb", 8, (120, 2400, 4800, 3260), "Section B–B′, conference room to office lobby", width=3400)
    photo(m, "view-reading", 73, "A long table between the shelves")
    photo(m, "view-arch", 70, "Through the arch")
    photo(m, "view-court", 69, "Lounge by the court")
    drawing(m, "section-cc", 9, (250, 2300, 4800, 3270), "Section C–C′, through the banyan court", width=3400)

    lob = "light-of-bharat"
    photo(lob, "signage", 192, "The signboard today", "photo")
    drawing(lob, "existing-plan", 11, (2780, 1480, 4500, 3120), "The existing floor plan", width=1800)
    drawing(lob, "sketch-concept", 12, (350, 750, 1650, 2450), "Concept sketches of the curved room", "sketch", 1600)
    drawing(lob, "sketch-space", 12, (1900, 780, 3050, 2500), "The old and the new, side by side", "sketch", 1600)
    drawing(lob, "sketch-direction", 12, (3200, 950, 4650, 2300), "Planning the room for thirty", "sketch", 1600)
    drawing(lob, "layout", 13, (450, 680, 2800, 2960), "Furniture layout", width=2600)
    drawing(lob, "section-aa", 14, (380, 2020, 3520, 3060), "Section A–A1", width=3000)
    drawing(lob, "section-bb", 15, (200, 1950, 3550, 3150), "Section B–B1", width=3000)

    s = "shararat"
    drawing(s, "levels", 17, (300, 250, 1900, 2800), "The four levels, ground floor to mezzanine", "sketch", 1600)
    drawing(s, "sketch-concept", 18, (380, 550, 1750, 2560), "Sketching the ground floor", "sketch", 1600)
    drawing(s, "sketch-space", 18, (1900, 550, 3200, 1800), "The existing structure, in three dimensions", "sketch", 1600)
    drawing(s, "sketch-direction", 18, (3200, 600, 4500, 2600), "The vaulted lounge, and its furniture", "sketch", 1600)
    drawing(s, "plans-ground", 19, (300, 650, 2950, 2780), "Ground floor and mezzanine plans", width=3000)
    photo(s, "view-jazz", 1819, "The lounge with the palm wallpaper")
    photo(s, "view-cowork", 1818, "The coworking bar")
    drawing(s, "plans-first", 20, (350, 420, 2950, 2650), "First floor plans", width=3000)
    photo(s, "view-open", 1823, "The open workspace on the first floor")
    photo(s, "view-intimate", 1822, "The long seat, for quieter work")
    drawing(s, "section-aa", 21, (380, 250, 2250, 1650), "Section A–A′", width=2600)
    drawing(s, "section-bb", 21, (380, 1750, 2250, 3200), "Section B–B′", width=2600)
    photo(s, "view-cigar", 1827, "The cigar bar")
    photo(s, "view-columns", 1826, "Between the columns")
    photo(s, "view-speakers", 1828, "The speaker wall")
    photo(s, "view-office", 1834, "The office lounge")
    photo(s, "view-pantry", 1835, "The pantry")
    drawing(s, "section-cc", 22, (330, 1800, 3400, 3200), "Section C–C′", width=3400)

    (ROOT / "src/content/pages.json").write_text(json.dumps(pages, indent=1, ensure_ascii=False))
    print({k: len(v) for k, v in pages.items()})


if __name__ == "__main__":
    main()
