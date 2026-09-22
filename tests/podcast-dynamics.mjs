import puppeteer from "puppeteer-core";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
const browser = await puppeteer.launch({
  executablePath:
    process.env.CHROME_PATH ||
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});
try {
  const page = await browser.newPage();
  await page.goto("http://127.0.0.1:4173/#listen");
  const moduleSource = await fs.readFile(
    new URL("../src/podcast-audio.js", import.meta.url),
    "utf8",
  );
  const report = await page.evaluate(async (code) => {
    const moduleUrl = URL.createObjectURL(
      new Blob([code], { type: "text/javascript" }),
    );
    const { createPodcastSignal } = await import(moduleUrl);
    URL.revokeObjectURL(moduleUrl);
    const sampleRate = 44100,
      seconds = 3;
    const context = new OfflineAudioContext(
      1,
      sampleRate * seconds,
      sampleRate,
    );
    const signal = createPodcastSignal(context);
    const buffer = context.createBuffer(1, sampleRate * seconds, sampleRate),
      samples = buffer.getChannelData(0);
    for (let i = 0; i < samples.length; i++) {
      const t = i / sampleRate;
      const amplitude =
        t > 0.2 && t < 1
          ? 0.035
          : t >= 1 && t < 1.8
            ? 0.35
            : t >= 1.8 && t < 2.4
              ? 0.98
              : 0;
      samples[i] =
        amplitude *
        (0.75 * Math.sin(2 * Math.PI * 220 * t) +
          0.25 * Math.sin(2 * Math.PI * 440 * t));
    }
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(signal.analyser);
    source.start();
    const rendered = (await context.startRendering()).getChannelData(0);
    const rms = (data, start, end) => {
      let sum = 0;
      for (let i = start * sampleRate; i < end * sampleRate; i++)
        sum += data[Math.floor(i)] ** 2;
      return Math.sqrt(sum / ((end - start) * sampleRate));
    };
    const quietGain = rms(rendered, 0.4, 0.9) / rms(samples, 0.4, 0.9);
    let peak = 0;
    for (const sample of rendered) peak = Math.max(peak, Math.abs(sample));
    return {
      quietGain,
      quietGainDb: 20 * Math.log10(quietGain),
      peak,
      tailRms: rms(rendered, 2.7, 2.9),
      finite: rendered.every(Number.isFinite),
      analyserSmoothing: signal.analyser.smoothingTimeConstant,
    };
  }, moduleSource);
  assert.ok(report.quietGain > 1.3);
  assert.ok(report.peak < 1, `Peak ${report.peak} clips`);
  assert.equal(report.tailRms, 0);
  assert.ok(report.finite);

  await page.setViewport({ width: 1165, height: 814 });
  await page.$eval("#listen", (e) => e.scrollIntoView({ behavior: "instant" }));
  await page.click(".episode-play");
  await page.waitForFunction(
    () =>
      document.querySelector(".listening-room").open &&
      document.querySelector("audio").currentTime > 0.5,
  );
  await page.click(".room-volume input");
  await page.keyboard.press("Home");
  await page.waitForFunction(
    () => document.querySelector("audio").volume === 0,
  );
  await new Promise((r) => setTimeout(r, 700));
  assert.equal(await page.$eval(".listening-room meter", (e) => e.value), 0);
  await page.keyboard.press("End");
  await page.waitForFunction(
    () => document.querySelector("audio").volume === 1,
  );
  report.volumeAndMute = true;
  await page.keyboard.press("Escape");
  const fallback = await browser.newPage();
  await fallback.evaluateOnNewDocument(() => {
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      return type === "webgl" ? null : getContext.call(this, type, ...args);
    };
  });
  await fallback.goto("http://127.0.0.1:4173/#listen");
  await fallback.$eval("#listen", (e) =>
    e.scrollIntoView({ behavior: "instant" }),
  );
  await fallback.click(".episode-play");
  await fallback.waitForFunction(
    () =>
      document.querySelector(".listening-room").open &&
      document.querySelector("audio").currentTime > 1,
  );
  assert.equal(
    await fallback.$eval(".listening-room canvas", (e) => e.dataset.renderer),
    "canvas",
  );
  const frame = await fallback.$eval(".listening-room canvas", (e) =>
    e.toDataURL(),
  );
  await new Promise((r) => setTimeout(r, 300));
  assert.notEqual(
    await fallback.$eval(".listening-room canvas", (e) => e.toDataURL()),
    frame,
  );
  report.reactiveCanvasFallback = true;
  await fallback.keyboard.press("Escape");
  await fs.writeFile(
    "quality/podcast-dynamics.json",
    JSON.stringify(report, null, 2) + "\n",
  );
  console.log(report);
} finally {
  await browser.close();
}
