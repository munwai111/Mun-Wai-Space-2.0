import puppeteer from "puppeteer-core";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
const browser = await puppeteer.launch({
  executablePath:
    process.env.CHROME_PATH ||
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});
const report = {};
try {
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.setViewport({ width: 1165, height: 814 });
  await page.goto(
    process.env.WORLDS_TEST_URL || "http://127.0.0.1:4173/#worlds",
  );
  await page.$eval("#world-panel", (e) =>
    e.scrollIntoView({ behavior: "instant", block: "center" }),
  );
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const current = () => page.$eval(".world-counter", (e) => e.textContent);
  await wait(1200);
  const first = await current();
  await page.waitForFunction(
    () => document.querySelector(".world-counter").textContent.startsWith("02"),
    { timeout: 9000 },
  );
  report.autoplay = true;
  const scene = await page.$(".polaroid-scene");
  const box = await scene.boundingBox();
  await page.mouse.move(box.x + box.width * 0.8, box.y + box.height * 0.3);
  await wait(600);
  const tilt = await page.$eval(
    ".polaroid-tilt",
    (e) => getComputedStyle(e).transform,
  );
  assert.notEqual(tilt, "none");
  report.pointerTilt = tilt;
  const hoverFrame = await current();
  await wait(7400);
  assert.equal(await current(), hoverFrame);
  report.hoverHolds = true;
  await page.screenshot({ path: "quality/worlds-desktop.png" });
  await page.mouse.move(0, 0);
  await wait(500);
  await page.click('[aria-label="Pause photo carousel"]');
  const paused = await current();
  await page.$eval('button[aria-label="Play photo carousel"]', (e) => e.blur());
  await page.mouse.move(0, 0);
  await wait(7400);
  assert.equal(await current(), paused);
  report.pauseHolds = true;
  await page.$eval(".world-tabs", (e) =>
    e.scrollIntoView({ behavior: "instant", block: "center" }),
  );
  await page.click(".world-tabs button");
  await page.waitForFunction(() =>
    document.querySelector(".world-counter").textContent.startsWith("01"),
  );
  const photos = [];
  for (let i = 0; i < 12; i++) {
    await wait(950);
    const item = await page.evaluate(() => ({
      counter: document.querySelector(".world-counter").textContent,
      image:
        document.querySelector(".polaroid-print img")?.getAttribute("src") ||
        null,
      loaded: [...document.querySelectorAll(".polaroid-print img")].every(
        (i) => i.complete && i.naturalWidth > 0,
      ),
      title: document.querySelector(".world-copy h3")?.textContent,
    }));
    assert.ok(item.loaded);
    photos.push(item);
    await page.click('[aria-label="Next moment"]');
  }
  assert.equal(
    new Set(photos.filter((p) => p.image).map((p) => p.image)).size,
    11,
  );
  assert.equal(photos.filter((p) => !p.image).length, 1);
  report.archive = photos;
  await wait(1000);
  assert.equal(await current(), first);
  report.wraparound = true;
  await page.addScriptTag({ path: "node_modules/axe-core/axe.min.js" });
  const axe = await page.evaluate(
    async () => await window.axe.run(document.querySelector("#worlds")),
  );
  report.accessibilityViolations = axe.violations.map((v) => ({
    id: v.id,
    nodes: v.nodes.length,
  }));
  assert.deepEqual(report.accessibilityViolations, []);
  await page.emulateMediaFeatures([
    { name: "prefers-reduced-motion", value: "reduce" },
  ]);
  await wait(500);
  assert.equal(
    await page.$eval(
      ".polaroid-float",
      (e) => getComputedStyle(e).animationName,
    ),
    "none",
  );
  assert.ok(await page.$eval(".world-autoplay", (e) => e.disabled));
  await page.click('[aria-label="Next moment"]');
  await wait(100);
  assert.ok((await current()).startsWith("02"));
  report.reducedMotionManualNavigation = true;
  report.widths = [];
  for (const width of [320, 390, 768, 1165]) {
    await page.setViewport({ width, height: 844 });
    await page.$eval(".polaroid-scene", (e) =>
      e.scrollIntoView({ behavior: "instant", block: "center" }),
    );
    await wait(150);
    const sizes = await page.evaluate(() => ({
      width: innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    assert.ok(sizes.scrollWidth <= width);
    report.widths.push(sizes);
    if (width === 390)
      await page.screenshot({ path: "quality/worlds-mobile.png" });
  }
  report.errors = errors;
  assert.deepEqual(errors, []);
  await fs.writeFile(
    "quality/worlds-functional.json",
    JSON.stringify(report, null, 2) + "\n",
  );
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
}
