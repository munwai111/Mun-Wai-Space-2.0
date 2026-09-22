import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Pause, Play } from "@phosphor-icons/react";
import Weave from "./Weave";
import useSceneActivity from "./useSceneActivity";

const moments = [
  {
    src: "/images/hero-800.webp",
    alt: "Mun Wai smiling outdoors in Melbourne",
    label: "At home in Melbourne",
  },
  {
    src: "/images/journey-10-0.webp",
    alt: "Mun Wai’s RMIT graduation archive",
    label: "Psychology, RMIT · 2024",
  },
  {
    src: "/images/journey-3-0.webp",
    alt: "Mun Wai at an RMIT scholarship presentation",
    label: "A beginning worth remembering",
  },
  {
    src: "/images/journey-7-1.webp",
    alt: "Mun Wai’s Kansai University winter exchange in Japan",
    label: "Winter exchange · Osaka",
  },
  {
    src: "/images/journey-9-1.webp",
    alt: "Mun Wai and friends during the UNIQLO Global Management Program in Tokyo",
    label: "Good company · Tokyo",
  },
  {
    src: "/images/journey-13-0.webp",
    alt: "Mun Wai’s SuperAI event archive from Singapore",
    label: "Following my curiosity · Singapore",
  },
];
export default function HeroPortrait({ calm, theme }) {
  const ref = useRef(null);
  const active = useSceneActivity(ref, calm);
  const [index, setIndex] = useState(0),
    [paused, setPaused] = useState(false),
    [held, setHeld] = useState(false),
    [focused, setFocused] = useState(false);
  useEffect(() => {
    if (!active || paused || held || focused) return;
    const preload = new Image();
    preload.src = moments[(index + 1) % moments.length].src;
    const timer = setTimeout(
      () => setIndex((v) => (v + 1) % moments.length),
      8000,
    );
    return () => clearTimeout(timer);
  }, [active, paused, held, focused, index]);
  const item = moments[index];
  return (
    <div
      className="portrait-composition hero-album"
      ref={ref}
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") setHeld(true);
      }}
      onPointerLeave={() => setHeld(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false);
      }}
    >
      <div className="portrait-backdrop">
        <Weave mode={0} calm={calm || !active} theme={theme} />
      </div>
      <figure className="portrait">
        <div className="hero-photo-window">
          <AnimatePresence initial={false}>
            <motion.img
              key={item.src}
              src={item.src}
              alt={item.alt}
              srcSet={
                index === 0
                  ? "/images/hero-480.webp 480w, /images/hero-800.webp 800w"
                  : undefined
              }
              sizes="(max-width: 640px) 260px, (max-width: 1100px) 300px, 400px"
              width="800"
              height="1000"
              fetchPriority={index === 0 ? "high" : "auto"}
              initial={
                calm ? false : { opacity: 0, scale: 1.035, filter: "blur(3px)" }
              }
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0 }}
              transition={{
                duration: calm ? 0 : 1.1,
                ease: [0.22, 1, 0.36, 1],
              }}
              className={index === 0 ? "hero-original" : "hero-memory"}
            />
          </AnimatePresence>
        </div>
        <figcaption>
          <strong>Looi Mun Wai</strong>
          <span lang="zh">吕文维</span>
        </figcaption>
        <div
          className="hero-photo-note"
          aria-live={paused || calm ? "polite" : "off"}
        >
          {item.label}
        </div>
        <div className="hero-album-controls">
          <span>{String(index + 1).padStart(2, "0")} / 06</span>
          <button
            aria-label="Previous portrait"
            onClick={() =>
              setIndex((v) => (v + moments.length - 1) % moments.length)
            }
          >
            <ArrowLeft size={16} />
          </button>
          <button
            aria-label={
              paused ? "Play portrait slideshow" : "Pause portrait slideshow"
            }
            aria-pressed={paused || calm}
            disabled={calm}
            onClick={() => setPaused((v) => !v)}
          >
            {paused || calm ? <Play size={14} /> : <Pause size={14} />}
          </button>
          <button
            aria-label="Next portrait"
            onClick={() => setIndex((v) => (v + 1) % moments.length)}
          >
            <ArrowRight size={16} />
          </button>
        </div>
      </figure>
      <span className="portrait-shape" aria-hidden="true" />
    </div>
  );
}
