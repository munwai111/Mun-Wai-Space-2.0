import puppeteer from "puppeteer-core";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
const browser = await puppeteer.launch({
  executablePath:
    process.env.CHROME_PATH ||
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});
const base = process.env.INK_TEST_URL || "http://127.0.0.1:4173/?ink=verified";
const report = {};
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
try {
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const requests = [];
  page.on("request", (r) => {
    if (r.url().includes("/ink-runtime-")) requests.push(r.url());
  });
  await page.emulateMediaFeatures([
    { name: "prefers-color-scheme", value: "light" },
  ]);
  await page.setViewport({ width: 1165, height: 814 });
  await page.goto(base + "#home");
  await page.waitForSelector("h1 .ink-stroke");
  const before = await page.$eval("h1", (e) => ({
    width: e.offsetWidth,
    height: e.offsetHeight,
  }));
  const first = await page.$("h1 .ink-letter");
  const clip = await first.boundingBox();
  await page.$eval("h1 .ink-writing", (e) => {
    e.getAnimations({ subtree: true }).forEach((a) => {
      a.pause();
      a.currentTime = 0;
    });
  });
  const empty = await page.screenshot({ clip });
  const stroke = await page.$eval("h1 .ink-writing", (e) => {
    const path = e.querySelector(".ink-stroke");
    const a = path.getAnimations()[0];
    const timing = a.effect.getTiming();
    const mid = Number(timing.delay) + Number(timing.duration) * 0.6;
    e.getAnimations({ subtree: true }).forEach((anim) => {
      anim.currentTime = mid;
    });
    return {
      offset: parseFloat(getComputedStyle(path).strokeDashoffset),
      nativeOpacity: getComputedStyle(e.querySelector(".ink-native")).opacity,
    };
  });
  await wait(30);
  const partial = await page.screenshot({ clip });
  assert.ok(stroke.offset > 0 && stroke.offset < 1);
  assert.equal(stroke.nativeOpacity, "0");
  assert.notDeepEqual(empty, partial);
  report.visibleProgressiveStroke = stroke;
  // Resume normal browser time; this is one finite animation, not a replay loop.
  await page.$eval("h1 .ink-writing", (e) =>
    e.getAnimations({ subtree: true }).forEach((a) => a.play()),
  );
  await page.waitForFunction(
    () =>
      document.querySelector("h1 .ink-writing").dataset.phase === "finished",
  );
  assert.equal(await page.$$eval("h1 .ink-glyph", (e) => e.length), 0);
  assert.deepEqual(
    await page.$eval("h1", (e) => ({
      width: e.offsetWidth,
      height: e.offsetHeight,
    })),
    before,
  );
  assert.ok(
    await page.$$eval("h1 .ink-native", (e) =>
      e.every((n) => getComputedStyle(n).opacity === "1"),
    ),
  );
  report.exactTextRestoredWithoutLayoutShift = true;
  await page.screenshot({ path: "quality/ink-hero-finished.png" });
  await page.$eval("#about", (e) =>
    e.scrollIntoView({ behavior: "instant", block: "center" }),
  );
  await page.waitForSelector("#about h2 .ink-glyph");
  assert.equal(
    await page.$eval("#about h2 .ink-writing", (e) => e.dataset.inkFont),
    "manrope",
  );
  await page.$eval("#contact", (e) =>
    e.scrollIntoView({ behavior: "instant", block: "center" }),
  );
  await page.waitForFunction(
    () =>
      document.querySelector("#about h2 .ink-writing").dataset.phase ===
      "finished",
  );
  assert.equal(await page.$$eval("#about h2 .ink-glyph", (e) => e.length), 0);
  report.offscreenAnimationSettles = true;
  await page.$eval("#about", (e) =>
    e.scrollIntoView({ behavior: "instant", block: "center" }),
  );
  await wait(250);
  assert.equal(await page.$$eval("#about h2 .ink-glyph", (e) => e.length), 0);
  const buttons = await page.$$(".perspective-tabs button");
  await buttons[1].click();
  await page.waitForSelector(".perspective-copy h3 .ink-glyph");
  await page.evaluate(() => (document.documentElement.dataset.calm = "true"));
  await page.waitForFunction(
    () =>
      document.querySelector(".perspective-copy h3 .ink-writing").dataset
        .phase === "finished",
  );
  assert.equal(
    await page.$$eval(".perspective-copy h3 .ink-glyph", (e) => e.length),
    0,
  );
  report.contentUpdatesAndMotionSwitch = true;
  await page.evaluate(() => (document.documentElement.dataset.calm = "false"));
  assert.equal(requests.length, 1);
  report.oneSharedLazyWritingRequest = true;
  await page.emulateMediaType("print");
  assert.ok(
    await page.$$eval('.ink-writing > [aria-hidden="true"]', (e) =>
      e.every((n) => getComputedStyle(n).visibility === "visible"),
    ),
  );
  report.unvisitedHeadingsPrintable = true;
  await page.emulateMediaType("screen");
  report.layouts = [];
  for (const width of [320, 390, 768, 1165]) {
    await page.setViewport({ width, height: 844 });
    for (const theme of ["light", "dark"]) {
      await page.evaluate(
        (t) => (document.documentElement.dataset.theme = t),
        theme,
      );
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth),
        width,
      );
      report.layouts.push({ width, theme, overflow: false });
    }
  }
  await page.setViewport({ width: 390, height: 844 });
  await page.$eval("#contact", (e) =>
    e.scrollIntoView({ block: "start", behavior: "instant" }),
  );
  await wait(2500);
  await page.screenshot({ path: "quality/ink-contact-mobile.png" });
  await page.addScriptTag({ path: "node_modules/axe-core/axe.min.js" });
  report.accessibility = await page.evaluate(async () =>
    (await window.axe.run()).violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => n.target),
    })),
  );
  assert.deepEqual(report.accessibility, []);
  const reduced = await browser.newPage();
  let reducedRequests = 0;
  reduced.on("request", (r) => {
    if (r.url().includes("/ink-runtime-")) reducedRequests++;
  });
  await reduced.emulateMediaFeatures([
    { name: "prefers-reduced-motion", value: "reduce" },
  ]);
  await reduced.goto(base + "#home");
  await reduced.waitForFunction(
    () =>
      document.querySelector("h1 .ink-writing")?.dataset.phase === "finished",
  );
  assert.equal(reducedRequests, 0);
  assert.equal(await reduced.$$eval(".ink-glyph", (e) => e.length), 0);
  assert.ok(
    await reduced.$$eval('.ink-writing > [aria-hidden="true"]', (e) =>
      e.every((n) => getComputedStyle(n).visibility === "visible"),
    ),
  );
  report.reducedMotionSkipsWritingDownload = true;
  await reduced.close();
  const slow = await browser.newPage();
  await slow.setRequestInterception(true);
  let held;
  slow.on("request", (r) => {
    if (r.url().includes("/ink-runtime-")) held = r;
    else r.continue();
  });
  await slow.goto(base + "#home", { waitUntil: "domcontentloaded" });
  await slow.waitForFunction(
    () =>
      document.querySelector("h1 .ink-writing")?.dataset.phase === "finished",
    { timeout: 4500 },
  );
  assert.ok(held);
  assert.equal(
    await slow.$eval(
      'h1 .ink-writing > [aria-hidden="true"]',
      (e) => getComputedStyle(e).visibility,
    ),
    "visible",
  );
  await held.continue();
  await wait(500);
  assert.equal(await slow.$$eval("h1 .ink-glyph", (e) => e.length), 0);
  report.slowDownloadFallsBackWithoutLateReplay = true;
  await slow.close();
  report.errors = errors;
  assert.deepEqual(errors, []);
  await fs.writeFile(
    "quality/ink-functional.json",
    JSON.stringify(report, null, 2) + "\n",
  );
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
}
