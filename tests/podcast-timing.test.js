import test from "node:test";
import assert from "node:assert/strict";
import {
  findCue,
  clampSeek,
  formatTime,
  chapters,
} from "../src/podcast-timing.js";

test("captions follow speech intervals, including silence and backwards seeks", () => {
  const cues = [
    { start: 1, end: 3 },
    { start: 3, end: 5 },
    { start: 8, end: 10 },
  ];
  for (const [time, expected] of [
    [0, -1],
    [1, 0],
    [2.9, 0],
    [3, 1],
    [5, -1],
    [9, 2],
    [10, -1],
    [2, 0],
  ]) {
    assert.equal(findCue(cues, time), expected, `At ${time}s`);
  }
  assert.equal(findCue([], 42), -1);
});
test("transport stays inside the episode", () => {
  assert.equal(clampSeek(-15, 2040), 0);
  assert.equal(clampSeek(2050, 2040), 2040);
  assert.equal(clampSeek(1509, 2040), 1509);
  assert.equal(formatTime(2040.058), "34:00");
  assert.equal(formatTime(NaN), "0:00");
  assert.ok(chapters.every(([t], i) => !i || t > chapters[i - 1][0]));
});
