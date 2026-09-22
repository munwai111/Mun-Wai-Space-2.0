import puppeteer from "puppeteer-core";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { chapters } from "../src/data.js";

const gallery = JSON.parse(
  await fs.readFile(new URL("../src/gallery.json", import.meta.url), "utf8"),
);
const photosFor = (chapter) =>
  chapter.ids.flatMap(
    (id) => gallery.find((row) => row.id === id)?.images || [],
  );
const normalise = (text) => text.replace(/\s+/g, " ").trim();
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const report = {
  scope:
    "Actual window scrolling, chapter content, photographs and responsive motion preferences",
  layouts: [],
  errors: [],
};
await fs.mkdir("quality", { recursive: true });
const browser = await puppeteer.launch({
  executablePath:
    process.env.CHROME_PATH ||
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});
let page;
try {
  page = await browser.newPage();
  page.on("pageerror", (error) => report.errors.push(error.message));
  await page.evaluateOnNewDocument(() => {
    localStorage.setItem("mw-theme", "light");
    localStorage.setItem("mw-calm", "false");
  });
  await page.emulateMediaFeatures([
    { name: "prefers-color-scheme", value: "light" },
    { name: "prefers-reduced-motion", value: "no-preference" },
  ]);
  await page.setViewport({ width: 1165, height: 814 });
  const url =
    process.env.SCROLL_EXPAND_TEST_URL ||
    "http://127.0.0.1:4173/?scroll-expand=qa";
  await page.goto(url, { waitUntil: "networkidle0" });
  await page.waitForSelector("#timeline .scroll-expand[data-progress]");

  const actual = await page.$$eval(".journey-stop", (articles) =>
    articles.map((article) => ({
      id: article.id,
      title:
        article.querySelector("h3 .sr-only")?.textContent ||
        article.querySelector("h3")?.textContent,
      intro: article.querySelector(".journey-stop-intro")?.textContent,
      details: [...article.querySelectorAll("li")].map(
        (item) => item.textContent,
      ),
      storyInsideMedia: !!article.querySelector(
        ".scroll-expand__frame .journey-stop-intro, .scroll-expand__frame li",
      ),
    })),
  );
  assert.equal(actual.length, 6);
  assert.equal(
    actual.reduce((sum, chapter) => sum + chapter.details.length, 0),
    18,
  );
  actual.forEach((article, index) => {
    assert.equal(article.id, `journey-${chapters[index].year}`);
    assert.equal(normalise(article.title), normalise(chapters[index].title));
    assert.equal(normalise(article.intro), normalise(chapters[index].intro));
    assert.deepEqual(
      article.details.map(normalise),
      chapters[index].details.map(normalise),
    );
    assert.equal(
      article.storyInsideMedia,
      false,
      "The story must remain outside the clipped media frame",
    );
  });
  assert.equal(
    await page.$$eval("#timeline .scroll-expand", (nodes) => nodes.length),
    5,
  );
  assert.equal(
    await page.$$eval("#journey-2026 .scroll-expand", (nodes) => nodes.length),
    0,
  );
  assert.match(
    await page.$eval(
      "#journey-2026 .journey-open-page",
      (node) => node.textContent,
    ),
    /Still\s*becoming/,
  );
  report.content = {
    chapters: 6,
    details: 18,
    expandingChapters: 5,
    finalChapterStatic: true,
  };

  const sample = (selector) =>
    page.$eval(selector, (root) => {
      const track = root.querySelector(".scroll-expand__track");
      const stage = root.querySelector(".scroll-expand__stage");
      const frame = root.querySelector(".scroll-expand__frame");
      const media = root.querySelector(".scroll-expand__media");
      const frameStyle = getComputedStyle(frame);
      const stageStyle = getComputedStyle(stage);
      const clip = frameStyle.clipPath;
      const clipNumbers = (clip.match(/-?\d*\.?\d+/g) || []).map(Number);
      return {
        progress: Number(root.dataset.progress),
        static: root.dataset.static,
        animating: root.dataset.animating,
        clip,
        horizontalInset: clipNumbers[1] || 0,
        transform: media ? getComputedStyle(media).transform : null,
        trackHeight: track.getBoundingClientRect().height,
        stageHeight: stage.getBoundingClientRect().height,
        stageTop: stage.getBoundingClientRect().top,
        stickyTop: parseFloat(stageStyle.top) || 0,
        position: stageStyle.position,
        overflowY: getComputedStyle(root).overflowY,
        rootScrollTop: root.scrollTop,
        scrollY,
      };
    });
  const scrollStage = async (selector, fraction) => {
    await page.$eval(
      selector,
      (root, ratio) => {
        const track = root.querySelector(".scroll-expand__track");
        const stage = root.querySelector(".scroll-expand__stage");
        const offset = parseFloat(getComputedStyle(stage).top) || 0;
        const range =
          track.getBoundingClientRect().height -
          stage.getBoundingClientRect().height;
        window.scrollTo({
          top:
            scrollY +
            track.getBoundingClientRect().top -
            offset +
            range * ratio,
          behavior: "instant",
        });
      },
      fraction,
    );
    await wait(600);
    await page.waitForFunction(
      (selector) =>
        document.querySelector(selector)?.dataset.animating === "false",
      { timeout: 5000 },
      selector,
    );
    return sample(selector);
  };
  const first = "#journey-2021 .scroll-expand";
  const start = await scrollStage(first, 0.03);
  const middle = await scrollStage(first, 0.52);
  await page.screenshot({ path: "quality/scroll-expand-desktop-middle.png" });
  const end = await scrollStage(first, 0.99);
  const reverse = await scrollStage(first, 0.08);
  assert.ok(
    start.progress < 0.18 &&
      middle.progress > start.progress + 0.2 &&
      end.progress > 0.9,
    JSON.stringify({ start, middle, end }),
  );
  assert.ok(
    start.horizontalInset > middle.horizontalInset &&
      middle.horizontalInset > end.horizontalInset,
    "The actual clip geometry must expand with scroll",
  );
  assert.ok(
    reverse.progress < 0.2 && reverse.horizontalInset > end.horizontalInset + 5,
    "Scrolling backwards must restore the framed photograph",
  );
  assert.equal(middle.position, "sticky");
  assert.ok(
    Math.abs(middle.stageTop - middle.stickyTop) < 3,
    "Sticky media should respect its measured top offset",
  );
  assert.ok(
    start.trackHeight < 1.65 * 814,
    "Each chapter must avoid an extended holding track",
  );
  assert.equal(middle.rootScrollTop, 0);
  assert.ok(
    !["auto", "scroll"].includes(middle.overflowY),
    "The effect must use normal window scrolling",
  );
  await page.mouse.move(580, Math.min(700, middle.stickyTop + 180));
  const wheelBefore = await page.evaluate(() => scrollY);
  await page.mouse.wheel({ deltaY: 80 });
  await wait(500);
  assert.ok(
    (await page.evaluate(() => scrollY)) > wheelBefore + 40,
    "Wheel input over the media must move the document",
  );
  await scrollStage(first, 0.52);
  const settled = await sample(first);
  await wait(350);
  const idle = await sample(first);
  assert.equal(idle.animating, "false");
  assert.equal(idle.progress, settled.progress);
  assert.equal(idle.clip, settled.clip);
  report.geometry = {
    start,
    middle,
    end,
    reverse,
    settlesWithoutFurtherChange: true,
    normalWindowWheel: true,
  };

  report.yearNavigation = [];
  for (const year of ["2026", "2023", "2021", "2025", "2024", "2022"]) {
    const index = chapters.findIndex(
      (chapter) => String(chapter.year) === year,
    );
    await page.click(`.journey-route button:nth-of-type(${index + 1})`);
    await wait(300);
    await page.waitForFunction(
      (targetYear) => {
        const article = document.getElementById(`journey-${targetYear}`);
        const expectedTop =
          (parseFloat(getComputedStyle(article).scrollMarginTop) || 0) +
          (parseFloat(
            getComputedStyle(document.documentElement).scrollPaddingTop,
          ) || 0);
        return Math.abs(article.getBoundingClientRect().top - expectedTop) < 5;
      },
      { timeout: 6000 },
      year,
    );
    await wait(150);
    const state = await page.$eval(`#journey-${year}`, (article) => {
      const route = document.querySelector(".journey-route");
      return {
        active: document
          .querySelector('.journey-route button[aria-pressed="true"]')
          ?.textContent.trim(),
        top: article.getBoundingClientRect().top,
        routeBottom: route.getBoundingClientRect().bottom,
        headerBottom: document
          .querySelector(".site-header")
          .getBoundingClientRect().bottom,
      };
    });
    assert.equal(state.active, year, JSON.stringify(state));
    assert.ok(
      state.top >= state.headerBottom - 2,
      `Chapter ${year} must not begin behind the header`,
    );
    assert.ok(
      state.top < 814 * 0.7,
      `Chapter ${year} must be brought into view`,
    );
    report.yearNavigation.push({ year, ...state });
  }

  report.photographs = [];
  for (const chapter of chapters.filter((entry) => photosFor(entry).length)) {
    const expected = photosFor(chapter);
    const article = `#journey-${chapter.year}`;
    await page.$eval(article, (node) =>
      node.scrollIntoView({ block: "start", behavior: "instant" }),
    );
    await wait(200);
    const visited = [];
    for (let index = 0; index < expected.length; index++) {
      await page.waitForFunction(
        (selector, source) => {
          const image = document.querySelector(
            `${selector} .scroll-expand img`,
          );
          return (
            image?.getAttribute("src") === source &&
            image.complete &&
            image.naturalWidth > 0
          );
        },
        { timeout: 10000 },
        article,
        expected[index],
      );
      visited.push(
        await page.$eval(`${article} .scroll-expand img`, (image) =>
          image.getAttribute("src"),
        ),
      );
      await page.click(
        `${article} [aria-label="Next ${chapter.year} photograph"]`,
      );
    }
    assert.deepEqual(visited, expected);
    // The carousel wraps and its labelled caption button opens the existing lightbox.
    await page.waitForFunction(
      (selector, source) =>
        document
          .querySelector(`${selector} .scroll-expand img`)
          ?.getAttribute("src") === source,
      {},
      article,
      expected[0],
    );
    await page.click(`${article} .journey-photo-enlarge`);
    await page.waitForSelector("dialog[open] .lightbox-image");
    assert.equal(
      await page.$eval("dialog[open] .lightbox-image", (image) =>
        image.getAttribute("src"),
      ),
      expected[0],
    );
    await page.keyboard.press("Escape");
    await page.waitForFunction(
      () => !document.querySelector("dialog[open] .lightbox-image"),
    );
    assert.equal(
      await page.$eval(
        `${article} .journey-photo-enlarge`,
        (button) => document.activeElement === button,
      ),
      true,
    );
    report.photographs.push({
      year: chapter.year,
      count: visited.length,
      sources: visited,
      wrapAndLightbox: true,
    });
  }
  assert.equal(
    report.photographs.reduce((sum, entry) => sum + entry.count, 0),
    24,
  );

  const checkStatic = async () => {
    const values = [];
    for (const chapter of chapters.slice(0, 5)) {
      const selector = `#journey-${chapter.year} .scroll-expand`;
      await page.$eval(selector, (node) =>
        node.scrollIntoView({ block: "center", behavior: "instant" }),
      );
      await wait(150);
      values.push(await sample(selector));
    }
    for (const value of values) {
      assert.equal(value.static, "true");
      assert.equal(value.animating, "false");
      assert.ok(
        value.trackHeight <= value.stageHeight + 2,
        "Static mode must remove the expansion's extra scroll distance",
      );
      assert.ok(
        value.horizontalInset < 0.5,
        "Static mode must reveal the complete frame",
      );
    }
    return values;
  };
  await scrollStage(first, 0.5);
  await page.$$eval("footer button", (buttons) =>
    buttons.find((button) => /Pause motion/.test(button.textContent)).click(),
  );
  await page.waitForFunction(
    () => document.documentElement.dataset.calm === "true",
  );
  report.userPausedMotion = await checkStatic();
  await page.$$eval("footer button", (buttons) =>
    buttons.find((button) => /Motion paused/.test(button.textContent)).click(),
  );
  await page.waitForFunction(
    () => document.documentElement.dataset.calm === "false",
  );
  await page.emulateMediaFeatures([
    { name: "prefers-reduced-motion", value: "reduce" },
  ]);
  await page.waitForFunction(
    () => document.documentElement.dataset.calm === "true",
  );
  report.reducedMotion = await checkStatic();

  for (const width of [320, 390, 768, 1165]) {
    for (const theme of ["light", "dark"]) {
      await page.setViewport({ width, height: 844 });
      if ((await page.$eval("html", (node) => node.dataset.theme)) !== theme) {
        await page.click(`[aria-label="Switch to ${theme} mode"]`);
      }
      await page.$eval("#journey-2023", (node) =>
        node.scrollIntoView({ block: "start", behavior: "instant" }),
      );
      await wait(250);
      const layout = await page.evaluate(() => ({
        width: innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        theme: document.documentElement.dataset.theme,
        route: [...document.querySelectorAll(".journey-route button")].map(
          (button) => {
            const box = button.getBoundingClientRect();
            return {
              left: box.left,
              right: box.right,
              width: box.width,
              height: box.height,
            };
          },
        ),
        story: (() => {
          const box = document
            .querySelector("#journey-2023 .journey-stop-intro")
            .getBoundingClientRect();
          return { left: box.left, right: box.right, height: box.height };
        })(),
      }));
      assert.ok(layout.scrollWidth <= width + 1, JSON.stringify(layout));
      assert.equal(layout.theme, theme);
      assert.ok(
        layout.route.every(
          (button) =>
            button.left >= -1 &&
            button.right <= width + 1 &&
            button.height >= 40,
        ),
        "All year controls must remain accessible without horizontal scrolling",
      );
      assert.ok(
        layout.story.left >= 0 &&
          layout.story.right <= width + 1 &&
          layout.story.height > 0,
      );
      report.layouts.push(layout);
      if (width === 390 || width === 1165)
        await page.screenshot({
          path: `quality/scroll-expand-${width}-${theme}.png`,
        });
    }
  }
  await page.setViewport({ width: 844, height: 390 });
  await page.$eval("#journey-2024", (node) =>
    node.scrollIntoView({ block: "start", behavior: "instant" }),
  );
  await wait(250);
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  );
  report.shortLandscape = true;

  // A genuinely new document must resolve its fragment after React mounts it.
  await page.close();
  page = await browser.newPage();
  page.on("pageerror", (error) => report.errors.push(error.message));
  await page.evaluateOnNewDocument(() => {
    localStorage.setItem("mw-theme", "light");
    localStorage.setItem("mw-calm", "false");
  });
  await page.setViewport({ width: 1165, height: 814 });
  await page.emulateMediaFeatures([
    { name: "prefers-reduced-motion", value: "no-preference" },
  ]);
  await page.goto(`${url.split("#")[0]}#journey-2024`, {
    waitUntil: "networkidle0",
  });
  await wait(900);
  const directLink = await page.$eval("#journey-2024", (article) => ({
    top: article.getBoundingClientRect().top,
    bottom: article.getBoundingClientRect().bottom,
    headerBottom: document.querySelector(".site-header").getBoundingClientRect()
      .bottom,
    active: document
      .querySelector('.journey-route button[aria-pressed="true"]')
      ?.textContent.trim(),
  }));
  report.directLink = directLink;
  assert.equal(directLink.active, "2024");
  assert.ok(
    directLink.top >= directLink.headerBottom - 2 && directLink.top < 814 * 0.7,
    JSON.stringify(directLink),
  );
  await page.reload({ waitUntil: "networkidle0" });
  await wait(900);
  assert.equal(
    await page.$eval('.journey-route button[aria-pressed="true"]', (button) =>
      button.textContent.trim(),
    ),
    "2024",
  );
  report.directLink.survivesReload = true;
  assert.deepEqual(report.errors, []);
  report.passed = true;
} catch (error) {
  report.passed = false;
  report.failure = error.stack;
  if (page)
    await page
      .screenshot({ path: "quality/scroll-expand-failure.png" })
      .catch(() => {});
  throw error;
} finally {
  await fs.writeFile(
    "quality/scroll-expand-functional.json",
    JSON.stringify(report, null, 2) + "\n",
  );
  console.log(JSON.stringify(report, null, 2));
  await browser.close();
}
