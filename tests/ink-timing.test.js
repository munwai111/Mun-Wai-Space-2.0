import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { writingTimeline } from "../src/ink-timing.js";
const font = JSON.parse(
  fs.readFileSync(new URL("../src/ink-assembly.json", import.meta.url), "utf8"),
);
test("pen strokes remain sequential and fit the reading-time limit", () => {
  const result = writingTimeline(
    ["PEOPLE", " ", "FIRST.", "\n", "ALWAYS", " ", "CURIOUS."],
    font,
    2800,
  );
  const strokes = result.letters.flatMap((l) => l.strokes);
  for (let i = 1; i < strokes.length; i++)
    assert.ok(
      strokes[i].delay > strokes[i - 1].delay + strokes[i - 1].duration,
    );
  assert.ok(result.duration <= 2920.01);
  assert.equal(
    result.letters.map((l) => l.character).join(""),
    "PEOPLEFIRST.ALWAYSCURIOUS.",
  );
});
test("word and line boundaries allow a longer pen lift", () => {
  const adjacent = writingTimeline(["AA"], font);
  const word = writingTimeline(["A", " ", "A"], font);
  const line = writingTimeline(["A", "\n", "A"], font);
  assert.ok(word.letters[1].start > adjacent.letters[1].start);
  assert.ok(line.letters[1].start > word.letters[1].start);
});
test("unsupported characters still receive a finite native-text reveal", () => {
  const result = writingTimeline(["A", "界", "B"], font);
  assert.equal(result.letters.length, 3);
  assert.equal(result.letters[1].strokes.length, 0);
  assert.ok(result.letters[1].end > result.letters[1].start);
  assert.ok(Number.isFinite(result.duration));
});
