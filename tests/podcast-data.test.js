import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("full episode captions have usable ordered word timings", () => {
  const { cues, duration } = JSON.parse(
    readFileSync(
      new URL("../public/audio/ai-unplugged-captions.json", import.meta.url),
    ),
  );
  assert.ok(cues[0].start < 1);
  assert.ok(cues.at(-1).end > 2030);
  assert.ok(cues.flatMap((c) => c.words).length > 6000);
  const speakers = new Set(cues.map((c) => c.speaker));
  for (const name of ["Evangeline Wong", "Aarush Pandey", "Mun Wai Looi"])
    assert.ok(speakers.has(name));
  for (const [i, cue] of cues.entries()) {
    assert.ok(cue.start < cue.end && cue.end <= duration);
    if (i) assert.ok(cues[i - 1].end <= cue.start);
    for (const word of cue.words) {
      assert.ok(word.text.trim());
      assert.ok(word.start >= cue.start && word.end <= cue.end);
      assert.ok(word.start < word.end);
    }
  }
});
