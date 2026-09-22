import { useCallback, useEffect, useRef } from "react";
import useSceneActivity from "./useSceneActivity";

/** Original ink lines for the margins of a page. The section controls activity;
 * the bounded canvas also sleeps independently when its own surface is hidden. */
export default function QuietField({ calm = false }) {
  const canvasRef = useRef(null);
  const sectionRef = useRef(null);
  const phaseRef = useRef(0);
  const attachCanvas = useCallback((canvas) => {
    canvasRef.current = canvas;
    sectionRef.current = canvas?.closest("section") || canvas?.parentElement;
  }, []);
  const active = useSceneActivity(sectionRef, calm);

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !section) return;

    let width = 1;
    let height = 1;
    let docLeft = 0;
    let docTop = 0;
    let frame = 0;
    let last = 0;
    let inView = false;
    let dialogOpen = !!document.querySelector("dialog[open]");
    let ink = "#173d33";
    let opacity = 0.085;
    let pointer = null;
    let influence = 0;
    const smooth = { x: 0, y: 0 };
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = matchMedia("(hover: hover) and (pointer: fine)");

    const available = () =>
      active &&
      !calm &&
      !reduce.matches &&
      inView &&
      !document.hidden &&
      !dialogOpen;

    const paint = (elapsed = 0) => {
      const settling = 1 - Math.exp(-elapsed * 5);
      influence += ((pointer ? 1 : 0) - influence) * settling;
      if (pointer) {
        smooth.x += (pointer.x - smooth.x) * settling;
        smooth.y += (pointer.y - smooth.y) * settling;
      }
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = ink;
      ctx.lineWidth = 0.75;
      const band = Math.min(205, width * 0.2);
      const phase = phaseRef.current;

      // Ten strands on either side leave the central reading column open.
      for (let line = 0; line < 20; line++) {
        const right = line >= 10;
        const order = line % 10;
        const inset = (order / 9) * band - 8;
        const baseX = right ? width - inset : inset;
        ctx.globalAlpha = opacity * (1 - (order / 10) * 0.6);
        ctx.beginPath();
        for (let step = 0; step <= 32; step++) {
          const fraction = step / 32;
          const y = fraction * height;
          const envelope = Math.sin(fraction * Math.PI);
          const drift =
            Math.sin(fraction * 6.3 + phase + order * 0.14) * 6 +
            Math.sin(fraction * 10.2 - phase * 0.6 + order * 0.1) * 2;
          const dx = baseX - smooth.x;
          const dy = y - smooth.y;
          const distance = Math.hypot(dx, dy);
          const brush =
            influence *
            Math.max(0, 1 - distance / 145) ** 2 *
            Math.sign(dx || 1) *
            3;
          const x = baseX + (drift + brush) * envelope;
          if (step === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    };

    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      last = 0;
      canvas.dataset.flowing = "false";
    };
    const tick = (now) => {
      frame = 0;
      if (!available()) {
        stop();
        return;
      }
      if (!last) last = now;
      if (now - last >= 1000 / 24) {
        const elapsed = Math.min((now - last) / 1000, 0.1);
        phaseRef.current += elapsed * 0.22;
        paint(elapsed);
        last = now;
      }
      frame = requestAnimationFrame(tick);
    };
    const syncActivity = () => {
      if (available()) {
        if (!frame) {
          canvas.dataset.flowing = "true";
          frame = requestAnimationFrame(tick);
        }
      } else stop();
    };
    const palette = () => {
      const style = getComputedStyle(canvas);
      ink = style.getPropertyValue("--quiet-field-ink").trim() || "#173d33";
      const requestedOpacity = parseFloat(
        style.getPropertyValue("--quiet-field-opacity"),
      );
      opacity = Number.isFinite(requestedOpacity)
        ? Math.max(0, Math.min(0.2, requestedOpacity))
        : 0.085;
      paint();
    };
    const measure = () => {
      const box = canvas.getBoundingClientRect();
      width = Math.max(1, box.width);
      height = Math.max(1, box.height);
      docLeft = box.left + scrollX;
      docTop = box.top + scrollY;
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      canvas.width = Math.ceil(width * dpr);
      canvas.height = Math.ceil(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      palette();
    };
    const move = (event) => {
      if (!available() || !finePointer.matches || event.pointerType !== "mouse")
        return;
      pointer = {
        x: event.clientX + scrollX - docLeft,
        y: event.clientY + scrollY - docTop,
      };
    };
    const leave = () => {
      pointer = null;
    };
    const resize = new ResizeObserver(measure);
    resize.observe(canvas);
    const visibility = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      syncActivity();
    });
    visibility.observe(canvas);
    const theme = new MutationObserver(palette);
    theme.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    const updateDialogs = () => {
      dialogOpen = !!document.querySelector("dialog[open]");
      syncActivity();
    };
    const dialogs = new MutationObserver(updateDialogs);
    dialogs.observe(document.body, {
      attributes: true,
      attributeFilter: ["open"],
      subtree: true,
    });
    // React may remove an open project dialog without a final `open` mutation.
    // Watch only modal insertion points, rather than every caption/text update.
    const dialogSlots = new MutationObserver(updateDialogs);
    dialogSlots.observe(document.body, { childList: true });
    const appRoot = document.getElementById("root");
    if (appRoot) dialogSlots.observe(appRoot, { childList: true });
    section.addEventListener("pointermove", move, { passive: true });
    section.addEventListener("pointerleave", leave);
    section.addEventListener("pointerenter", measure, { passive: true });
    document.addEventListener("visibilitychange", syncActivity);
    reduce.addEventListener("change", syncActivity);
    measure();
    syncActivity();

    return () => {
      stop();
      resize.disconnect();
      visibility.disconnect();
      theme.disconnect();
      dialogs.disconnect();
      dialogSlots.disconnect();
      section.removeEventListener("pointermove", move);
      section.removeEventListener("pointerleave", leave);
      section.removeEventListener("pointerenter", measure);
      document.removeEventListener("visibilitychange", syncActivity);
      reduce.removeEventListener("change", syncActivity);
    };
  }, [active, calm]);

  return (
    <canvas
      ref={attachCanvas}
      className="quiet-field"
      aria-hidden="true"
      data-flowing="false"
    />
  );
}
