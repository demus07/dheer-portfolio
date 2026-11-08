"""Turns Dheer's source files in context/ into the images, film frames and sketches the site uses.

    pip install pymupdf pillow av
    python scripts/prepare-assets.py

Writes to public/ and src/content/media.json. context/ is not in the repo.
"""

import json
import shutil
from pathlib import Path

import av
import pymupdf
from PIL import Image, ImageChops, ImageOps, ImageStat

ROOT = Path(__file__).resolve().parent.parent
CTX = ROOT / "context"
PROJ = CTX / "dheer_projects"
SHARARAT = PROJ / "studio submition Shararat"
PORTFOLIO = CTX / "Dheer_Portfolio.pdf"
SUBMISSION = SHARARAT / "EA3_dheer chheda_design studio6.pdf"
PUBLIC = ROOT / "public"
LAVA = "#F56E0F"

media = {"work": {}, "ring": {}, "sketches": {}, "film": {}}


def embedded(pdf: Path, page: int, xref: int) -> Image.Image:
    doc = pymupdf.open(pdf)
    pix = pymupdf.Pixmap(doc, xref)
    if pix.n - pix.alpha > 3:
        pix = pymupdf.Pixmap(pymupdf.csRGB, pix)
    if pix.alpha:
        pix = pymupdf.Pixmap(pix, 0)
    return Image.frombytes("RGB", (pix.width, pix.height), pix.samples)


def page_render(pdf: Path, page: int = 1, width: int = 2600, clip=None) -> Image.Image:
    p = pymupdf.open(pdf)[page - 1]
    rect = pymupdf.Rect(clip) if clip else p.rect
    zoom = width / rect.width
    pix = p.get_pixmap(matrix=pymupdf.Matrix(zoom, zoom), clip=rect, alpha=False)
    return Image.frombytes("RGB", (pix.width, pix.height), pix.samples)


def trim(im: Image.Image, pad: int = 40) -> Image.Image:
    bg = Image.new(im.mode, im.size, im.getpixel((2, 2)))
    box = ImageChops.difference(im, bg).convert("L").point(lambda v: 255 if v > 18 else 0).getbbox()
    if not box:
        return im
    l, t, r, b = box
    return im.crop((max(0, l - pad), max(0, t - pad), min(im.width, r + pad), min(im.height, b + pad)))


def save(slug: str, name: str, im: Image.Image, max_w: int = 2400, alt: str = "", kind: str = "render"):
    out = PUBLIC / "work" / slug
    out.mkdir(parents=True, exist_ok=True)
    im = im.convert("RGB")
    if im.width > max_w:
        im = im.resize((max_w, round(im.height * max_w / im.width)), Image.LANCZOS)
    im.save(out / f"{name}.webp", quality=80, method=6)
    media["work"].setdefault(slug, {})[name] = {
        "src": f"/work/{slug}/{name}.webp",
        "width": im.width,
        "height": im.height,
        "alt": alt,
        "kind": kind,
    }
    return im


def ring(slug: str, images: list[Image.Image]):
    out = PUBLIC / "ring"
    out.mkdir(parents=True, exist_ok=True)
    srcs = []
    for i, im in enumerate(images):
        card = ImageOps.fit(im.convert("RGB"), (360, 480), Image.LANCZOS, centering=(0.5, 0.5))
        path = out / f"{slug}-{i + 1}.webp"
        card.save(path, quality=74, method=6)
        srcs.append(f"/ring/{slug}-{i + 1}.webp")
    media["ring"][slug] = srcs


def sketch(slug: str, page: int):
    """His red sketches are vector fills in the portfolio. Keep them as vectors, in Liquid Lava."""
    p = pymupdf.open(PORTFOLIO)[page - 1]

    def red(c):
        return c and c[0] > 0.6 and c[1] < 0.4

    items = [d for d in p.get_drawings() if red(d.get("fill")) or red(d.get("color"))]
    box = items[0]["rect"]
    for d in items[1:]:
        box |= d["rect"]
    x0, y0 = box.x0 - 6, box.y0 - 6
    w, h = box.width + 12, box.height + 12

    def pt(q):
        return f"{q.x - x0:.1f} {q.y - y0:.1f}"

    paths = []
    for d in items:
        cmds, last = [], None
        for it in d["items"]:
            kind = it[0]
            if kind == "re":
                r = it[1]
                cmds.append(f"M{r.x0 - x0:.1f} {r.y0 - y0:.1f}h{r.width:.1f}v{r.height:.1f}h{-r.width:.1f}Z")
                last = None
                continue
            if kind == "qu":
                q = it[1]
                cmds.append(f"M{pt(q.ul)}L{pt(q.ur)}L{pt(q.lr)}L{pt(q.ll)}Z")
                last = None
                continue
            start = it[1]
            if last is None or abs(start.x - last.x) > 0.05 or abs(start.y - last.y) > 0.05:
                cmds.append(f"M{pt(start)}")
            if kind == "l":
                cmds.append(f"L{pt(it[2])}")
                last = it[2]
            elif kind == "c":
                cmds.append(f"C{pt(it[2])} {pt(it[3])} {pt(it[4])}")
                last = it[4]
        if d.get("closePath"):
            cmds.append("Z")
        attrs = []
        attrs.append(f'fill="{LAVA}"' if red(d.get("fill")) else 'fill="none"')
        if red(d.get("color")):
            attrs.append(f'stroke="{LAVA}" stroke-width="{d.get("width") or 1:.1f}" stroke-linecap="round" stroke-linejoin="round"')
        if d.get("even_odd"):
            attrs.append('fill-rule="evenodd"')
        paths.append(f'<path {" ".join(attrs)} d="{"".join(cmds)}"/>')

    out = PUBLIC / "sketches"
    out.mkdir(parents=True, exist_ok=True)
    svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:.0f} {h:.0f}">{"".join(paths)}</svg>'
    (out / f"{slug}.svg").write_text(svg)
    media["sketches"][slug] = {"src": f"/sketches/{slug}.svg", "width": round(w), "height": round(h)}


