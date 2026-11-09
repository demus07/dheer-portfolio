"""Trace a render into a pen drawing, for the "How I think" section, where the plan turns into the render.

Usage: python3 scripts/trace-lines.py public/work/maatik/facade.webp public/steps/maatik-facade-lines.webp
Sobel edges on a softened greyscale copy, keeping only the strong ones, drawn dark on white.
"""

import sys
import numpy as np
from PIL import Image, ImageFilter
src, out = sys.argv[1], sys.argv[2]
im = Image.open(src).convert("L")
im = im.filter(ImageFilter.GaussianBlur(1.6))
a = np.asarray(im, dtype=np.float32) / 255.0
# Sobel gradient magnitude
kx = np.array([[-1,0,1],[-2,0,2],[-1,0,1]], np.float32); ky = kx.T
def conv(a,k):
    p = np.pad(a,1,mode='edge'); o = np.zeros_like(a)
    for i in range(3):
        for j in range(3): o += k[i,j]*p[i:i+a.shape[0], j:j+a.shape[1]]
    return o
g = np.hypot(conv(a,kx), conv(a,ky))
g = g / np.percentile(g, 99.3)
g = np.clip((g - 0.22) / 0.55, 0, 1) ** 0.8   # keep the strong edges, drop the brick noise
ink = 1 - g * 0.92
Image.fromarray((ink*255).astype(np.uint8)).save(out, quality=88)
