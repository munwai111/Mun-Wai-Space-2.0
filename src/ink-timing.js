// Distance sets drawing time; pen lifts, words and punctuation set cadence.
// Each heading has a reading-time ceiling, with no overlapping pen strokes.
export function writingTimeline(tokens, font, maximum = 2300) {
  let cursor = 0;
  const letters = [];
  for (const token of tokens) {
    if (/^\s+$/.test(token)) {
      cursor += token.includes("\n") ? 145 : 75;
      continue;
    }
    for (const character of Array.from(token)) {
      const glyph =
        font.glyphs[character] || font.glyphs[character.toUpperCase()];
      const start = cursor;
      const strokes = (glyph?.strokes || []).map((stroke) => {
        const delay = cursor;
        const duration = Math.max(28, (stroke.length / font.unitsPerEm) * 125);
        cursor += duration + 12;
        return { ...stroke, delay, duration };
      });
      if (!strokes.length) cursor += 65;
      const end = cursor;
      letters.push({ character, glyph, start, end, strokes });
      cursor += /[.!?:;,]/.test(character) ? 90 : 18;
    }
  }
  const scale = Math.min(1, maximum / Math.max(cursor, 1));
  return {
    duration: cursor * scale + 120,
    letters: letters.map((letter) => ({
      ...letter,
      start: letter.start * scale,
      end: letter.end * scale,
      strokes: letter.strokes.map((stroke) => ({
        ...stroke,
        delay: stroke.delay * scale,
        duration: stroke.duration * scale,
      })),
    })),
  };
}