def figure():
    """The person he draws into every sketch. The about scene walks him into the light."""
    p = pymupdf.open(PORTFOLIO)[2]
    d = p.get_drawings()[1233]
    r = d["rect"]
    cmds, last = [], None
    for it in d["items"]:
        start = it[1]
        if last is None or abs(start.x - last.x) > 0.05 or abs(start.y - last.y) > 0.05:
            cmds.append(f"M{start.x - r.x0:.1f} {start.y - r.y0:.1f}")
        if it[0] == "l":
            cmds.append(f"L{it[2].x - r.x0:.1f} {it[2].y - r.y0:.1f}")
            last = it[2]
        elif it[0] == "c":
            cmds.append(" ".join(["C" + f"{it[2].x - r.x0:.1f} {it[2].y - r.y0:.1f}", f"{it[3].x - r.x0:.1f} {it[3].y - r.y0:.1f}", f"{it[4].x - r.x0:.1f} {it[4].y - r.y0:.1f}"]))
            last = it[4]
    svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {r.width:.1f} {r.height:.1f}"><path d="{"".join(cmds)}"/></svg>'
    (PUBLIC / "sketches" / "figure.svg").write_text(svg)
    media["figure"] = {"src": "/sketches/figure.svg", "width": round(r.width, 1), "height": round(r.height, 1)}


def film():
    """His Shararat walkthrough, as frames the page can scrub. The title card and black tail are cut."""
    out = PUBLIC / "film"
    shutil.rmtree(out, ignore_errors=True)
    out.mkdir(parents=True)
    container = av.open(str(SHARARAT / "walkthrough.mp4"))
    stream = container.streams.video[0]
    start, end, fps = 2.2, 17.75, 12
    n, next_t = 0, start
    for frame in container.decode(stream):
        t = float(frame.time)
        if t < next_t - 1e-3:
            continue
        if t > end:
            break
        im = frame.to_image().resize((1280, 720), Image.LANCZOS)
        im.save(out / f"{n:03d}.webp", quality=62, method=4)
        n += 1
        next_t = start + n / fps
    media["film"] = {"count": n, "fps": fps, "start": start, "width": 1280, "height": 720, "cuts": cuts(out, n)}


def cuts(folder: Path, n: int) -> list[int]:
    """Frames where his walkthrough cuts to a new shot. The page blends frames within a shot only."""
    from statistics import median

    small = [Image.open(folder / f"{i:03d}.webp").convert("L").resize((160, 90)) for i in range(n)]
    diff = [0.0] + [ImageStat.Stat(ImageChops.difference(small[i], small[i - 1])).mean[0] for i in range(1, n)]
    found = []
    for i in range(1, n):
        around = [diff[j] for j in range(max(1, i - 4), min(n, i + 5)) if j != i]
        if diff[i] > 25 and diff[i] > 4 * median(around):
            found.append(i)
    return found


