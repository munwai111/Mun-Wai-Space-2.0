import { useEffect, useRef } from "react";
import useSceneActivity from "./useSceneActivity";

const folds = [
  [-23, -101, -54, -94, -57, -77],
  [-82, -80, -97, -57, -90, -40],
  [-111, -21, -103, 3, -89, 12],
  [-97, 34, -78, 54, -62, 52],
  [-55, 78, -28, 79, -14, 61],
  [-4, 45, -11, 18, -7, -1],
  [-12, -25, -2, -51, -7, -77],
];
function brainOutline(time, side) {
  const shape = new Path2D();
  shape.moveTo(-7, -77);
  folds.forEach((fold, index) => {
    const drift = Math.sin(time * 0.8 + index + side) * 2.6;
    shape.bezierCurveTo(
      fold[0] + drift,
      fold[1],
      fold[2],
      fold[3] + drift,
      fold[4],
      fold[5],
    );
  });
  shape.closePath();
  return shape;
}
const points = [
  [-24, -67],
  [-52, -63],
  [-73, -42],
  [-29, -37],
  [-56, -18],
  [-78, 0],
  [-23, 4],
  [-47, 24],
  [-69, 34],
  [-28, 53],
];
const edges = [
  [0, 1],
  [0, 3],
  [1, 2],
  [1, 4],
  [2, 4],
  [2, 5],
  [3, 4],
  [3, 6],
  [4, 5],
  [4, 7],
  [5, 8],
  [6, 7],
  [6, 9],
  [7, 8],
  [7, 9],
  [8, 9],
];
export default function NeuralBrain({ mode, calm, theme }) {
  const ref = useRef(null);
  const active = useSceneActivity(ref, calm);
  const phase = useRef(0);
  useEffect(() => {
    const canvas = ref.current,
      ctx = canvas.getContext("2d");
    if (!ctx) return;
    let width = 1,
      height = 1,
      frame = 0,
      last = 0;
    const pointer = { x: 0, y: 0 },
      eased = { x: 0, y: 0 };
    const draw = () => {
      const t = phase.current;
      eased.x += (pointer.x - eased.x) * 0.055;
      eased.y += (pointer.y - eased.y) * 0.055;
      ctx.clearRect(0, 0, width, height);
      ctx.save();
      ctx.translate(width * 0.5 + eased.x * 12, height * 0.52 + eased.y * 8);
      const scale = Math.min(width / 260, height / 218);
      ctx.scale(
        scale * (1 + Math.sin(t) * 0.025),
        scale * (1 + Math.cos(t * 0.8) * 0.02),
      );
      ctx.rotate(Math.sin(t * 0.5) * 0.035 + eased.x * 0.04);
      const ink = theme === "dark" ? "#d2ef78" : "#1b4a39";
      ctx.strokeStyle = ink;
      ctx.fillStyle = ink;
      for (const side of [-1, 1]) {
        const outline = brainOutline(t, side);
        ctx.save();
        ctx.scale(side, 1);
        ctx.globalAlpha = 0.055;
        ctx.fill(outline);
        ctx.globalAlpha = 0.6;
        ctx.lineWidth = 1.2;
        ctx.stroke(outline);
        // Convolutions retain the recognisable two-hemisphere silhouette.
        for (let i = 0; i < 7; i++) {
          const y = -66 + i * 19;
          ctx.globalAlpha = 0.18;
          ctx.lineWidth = 0.75;
          ctx.beginPath();
          ctx.moveTo(-14, y);
          ctx.bezierCurveTo(
            -43,
            y - 20 + Math.sin(t + i) * 4,
            -34,
            y + 21,
            -77 + Math.abs(i - 3) * 7,
            y + 3,
          );
          ctx.stroke();
        }
        const nodes = points.map(([x, y], i) => [
          x + Math.sin(t + i) * 2.2,
          y + Math.cos(t * 0.8 + i) * 2.2,
        ]);
        for (let i = 0; i < edges.length; i++) {
          const [a, b] = edges[i],
            p = nodes[a],
            q = nodes[b];
          ctx.globalAlpha = 0.16 + (i % 3 === mode ? 0.12 : 0);
          ctx.lineWidth = 0.7;
          ctx.beginPath();
          ctx.moveTo(...p);
          ctx.lineTo(...q);
          ctx.stroke();
          if (i % 3 === mode) {
            const u = (t * 0.22 + i * 0.17) % 1;
            ctx.globalAlpha = 0.8;
            ctx.beginPath();
            ctx.arc(
              p[0] + (q[0] - p[0]) * u,
              p[1] + (q[1] - p[1]) * u,
              1.8,
              0,
              Math.PI * 2,
            );
            ctx.fill();
          }
        }
        nodes.forEach(([x, y], i) => {
          ctx.globalAlpha = 0.5 + Math.sin(t * 1.5 + i) * 0.2;
          ctx.beginPath();
          ctx.arc(x, y, i % 3 === mode ? 2.8 : 1.6, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.restore();
      }
      ctx.globalAlpha = 0.25;
      ctx.beginPath();
      ctx.moveTo(-8, 8);
      ctx.bezierCurveTo(0, 2, 1, 2, 8, 8);
      ctx.stroke();
      ctx.restore();
    };
    const tick = (time) => {
      if (time - last >= 1000 / 24) {
        phase.current += last ? Math.min(0.05, (time - last) / 1000) * 0.7 : 0;
        last = time;
        draw();
      }
      frame = requestAnimationFrame(tick);
    };
    const resize = new ResizeObserver(([entry]) => {
      width = entry.contentRect.width;
      height = entry.contentRect.height;
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    });
    resize.observe(canvas);
    const move = (e) => {
      if (calm) return;
      const r = canvas.getBoundingClientRect();
      pointer.x = (e.clientX - r.left) / width - 0.5;
      pointer.y = (e.clientY - r.top) / height - 0.5;
    };
    const leave = () => {
      pointer.x = 0;
      pointer.y = 0;
    };
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerleave", leave);
    if (active) frame = requestAnimationFrame(tick);
    else draw();
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerleave", leave);
    };
  }, [active, calm, mode, theme]);
  return <canvas className="neural-brain" ref={ref} aria-hidden="true" />;
}
