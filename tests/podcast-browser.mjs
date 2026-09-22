import puppeteer from "puppeteer-core";
import assert from "node:assert/strict";
import fs from "node:fs/promises";

const browser = await puppeteer.launch({
  executablePath:
    process.env.CHROME_PATH ||
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});
const page = await browser.newPage(),
  errors = [],
  report = {};
page.on("pageerror", (e) => errors.push(e.message));
const delay = (ms) => new Promise((r) => setTimeout(r, ms));
const waitOpen = () =>
  page.waitForFunction(
    () =>
      document.querySelector(".listening-room").open &&
      document
        .querySelector(".listening-room")
        .getAnimations()
        .every((animation) => animation.playState !== "running") &&
      getComputedStyle(document.querySelector(".listening-room")).opacity ===
        "1" &&
      document.querySelector("audio").currentTime > 0,
  );
const waitClosed = () =>
  page.waitForFunction(() => !document.querySelector(".listening-room").open);
try {
  await page.setViewport({ width: 1440, height: 960, deviceScaleFactor: 1 });
  await page.goto(
    process.env.PODCAST_TEST_URL || "http://127.0.0.1:5173/#listen",
  );
  await page.$eval("#listen", (e) => e.scrollIntoView({ behavior: "instant" }));
  assert.equal(await page.$eval("audio", (e) => e.readyState), 0);
  const original = await page.evaluate(() => ({
    scroll: scrollY,
    theme: document.documentElement.dataset.theme,
  }));
  await page.click(".episode-play");
  await waitOpen();
  assert.equal(await page.$eval(".listening-room", (e) => e.clientWidth), 1440);
  assert.equal(await page.$eval(".listening-room", (e) => e.clientHeight), 960);
  assert.equal(
    await page.evaluate(() => document.activeElement.className),
    "room-pause",
  );
  report.automaticImmersion = true;
  report.duration = await page.$eval("audio", (e) => e.duration);
  assert.ok(report.duration > 2039 && report.duration < 2041);
  assert.equal(
    await page.$eval(".listening-room canvas", (e) => e.dataset.renderer),
    "webgl",
  );
  await page.select('[aria-label="Listening room chapter"]', "1");
  await page.waitForFunction(
    () => document.querySelector("audio").currentTime >= 70,
  );
  report.signal = [];
  for (let i = 0; i < 12; i++) {
    await delay(130);
    report.signal.push(
      await page.$eval(".listening-room meter", (e) => e.value),
    );
  }
  assert.ok(new Set(report.signal).size > 2 && Math.max(...report.signal) > 0);
  const mesh1 = await page.screenshot({
    clip: {
      x: 10,
      y: (await page.evaluate(() => scrollY)) + 390,
      width: 1400,
      height: 140,
    },
  });
  await delay(200);
  const mesh2 = await page.screenshot({
    clip: {
      x: 10,
      y: (await page.evaluate(() => scrollY)) + 390,
      width: 1400,
      height: 140,
    },
  });
  assert.notEqual(Buffer.compare(mesh1, mesh2), 0);
  report.reactiveMesh = true;
  await page.waitForSelector(".room-words .word-current");
  report.word1 = await page.$eval(
    ".room-words .word-current",
    (e) => e.textContent,
  );
  await delay(950);
  report.word2 = await page.$eval(
    ".room-words .word-current",
    (e) => e.textContent,
  );
  assert.notEqual(report.word1, report.word2);
  report.speaker = await page.$eval(".room-speaker", (e) => e.textContent);
  await page.select('[aria-label="Listening room speed"]', "1.5");
  assert.equal(await page.$eval("audio", (e) => e.playbackRate), 1.5);
  await page.click(".room-cc");
  assert.equal(
    await page.$eval(".room-captions", (e) => e.dataset.captions),
    "off",
  );
  await page.click(".room-cc");
  await page.screenshot({ path: "quality/listening-room-desktop.png" });
  await page.addScriptTag({ path: "node_modules/axe-core/axe.min.js" });
  const axe = await page.evaluate(
    async () => await window.axe.run(document.querySelector(".listening-room")),
  );
  report.accessibilityViolations = axe.violations.map((v) => ({
    id: v.id,
    nodes: v.nodes.map((n) => n.target),
  }));
  assert.deepEqual(report.accessibilityViolations, []);
  await page.keyboard.press("Escape");
  await waitClosed();
  assert.equal(await page.$eval("audio", (e) => e.paused), true);
  const paused = await page.$eval("audio", (e) => e.currentTime);
  await delay(150);
  assert.equal(await page.$eval("audio", (e) => e.currentTime), paused);
  assert.ok(paused > 70);
  const restored = await page.evaluate(() => ({
    scroll: scrollY,
    theme: document.documentElement.dataset.theme,
    lock: document.documentElement.classList.contains("listening-open"),
    focus: document.activeElement.className,
  }));
  assert.equal(restored.lock, false);
  assert.equal(restored.theme, original.theme);
  assert.equal(restored.focus, "episode-play");
  assert.ok(Math.abs(restored.scroll - original.scroll) < 2);
  report.pauseRestoresPortfolio = restored;
  await page.click(".episode-play");
  await waitOpen();
  await page.click(".room-footnote button");
  await waitClosed();
  assert.equal(await page.$eval("audio", (e) => e.currentTime), 0);
  report.reset = true;
  await page.click(".podcast-chapters button:last-child");
  await waitOpen();
  await page.waitForFunction(
    () => document.querySelector("audio").currentTime >= 1946,
  );
  report.chapterBeforeFirstPlay = await page.$eval(
    "audio",
    (e) => e.currentTime,
  );
  await page.$eval("audio", (e) => {
    e.currentTime = e.duration - 0.15;
  });
  await waitClosed();
  assert.equal(await page.$eval("audio", (e) => e.currentTime), 0);
  assert.equal(await page.$eval("audio", (e) => e.paused), true);
  report.endedResetsAndReturns = true;
  report.widths = [];
  for (const [width, height] of [
    [320, 568],
    [390, 844],
    [768, 900],
    [1200, 800],
    [740, 420],
  ]) {
    await page.setViewport({ width, height, deviceScaleFactor: 1 });
    await page.click(".episode-play");
    await waitOpen();
    const dimensions = await page.$eval(".listening-room", (e) => ({
      width: e.clientWidth,
      scrollWidth: e.scrollWidth,
      height: e.clientHeight,
      scrollHeight: e.scrollHeight,
    }));
    assert.ok(dimensions.scrollWidth <= width);
    assert.equal(dimensions.width, width);
    report.widths.push(dimensions);
    if (width === 390)
      await page.screenshot({ path: "quality/listening-room-mobile.png" });
    await page.click(".room-pause");
    await waitClosed();
  }
  await page.setViewport({ width: 1200, height: 850 });
  await page.click(".episode-play");
  await waitOpen();
  await page.emulateMediaFeatures([
    { name: "prefers-reduced-motion", value: "reduce" },
  ]);
  await page.waitForFunction(() =>
    document
      .querySelector(".room-footnote")
      .textContent.includes("Motion paused"),
  );
  await delay(200);
  const still1 = await page.screenshot({
    clip: {
      x: 5,
      y: (await page.evaluate(() => scrollY)) + 310,
      width: 1190,
      height: 90,
    },
  });
  await delay(200);
  const still2 = await page.screenshot({
    clip: {
      x: 5,
      y: (await page.evaluate(() => scrollY)) + 310,
      width: 1190,
      height: 90,
    },
  });
  assert.equal(Buffer.compare(still1, still2), 0);
  assert.equal(await page.$eval("audio", (e) => e.paused), false);
  report.reducedMotionKeepsAudio = true;
  await page.click(".room-pause");
  await waitClosed();
  assert.deepEqual(errors, []);
  report.errors = errors;
  await fs.writeFile(
    "quality/podcast-functional.json",
    JSON.stringify(report, null, 2) + "\n",
  );
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
}