def main():
    pf, ea = PORTFOLIO, SUBMISSION

    # Shararat: his renders and furniture from the studio submission
    shararat = {
        "bar": (ea, 89, 9085, "The bar, between timber columns"),
        "passage": (ea, 66, 7783, "The entrance passage"),
        "lounge": (ea, 69, 7967, "Lounge with the palm wallpaper"),
        "speakers": (ea, 72, 8143, "The illuminated speaker wall"),
        "mezzanine": (ea, 76, 8381, "The double-height lounge and mezzanine"),
        "vinyl": (ea, 73, 8199, "A corner for listening"),
        "cowork": (ea, 79, 8563, "The first-floor coworking bar"),
        "library": (ea, 81, 8675, "First-floor lounge"),
        "booths": (ea, 89, 9141, "Booths along the speakeasy"),
        "table": (ea, 84, 8857, "Communal table on the first floor"),
    }
    imgs = {}
    for name, (pdf, page, xref, alt) in shararat.items():
        imgs[name] = save("shararat", name, embedded(pdf, page, xref), alt=alt)
    for name, (page, xref, alt) in {
        "piece-sofa": (91, 9295, "Curved sofa and lounge set"),
        "piece-chair": (94, 9463, "Lounge chair"),
        "piece-bar": (100, 9803, "Bar counter"),
        "piece-booth": (95, 9519, "Booth seating"),
    }.items():
        save("shararat", name, embedded(ea, page, xref), max_w=1400, alt=alt, kind="piece")
    save("shararat", "plans", embedded(ea, 56, 7133), alt="Ground floor and mezzanine plans", kind="drawing")
    save("shararat", "sections", embedded(ea, 62, 7475), alt="Sections", kind="drawing")
    ring("shararat", [imgs[k] for k in ["bar", "lounge", "speakers", "mezzanine", "cowork", "booths", "vinyl", "passage"]])

    # Maatik: Firefly-upscaled renders of his model
    maatik = {
        "facade": ("Firefly-32.jpg.jpeg", "The IF BE warehouse, Ballard Estate"),
        "cafe": ("Firefly-17.jpg.jpeg", "The café under the arch"),
        "lounge": ("Firefly-18.jpg.jpeg", "Lounge beside the brick wall"),
        "workshop": ("Firefly-22.jpg.jpeg", "The potters' workshop"),
        "vessel": ("Firefly-24.jpg.jpeg", "A vessel in the arched window"),
        "office": ("Firefly-25.jpg.jpeg", "Office lobby"),
        "kitchen": ("Firefly-28.jpg.jpeg", "Pantry and dining"),
        "bar": ("Firefly-30.jpg.jpeg", "Café counter"),
        "swing": ("Firefly-31.jpg.jpeg", "Swings below the stone wall"),
        "library": ("Firefly-16.jpg.jpeg", "Reading corner"),
    }
    imgs = {}
    for name, (file, alt) in maatik.items():
        imgs[name] = save("maatik", name, Image.open(PROJ / file), alt=alt)
    save("maatik", "plan", trim(page_render(PROJ / "key plan for maatik.pdf", width=3000)), alt="Furniture layout", kind="drawing")
    save("maatik", "section", trim(page_render(PROJ / "final maatik 1-Model.pdf 12.pdf", width=3400)), alt="Section through the banyan court", kind="drawing")
    save("maatik", "study-roof", Image.open(PROJ / "3.jpeg"), max_w=1200, alt="Pencil study of the workshop roof", kind="pencil")
    save("maatik", "study-truss", Image.open(PROJ / "2.jpeg"), max_w=1200, alt="Pencil study of the trusses", kind="pencil")
    ring("maatik", [imgs[k] for k in ["vessel", "facade", "cafe", "workshop", "swing", "office", "bar", "library"]])

    # Light of Bharat: renders, and the café as it stands
    lob = {
        "dining": (pf, 14, 204, "Persian carpet ceilings over the dining room"),
        "counter": (pf, 14, 206, "The counter and the old signage"),
        "bar": (pf, 15, 214, "Upholstered stools at the counter"),
        "chess": (pf, 15, 216, "Carved chessboard tables"),
    }
    imgs = {}
    for name, (pdf, page, xref, alt) in lob.items():
        imgs[name] = save("light-of-bharat", name, embedded(pdf, page, xref), alt=alt)
    save("light-of-bharat", "today", embedded(pf, 11, 191), max_w=900, alt="Light of Bharat as it is today", kind="photo")
    save("light-of-bharat", "plan", trim(page_render(PROJ / "fin lob sections final-Model.pdf 1.pdf", width=2600)), alt="Furniture layout", kind="drawing")
    save("light-of-bharat", "section", trim(page_render(PROJ / "fin lob sections final-Model.pdf 3.pdf", width=3000)), alt="Section A–A1", kind="drawing")
    ring("light-of-bharat", [imgs[k] for k in ["dining", "chess", "counter", "bar", "dining", "chess", "bar", "counter"]])

    # Hubtown Seasons: drawings from the internship
    plan = save("hubtown-seasons", "plan", trim(page_render(pf, 24, 3000, clip=(450, 250, 2800, 3350))), alt="Sales office floor plan", kind="drawing")
    elev = save("hubtown-seasons", "elevations", trim(page_render(pf, 30, 3200, clip=(2000, 480, 4000, 2420))), alt="Passage 9 elevations", kind="drawing")
    side = save("hubtown-seasons", "passage", trim(page_render(pf, 30, 2400, clip=(480, 480, 1990, 2420))), alt="Passage 8 elevations", kind="drawing")
    ring("hubtown-seasons", [elev, side, plan, elev, side, plan, elev, side])

    for slug, page in [("maatik", 3), ("light-of-bharat", 10), ("shararat", 16), ("hubtown-seasons", 23)]:
        sketch(slug, page)

    # The sketchbook
    for i, file in enumerate(["1.jpeg", "4.jpeg"]):
        save("sketchbook", f"page-{i + 1}", Image.open(PROJ / file), max_w=1200, alt="A page from his sketchbook", kind="pencil")

    figure()
    film()
    (ROOT / "src/content/media.json").write_text(json.dumps(media, indent=1))
    print({k: len(v) for k, v in media.items()}, media["film"])


if __name__ == "__main__":
    main()
