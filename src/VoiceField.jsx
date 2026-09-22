import { useEffect, useRef, useState } from "react";
import { createMeshRenderer } from "./mesh-renderer";

export default function VoiceField({
  analyser,
  playing,
  calm,
  immersive = false,
}) {
  const canvas = useRef(null),
    phase = useRef(0);
  const [level, setLevel] = useState(0);
  const [revision, setRevision] = useState(0);
  const [unavailable, setUnavailable] = useState(false);
  useEffect(() => {
    const element = canvas.current;
    let renderer;
    try {
      renderer = createMeshRenderer(element, immersive);
      setUnavailable(false);
    } catch {
      setUnavailable(true);
      return;
    }
    let frame,
      visible = false,
      width = 1,
      height = 1,
      dpr = 1,
      lastPaint = 0,
      lastMeter = 0,
      response = 0,
      lost = false;
    const frequency = new Uint8Array(analyser?.frequencyBinCount || 512);
    const waveform = new Float32Array(analyser?.fftSize || 1024);
    const spectrum = new Uint8Array(64);
    // The field follows the theme in both contexts: lit points added onto a
    // dark ground, ink points laid over a pale one.
    const dark = () => document.documentElement.dataset.theme === "dark";
    let colour = dark() ? [0.15, 0.65, 0.4] : [0.07, 0.2, 0.15];
    let hot = dark() ? [0.82, 0.94, 0.47] : [0.26, 0.38, 0.08];
    let blend = dark() ? "add" : "over";
    let gain = dark() ? 1 : 3.2;
    let size = dark() ? 1 : 1.35;
    const canAnimate = () =>
      visible &&
      !calm &&
      !document.hidden &&
      (immersive
        ? playing
        : !document.documentElement.classList.contains("listening-open") &&
          !document.documentElement.classList.contains("impact-open") &&
          !document.documentElement.classList.contains("film-open"));
    const draw = (now = 0, force = false) => {
      if (lost) return;
      const active = playing && analyser && !document.hidden;
      if (force || now - lastPaint >= (immersive ? 33 : 1000 / 24)) {
        const delta = lastPaint
          ? Math.min(0.05, (now - lastPaint) / 1000)
          : 1 / 30;
        let energy = 0;
        if (active) {
          analyser.getByteFrequencyData(frequency);
          analyser.getFloatTimeDomainData(waveform);
          const rms = Math.sqrt(
            waveform.reduce((sum, v) => sum + v * v, 0) / waveform.length,
          );
          const target = Math.min(1, Math.max(0, rms - 0.002) * 10);
          // Quick syllable response with a short, smooth release between words.
          response +=
            (target - response) *
            (1 - Math.exp(-delta / (target > response ? 0.03 : 0.12)));
          energy = response;
        } else {
          frequency.fill(0);
          response = 0;
        }
        if (now - lastMeter > 100 || !active) {
          setLevel(Math.round(energy * 100));
          lastMeter = now;
        }
        for (let i = 0; i < 64; i++) {
          const bin = Math.min(
            frequency.length - 1,
            Math.round(2 * Math.pow(64, i / 63)),
          );
          spectrum[i] = calm
            ? 0
            : Math.round(255 * Math.pow(frequency[bin] / 255, 0.75));
        }
        if (!calm || force) {
          if (canAnimate())
            phase.current += delta * (immersive ? 0.18 + energy * 1.4 : 0.65);
          renderer.draw({
            spectrum,
            energy: calm ? 0 : energy,
            phase: phase.current,
            width,
            height,
            dpr,
            colour,
            hot,
            blend,
            gain,
            size,
          });
        }
        lastPaint = now;
      }
      if (canAnimate()) frame = requestAnimationFrame(draw);
    };
    const start = () => {
      cancelAnimationFrame(frame);
      draw(performance.now(), true);
    };
    const resize = new ResizeObserver(([entry]) => {
      width = entry.contentRect.width;
      height = entry.contentRect.height;
      if (!width || !height) return;
      dpr = Math.min(devicePixelRatio || 1, immersive ? 1.5 : 1);
      element.width = Math.round(width * dpr);
      element.height = Math.round(height * dpr);
      start();
    });
    resize.observe(element);
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      start();
    });
    intersection.observe(element);
    const theme = new MutationObserver(() => {
      colour = dark() ? [0.15, 0.65, 0.4] : [0.07, 0.2, 0.15];
      hot = dark() ? [0.82, 0.94, 0.47] : [0.26, 0.38, 0.08];
      blend = dark() ? "add" : "over";
      gain = dark() ? 1 : 3.2;
      size = dark() ? 1 : 1.35;
      start();
    });
    theme.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "class"],
    });
    const contextLost = (e) => {
      e.preventDefault();
      lost = true;
      cancelAnimationFrame(frame);
    };
    const contextRestored = () => setRevision((v) => v + 1);
    element.addEventListener("webglcontextlost", contextLost);
    element.addEventListener("webglcontextrestored", contextRestored);
    document.addEventListener("visibilitychange", start);
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      intersection.disconnect();
      theme.disconnect();
      renderer.dispose();
      element.removeEventListener("webglcontextlost", contextLost);
      element.removeEventListener("webglcontextrestored", contextRestored);
      document.removeEventListener("visibilitychange", start);
    };
  }, [analyser, playing, calm, immersive, revision]);
  return (
    <div className="voice-field">
      <canvas ref={canvas} aria-hidden="true" />
      {unavailable && (
        <p className="visual-unavailable" role="status">
          The visualiser is unavailable in this browser. Audio and captions will
          continue.
        </p>
      )}
      <div className="voice-field-footer">
        <span>
          {calm ? "STILL VIEW · AUDIO CONTINUES" : "STEP INTO THE CONVERSATION"}
        </span>
        <meter
          min="0"
          max="100"
          value={level}
          aria-label={
            immersive ? "Listening room audio signal" : "Audio signal level"
          }
        />
      </div>
    </div>
  );
}
