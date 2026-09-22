import { useEffect, useRef } from "react";

/** A local generative textile, not a recording. Pointer input bends adjacent
 * strands together; a change of perspective changes the underlying structure.
 * Draws without React state updates, pauses off-screen and honours calm mode.
 */
export default function Weave({
  mode = 0,
  calm = false,
  theme = "light",
  className = "",
}) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let width = 1,
      height = 1,
      frame = 0,
      visible = false,
      last = 0;
    let pointer = { x: 0.5, y: 0.5 },
      smooth = { x: 0.5, y: 0.5 };
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let staticMode = calm || reduced.matches;
    const draw = (time = 0) => {
      ctx.clearRect(0, 0, width, height);
      smooth.x += (pointer.x - smooth.x) * 0.045;
      smooth.y += (pointer.y - smooth.y) * 0.045;
      const t = staticMode ? 0.6 : time * 0.00015;
      const cx = width * (0.5 + (smooth.x - 0.5) * 0.16);
      const cy = height * (0.52 + (smooth.y - 0.5) * 0.12);
      const size = Math.min(width * 0.4, height * 0.41);
      for (let strand = 0; strand < 44; strand++) {
        const phase = strand / 43;
        ctx.beginPath();
        for (let j = 0; j <= 160; j++) {
          const a = (j / 160) * Math.PI * 2;
          const radius = size * (0.44 + phase * 0.56);
          const twist =
            Math.sin(a * (mode === 1 ? 3 : 2) + t) * (0.22 + phase * 0.14);
          const x =
            cx +
            Math.cos(a + twist) *
              radius *
              (1.06 + 0.17 * Math.sin(phase * 5 + t));
          const y =
            cy +
            Math.sin(a) * radius * (0.72 + 0.2 * Math.cos(a * 2 + t + mode)) +
            Math.cos(a * 3 + phase * 4 + t) * size * (mode === 2 ? 0.18 : 0.08);
          if (j === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle =
          theme === "dark"
            ? `rgba(210,239,120,${0.13 + phase * 0.3})`
            : `rgba(27,74,57,${0.11 + phase * 0.3})`;
        ctx.lineWidth = strand % 11 === 0 ? 1.6 : 0.8;
        ctx.stroke();
      }
    };
    const tick = (time) => {
      if (document.hidden || !visible || staticMode) {
        frame = 0;
        return;
      }
      if (time - last > 32) {
        draw(time);
        last = time;
      }
      frame = requestAnimationFrame(tick);
    };
    const start = () => {
      if (!frame && visible && !staticMode && !document.hidden)
        frame = requestAnimationFrame(tick);
    };
    const resize = new ResizeObserver(([entry]) => {
      width = entry.contentRect.width;
      height = entry.contentRect.height;
      const dpr = Math.min(devicePixelRatio || 1, 1.75);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    });
    resize.observe(canvas);
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      start();
    });
    observer.observe(canvas);
    const move = (e) => {
      const r = canvas.getBoundingClientRect();
      pointer = {
        x: (e.clientX - r.left) / width,
        y: (e.clientY - r.top) / height,
      };
    };
    const leave = () => {
      pointer = { x: 0.5, y: 0.5 };
    };
    const preference = () => {
      staticMode = calm || reduced.matches;
      draw();
      start();
    };
    const parent = canvas.parentElement;
    parent.addEventListener("pointermove", move);
    parent.addEventListener("pointerleave", leave);
    document.addEventListener("visibilitychange", start);
    reduced.addEventListener("change", preference);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      resize.disconnect();
      parent.removeEventListener("pointermove", move);
      parent.removeEventListener("pointerleave", leave);
      document.removeEventListener("visibilitychange", start);
      reduced.removeEventListener("change", preference);
    };
  }, [mode, calm, theme]);
  return (
    <canvas ref={ref} className={`weave ${className}`} aria-hidden="true" />
  );
}
