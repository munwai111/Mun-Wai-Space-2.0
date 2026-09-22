"""Make original pen routes for the local Manrope heading font.

These are conventional letter skeletons, not copied font outlines or visible
artwork. A white stroke following each route masks native browser text. The
browser remains responsible for the final glyph shape and kerning. Routes are
fitted to the actual local font's wght=600 bounds; widths allow the same routes
to reveal the slightly heavier subheadings without tracing their outlines.

Run with python3; requires fonttools and brotli, already used by generate-font.py.
"""

import json
import math
from pathlib import Path

from fontTools.pens.boundsPen import BoundsPen
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont


ROOT = Path(__file__).resolve().parent
font = instantiateVariableFont(
    TTFont(ROOT / "public/fonts/manrope-latin.woff2"), {"wght": 600}
)
glyph_set = font.getGlyphSet()
cmap = font.getBestCmap()
ascent = font["hhea"].ascent
descent = font["hhea"].descent
units = font["head"].unitsPerEm


def metrics(character):
    name = cmap[ord(character)]
    pen = BoundsPen(glyph_set)
    glyph_set[name].draw(pen)
    advance, bearing = font["hmtx"][name]
    if not pen.bounds:
        return advance, [0, ascent, 0, ascent]
    xmin, ymin, xmax, ymax = pen.bounds
    # TrueType outlines need not start at the hmtx bearing (variation rounding
    # can also leave a fractional mismatch). Align with browser glyph origins.
    shift = bearing - xmin
    return advance, [xmin + shift, ascent - ymax, xmax + shift, ascent - ymin]


stem = metrics("I")[1][2] - metrics("I")[1][0]


class Route:
    """Normalised, inset glyph coordinates; numeric bezier arc length offline."""

    def __init__(self, bounds, width=1.36, inset=0.5):
        left, top, right, bottom = bounds
        self.left = left + min(stem * inset, (right - left) / 2)
        self.top = top + min(stem * inset, (bottom - top) / 2)
        self.width = max(0, right - left - 2 * min(stem * inset, (right - left) / 2))
        self.height = max(0, bottom - top - 2 * min(stem * inset, (bottom - top) / 2))
        self.mask_width = stem * width
        self.commands = []
        self.length = 0
        self.current = None

    def point(self, x, y):
        return self.left + self.width * x, self.top + self.height * y

    def m(self, x, y):
        self.current = self.point(x, y)
        self.commands.append(("M", *self.current))
        return self

    def l(self, x, y):
        target = self.point(x, y)
        self.length += math.dist(self.current, target)
        self.commands.append(("L", *target))
        self.current = target
        return self

    def c(self, x1, y1, x2, y2, x3, y3):
        start = self.current
        one, two, end = self.point(x1, y1), self.point(x2, y2), self.point(x3, y3)
        previous = start
        for index in range(1, 65):
            t = index / 64
            s = 1 - t
            point = tuple(s**3 * start[a] + 3 * s * s * t * one[a]
                          + 3 * s * t * t * two[a] + t**3 * end[a] for a in (0, 1))
            self.length += math.dist(previous, point)
            previous = point
        self.commands.append(("C", *one, *two, *end))
        self.current = end
        return self

    def result(self):
        return {
            "d": " ".join(c[0] + " ".join(f"{value:.2f}".rstrip("0").rstrip(".")
                                           for value in c[1:]) for c in self.commands),
            "length": round(max(self.length, 1), 2),
            "width": round(self.mask_width, 2),
        }


