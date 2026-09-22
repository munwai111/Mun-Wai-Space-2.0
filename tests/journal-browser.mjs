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
  await page.emulateMediaFeatures([
    { name: "prefers-color-scheme", value: "light" },
  ]);
  await page.setViewport({ width: 1165, height: 814 });
  await page.goto(
    process.env.JOURNAL_TEST_URL || "http://127.0.0.1:4173/?journal=1",
  );
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  await page.waitForFunction(
    () => document.querySelector(".hero-photo-window img")?.naturalWidth > 0,
  );
  await wait(2400);
  await page.screenshot({ path: "quality/journal-hero.png" });
  assert.equal(
    await page.$eval("h1 .ink-writing", (e) => e.dataset.written),
    "true",
  );
  const initial = await page.$eval(".hero-photo-window img", (e) =>
    e.getAttribute("src"),
  );
  await page.waitForFunction(
    (src) =>
      document.querySelector(".hero-photo-window img")?.getAttribute("src") !==
      src,
    { timeout: 10000 },
    initial,
  );
  await wait(1300);
  report.heroAutoTransitions = true;
  await page.click('[aria-label="Pause portrait slideshow"]');
  const portraitSources = [];
  for (let i = 0; i < 6; i++) {
    await wait(1200);
    portraitSources.push(
      await page.$eval(".hero-photo-window img", (e) => ({
        src: e.getAttribute("src"),
        loaded: e.complete && e.naturalWidth > 0,
      })),
    );
    await page.click('[aria-label="Next portrait"]');
  }
  assert.equal(new Set(portraitSources.map((p) => p.src)).size, 6);
  assert.ok(portraitSources.every((p) => p.loaded));
  report.heroImages = portraitSources;
  await page.$eval("#about", (e) => e.scrollIntoView({ behavior: "instant" }));
  await wait(1000);
  const brain1 = await page.$eval(".neural-brain", (e) => e.toDataURL());
  await wait(350);
  const brain2 = await page.$eval(".neural-brain", (e) => e.toDataURL());
  assert.notEqual(brain1, brain2);
  report.neuralMotion = true;
  await page.screenshot({ path: "quality/journal-brain.png" });
  await page.$eval("#world-panel", (e) =>
    e.scrollIntoView({ behavior: "instant", block: "center" }),
  );
  await wait(1800);
  assert.equal(
    await page.$eval(".sticker-uniqlo", (e) => e.textContent),
    "UNIQLO",
  );
  report.uniqloKeepsakes = true;
  await page.screenshot({ path: "quality/journal-uniqlo.png" });
  await page.$$eval(".world-tabs button", (buttons) =>
    buttons.find((b) => b.textContent === "SuperAI").click(),
  );
  await wait(2000);
  assert.ok(
    await page.$eval(".world-counter", (e) =>
      e.textContent.includes("SuperAI"),
    ),
  );
  assert.ok(
    await page.$eval(".polaroid-print img", (e) =>
      e.src.includes("journey-13"),
    ),
  );
  report.superAI = true;
  await page.screenshot({ path: "quality/journal-superai.png" });
  const years = ["2021", "2022", "2023", "2024", "2025", "2026"];
  report.scrollChapters = [];
  for (const year of years) {
    await page.$eval(`#journey-${year}`, (e) =>
      e.scrollIntoView({ block: "center", behavior: "instant" }),
    );
    await wait(1100);
    const current = await page.$eval(
      '.journey-route button[aria-pressed="true"]',
      (e) => e.textContent,
    );
    assert.equal(current, year);
    report.scrollChapters.push(current);
    if (year === "2024")
      await page.screenshot({ path: "quality/journal-timeline.png" });
  }
  await page.click(".journey-route button");
  await wait(1700);
  assert.equal(
    await page.$eval(
      '.journey-route button[aria-pressed="true"]',
      (e) => e.textContent,
    ),
    "2021",
  );
  report.timelineNavigation = true;
  await page.click(".journey-stop.is-current .journey-photo-enlarge");
  await page.waitForSelector("dialog[open] .lightbox-image");
  await page.keyboard.press("Escape");
  report.photoLightbox = true;
  await page.$eval("footer", (e) => e.scrollIntoView({ behavior: "instant" }));
  await wait(1700);
  assert.equal(
    await page.$eval(
      '#contact .contact-links a[aria-label="Instagram, @munwai111"]',
      (e) => e.getAttribute("href"),
    ),
    "https://www.instagram.com/munwai111/",
  );
  assert.equal(
    await page.$eval(
      '#contact .contact-links a[aria-label="Instagram, @munwai111"]',
      (e) => e.getAttribute("target"),
    ),
    "_blank",
  );
  report.instagramContactLink = true;
  await page.screenshot({ path: "quality/journal-footer.png" });
  await page.addScriptTag({ path: "node_modules/axe-core/axe.min.js" });
  const axe = await page.evaluate(async () => window.axe.run());
  report.accessibilityViolations = axe.violations.map((v) => ({
    id: v.id,
    nodes: v.nodes.map((n) => ({
      target: n.target,
      summary: n.failureSummary,
    })),
  }));
  await page.emulateMediaFeatures([
    { name: "prefers-reduced-motion", value: "reduce" },
  ]);
  await page.$eval("#about", (e) => e.scrollIntoView({ behavior: "instant" }));
  await wait(700);
  const still1 = await page.$eval(".neural-brain", (e) => e.toDataURL());
  await wait(400);
  assert.equal(await page.$eval(".neural-brain", (e) => e.toDataURL()), still1);
  report.reducedBrainStill = true;
  assert.equal(
    await page.$eval(
      ".wordmark-square",
      (e) => getComputedStyle(e).animationName,
    ),
    "none",
  );
  assert.equal(
    await page.$eval("h1 .ink-letter", (e) => getComputedStyle(e).opacity),
    "1",
  );
  report.reducedHeadingsVisible = true;
  report.widths = [];
  for (const width of [320, 390, 768, 1165]) {
    await page.setViewport({ width, height: 844 });
    await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
    await wait(300);
    const size = await page.evaluate(() => ({
      width: innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    report.widths.push(size);
    assert.ok(size.scrollWidth <= width, JSON.stringify(size));
    if (width === 390) {
      await page.screenshot({ path: "quality/journal-mobile.png" });
      await page.$eval("#journey-2023", (e) =>
        e.scrollIntoView({ behavior: "instant", block: "start" }),
      );
      await wait(300);
      await page.screenshot({ path: "quality/journal-mobile-timeline.png" });
    }
  }
  report.errors = errors;
  await fs.writeFile(
    "quality/journal-functional.json",
    JSON.stringify(report, null, 2) + "\n",
  );
  console.log(JSON.stringify(report, null, 2));
  assert.deepEqual(report.accessibilityViolations, []);
  assert.deepEqual(errors, []);
} finally {
  await browser.close();
}
