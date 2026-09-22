"""Build the digits-only Roboto Flex subset used by the timeline years.

Source: the Roboto Flex variable font in Google Fonts' official repository
(github.com/google/fonts, ofl/robotoflex), licensed under the SIL Open Font
Licence 1.1; the licence is copied beside the output. Every variation axis
except weight (wght) and optical size (opsz) is fixed at its default, and only
the ten digits are kept. VariableProximity can then move the years between
'wght' 400, 'opsz' 9 and 'wght' 1000, 'opsz' 40 without a remote font request.

Run with python3; requires fonttools and brotli.
Usage: python3 generate-roboto-flex-digits.py "path/to/RobotoFlex[...].ttf"
"""

import sys
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont


ROOT = Path(__file__).resolve().parent
KEEP_AXES = {"wght", "opsz"}
DIGITS = range(0x30, 0x3A)
OUTPUT = ROOT / "public/fonts/roboto-flex-digits.woff2"

source = Path(sys.argv[1])
font = TTFont(source)
pinned = {
    axis.axisTag: axis.defaultValue
    for axis in font["fvar"].axes
    if axis.axisTag not in KEEP_AXES
}
font = instantiateVariableFont(font, pinned)

# fontTools loads glyph variations lazily and omits glyphs without deltas, which
# the subsetter then cannot look up. Give every glyph an entry before subsetting.
if "gvar" in font:
    variations = dict(font["gvar"].variations)
    for name in font.getGlyphOrder():
        variations.setdefault(name, [])
    font["gvar"].variations = variations

options = subset.Options()
options.layout_features = ["kern", "lnum", "tnum"]
# Keep every name record, including the copyright and licence notices.
options.name_IDs = ["*"]
options.notdef_outline = True
subsetter = subset.Subsetter(options)
subsetter.populate(unicodes=DIGITS)
subsetter.subset(font)

font.flavor = "woff2"
font.save(OUTPUT)

axes = {
    axis.axisTag: (axis.minValue, axis.defaultValue, axis.maxValue)
    for axis in font["fvar"].axes
}
print(f"{OUTPUT.relative_to(ROOT)}: {OUTPUT.stat().st_size} bytes")
print("axes:", axes)
print("digits:", sorted(chr(code) for code in font.getBestCmap()))