def routes(character, bounds):
    def p(width=1.36, inset=0.5):
        return Route(bounds, width, inset)

    def oval(x0=0, y0=0, x1=1, y1=1):
        xm, ym = (x0 + x1) / 2, (y0 + y1) / 2
        kx, ky = (x1 - x0) * .276, (y1 - y0) * .276
        return p().m(xm, y0).c(xm-kx, y0, x0, ym-ky, x0, ym).c(x0, ym+ky, xm-kx, y1, xm, y1).c(xm+kx, y1, x1, ym+ky, x1, ym).c(x1, ym-ky, xm+kx, y0, xm, y0)

    c = character
    # Uppercase: each separate route is a natural pen lift.
    if c == "A": return [p().m(0, 1).l(.5, 0).l(1, 1), p().m(.2, .64).l(.8, .64)]
    if c == "B": return [p().m(0, 0).l(0, 1), p().m(0, 0).l(.5, 0).c(1, 0, 1, .45, .5, .45).l(0, .45), p().m(.45, .45).c(1.17, .42, 1.2, 1, .5, 1).l(0, 1)]
    if c == "C": return [p().m(1, .18).c(.73, -.14, 0, -.08, 0, .5).c(0, 1.08, .73, 1.14, 1, .82)]
    if c == "D": return [p().m(0, 0).l(0, 1), p().m(0, 0).l(.4, 0).c(1.2, 0, 1.2, 1, .4, 1).l(0, 1)]
    if c == "E": return [p().m(1, 0).l(0, 0).l(0, 1).l(1, 1), p().m(0, .5).l(.88, .5)]
    if c == "F": return [p().m(0, 1).l(0, 0).l(1, 0), p().m(0, .5).l(.85, .5)]
    if c == "G": return [p().m(1, .18).c(.73, -.14, 0, -.08, 0, .5).c(0, 1.12, 1.04, 1.22, 1, .54).l(.56, .54)]
    if c == "H": return [p().m(0, 0).l(0, 1), p().m(1, 0).l(1, 1), p().m(0, .5).l(1, .5)]
    if c == "I": return [p().m(.5, 0).l(.5, 1)]
    if c == "J": return [p().m(1, 0).l(1, .7).c(1, 1.1, 0, 1.12, 0, .78)]
    if c == "K": return [p().m(0, 0).l(0, 1), p().m(1, 0).l(0, .54), p().m(.32, .4).l(1, 1)]
    if c == "L": return [p().m(0, 0).l(0, 1).l(1, 1)]
    if c == "M": return [p().m(0, 1).l(0, 0).l(.5, .95).l(1, 0).l(1, 1)]
    if c == "N": return [p().m(0, 1).l(0, 0).l(1, 1).l(1, 0)]
    if c == "O": return [oval()]
    if c == "P": return [p().m(0, 1).l(0, 0).l(.55, 0).c(1.16, 0, 1.16, .54, .55, .54).l(0, .54)]
    if c == "Q": return [oval(0, 0, .94, .94), p().m(.57, .72).l(1, 1)]
    if c == "R": return [p().m(0, 1).l(0, 0).l(.55, 0).c(1.12, 0, 1.12, .54, .55, .54).l(0, .54), p().m(.48, .54).l(1, 1)]
    if c == "S": return [p().m(1, .15).c(.72, -.12, .02, -.06, .02, .26).c(.02, .52, .96, .48, .98, .74).c(1.08, 1.08, .27, 1.12, 0, .85)]
    if c == "T": return [p().m(0, 0).l(1, 0), p().m(.5, 0).l(.5, 1)]
    if c == "U": return [p().m(0, 0).l(0, .67).c(0, 1.12, 1, 1.12, 1, .67).l(1, 0)]
    if c == "V": return [p().m(0, 0).l(.5, 1).l(1, 0)]
    if c == "W": return [p().m(0, 0).l(.24, 1).l(.5, 0).l(.76, 1).l(1, 0)]
    if c == "X": return [p().m(0, 0).l(1, 1), p().m(1, 0).l(0, 1)]
    if c == "Y": return [p().m(0, 0).l(.5, .55).l(1, 0), p().m(.5, .55).l(.5, 1)]
    if c == "Z": return [p().m(0, 0).l(1, 0).l(0, 1).l(1, 1)]

    # Ascenders and descenders are placed against this font's actual baseline
    # and x-height instead of scaling every lowercase letter into a cap height.
    ytop = bounds[1] + stem * .5
    inner_height = max(1, bounds[3] - bounds[1] - stem)
    xheight = (ascent - 1080 + stem * .5 - ytop) / inner_height
    baseline = (ascent - stem * .5 - ytop) / inner_height
    if c == "a": return [p().m(.05, .17).c(.16, -.07, .96, -.1, .97, .28).l(.97, 1), p().m(.97, .38).c(.64, .53, 0, .35, 0, .74).c(0, 1.13, .79, 1.08, .97, .72)]
    if c == "b": return [p().m(0, 0).l(0, 1), oval(.02, xheight, 1, 1)]
    if c == "c": return [p().m(1, .18).c(.72, -.16, 0, -.02, 0, .5).c(0, 1.02, .72, 1.16, 1, .82)]
    if c == "d": return [oval(0, xheight, .98, 1), p().m(1, 0).l(1, 1)]
    if c == "e": return [p().m(.02, .49).l(1, .49).c(1, -.15, 0, -.2, 0, .5).c(0, 1.09, .75, 1.12, .97, .85)]
    if c == "f": return [p().m(1, 0).c(.3, -.09, .35, .24, .35, .35).l(.35, 1), p().m(0, xheight).l(1, xheight)]
    if c == "g": return [oval(0, 0, .98, baseline), p().m(1, 0).l(1, .76).c(1, 1.08, .24, 1.05, .1, .89)]
    if c == "h": return [p().m(0, 0).l(0, 1), p().m(0, xheight+.17).c(.2, xheight-.08, 1, xheight-.06, 1, xheight+.2).l(1, 1)]
    if c == "i": return [p().m(.5, xheight).l(.5, 1), p().m(.5, 0).l(.5, .001)]
    if c == "j": return [p().m(.91, xheight).l(.91, .8).c(.91, 1.03, .5, 1, 0, 1), p().m(.91, 0).l(.91, .001)]
    if c == "k": return [p().m(0, 0).l(0, 1), p().m(.96, xheight).l(0, .72), p().m(.28, .6).l(1, 1)]
    if c == "l": return [p().m(.5, 0).l(.5, 1)]
    if c == "m": return [p().m(0, 0).l(0, 1), p().m(0, .26).c(.1, -.08, .51, -.11, .51, .3).l(.51, 1), p().m(.51, .26).c(.61, -.08, 1, -.11, 1, .3).l(1, 1)]
    if c == "n": return [p().m(0, 0).l(0, 1), p().m(0, .26).c(.22, -.12, 1, -.13, 1, .3).l(1, 1)]
    if c == "o": return [oval()]
    if c == "p": return [p().m(0, 0).l(0, 1), oval(.02, 0, 1, baseline)]
    if c == "q": return [oval(0, 0, .98, baseline), p().m(1, 0).l(1, 1)]
    if c == "r": return [p().m(0, 0).l(0, 1), p().m(0, .32).c(.24, .03, .48, -.01, 1, 0)]
    if c == "s": return [p().m(1, .15).c(.71, -.1, .01, -.08, .02, .27).c(.03, .53, .97, .46, .98, .73).c(1.01, 1.08, .27, 1.11, 0, .85)]
    if c == "t": return [p().m(.36, 0).l(.36, .79).c(.36, 1, .65, 1.02, 1, .98), p().m(0, xheight).l(1, xheight)]
    if c == "u": return [p().m(0, 0).l(0, .7).c(0, 1.13, .8, 1.12, 1, .74), p().m(1, 0).l(1, 1)]
    if c == "v": return [p().m(0, 0).l(.5, 1).l(1, 0)]
    if c == "w": return [p().m(0, 0).l(.23, 1).l(.5, .06).l(.77, 1).l(1, 0)]
    if c == "x": return [p().m(0, 0).l(1, 1), p().m(1, 0).l(0, 1)]
    if c == "y": return [p().m(0, 0).l(.51, baseline), p().m(1, 0).l(.27, 1)]
    if c == "z": return [p().m(0, 0).l(1, 0).l(0, 1).l(1, 1)]

    if c == "0": return [oval()]
    if c == "1": return [p().m(0, .18).l(1, 0).l(1, 1)]
    if c == "2": return [p().m(0, .2).c(0, -.08, 1, -.12, 1, .22).c(1, .44, .34, .65, 0, 1).l(1, 1)]
    if c == "3": return [p().m(0, 0).l(1, 0).l(.44, .43).c(1.18, .36, 1.22, .95, .6, 1).c(.28, 1.05, .02, .93, 0, .82)]
    if c == "4": return [p().m(.75, 0).l(0, .72).l(1, .72), p().m(.75, 0).l(.75, 1)]
    if c == "5": return [p().m(1, 0).l(.06, 0).l(0, .51).c(.51, .22, 1.15, .42, 1, .77).c(.89, 1.08, .2, 1.08, 0, .87)]
    if c == "6": return [p().m(.88, .11).c(.19, -.3, -.18, .53, .08, .84).c(.47, 1.29, 1.25, .89, .97, .58).c(.64, .2, -.02, .44, .05, .72)]
    if c == "7": return [p().m(0, 0).l(1, 0).l(.25, 1)]
    if c == "8": return [oval(.07, 0, .93, .47), oval(0, .47, 1, 1)]
    if c == "9": return [oval(0, 0, 1, .61), p().m(.97, .3).c(1.14, .98, .55, 1.22, .13, .9)]

    # Dot routes have a tiny nonzero length so dash animations are well defined.
    if c == ".": return [p(1.16).m(.5, .5).l(.51, .5)]
    if c == ",": return [p(1.15).m(.55, 0).c(.63, .4, .59, .65, .1, 1)]
    if c == ":": return [p(1.17).m(.5, 0).l(.51, 0), p(1.17).m(.5, 1).l(.51, 1)]
    if c == ";": return [p(1.17).m(.5, 0).l(.51, 0), p(1.15).m(.5, .62).c(.63, .77, .59, .91, .1, 1)]
    if c == "!": return [p().m(.5, 0).l(.5, .73), p(1.17).m(.5, 1).l(.51, 1)]
    if c == "?": return [p().m(0, .2).c(0, -.12, 1, -.15, 1, .2).c(1, .44, .47, .39, .47, .68), p(1.17).m(.47, 1).l(.48, 1)]
    if c in "-–—": return [p(1.15).m(0, .5).l(1, .5)]
    if c in "’‘": return [p(1.15).m(.65, 0).c(.65, .48, .62, .75, 0, 1)]
    if c == "'": return [p(1.15).m(.5, 0).l(.5, 1)]
    if c == "&": return [p(1.5).m(1, 1).c(.56, .65, -.02, .29, .16, .09).c(.33, -.13, .84, .01, .65, .26).c(.43, .48, -.04, .47, .02, .77).c(.1, 1.24, .98, 1.01, .87, .49)]
    if c == "/": return [p().m(1, 0).l(0, 1)]
    if c == "+": return [p(1.15).m(.5, 0).l(.5, 1), p(1.15).m(0, .5).l(1, .5)]
    if c == "@": return [p(1.15).m(.95, .79).c(.7, 1.14, -.07, 1.08, 0, .47).c(.06, -.22, 1.2, -.09, 1, .58).c(.95, .77, .75, .77, .75, .59).l(.75, .26), p(1.15).m(.75, .32).c(.61, .13, .28, .22, .28, .49).c(.28, .82, .75, .77, .75, .46)]
    if c == "(": return [p().m(1, 0).c(-.28, .2, -.28, .8, 1, 1)]
    if c == ")": return [p().m(0, 0).c(1.28, .2, 1.28, .8, 0, 1)]
    if c == "[": return [p().m(1, 0).l(0, 0).l(0, 1).l(1, 1)]
    if c == "]": return [p().m(0, 0).l(1, 0).l(1, 1).l(0, 1)]
    return []


characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,:;!?-’'&/+@–—‘()[] "
glyphs = {}
for character in characters:
    if ord(character) not in cmap:
        continue
    advance, bounds = metrics(character)
    glyphs[character] = {
        "advance": advance,
        "bounds": [round(value, 2) for value in bounds],
        "strokes": [route.result() for route in routes(character, bounds)],
    }

data = {"unitsPerEm": units, "ascent": ascent, "descent": descent, "glyphs": glyphs}
target = ROOT / "src/ink-manrope.json"
target.write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")) + "\n")
print(f"Generated {len(glyphs)} original mask-route glyphs in {target.name} ({target.stat().st_size:,} bytes).")
