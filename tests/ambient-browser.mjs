import puppeteer from "puppeteer-core";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
const browser = await puppeteer.launch({
  executablePath:
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1165, height: 814 });
  await page.evaluateOnNewDocument(() => {
    window.previewFrames = 0;
    const clear = CanvasRenderingContext2D.prototype.clearRect;
    CanvasRenderingContext2D.prototype.clearRect = function (...args) {
      if (this.canvas.closest(".podcast-conversation")) window.previewFrames++;
      return clear.apply(this, args);
    };
  });
  await page.goto("http://127.0.0.1:4173/?ambient=1#listen");
  await page.$eval(".podcast-conversation .voice-field", (e) =>
    e.scrollIntoView({ block: "center", behavior: "instant" }),
  );
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  await wait(500);
  const client = await page.createCDPSession();
  await client.send("Performance.enable");
  const metrics = async () =>
    Object.fromEntries(
      (await client.send("Performance.getMetrics")).metrics.map((m) => [
        m.name,
        m.value,
      ]),
    );
  const before = await metrics();
  const frame0 = await page.evaluate(() => window.previewFrames);
  const image0 = await page.$eval(".podcast-conversation canvas", (c) =>
    c.toDataURL(),
  );
  await wait(2500);
  const after = await metrics();
  const frames = (await page.evaluate(() => window.previewFrames)) - frame0;
  const image1 = await page.$eval(".podcast-conversation canvas", (c) =>
    c.toDataURL(),
  );
  assert.notEqual(image0, image1);
  assert.ok(frames > 25 && frames <= 62, `Unexpected frame count ${frames}`);
  const report = {
    ambientFlow: true,
    framesOver2_5Seconds: frames,
    pageTaskTimeMs: Math.round(
      (after.TaskDuration - before.TaskDuration) * 1000,
    ),
  };
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await wait(300);
  let count = await page.evaluate(() => window.previewFrames);
  await wait(500);
  assert.equal(await page.evaluate(() => window.previewFrames), count);
  report.offscreenStops = true;
  await page.$eval(".podcast-conversation .voice-field", (e) =>
    e.scrollIntoView({ block: "center", behavior: "instant" }),
  );
  await page.emulateMediaFeatures([
    { name: "prefers-reduced-motion", value: "reduce" },
  ]);
  await wait(300);
  count = await page.evaluate(() => window.previewFrames);
  await wait(500);
  assert.equal(await page.evaluate(() => window.previewFrames), count);
  report.reducedMotionStops = true;
  await page.emulateMediaFeatures([
    { name: "prefers-reduced-motion", value: "no-preference" },
  ]);
  await page.click(".episode-play");
  await page.waitForFunction(
    () => document.querySelector(".listening-room").open,
  );
  await wait(600);
  count = await page.evaluate(() => window.previewFrames);
  await wait(500);
  assert.equal(await page.evaluate(() => window.previewFrames), count);
  report.stopsBehindListeningRoom = true;
  await page.keyboard.press("Escape");
  await page.waitForFunction(
    () => !document.querySelector(".listening-room").open,
  );
  await wait(300);
  count = await page.evaluate(() => window.previewFrames);
  await wait(500);
  assert.ok((await page.evaluate(() => window.previewFrames)) > count);
  report.resumesAfterPause = true;
  await fs.writeFile(
    "quality/ambient-preview.json",
    JSON.stringify(report, null, 2) + "\n",
  );
  console.log(report);
} finally {
  await browser.close();
}
