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
    process.env.IMPACT_TEST_URL || "http://127.0.0.1:4173/?impact=1#home",
  );
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const open = async () => {
    await page.click(".degree-link");
    await page.waitForFunction(
      () => document.querySelector("#impact-note").open,
    );
    await wait(1300);
  };
  const closed = () =>
    page.waitForFunction(() => !document.querySelector("#impact-note").open);
  assert.equal(
    await page.$eval(".hero-intro", (e) =>
      e.textContent.replace(/\s+/g, " ").trim(),
    ),
    "I'm Mun Wai, Applied Science (Psychology) Graduate. Build with AI. Grow with People. Love Innovation.",
  );
  report.exactIntroduction = true;
  await page.hover(".degree-link");
  assert.equal(
    await page.$eval(
      ".degree-link path",
      (e) => getComputedStyle(e).animationName,
    ),
    "degree-underline",
  );
  report.penUnderline = true;
  await wait(800);
  await page.screenshot({ path: "quality/impact-trigger.png" });
  const original = await page.evaluate(() => ({
    scroll: scrollY,
    theme: document.documentElement.dataset.theme,
  }));
  await open();
  assert.equal(
    await page.evaluate(() => document.activeElement.className),
    "impact-close",
  );
  assert.equal(
    await page.evaluate(() => document.body.style.overflow),
    "hidden",
  );
  assert.ok(
    await page.evaluate(() =>
      document.documentElement.classList.contains("impact-open"),
    ),
  );
  const firstPortrait = await page.$eval(
    ".hero-photo-window img",
    (e) => e.src,
  );
  await wait(8300);
  assert.equal(
    await page.$eval(".hero-photo-window img", (e) => e.src),
    firstPortrait,
  );
  report.backgroundAlbumSuspended = true;
  report.lightBackdrop = await page.$eval("#impact-note", (e) => ({
    background: getComputedStyle(e, "::backdrop").backgroundColor,
    blur: getComputedStyle(e, "::backdrop").backdropFilter,
  }));
  assert.ok(report.lightBackdrop.blur.includes("blur"));
  await page.screenshot({ path: "quality/impact-light.png" });
  report.contributions = [];
  const expectedWork = [
    { name: "Career OS", result: "deployed hackathon MVP", title: "Career OS" },
    {
      name: "VTAC",
      result: "design proposal presented to stakeholders",
      title: "A clearer path to university",
    },
    {
      name: "RMIT CIAIRI",
      result: "Research for ADOPTIC",
      title: "Why good ideas get adopted",
    },
    {
      name: "UNIQLO Malaysia HQ",
      result: "Store development within a 60+ store network",
    },
  ];
  const count = await page.$$eval(".impact-work-list button", (e) => e.length);
  assert.equal(count, expectedWork.length);
  for (let i = 0; i < count; i++) {
    await page.$$eval(
      ".impact-work-list button",
      (buttons, index) => buttons[index].click(),
      i,
    );
    const panel = await page.$eval("#impact-work-detail", (e) => ({
      name: e.getAttribute("aria-label"),
      result: e.querySelector(".impact-result strong").textContent,
      scope: e.querySelector(".impact-result p").textContent,
    }));
    report.contributions.push(panel);
    assert.equal(panel.name, expectedWork[i].name);
    assert.ok(panel.result.includes(expectedWork[i].result));
    assert.equal(
      await page.$$eval(
        '.impact-work-list button[aria-pressed="true"]',
        (buttons) => buttons.length,
      ),
      1,
    );
  }
  assert.ok(report.contributions[0].scope.includes("not been established"));
  assert.ok(report.contributions[1].scope.includes("team design project"));
  assert.ok(report.contributions[2].scope.includes("wider research team"));
  assert.ok(report.contributions[3].scope.includes("shared"));
  assert.equal(await page.$eval(".impact-context", (e) => e.open), false);
  await page.click(".impact-context summary");
  assert.equal(await page.$eval(".impact-context", (e) => e.open), true);
  assert.ok(
    await page.$eval(
      ".impact-context",
      (e) =>
        e.textContent.includes("economics") ||
        e.textContent.includes("Economics"),
    ),
  );
  await page.click(".impact-context summary");
  report.widerPerspectiveExpandable = true;
  await page.$eval(".impact-close", (e) => e.focus());
  await page.keyboard.down("Shift");
  await page.keyboard.press("Tab");
  await page.keyboard.up("Shift");
  assert.ok(
    await page.evaluate(() =>
      document.querySelector("#impact-note").contains(document.activeElement),
    ),
  );
  await page.keyboard.press("Tab");
  assert.equal(
    await page.evaluate(() => document.activeElement.className),
    "impact-close",
  );
  report.focusContained = true;
  await page.addScriptTag({ path: "node_modules/axe-core/axe.min.js" });
  report.accessibility = {};
  report.accessibility.light = await page.evaluate(async () =>
    (
      await window.axe.run(document.querySelector("#impact-note"))
    ).violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => n.target),
    })),
  );
  await page.keyboard.press("Escape");
  await closed();
  assert.equal(
    await page.evaluate(() => document.activeElement.className),
    "degree-link",
  );
  assert.equal(await page.evaluate(() => document.body.style.overflow), "");
  assert.equal(await page.evaluate(() => scrollY), original.scroll);
  assert.equal(
    await page.evaluate(() => document.documentElement.dataset.theme),
    original.theme,
  );
  report.escapeRestoresPage = true;
  report.evidenceNavigation = [];
  for (let i = 0; i < expectedWork.length; i++) {
    await open();
    await page.$$eval(
      ".impact-work-list button",
      (buttons, index) => buttons[index].click(),
      i,
    );
    await page.click(".impact-evidence-link");
    await closed();
    if (expectedWork[i].title) {
      await page.waitForSelector("dialog[open] #dialog-title");
      assert.ok(
        await page.$eval(
          "#dialog-title",
          (e, title) => e.textContent.includes(title),
          expectedWork[i].title,
        ),
      );
      assert.equal(await page.$$eval("dialog[open]", (e) => e.length), 1);
      assert.equal(
        await page.evaluate(() => document.body.style.overflow),
        "hidden",
      );
      await page.keyboard.press("Escape");
      await page.waitForFunction(() => !document.querySelector("dialog[open]"));
      assert.equal(
        await page.evaluate(() => document.activeElement.className),
        "degree-link",
      );
      assert.equal(await page.evaluate(() => document.body.style.overflow), "");
    } else {
      await page.waitForFunction(() => {
        const role = document.getElementById("experience-uniqlo");
        const box = role.getBoundingClientRect();
        return role.open && box.top >= 0 && box.bottom <= innerHeight;
      });
      assert.equal(await page.evaluate(() => location.hash), "#experience");
      assert.ok(
        await page.$eval(
          "#experience-uniqlo summary",
          (e) => document.activeElement === e,
        ),
      );
      assert.equal(await page.$$eval("dialog[open]", (e) => e.length), 0);
      await page.evaluate((top) => {
        history.replaceState(null, "", "#home");
        scrollTo({ top, behavior: "instant" });
      }, original.scroll);
    }
    report.evidenceNavigation.push(expectedWork[i].name);
  }
  await page.click(".theme-button");
  await open();
  report.darkBackdrop = await page.$eval(
    "#impact-note",
    (e) => getComputedStyle(e, "::backdrop").backgroundColor,
  );
  assert.notEqual(report.darkBackdrop, report.lightBackdrop.background);
  await page.screenshot({ path: "quality/impact-dark.png" });
  report.accessibility.dark = await page.evaluate(async () =>
    (
      await window.axe.run(document.querySelector("#impact-note"))
    ).violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => n.target),
    })),
  );
  await page.mouse.click(3, 3);
  await closed();
  report.backdropDismissal = true;
  report.widths = [];
  for (const width of [320, 390, 768, 1165]) {
    await page.setViewport({ width, height: 844 });
    await open();
    const sizes = await page.$eval("#impact-note", (e) => ({
      width: innerWidth,
      page: document.documentElement.scrollWidth,
      client: e.clientWidth,
      scroll: e.scrollWidth,
    }));
    report.widths.push(sizes);
    assert.ok(sizes.page <= width);
    assert.equal(sizes.client, sizes.scroll);
    // Every contribution and its action remain reachable on narrow screens.
    for (let i = 0; i < expectedWork.length; i++) {
      const buttons = await page.$$(".impact-work-list button");
      await buttons[i].click();
      assert.equal(
        await page.$eval("#impact-work-detail", (e) =>
          e.getAttribute("aria-label"),
        ),
        expectedWork[i].name,
      );
    }
    if (width === 390) {
      await page.$eval(".impact-work-list button", (e) => e.click());
      await page.$eval("#impact-note", (e) => (e.scrollTop = 0));
      await page.screenshot({ path: "quality/impact-mobile.png" });
      await page.$eval("#impact-work-detail", (e) =>
        e.scrollIntoView({ block: "center" }),
      );
      await wait(250);
      await page.screenshot({ path: "quality/impact-mobile-detail.png" });
    }
    await page.click(".impact-close");
    await closed();
  }
  await page.emulateMediaFeatures([
    { name: "prefers-reduced-motion", value: "reduce" },
  ]);
  await open();
  assert.equal(
    await page.$eval("#impact-note", (e) => getComputedStyle(e).animationName),
    "none",
  );
  await page.click(".impact-close");
  await closed();
  report.reducedMotion = true;
  report.errors = errors;
  await fs.writeFile(
    "quality/impact-functional.json",
    JSON.stringify(report, null, 2) + "\n",
  );
  console.log(JSON.stringify(report, null, 2));
  assert.deepEqual(report.accessibility.light, []);
  assert.deepEqual(report.accessibility.dark, []);
  assert.deepEqual(errors, []);
} finally {
  await browser.close();
}
