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
const normalise = (text = "") => text.replace(/\s+/g, " ").trim();
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const readable = (word) =>
  word.opacity > 0.98 &&
  (word.filter === "none" || /blur\(0(?:px)?\)/.test(word.filter));
const url =
  process.env.CONTINUOUS_JOURNEY_TEST_URL ||
  "http://127.0.0.1:4173/?continuous-journey=qa";
const report = {
  scope:
    "One continuous photo frame; each year fills the frame before its story settles fully revealed; complete chapter content and photographs; native scrolling and accessible static layouts",
  errors: [],
  externalFontRequests: [],
  layouts: [],
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
  const newPage = async (width = 1165, height = 814) => {
    const next = await browser.newPage();
    // A loaded machine can take well over the 30 s default to settle this page.
    next.setDefaultNavigationTimeout(90000);
    next.on("pageerror", (error) => report.errors.push(error.message));
    next.on("request", (request) => {
      if (/fonts\.(googleapis|gstatic)\.com/.test(request.url()))
        report.externalFontRequests.push(request.url());
    });
    await next.setViewport({ width, height });
    await next.evaluateOnNewDocument(() => {
      localStorage.setItem("mw-theme", "light");
      localStorage.setItem("mw-calm", "false");
    });
    await next.emulateMediaFeatures([
      { name: "prefers-reduced-motion", value: "no-preference" },
    ]);
    return next;
  };
  page = await newPage();
  await page.goto(url, { waitUntil: "networkidle0" });
  await page.waitForSelector(".journey-cinema[data-active-year]");
  // Freeze automatic cycling while geometry and manual photo controls are tested.
  await page.$eval('[aria-label="Pause timeline photographs"]', (button) =>
    button.click(),
  );

  const content = await page.$$eval(".journey-flow .journey-stop", (articles) =>
    articles.map((article) => {
      const heading = article.querySelector("h3");
      const intro = article.querySelector(".journey-story .scroll-reveal");
      const headingWords = [
        ...(heading?.querySelectorAll(".masked-heading__word") || []),
      ];
      return {
        id: article.id,
        title:
          heading?.getAttribute("aria-label") ||
          heading?.querySelector(".sr-only")?.textContent ||
          (headingWords.length
            ? headingWords.map((word) => word.textContent).join(" ")
            : heading?.textContent),
        intro:
          intro?.querySelector(".sr-only")?.textContent || intro?.textContent,
        details: [...article.querySelectorAll(".journey-story li")].map(
          (item) => item.textContent,
        ),
        yearBeforeStory: !!(
          article
            .querySelector(".journey-year-sheet")
            ?.compareDocumentPosition(article.querySelector(".journey-story")) &
          Node.DOCUMENT_POSITION_FOLLOWING
        ),
        storyInsidePinnedMedia: !!article.closest(".journey-media-pin"),
      };
    }),
  );
  assert.equal(content.length, 6);
  assert.equal(
    content.reduce((sum, chapter) => sum + chapter.details.length, 0),
    18,
  );
  content.forEach((actual, index) => {
    const expected = chapters[index];
    assert.equal(actual.id, `journey-${expected.year}`);
    assert.equal(normalise(actual.title), normalise(expected.title));
    assert.equal(normalise(actual.intro), normalise(expected.intro));
    assert.deepEqual(
      actual.details.map(normalise),
      expected.details.map(normalise),
    );
    assert.equal(
      actual.yearBeforeStory,
      true,
      `The ${expected.year} year sheet precedes its description`,
    );
    assert.equal(
      actual.storyInsidePinnedMedia,
      false,
      "Stories remain outside the shared photo frame",
    );
  });
  assert.equal(
    await page.$$eval(".journey-media-pin", (nodes) => nodes.length),
    1,
  );
  assert.equal(
    await page.$$eval("#timeline .scroll-expand", (nodes) => nodes.length),
    1,
  );
  assert.equal(
    await page.$$eval(
      ".journey-story h3.masked-heading",
      (nodes) => nodes.length,
    ),
    6,
  );
  report.content = {
    chapters: 6,
    achievementBullets: 18,
    yearBeforeEveryStory: true,
    singlePinnedStage: true,
    imageMaskedHeadings: 6,
  };
  assert.equal(
    await page.$$eval(".journey-stop", (articles) =>
      articles.reduce(
        (sum, article) => sum + Number(article.dataset.photoCount),
        0,
      ),
    ),
    24,
  );

  const pinHandle = await page.$(".journey-media-pin");
  const stageSample = () =>
    page.$eval(".journey-cinema", (cinema) => {
      const pin = cinema.querySelector(".journey-media-pin");
      const expand = cinema.querySelector(".scroll-expand");
      const frame = cinema.querySelector(".scroll-expand__frame");
      const clip = frame ? getComputedStyle(frame).clipPath : "none";
      const numbers = (clip.split("round")[0].match(/-?\d*\.?\d+/g) || []).map(
        Number,
      );
      const pinBox = pin.getBoundingClientRect();
      return {
        year: cinema.dataset.activeYear,
        photoIndex: Number(cinema.dataset.photoIndex),
        progress: Number(expand?.dataset.progress),
        static: expand?.dataset.static,
        clip,
        horizontalInset: numbers[1] ?? numbers[0] ?? 0,
        pin: {
          top: pinBox.top,
          width: pinBox.width,
          height: pinBox.height,
          position: getComputedStyle(pin).position,
        },
        layers: [...cinema.querySelectorAll(".journey-photo-layer")].map(
          (layer) => ({
            active: layer.classList.contains("is-active"),
            opacity: Number(getComputedStyle(layer).opacity),
            source:
              layer.querySelector("img")?.getAttribute("src") ||
              (layer.matches("img") ? layer.getAttribute("src") : null),
            loaded: (() => {
              const image = layer.matches("img")
                ? layer
                : layer.querySelector("img");
              return !image || (image.complete && image.naturalWidth > 0);
            })(),
          }),
        ),
        scrollY,
      };
    });
  // The first year sits inside the opening frame and grows with it.
  const openingYear = () =>
    page.$eval("#journey-2021", (stop) => {
      const cinema = stop.closest(".journey-cinema");
      const pin = cinema
        .querySelector(".journey-media-pin")
        .getBoundingClientRect();
      const frame = cinema.querySelector(".scroll-expand__frame");
      const numbers = (
        getComputedStyle(frame)
          .clipPath.split("round")[0]
          .match(/-?\d*\.?\d+/g) || []
      ).map(Number);
      const inset = numbers[1] ?? numbers[0] ?? 0;
      const letters = [
        ...stop.querySelectorAll(".variable-proximity__letter"),
      ].map((letter) => letter.getBoundingClientRect());
      return {
        scale: new DOMMatrixReadOnly(
          getComputedStyle(stop.querySelector(".journey-year-fit")).transform,
        ).a,
        left: Math.min(...letters.map((box) => box.left)),
        right: Math.max(...letters.map((box) => box.right)),
        frameLeft: pin.left + (pin.width * inset) / 100,
        frameRight: pin.right - (pin.width * inset) / 100,
      };
    });
  const align = async (selector, viewportTop) => {
    await page.$eval(
      selector,
      (node, top) =>
        scrollTo({
          top: scrollY + node.getBoundingClientRect().top - top,
          behavior: "instant",
        }),
      viewportTop,
    );
    await wait(650);
  };
  // Scrolls to a chapter position, measured in stage heights after its scene settles.
  const chapterAt = async (year, units, settle = 1500) => {
    await page.evaluate(
      ({ year, units }) => {
        const stop = document.getElementById(`journey-${year}`);
        const section = stop.closest(".journey-continuous");
        const top = parseFloat(
          getComputedStyle(section).getPropertyValue("--journey-pinned-top"),
        );
        const stage = section
          .querySelector(".journey-media-pin")
          .getBoundingClientRect().height;
        scrollTo({
          top: scrollY + stop.getBoundingClientRect().top - top + units * stage,
          behavior: "instant",
        });
      },
      { year, units },
    );
    await wait(settle);
  };
  const chapterState = (year) =>
    page.$eval(`#journey-${year}`, (stop) => {
      const section = stop.closest(".journey-continuous");
      const pin = section
        .querySelector(".journey-media-pin")
        .getBoundingClientRect();
      const consoleBox = section
        .querySelector(".journey-photo-console")
        ?.getBoundingClientRect();
      const copy = stop.querySelector(".journey-story-copy");
      const copyBox = copy.getBoundingClientRect();
      const heading = stop.querySelector(".journey-story .masked-heading");
      const letters = [
        ...stop.querySelectorAll(".variable-proximity__letter"),
      ].map((letter) => letter.getBoundingClientRect());
      const left = Math.min(...letters.map((box) => box.left));
      const right = Math.max(...letters.map((box) => box.right));
      return {
        yearOpacity: Number(
          getComputedStyle(stop.querySelector(".journey-year-content")).opacity,
        ),
        storyOpacity: Number(getComputedStyle(copy).opacity),
        yearWidthRatio: (right - left) / pin.width,
        yearInsideFrame: left >= pin.left - 1 && right <= pin.right + 1,
        sheetTop: stop
          .querySelector(".journey-year-sheet")
          .getBoundingClientRect().top,
        storyTop: stop.querySelector(".journey-story").getBoundingClientRect()
          .top,
        stageTop: pin.top,
        copy: { top: copyBox.top, bottom: copyBox.bottom },
        consoleTop: consoleBox?.top ?? pin.bottom,
        headingMotion: heading.dataset.motionActive,
        headingReady: heading.dataset.mediaReady,
        words: [
          ...stop.querySelectorAll(".journey-story .scroll-reveal .word"),
        ].map((word) => ({
          opacity: Number(getComputedStyle(word).opacity),
          filter: getComputedStyle(word).filter,
        })),
      };
    });

  const pinTop = await page.$eval(
    ".journey-media-pin",
    (pin) => parseFloat(getComputedStyle(pin).top) || 0,
  );
  const initialStageHeight = await page.$eval(
    ".journey-media-pin",
    (pin) => pin.getBoundingClientRect().height,
  );
  await align(".journey-cinema", pinTop + initialStageHeight * 0.25);
  const opening = [await stageSample()];
  const openingYears = [await openingYear()];
  for (let index = 0; index < 8 && opening.at(-1).progress < 0.99; index++) {
    await page.evaluate(() =>
      scrollBy({ top: innerHeight * 0.2, behavior: "instant" }),
    );
    await wait(650);
    opening.push(await stageSample());
    openingYears.push(await openingYear());
  }
  assert.ok(opening[0].progress < 0.2, JSON.stringify(opening[0]));
  assert.ok(
    opening.at(-1).progress > 0.98,
    "The initial opening must complete",
  );
  assert.ok(
    opening[0].horizontalInset > opening.at(-1).horizontalInset + 5,
    "The actual media frame must expand, not only its progress marker",
  );
  assert.equal(opening.at(-1).pin.position, "sticky");
  assert.ok(
    openingYears[0].scale < 0.8 &&
      openingYears[0].left >= openingYears[0].frameLeft - 2 &&
      openingYears[0].right <= openingYears[0].frameRight + 2,
    `The first year starts inside the opening frame: ${JSON.stringify(openingYears[0])}`,
  );
  assert.ok(
    openingYears.at(-1).scale > 0.98,
    "The first year expands with the frame",
  );
  await page.screenshot({ path: "quality/continuous-journey-opening.png" });
  report.opening = opening;
  report.openingYear = openingYears;

  report.choreography = [];
  for (const year of ["2022", "2025"]) {
    await chapterAt(year, -0.4, 900);
    await chapterAt(year, 0.5);
    const yearHold = await chapterState(year);
    if (year === "2022")
      await page.screenshot({ path: "quality/continuous-journey-year.png" });
    await chapterAt(year, 0.95, 1100);
    const entering = await chapterState(year);
    await chapterAt(year, 1.78, 1800);
    const storyHold = await chapterState(year);
    if (year === "2022")
      await page.screenshot({ path: "quality/continuous-journey-story.png" });
    assert.ok(
      yearHold.yearOpacity > 0.9 && yearHold.storyOpacity < 0.05,
      `${year}: the year holds the frame on its own ${JSON.stringify(yearHold)}`,
    );
    assert.ok(
      Math.abs(yearHold.sheetTop - yearHold.stageTop) < 3,
      `${year}: the year settles inside the frame`,
    );
    assert.ok(
      yearHold.yearWidthRatio > 0.7 && yearHold.yearInsideFrame,
      `${year}: the year fills the frame without leaving it`,
    );
    assert.ok(
      storyHold.storyOpacity > 0.98 && storyHold.yearOpacity < 0.05,
      `${year}: the story replaces the year ${JSON.stringify(storyHold)}`,
    );
    assert.ok(
      Math.abs(storyHold.storyTop - storyHold.stageTop) < 3,
      `${year}: the story holds inside the frame`,
    );
    assert.ok(
      storyHold.words.length > 5 && storyHold.words.every(readable),
      `${year}: the whole description is revealed during the hold`,
    );
    assert.ok(
      storyHold.copy.top >= storyHold.stageTop - 1 &&
        storyHold.copy.bottom <= storyHold.consoleTop + 1,
      `${year}: the revealed story fits above the photo console ${JSON.stringify(storyHold.copy)}`,
    );
    assert.ok(
      entering.words.some(
        (word, index) => word.opacity < storyHold.words[index].opacity - 0.1,
      ),
      `${year}: word reveal responds to real scroll progress`,
    );
    assert.equal(storyHold.headingMotion, "true");
    assert.equal(storyHold.headingReady, "true");
    const { words: holdWords, ...holdSummary } = storyHold;
    const { words: enteringWords, ...enteringSummary } = entering;
    const { words: yearWords, ...yearSummary } = yearHold;
    report.choreography.push({
      year,
      yearHold: yearSummary,
      entering: {
        ...enteringSummary,
        wordOpacity: enteringWords.map((word) => word.opacity),
      },
      storyHold: { ...holdSummary, wordCount: holdWords.length },
    });
  }

  // Scroll velocity displaces the settled story, which springs back at rest.
  await chapterAt("2025", 1.6, 1800);
  await page.mouse.move(700, 480);
  const readDrag = () =>
    page.$eval(
      "#journey-2025 .journey-story-drag",
      (node) => new DOMMatrixReadOnly(getComputedStyle(node).transform).m42,
    );
  const dragSamples = [];
  for (let index = 0; index < 6; index++) {
    await page.mouse.wheel({ deltaY: 80 });
    await wait(30);
    dragSamples.push(await readDrag());
  }
  await wait(2000);
  const dragRest = await readDrag();
  assert.ok(
    Math.max(...dragSamples.map(Math.abs)) > 2,
    `A scroll gesture gives the story a slight drag ${JSON.stringify(dragSamples)}`,
  );
  assert.ok(
    Math.abs(dragRest) < 0.75,
    `The story springs back at rest (${dragRest})`,
  );
  report.drag = { samples: dragSamples, rest: dragRest };

  // Pointer proximity thickens the year numerals, then settles back to rest.
  await chapterAt("2023", -0.4, 900);
  await chapterAt("2023", 0.5);
  // The years use the local Roboto Flex digits, never a remote font service.
  const yearFont = await page.evaluate(async () => {
    await document.fonts.load('100px "Roboto Flex"', "2023");
    const letter = document.querySelector(
      "#journey-2023 .variable-proximity__letter",
    );
    return {
      family: getComputedStyle(letter).fontFamily,
      loaded: document.fonts.check('100px "Roboto Flex"', "2023"),
      faces: [...document.fonts]
        .filter((face) => face.family.replace(/["']/g, "") === "Roboto Flex")
        .map((face) => face.status),
    };
  });
  assert.ok(
    /^"?Roboto Flex/.test(yearFont.family) &&
      yearFont.loaded &&
      yearFont.faces.includes("loaded"),
    `The years render in local Roboto Flex ${JSON.stringify(yearFont)}`,
  );
  const variations = () =>
    page.$$eval("#journey-2023 .variable-proximity__letter", (letters) =>
      letters.map((letter) => {
        const settings = letter.style.fontVariationSettings;
        const axis = (tag) =>
          Number(
            new RegExp(`["']${tag}["']\\s+([\\d.]+)`).exec(settings)?.[1] ??
              NaN,
          );
        return { wght: axis("wght"), opsz: axis("opsz") };
      }),
    );
  const digits = await page.$$("#journey-2023 .variable-proximity__letter");
  const target = await digits[1].boundingBox();
  await page.mouse.move(
    target.x + target.width / 2,
    target.y + target.height / 2,
    { steps: 8 },
  );
  await wait(900);
  const hovered = await variations();
  await page.mouse.move(8, 400, { steps: 6 });
  await wait(1200);
  const rested = await variations();
  assert.ok(
    hovered[1].wght > 900 &&
      hovered[1].opsz > 30 &&
      hovered[1].wght > hovered[3].wght + 100,
    `The hovered numeral moves towards 'wght' 1000, 'opsz' 40 ${JSON.stringify(hovered)}`,
  );
  assert.ok(
    rested.every(
      (value) =>
        Math.abs(value.wght - 400) < 2 && Math.abs(value.opsz - 9) < 0.5,
    ),
    `Numerals return to 'wght' 400, 'opsz' 9 ${JSON.stringify(rested)}`,
  );
  report.variableProximity = { font: yearFont, hovered, rested };

  const activateYear = async (year, keyboard = false) => {
    const index = chapters.findIndex(
      (chapter) => String(chapter.year) === String(year),
    );
    const button = `.journey-route button:nth-of-type(${index + 1})`;
    if (keyboard) {
      await page.focus(button);
      await page.keyboard.press("Enter");
    } else await page.click(button);
    await wait(900);
    await page.waitForFunction(
      (expected) =>
        document.querySelector(".journey-cinema")?.dataset.activeYear ===
        String(expected),
      { timeout: 8000 },
      year,
    );
    await wait(200);
  };
  report.continuity = [];
  for (const year of ["2022", "2023", "2024", "2025", "2026", "2023"]) {
    await activateYear(year, year === "2024");
    const snapshot = await stageSample();
    report.continuity.push(snapshot);
    assert.equal(
      await page.evaluate(
        (original) =>
          original === document.querySelector(".journey-media-pin") &&
          original.isConnected,
        pinHandle,
      ),
      true,
      "A year change must keep the same shared stage",
    );
    assert.ok(
      snapshot.progress > 0.98 && snapshot.horizontalInset < 0.1,
      `The stage must remain fully open in ${year}`,
    );
    assert.equal(
      await page.$eval('.journey-route button[aria-pressed="true"]', (button) =>
        button.textContent.trim(),
      ),
      year,
    );
    if (year !== "2026")
      assert.ok(
        snapshot.layers.some(
          (layer) => layer.active && layer.loaded && layer.opacity > 0.5,
        ),
        `The ${year} photograph must be visible`,
      );
    else
      assert.ok(
        snapshot.layers.every((layer) => !layer.source || layer.opacity < 0.01),
        "The undated 2026 chapter must not present an older photograph as current",
      );
    await wait(1200);
    const landed = await chapterState(year);
    assert.ok(
      landed.yearOpacity > 0.9 &&
        Math.abs(landed.sheetTop - landed.stageTop) < 3,
      `A year shortcut lands while ${year} fills the frame ${JSON.stringify({ ...landed, words: undefined })}`,
    );
  }

  const visibleControl = async (label) => {
    const controls = await page.$$(`[aria-label="${label}"]`);
    for (const control of controls)
      if (await control.boundingBox()) return control;
    throw new Error(`No visible control labelled ${label}`);
  };
  const activeSource = () =>
    page.$eval(".journey-photo-layer.is-active", (layer) =>
      (layer.matches("img") ? layer : layer.querySelector("img"))?.getAttribute(
        "src",
      ),
    );
  report.photographs = [];
  for (const chapter of chapters.filter(
    (chapter) => photosFor(chapter).length,
  )) {
    await activateYear(chapter.year);
    const expected = photosFor(chapter);
    const sources = [];
    for (let index = 0; index < expected.length; index++) {
      await page.waitForFunction(
        (source) => {
          const layer = document.querySelector(
            ".journey-photo-layer.is-active",
          );
          const image = layer?.matches("img")
            ? layer
            : layer?.querySelector("img");
          return (
            image?.getAttribute("src") === source &&
            image.complete &&
            image.naturalWidth > 0
          );
        },
        { timeout: 10000 },
        expected[index],
      );
      sources.push(await activeSource());
      const before = await stageSample();
      const next = await visibleControl(`Next ${chapter.year} photograph`);
      await next.click();
      if (chapter.year === "2021" && index === 0) {
        await wait(100);
        const transitioning = await stageSample();
        await wait(650);
        const after = await stageSample();
        assert.ok(
          transitioning.layers.some(
            (layer) => layer.loaded && layer.opacity > 0.05,
          ),
          "Crossfade must never expose a blank background",
        );
        assert.notDeepEqual(
          before.layers
            .filter((layer) => layer.active)
            .map((layer) => layer.source),
          after.layers
            .filter((layer) => layer.active)
            .map((layer) => layer.source),
        );
        assert.ok(
          after.progress >= before.progress - 0.01,
          "Manual photo changes must not restart the opening",
        );
        report.crossfade = { before, transitioning, after };
      }
    }
    assert.deepEqual(sources, expected);
    await page.waitForFunction(
      (source) =>
        document.querySelector(".journey-photo-layer.is-active")?.dataset
          .src === source,
      { timeout: 5000 },
      expected[0],
    );
    assert.equal(await activeSource(), expected[0]);
    const enlarge = await visibleControl(
      `Enlarge photograph: ${gallery.find((row) => row.images.includes(expected[0])).title}`,
    );
    await enlarge.focus();
    await page.keyboard.press("Enter");
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
      await page.evaluate(
        (button) => document.activeElement === button,
        enlarge,
      ),
      true,
    );
    report.photographs.push({
      year: chapter.year,
      count: sources.length,
      sources,
      keyboardLightboxAndFocusReturn: true,
    });
  }
  assert.equal(
    report.photographs.reduce((sum, chapter) => sum + chapter.count, 0),
    24,
  );

  await activateYear("2023");
  await page.mouse.move(600, 500);
  const beforeWheel = await page.evaluate(() => scrollY);
  await page.mouse.wheel({ deltaY: 120 });
  await wait(400);
  assert.ok((await page.evaluate(() => scrollY)) > beforeWheel + 70);
  await page.$eval("body", (body) => {
    if (!body.hasAttribute("tabindex")) body.tabIndex = -1;
    body.focus();
  });
  const beforePageDown = await page.evaluate(() => scrollY);
  await page.keyboard.press("PageDown");
  await wait(600);
  assert.ok((await page.evaluate(() => scrollY)) > beforePageDown + 100);
  report.nativeScroll = { wheel: true, pageDown: true };

  await align("#contact", 100);
  const offscreenHeadings = await page.$$eval(
    ".journey-story .masked-heading",
    (headings) => headings.map((heading) => heading.dataset.motionActive),
  );
  assert.ok(offscreenHeadings.every((active) => active === "false"));
  report.offscreenHeadingMotionStopped = true;

  const checkStatic = async (reason) => {
    const staticState = await page.evaluate(() => ({
      cinema: document.querySelector(".journey-cinema")?.dataset,
      pins: [...document.querySelectorAll(".journey-media-pin")].map((pin) => ({
        position: getComputedStyle(pin).position,
        display: getComputedStyle(pin).display,
      })),
      words: [
        ...document.querySelectorAll(".journey-story .scroll-reveal .word"),
      ].map((word) => ({
        opacity: Number(getComputedStyle(word).opacity),
        filter: getComputedStyle(word).filter,
      })),
      stories: [...document.querySelectorAll(".journey-story-copy")].map(
        (copy) => Number(getComputedStyle(copy).opacity),
      ),
      chapters: document.querySelectorAll(".journey-stop").length,
      details: document.querySelectorAll(".journey-story li").length,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    assert.ok(
      staticState.pins.every(
        (pin) => pin.position !== "sticky" || pin.display === "none",
      ),
      `${reason} must disable the pinned stage`,
    );
    assert.ok(
      staticState.words.every(readable),
      `${reason} keeps every description readable`,
    );
    assert.ok(
      staticState.stories.every((opacity) => opacity > 0.98),
      `${reason} shows every story`,
    );
    assert.equal(staticState.chapters, 6);
    assert.equal(staticState.details, 18);
    return { reason, ...staticState };
  };
  await page.$$eval("footer button", (buttons) =>
    buttons.find((button) => /Pause motion/.test(button.textContent)).click(),
  );
  await page.waitForFunction(
    () => document.documentElement.dataset.calm === "true",
  );
  await wait(350);
  report.userCalm = await checkStatic("User paused motion");
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
  await wait(350);
  report.reducedMotion = await checkStatic("OS reduced motion");
  await page.emulateMediaFeatures([
    { name: "prefers-reduced-motion", value: "no-preference" },
  ]);
  await page.waitForFunction(
    () => document.documentElement.dataset.calm === "false",
  );

  for (const size of [
    { width: 320, height: 568, static: true },
    { width: 390, height: 844, static: false },
    { width: 768, height: 844, static: false },
    { width: 1165, height: 814, static: false },
    { width: 844, height: 390, static: true },
  ]) {
    await page.setViewport(size);
    await wait(350);
    for (const theme of ["light", "dark"]) {
      if ((await page.$eval("html", (html) => html.dataset.theme)) !== theme)
        await page.click(`[aria-label="Switch to ${theme} mode"]`);
      await activateYear("2023");
      const layout = await page.evaluate(() => ({
        width: innerWidth,
        height: innerHeight,
        theme: document.documentElement.dataset.theme,
        scrollWidth: document.documentElement.scrollWidth,
        route: [...document.querySelectorAll(".journey-route button")].map(
          (button) => {
            const box = button.getBoundingClientRect();
            return { left: box.left, right: box.right, height: box.height };
          },
        ),
        story: (() => {
          const box = document
            .querySelector("#journey-2023 .journey-story")
            .getBoundingClientRect();
          return { left: box.left, right: box.right, height: box.height };
        })(),
        pin: (() => {
          const node = document.querySelector(".journey-media-pin");
          return node
            ? {
                position: getComputedStyle(node).position,
                display: getComputedStyle(node).display,
              }
            : null;
        })(),
      }));
      assert.ok(layout.scrollWidth <= size.width + 1, JSON.stringify(layout));
      assert.ok(
        layout.route.every(
          (button) =>
            button.left >= -1 &&
            button.right <= size.width + 1 &&
            button.height >= 40,
        ),
      );
      assert.ok(
        layout.story.left >= -1 &&
          layout.story.right <= size.width + 1 &&
          layout.story.height > 0,
      );
      if (size.static) await checkStatic(`${size.width}×${size.height}`);
      else {
        assert.equal(
          layout.pin?.position,
          "sticky",
          `${size.width}px retains the continuous experience`,
        );
        await chapterAt("2023", 1.78, 1800);
        const fitted = await chapterState("2023");
        assert.ok(
          fitted.words.every(readable) &&
            fitted.copy.top >= fitted.stageTop - 1 &&
            fitted.copy.bottom <= fitted.consoleTop + 1,
          `${size.width}px fits the revealed story above the console ${JSON.stringify(fitted.copy)} / ${fitted.stageTop}-${fitted.consoleTop}`,
        );
        layout.storyFits = true;
      }
      report.layouts.push(layout);
      if ([320, 390, 1165].includes(size.width))
        await page.screenshot({
          path: `quality/continuous-journey-${size.width}-${theme}.png`,
        });
    }
  }

  await page.setViewport({ width: 1165, height: 814 });
  const session = await page.createCDPSession();
  await session.send("Emulation.setEmulatedMedia", {
    features: [{ name: "forced-colors", value: "active" }],
  });
  await wait(250);
  const forcedColours = await page.$$eval(
    ".journey-story .masked-heading__measure",
    (nodes) =>
      nodes.map((node) => ({
        colour: getComputedStyle(node).color,
        opacity: Number(getComputedStyle(node).opacity),
        text: node.textContent.trim(),
      })),
  );
  assert.equal(forcedColours.length, 6);
  assert.ok(
    forcedColours.every(
      (heading) =>
        heading.text &&
        heading.opacity > 0.98 &&
        !["transparent", "rgba(0, 0, 0, 0)"].includes(heading.colour),
    ),
  );
  report.forcedColourHeadingsReadable = true;
  await session.detach();

  // A brand-new page catches fragment lookup before React creates its chapters.
  await page.close();
  page = await newPage();
  await page.goto(`${url}#journey-2024`, { waitUntil: "networkidle0" });
  await wait(1800);
  const directLink = () =>
    page.$eval("#journey-2024", (article) => {
      const section = article.closest(".journey-continuous");
      return {
        active: section.querySelector(".journey-cinema").dataset.activeYear,
        sheetTop: article
          .querySelector(".journey-year-sheet")
          .getBoundingClientRect().top,
        stageTop: section
          .querySelector(".journey-media-pin")
          .getBoundingClientRect().top,
        yearOpacity: Number(
          getComputedStyle(article.querySelector(".journey-year-content"))
            .opacity,
        ),
        headerBottom: document
          .querySelector(".site-header")
          .getBoundingClientRect().bottom,
      };
    });
  const anchor = await directLink();
  report.directLink = anchor;
  assert.equal(anchor.active, "2024");
  assert.ok(
    Math.abs(anchor.sheetTop - anchor.stageTop) < 3 &&
      anchor.stageTop >= anchor.headerBottom - 2 &&
      anchor.yearOpacity > 0.9,
    JSON.stringify(anchor),
  );
  await page.reload({ waitUntil: "networkidle0" });
  await wait(1800);
  assert.equal((await directLink()).active, "2024");
  report.directLink.survivesReload = true;
  assert.deepEqual(report.errors, []);
  assert.deepEqual(report.externalFontRequests, []);
  report.passed = true;
} catch (error) {
  report.passed = false;
  report.failure = error.stack;
  if (page)
    await page
      .screenshot({ path: "quality/continuous-journey-failure.png" })
      .catch(() => {});
  throw error;
} finally {
  await fs.writeFile(
    "quality/continuous-journey-functional.json",
    JSON.stringify(report, null, 2) + "\n",
  );
  console.log(
    JSON.stringify(
      {
        passed: report.passed,
        failure: report.failure?.split("\n").slice(0, 6).join("\n"),
        errors: report.errors,
        openingYear: report.openingYear?.map((sample) => sample.scale),
        choreography: report.choreography,
        drag: report.drag,
        variableProximity: report.variableProximity,
        directLink: report.directLink,
      },
      null,
      2,
    ),
  );
  await browser.close();
}
