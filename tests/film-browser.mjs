import puppeteer from "puppeteer-core";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { films } from "../src/films.js";

const browser = await puppeteer.launch({
  executablePath:
    process.env.CHROME_PATH ||
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});
const report = {
  scope:
    "Portfolio interface with a blocked-provider fixture; actual Instagram playback is checked separately.",
  layouts: [],
  errors: [],
};
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
try {
  const page = await browser.newPage();
  page.on("pageerror", (e) => report.errors.push(e.message));
  await page.evaluateOnNewDocument(() => {
    localStorage.setItem("mw-theme", "light");
    localStorage.setItem("mw-calm", "false");
  });
  const providerRequests = [];
  await page.setRequestInterception(true);
  page.on("request", (request) => {
    if (new URL(request.url()).hostname.endsWith("instagram.com")) {
      providerRequests.push(request.url());
      request.respond({
        status: 503,
        contentType: "text/html",
        body: "<html lang='en'><title>Unavailable provider fixture</title><body>Instagram is temporarily unavailable.</body></html>",
      });
    } else request.continue();
  });
  await page.setViewport({ width: 1165, height: 814, deviceScaleFactor: 2 });
  await page.goto(
    process.env.FILM_TEST_URL || "http://127.0.0.1:4173/?films=verified#voice",
  );
  await page.waitForSelector(".film-cover");
  assert.equal(providerRequests.length, 0);
  assert.equal(
    await page.$$eval(".film-choice", (nodes) => nodes.length),
    films.length,
  );
  report.noProviderRequestBeforeOpening = true;
  const scroll = (selector) =>
    page.$eval(selector, (e) =>
      e.scrollIntoView({ behavior: "instant", block: "start" }),
    );
  for (const category of [...new Set(films.map((film) => film.category))]) {
    await page.$$eval(
      ".film-filters button",
      (nodes, label) => nodes.find((n) => n.textContent === label).click(),
      category,
    );
    await wait(100);
    assert.equal(
      await page.$$eval(".film-choice", (nodes) => nodes.length),
      films.filter((f) => f.category === category).length,
    );
  }
  await page.click(".film-filters button");
  for (let i = 0; i < films.length; i++) {
    await page.$$eval(
      ".film-choice",
      (nodes, index) => nodes[index].click(),
      i,
    );
    await wait(50);
    assert.equal(
      await page.$eval(".film-original", (e) => e.href),
      films[i].url,
    );
    const cover = await page.$eval(".film-cover", (e) => ({
      description: document.getElementById(e.getAttribute("aria-describedby"))
        ?.textContent,
      action: e.querySelector(".film-play").textContent.trim(),
    }));
    assert.ok(cover.description.includes(films[i].title));
    assert.equal(
      cover.action,
      films[i].playback === "instagram" ? "Watch on Instagram" : "Watch reel",
    );
    if (films[i].playback === "instagram") {
      assert.equal(await page.$eval(".film-cover", (e) => e.tagName), "A");
      assert.equal(
        await page.$eval(".film-cover", (e) => e.href),
        films[i].url,
      );
      assert.equal(await page.$eval(".film-cover", (e) => e.target), "_blank");
      assert.equal(await page.$$eval("iframe", (nodes) => nodes.length), 0);
    }
  }
  report.filtersAndAllDestinations = true;
  await page.$$eval(".film-choice", (nodes) => nodes[0].click());
  await scroll(".film-journal");
  await wait(1600);
  await page.screenshot({ path: "quality/film-journal-desktop.png" });
  await page.click(".film-cover");
  await page.waitForSelector(".film-viewer[open]");
  assert.equal(
    await page.$$eval(".film-embed iframe", (nodes) => nodes.length),
    1,
  );
  assert.equal(
    await page.$eval(".film-viewer-copy a", (e) => e.href),
    films[0].url,
  );
  assert.ok(
    await page.$eval(".film-embed iframe", (e) => e.title.includes("xolvit")),
  );
  assert.equal(
    await page.evaluate(() => document.body.style.overflow),
    "hidden",
  );
  await page.keyboard.down("Shift");
  await page.keyboard.press("Tab");
  await page.keyboard.up("Shift");
  assert.ok(
    await page.evaluate(() =>
      document.querySelector(".film-viewer").contains(document.activeElement),
    ),
  );
  await page.keyboard.press("Escape");
  await page.waitForFunction(() => !document.querySelector(".film-viewer"));
  assert.equal(await page.$$eval("iframe", (nodes) => nodes.length), 0);
  assert.equal(
    await page.evaluate(() => document.activeElement.className),
    "film-cover",
  );
  assert.notEqual(
    await page.evaluate(() => document.body.style.overflow),
    "hidden",
  );
  report.providerFallbackAndFocusRestoration = true;

  await scroll("#projects");
  await page.waitForFunction(
    () =>
      document.querySelector("#projects .quiet-field").dataset.flowing ===
      "true",
  );
  const pixels = () =>
    page.$eval("#projects .quiet-field", (canvas) => canvas.toDataURL());
  const first = await pixels();
  await wait(700);
  assert.notEqual(await pixels(), first);
  assert.ok(
    await page.$eval(
      "#projects .quiet-field",
      (canvas) => canvas.width / canvas.clientWidth <= 1.501,
    ),
  );
  await page.$eval(".film-cover", (e) => e.click());
  await page.waitForFunction(
    () =>
      document.querySelector("#projects .quiet-field").dataset.flowing ===
      "false",
  );
  const frozen = await pixels();
  await wait(400);
  assert.equal(await pixels(), frozen);
  await page.keyboard.press("Escape");
  await page.waitForFunction(
    () =>
      document.querySelector("#projects .quiet-field").dataset.flowing ===
      "true",
  );
  await page.click(".project-open");
  await page.waitForFunction(
    () =>
      document.querySelector("#projects .quiet-field").dataset.flowing ===
      "false",
  );
  await page.click(".dialog-close");
  await page.waitForFunction(
    () =>
      document.querySelector("#projects .quiet-field").dataset.flowing ===
      "true",
  );
  await page.emulateMediaFeatures([
    { name: "prefers-reduced-motion", value: "reduce" },
  ]);
  await page.waitForFunction(
    () =>
      document.querySelector("#projects .quiet-field").dataset.flowing ===
      "false",
  );
  const still = await pixels();
  await wait(500);
  assert.equal(await pixels(), still);
  await page.emulateMediaFeatures([
    { name: "prefers-reduced-motion", value: "no-preference" },
  ]);
  await page.waitForFunction(
    () =>
      document.querySelector("#projects .quiet-field").dataset.flowing ===
      "true",
  );
  await scroll("#voice");
  await page.waitForFunction(
    () =>
      document.querySelector("#projects .quiet-field").dataset.flowing ===
      "false",
  );
  report.fieldFlowsAndSleeps = {
    changesPixels: true,
    offscreen: true,
    filmOverlay: true,
    projectUnmount: true,
    reducedMotion: true,
    pixelRatioCap: 1.5,
  };

  await page.addScriptTag({ path: "node_modules/axe-core/axe.min.js" });
  report.accessibility = [];
  for (const theme of ["light", "dark"]) {
    if ((await page.$eval("html", (e) => e.dataset.theme)) !== theme)
      await page.click(".theme-button");
    for (const width of [320, 390, 768, 1165]) {
      await page.setViewport({ width, height: width < 700 ? 844 : 814 });
      await scroll(".film-journal");
      await wait(200);
      const layout = await page.evaluate(() => ({
        width: innerWidth,
        page: document.documentElement.scrollWidth,
        theme: document.documentElement.dataset.theme,
      }));
      assert.equal(layout.page, width);
      await page.$eval(".film-cover", (e) => e.click());
      await page.waitForSelector(".film-viewer[open]");
      const modal = await page.$eval(".film-viewer", (e) => ({
        scroll: e.scrollWidth,
        client: e.clientWidth,
        closeTop: e.querySelector("button").getBoundingClientRect().top,
      }));
      assert.ok(modal.scroll <= modal.client + 1);
      assert.ok(modal.closeTop >= 0 && modal.closeTop < 844);
      report.layouts.push({ ...layout, modal });
      if (width === 390) {
        report.accessibility.push({
          theme,
          violations: await page.evaluate(async () =>
            (
              await axe.run(document.querySelector(".film-viewer"), {
                iframes: false,
              })
            ).violations.map((v) => ({
              id: v.id,
              nodes: v.nodes.map((n) => n.target),
            })),
          ),
        });
      }
      await page.keyboard.press("Escape");
      if (width === 390 && theme === "light")
        await page.screenshot({ path: "quality/film-journal-mobile.png" });
    }
  }
  await page.setViewport({ width: 390, height: 844 });
  await page.$$eval(".film-choice", (nodes) => nodes.at(-1).click());
  await wait(1000);
  assert.equal(
    await page.evaluate(() => document.activeElement.className),
    "film-cover",
  );
  report.mobileSelectionReturnsToPreview = true;
  await page.emulateMediaFeatures([
    { name: "prefers-reduced-motion", value: "reduce" },
  ]);
  assert.equal(
    await page.$eval(".film-cover", (e) => e.href),
    films.at(-1).url,
  );
  await page.$$eval(".film-choice", (nodes) => nodes[0].click());
  await wait(100);
  await page.$eval(".film-cover", (e) => e.click());
  assert.ok(
    await page.$eval(".film-embed iframe", (e) =>
      e.src.includes("DQ3J-MFgBhm"),
    ),
  );
  await page.keyboard.press("Escape");
  report.reducedMotionKeepsReelsAvailable = true;
  await page.setViewport({ width: 1165, height: 814 });
  await scroll("#contact");
  await wait(700);
  report.accessibility.push({
    theme: "dark",
    page: true,
    violations: await page.evaluate(async () =>
      (await axe.run(document, { iframes: false })).violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => n.target),
      })),
    ),
  });
  assert.ok(
    report.accessibility.every((r) => r.violations.length === 0),
    JSON.stringify(report.accessibility),
  );
  assert.deepEqual(report.errors, []);
  report.passed = true;
  console.log(JSON.stringify(report, null, 2));
} finally {
  await fs.writeFile(
    "quality/film-functional.json",
    JSON.stringify(report, null, 2),
  );
  await browser.close();
}
