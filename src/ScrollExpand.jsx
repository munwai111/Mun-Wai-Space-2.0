// Adapted from React Bits ScrollExpand (JS-CSS), MIT + Commons Clause.
// Licence: licences/react-bits-LICENSE.md. Provenance: vendor/react-bits/PROVENANCE.md.
import { useCallback, useEffect, useRef } from "react";

import "./ScrollExpand.css";

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

const smoothstep = (edge0, edge1, x) => {
  const t = clamp((x - edge0) / (edge1 - edge0 || 1e-6), 0, 1);
  return t * t * (3 - 2 * t);
};

const ScrollExpand = ({
  src = "",
  mediaType = "image",
  poster = "",
  alt = "",
  title = "",
  scrollHint = "",
  startWidth = 42,
  startHeight = 58,
  startRadius = 24,
  endRadius = 0,
  mediaZoom = 1.35,
  scrollDistance = 1.2,
  holdDistance = 0.35,
  smoothing = 0.1,
  overlayScrim = 0.45,
  useWindowScroll = false,
  enabled = true,
  externalProgress,
  mediaContent,
  children,
  className = "",
  style,
  ...rest
}) => {
  const rootRef = useRef(null);
  const trackRef = useRef(null);
  const stageRef = useRef(null);
  const frameRef = useRef(null);
  const mediaRef = useRef(null);
  const titleRef = useRef(null);
  const overlayRef = useRef(null);
  const scrimRef = useRef(null);
  const hintRef = useRef(null);

  const propsRef = useRef({});
  propsRef.current = {
    startWidth,
    startHeight,
    startRadius,
    endRadius,
    mediaZoom,
    scrollDistance,
    holdDistance,
    smoothing,
    overlayScrim,
    useWindowScroll,
    enabled,
  };

  const applyProgress = useCallback((p) => {
    const frame = frameRef.current;
    const media = mediaRef.current;
    if (!frame || !media) return;
    const c = propsRef.current;

    const e = smoothstep(0, 1, p);

    const w = c.startWidth + (100 - c.startWidth) * e;
    const h = c.startHeight + (100 - c.startHeight) * e;
    const ix = Math.max(0, (100 - w) / 2);
    const iy = Math.max(0, (100 - h) / 2);
    const r = c.startRadius + (c.endRadius - c.startRadius) * e;
    rootRef.current.dataset.progress = p.toFixed(4);
    frame.style.clipPath = `inset(${iy}% ${ix}% ${iy}% ${ix}% round ${r}px)`;

    media.style.transform = `scale(${c.mediaZoom + (1 - c.mediaZoom) * e})`;

    if (scrimRef.current)
      scrimRef.current.style.opacity = `${c.overlayScrim * e}`;

    if (titleRef.current) {
      const out = smoothstep(0.4, 0.88, p);
      titleRef.current.style.opacity = `${1 - out}`;
      titleRef.current.style.transform = `translate3d(0, ${-28 * out}px, 0) scale(${1 + 0.06 * out})`;
    }

    if (hintRef.current) {
      const gone = smoothstep(0, 0.12, p);
      hintRef.current.style.opacity = `${1 - gone}`;
      hintRef.current.style.transform = `translate3d(0, ${8 * gone}px, 0)`;
    }

    if (overlayRef.current) {
      const inn = smoothstep(0.68, 1, p);
      overlayRef.current.style.opacity = `${inn}`;
      overlayRef.current.style.transform = `translate3d(0, ${18 * (1 - inn)}px, 0)`;
    }
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    const stage = stageRef.current;
    if (!root || !track || !stage) return;

    // A shared sticky scene can drive the same original frame geometry.
    // The scene owns scrolling and inertia; this component remains mounted.
    if (externalProgress) {
      root.dataset.controlled = "true";
      root.dataset.static = String(!enabled);
      track.style.height = "100%";
      stage.style.height = "100%";
      const paint = (value) => {
        applyProgress(enabled ? clamp(value, 0, 1) : 1);
        root.dataset.animating = String(enabled && value > 0 && value < 1);
      };
      paint(externalProgress.get());
      const unsubscribe = externalProgress.on("change", paint);
      return unsubscribe;
    }

    const motionPreference = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    let raf = 0;
    let current = 0;
    let target = 0;
    let stageH = 0;
    let stickyTop = 0;
    let visible = false;
    let lastTime = 0;
    const isStatic = () =>
      !propsRef.current.enabled || motionPreference.matches;
    const available = () =>
      visible &&
      !document.hidden &&
      !document.documentElement.matches(
        ".listening-open, .impact-open, .film-open",
      );

    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      lastTime = 0;
      root.dataset.animating = "false";
    };
    const measure = () => {
      const c = propsRef.current;
      root.dataset.static = String(isStatic());
      stage.style.height = c.useWindowScroll
        ? "var(--se-stage-height, 100svh)"
        : `${root.clientHeight}px`;
      stageH = stage.getBoundingClientRect().height;
      stickyTop = c.useWindowScroll
        ? parseFloat(getComputedStyle(stage).top) || 0
        : 0;
      if (stageH <= 0) return;
      const extra = isStatic()
        ? 0
        : Math.max(0, c.scrollDistance) + Math.max(0, c.holdDistance);
      track.style.height = `${stageH * (1 + extra)}px`;
      stage.style.setProperty(
        "--se-title-size",
        `${clamp((root.clientWidth || stageH) * 0.075, 20, 84)}px`,
      );
    };
    const readProgress = () => {
      const c = propsRef.current;
      if (isStatic()) return 1;
      const span = stageH * Math.max(0.01, c.scrollDistance);
      if (c.useWindowScroll)
        stickyTop = parseFloat(getComputedStyle(stage).top) || 0;
      return c.useWindowScroll
        ? clamp((stickyTop - track.getBoundingClientRect().top) / span, 0, 1)
        : clamp(root.scrollTop / span, 0, 1);
    };
    const tick = (now) => {
      raf = 0;
      if (!available() || isStatic()) {
        stop();
        return;
      }
      const elapsed = lastTime
        ? Math.min((now - lastTime) / 1000, 0.05)
        : 1 / 60;
      lastTime = now;
      const duration = propsRef.current.smoothing;
      const k = duration <= 0 ? 1 : 1 - Math.exp(-elapsed / duration);
      current += (target - current) * k;
      if (Math.abs(target - current) < 0.0004) current = target;
      applyProgress(current);
      if (current !== target) raf = requestAnimationFrame(tick);
      else stop();
    };
    const onScroll = () => {
      if (!available() || isStatic()) return;
      target = readProgress();
      if (target === current) return;
      if (propsRef.current.smoothing <= 0) {
        current = target;
        applyProgress(current);
      } else if (!raf) {
        root.dataset.animating = "true";
        raf = requestAnimationFrame(tick);
      }
    };
    const settle = () => {
      stop();
      measure();
      target = current = readProgress();
      applyProgress(current);
    };
    const sync = () => {
      root.dataset.active = String(available() && !isStatic());
      if (available()) settle();
      else stop();
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    observer.observe(root);
    const scroller = useWindowScroll ? window : root;
    scroller.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", settle);
    document.addEventListener("visibilitychange", sync);
    motionPreference.addEventListener("change", settle);
    const overlays = new MutationObserver(sync);
    overlays.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    const ro = new ResizeObserver(settle);
    ro.observe(root);
    settle();

    return () => {
      stop();
      observer.disconnect();
      overlays.disconnect();
      ro.disconnect();
      scroller.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", settle);
      document.removeEventListener("visibilitychange", sync);
      motionPreference.removeEventListener("change", settle);
    };
  }, [applyProgress, useWindowScroll, enabled, src, externalProgress]);

  const media =
    mediaType === "video" ? (
      <video
        ref={mediaRef}
        className="scroll-expand__media"
        src={src}
        poster={poster}
        autoPlay
        muted
        loop
        playsInline
      />
    ) : (
      <img
        ref={mediaRef}
        className="scroll-expand__media"
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        draggable={false}
      />
    );

  return (
    <div
      ref={rootRef}
      className={`scroll-expand ${useWindowScroll ? "" : "scroll-expand--scroller"} ${className}`.trim()}
      style={{
        "--se-track-ratio": enabled
          ? 1 + Math.max(0, scrollDistance) + Math.max(0, holdDistance)
          : 1,
        ...style,
      }}
      {...rest}
    >
      <div ref={trackRef} className="scroll-expand__track">
        <div ref={stageRef} className="scroll-expand__stage">
          <div ref={frameRef} className="scroll-expand__frame">
            {mediaContent ? (
              <div ref={mediaRef} className="scroll-expand__media">
                {mediaContent}
              </div>
            ) : (
              media
            )}
            <div ref={scrimRef} className="scroll-expand__scrim" />
            {children ? (
              <div ref={overlayRef} className="scroll-expand__overlay">
                {children}
              </div>
            ) : null}
          </div>
          {title ? (
            <div
              ref={titleRef}
              className="scroll-expand__title"
              aria-hidden="true"
            >
              {title}
            </div>
          ) : null}
          {scrollHint ? (
            <div ref={hintRef} className="scroll-expand__hint">
              {scrollHint}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ScrollExpand;
