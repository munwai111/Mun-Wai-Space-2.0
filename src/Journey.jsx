import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useVelocity,
} from "motion/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  ArrowsOutSimple,
  Pause,
  Play,
} from "@phosphor-icons/react";
import { chapters, originalUrl } from "./data";
import gallery from "./gallery.json";
import Ink from "./Ink";
import ScrollExpand from "./ScrollExpand";
import ScrollReveal from "./ScrollReveal";
import MaskedHeading from "./MaskedHeading";
import VariableProximity from "./VariableProximity";
import useSceneActivity from "./useSceneActivity";

gsap.registerPlugin(ScrollTrigger);
const settings = [
  ["MELBOURNE", "Learning to take up space"],
  ["MELBOURNE", "Finding people. Finding my feet."],
  ["OSAKA ↔ MELBOURNE", "A different place to listen"],
  ["TOKYO ↔ MELBOURNE", "Taking ideas into the world"],
  ["MELBOURNE ↔ SINGAPORE", "Curiosity becomes practice"],
  ["KUALA LUMPUR", "The story is still being written"],
];
const photoChapters = chapters.map((chapter) => ({
  ...chapter,
  photos: chapter.ids.flatMap((id) => {
    const row = gallery.find((g) => g.id === id);
    return row ? row.images.map((src) => ({ src, title: row.title })) : [];
  }),
}));

// Every chapter follows one choreography, measured in stage heights of ordinary
// scrolling after its scene settles into the photo frame: the year fills the
// frame, hands over to the story, the story holds once fully revealed, then leaves.
const BEATS = {
  yearIn: [0.08, 0.38],
  yearOut: [0.72, 1.02],
  storyIn: [0.84, 1.3],
  words: [0.88, 1.52],
  tilt: 1.36,
  details: [1.14, 1.5],
  storyOut: [2.04, 2.44],
  span: 2.44,
  finalSpan: 2.04,
};
// The single photo expansion runs across chapter one's first beats.
const OPENING = [-0.2, 0.42];
const FRAME_START_WIDTH = 54;
const SCRUB = 0.9;
const DRAG = { gain: 0.014, limit: 36 };
const PRESENT_TEXTURE = "/images/present-texture.svg";
// The requested VariableProximity axes, served by the local Roboto Flex digits.
const YEAR_REST = "'wght' 400, 'opsz' 9";
const YEAR_HOVER = "'wght' 1000, 'opsz' 40";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const smoothstep = (from, to, value) => {
  const t = clamp((value - from) / (to - from || 1e-6), 0, 1);
  return t * t * (3 - 2 * t);
};
const length = ([from, to]) => to - from;
const stageOf = (node) => {
  const section = node.closest(".journey-continuous");
  const pin = section.querySelector(".journey-media-pin");
  return {
    top:
      parseFloat(
        getComputedStyle(section).getPropertyValue("--journey-pinned-top"),
      ) || 0,
    height: pin?.getBoundingClientRect().height || innerHeight,
  };
};
// A ScrollTrigger position, in stage heights after the chapter scene settles.
const beat = (units) => (self) => {
  const { top, height } = stageOf(self.trigger);
  const offset = Math.round(units * height);
  return `top${offset < 0 ? "-=" : "+="}${Math.abs(offset)} ${top}px`;
};
const wordsStart = beat(BEATS.words[0]);
const wordsEnd = beat(BEATS.words[1]);
const tiltEnd = beat(BEATS.tilt);

// Years fill the frame: four digits across, or two over two in tall frames.
// Stories share one type scale sized to the tallest chapter, so every
// description fits inside the frame once it is fully revealed.
function fitScene(section) {
  const pin = section.querySelector(".journey-media-pin");
  const probe = section.querySelector(".journey-year-probe");
  const consoleNode = section.querySelector(".journey-photo-console");
  const card = pin?.getBoundingClientRect();
  if (!probe || !card?.width || !card.height) return null;
  const consoleHeight = consoleNode?.getBoundingClientRect().height || 0;
  section.style.setProperty(
    "--journey-console-h",
    `${consoleHeight.toFixed(1)}px`,
  );
  const [whole, wholeBold, half, halfBold] = [...probe.children].map(
    (node) => node.getBoundingClientRect().width / 100 || 1,
  );
  const room = Math.max(120, card.height - consoleHeight - 24);
  const stacked = card.width / card.height < 0.9;
  const size = Math.max(
    56,
    stacked
      ? Math.min(
          (card.width * 0.9) / half,
          (card.width * 0.97) / halfBold,
          room * 0.56,
        )
      : Math.min(
          (card.width * 0.9) / whole,
          (card.width * 0.97) / wholeBold,
          room * 0.8,
        ),
  );
  section.style.setProperty("--journey-year-size", `${size.toFixed(1)}px`);

  const layer = section.querySelector(".journey-story");
  const copies = [...section.querySelectorAll(".journey-story-copy")];
  if (layer && copies.length) {
    const style = getComputedStyle(layer);
    const space =
      layer.clientHeight -
      parseFloat(style.paddingTop) -
      parseFloat(style.paddingBottom);
    const tallest = () => Math.max(...copies.map((copy) => copy.offsetHeight));
    const apply = (value) =>
      section.style.setProperty("--journey-story-scale", value.toFixed(3));
    apply(1);
    // Copy height grows roughly with the square of the type scale (larger type
    // and more wrapped lines), so a single measurement gives a close estimate.
    let scale = clamp(
      Math.sqrt((space * 0.94) / Math.max(1, tallest())),
      0.62,
      1.16,
    );
    apply(scale);
    while (scale > 0.62 && tallest() > space) {
      scale = Math.max(0.62, scale - 0.03);
      apply(scale);
    }
  }
  return { stacked, radius: Math.round(size * 0.7) };
}

function PhotoLayers({ photo, calm }) {
  const [ready, setReady] = useState(photo);
  useEffect(() => {
    let current = true;
    if (!photo) {
      setReady(null);
      return;
    }
    const image = new Image();
    image.src = photo.src;
    image
      .decode()
      .then(() => {
        if (current) setReady(photo);
      })
      .catch(() => {
        if (current) setReady(photo);
      });
    return () => {
      current = false;
    };
  }, [photo]);
  return (
    <div className="journey-photo-layers" aria-hidden="true">
      <AnimatePresence initial={false}>
        {ready && (
          <motion.div
            key={ready.src}
            className="journey-photo-layer is-active"
            data-src={ready.src}
            initial={{ opacity: 0, scale: 1.025 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: calm ? 0 : 0.85, ease: [0.22, 1, 0.36, 1] }}
          >
            <img className="journey-photo-wash" src={ready.src} alt="" />
            <img className="journey-photo-original" src={ready.src} alt="" />
          </motion.div>
        )}
      </AnimatePresence>
      <div className="journey-photo-shade" />
    </div>
  );
}

function PhotoControls({
  chapter,
  index,
  change,
  enlarge,
  paused,
  toggle,
  compact = false,
}) {
  const photo = chapter.photos[index];
  if (!photo)
    return (
      <p className="journey-present-note">
        2026 / STILL BECOMING <span>The story continues.</span>
      </p>
    );
  return (
    <>
      <p className="journey-photo-caption">
        <span>{chapter.year} / FROM THE PHOTO JOURNAL</span>
        {photo.title}
      </p>
      <div className="journey-photo-controls">
        <button
          aria-label={`Previous ${chapter.year} photograph`}
          onClick={() => change(-1)}
        >
          <ArrowLeft size={18} />
        </button>
        <span className="journey-photo-count">
          {index + 1} / {chapter.photos.length}
        </span>
        <button
          aria-label={`Next ${chapter.year} photograph`}
          onClick={() => change(1)}
        >
          <ArrowRight size={18} />
        </button>
        {!compact && (
          <button
            aria-label={
              paused
                ? "Resume timeline photographs"
                : "Pause timeline photographs"
            }
            aria-pressed={paused}
            onClick={toggle}
          >
            {paused ? <Play size={16} /> : <Pause size={16} />}
          </button>
        )}
        <button
          className="journey-photo-enlarge"
          aria-label={`Enlarge photograph: ${photo.title}`}
          onClick={() => enlarge(photo)}
        >
          <ArrowsOutSimple size={18} />
        </button>
      </div>
    </>
  );
}

export default function Journey({ calm, enlarge }) {
  const ref = useRef(null);
  const cinema = useRef(null);
  const route = useRef(null);
  const firstYear = useRef(null);
  const [active, setActive] = useState(0);
  const [indices, setIndices] = useState(() => chapters.map(() => 0));
  const [paused, setPaused] = useState(false);
  const [hoveringControls, setHoveringControls] = useState(false);
  const [reading, setReading] = useState(false);
  const [compact, setCompact] = useState(
    () => matchMedia("(max-height: 649px), (max-width: 359px)").matches,
  );
  const [storyShown, setStoryShown] = useState(() => chapters.map(() => false));
  const [revealTokens, setRevealTokens] = useState(() => chapters.map(() => 0));
  const [yearLayout, setYearLayout] = useState({ stacked: false, radius: 240 });
  // Measurement and scroll choreography start once the section approaches the
  // viewport, which keeps that work out of the initial page load.
  const [armed, setArmed] = useState(false);
  const flat = calm || compact || reading;
  const available = useSceneActivity(cinema, calm);
  const opening = useMotionValue(flat ? 1 : 0);
  // Scroll velocity feeds a spring: stories lag a little behind a fast scroll
  // and settle back with a small elastic overshoot when scrolling stops.
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const dragTarget = useMotionValue(0);
  const drag = useSpring(dragTarget, { stiffness: 120, damping: 13, mass: 1 });
  const selectedChapter = photoChapters[active];
  const selectedPhoto = selectedChapter.photos[indices[active]] || null;
  const changePhoto = (chapterIndex, delta, manual = true) => {
    if (manual) setPaused(true);
    setIndices((previous) =>
      previous.map((value, index) =>
        index === chapterIndex
          ? (value + delta + photoChapters[index].photos.length) %
            photoChapters[index].photos.length
          : value,
      ),
    );
  };

  useEffect(() => {
    const query = matchMedia("(max-height: 649px), (max-width: 359px)");
    const update = () => setCompact(query.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (armed) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setArmed(true);
      },
      { rootMargin: "150% 0px" },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [armed]);

  useLayoutEffect(() => {
    const section = ref.current;
    const header = document.querySelector(".site-header");
    section.style.setProperty("--journey-span", String(BEATS.span));
    section.style.setProperty("--journey-final-span", String(BEATS.finalSpan));
    const measure = () => {
      const headerH = header.getBoundingClientRect().height;
      const routeH = route.current.getBoundingClientRect().height;
      section.style.setProperty("--journey-header-height", `${headerH}px`);
      section.style.setProperty(
        "--journey-pinned-top",
        `${headerH + routeH + 10}px`,
      );
      section.style.setProperty(
        "--journey-root-scroll-padding",
        getComputedStyle(document.documentElement).scrollPaddingTop,
      );
    };
    const ro = new ResizeObserver(measure);
    ro.observe(header);
    ro.observe(route.current);
    measure();
    return () => ro.disconnect();
  }, []);

  useLayoutEffect(() => {
    const section = ref.current;
    if (flat) {
      section.style.removeProperty("--journey-story-scale");
      return;
    }
    if (!armed) return;
    let frame = 0;
    let live = true;
    let fitted = "";
    const fit = (force = false) => {
      frame = 0;
      if (!live) return;
      // Refit only when the frame or its photo console actually changes size.
      const pin = section.querySelector(".journey-media-pin");
      const consoleNode = section.querySelector(".journey-photo-console");
      const key = `${pin.offsetWidth}x${pin.offsetHeight}x${consoleNode?.offsetHeight || 0}`;
      if (!force && key === fitted) return;
      fitted = key;
      const layout = fitScene(section);
      if (layout)
        setYearLayout((previous) =>
          previous.stacked === layout.stacked &&
          Math.abs(previous.radius - layout.radius) < 4
            ? previous
            : layout,
        );
    };
    const schedule = () => {
      if (live && !frame) frame = requestAnimationFrame(() => fit());
    };
    fit(true);
    const observer = new ResizeObserver(schedule);
    section
      .querySelectorAll(".journey-media-pin, .journey-photo-console")
      .forEach((node) => observer.observe(node));
    // The years load their own web font, so refit once its real metrics arrive.
    Promise.all([
      document.fonts.load('1em "Roboto Flex"', "0123456789").catch(() => {}),
      document.fonts.ready,
    ]).then(() => {
      if (live) fit(true);
    });
    return () => {
      live = false;
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [flat, armed]);

  useEffect(() => {
    if (flat || !available) {
      dragTarget.set(0);
      return;
    }
    const unsubscribe = scrollVelocity.on("change", (velocity) =>
      dragTarget.set(clamp(velocity * DRAG.gain, -DRAG.limit, DRAG.limit)),
    );
    return () => {
      unsubscribe();
      dragTarget.set(0);
    };
  }, [flat, available, scrollVelocity, dragTarget]);

  useEffect(() => {
    const section = ref.current;
    let frame = 0;
    let visible = false;
    const update = () => {
      frame = 0;
      if (!visible) return;
      const { top, height } = stageOf(section);
      // In motion, a chapter becomes current as its scene settles into the frame.
      const line = flat ? top + height * 0.2 : top + 2;
      let current = 0;
      section.querySelectorAll(".journey-stop").forEach((node, index) => {
        if (node.getBoundingClientRect().top <= line) current = index;
      });
      setActive((previous) => (previous === current ? previous : current));
    };
    const schedule = () => {
      if (visible && !frame) frame = requestAnimationFrame(update);
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) update();
    });
    observer.observe(section);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [flat]);

  useEffect(() => {
    if (flat) {
      opening.set(1);
      return;
    }
    if (!armed) return;
    const section = ref.current;
    const stops = [...section.querySelectorAll(".journey-stop")];
    const state = { progress: 0 };
    const markStory = (index, value) =>
      setStoryShown((previous) =>
        previous[index] === value
          ? previous
          : previous.map((shown, position) =>
              position === index ? value : shown,
            ),
      );
    const context = gsap.context(() => {
      gsap.to(state, {
        progress: 1,
        ease: "none",
        onUpdate: () => opening.set(state.progress),
        scrollTrigger: {
          trigger: stops[0],
          start: beat(OPENING[0]),
          end: beat(OPENING[1]),
          scrub: 0.48,
        },
      });
      stops.forEach((stop, index) => {
        const final = index === stops.length - 1;
        const units = final ? BEATS.finalSpan : BEATS.span;
        const year = stop.querySelector(".journey-year-content");
        const copy = stop.querySelector(".journey-story-copy");
        const details = stop.querySelectorAll(".journey-chapter-details li");
        const timeline = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: stop,
            start: beat(0),
            end: beat(units),
            scrub: SCRUB,
          },
        });
        // Positions are functions, re-measured on every refresh; tween values
        // avoid layout measurements, so the timeline never needs invalidating.
        // Chapter one's year arrives with the frame expansion rather than a fade.
        if (index > 0)
          timeline.fromTo(
            year,
            { opacity: 0, scale: 0.9, filter: "blur(12px)" },
            {
              opacity: 1,
              scale: 1,
              filter: "blur(0px)",
              duration: length(BEATS.yearIn),
              ease: "power2.out",
            },
            BEATS.yearIn[0],
          );
        timeline
          .fromTo(
            year,
            { opacity: 1, scale: 1, filter: "blur(0px)" },
            {
              opacity: 0,
              scale: 1.05,
              filter: "blur(10px)",
              duration: length(BEATS.yearOut),
              ease: "power1.in",
              immediateRender: false,
            },
            BEATS.yearOut[0],
          )
          .fromTo(
            copy,
            { opacity: 0, yPercent: 38 },
            {
              opacity: 1,
              yPercent: 0,
              duration: length(BEATS.storyIn),
              ease: "power3.out",
            },
            BEATS.storyIn[0],
          );
        details.forEach((item, position) =>
          timeline.fromTo(
            item,
            { opacity: 0, y: 14 },
            { opacity: 1, y: 0, duration: 0.24, ease: "power2.out" },
            BEATS.details[0] + position * 0.06,
          ),
        );
        // The last story stays; the frame itself carries it out of view.
        if (!final)
          timeline.fromTo(
            copy,
            { opacity: 1, yPercent: 0 },
            {
              opacity: 0,
              yPercent: -24,
              duration: length(BEATS.storyOut),
              ease: "power2.in",
              immediateRender: false,
            },
            BEATS.storyOut[0],
          );
        timeline.set({}, {}, units);
        ScrollTrigger.create({
          trigger: stop,
          start: beat(BEATS.storyIn[0]),
          end: beat(final ? units + 1 : BEATS.storyOut[1]),
          onToggle: (self) => markStory(index, self.isActive),
          onEnter: () =>
            setRevealTokens((previous) =>
              previous.map((token, position) =>
                position === index ? token + 1 : token,
              ),
            ),
        });
      });
    }, section);
    // Each trigger measures itself when created; refresh again only while
    // fonts are still loading and may shift the layout.
    if (document.fonts.status !== "loaded")
      document.fonts.ready.then(() => ScrollTrigger.refresh());
    return () => {
      context.revert();
      setStoryShown((previous) =>
        previous.some(Boolean) ? previous.map(() => false) : previous,
      );
    };
  }, [flat, armed, opening]);

  useEffect(() => {
    const fit = firstYear.current;
    const content = fit?.closest(".journey-year-content");
    if (!fit || !content) return;
    const clear = () => {
      fit.style.removeProperty("transform");
      content.style.removeProperty("--journey-year-labels");
    };
    if (flat) {
      clear();
      return;
    }
    // The first year grows with the frame, from its starting width to full size.
    const paint = (progress) => {
      const scale =
        (FRAME_START_WIDTH +
          (100 - FRAME_START_WIDTH) * smoothstep(0, 1, progress)) /
        100;
      fit.style.transform = `scale(${scale.toFixed(4)})`;
      content.style.setProperty(
        "--journey-year-labels",
        smoothstep(0.62, 1, progress).toFixed(3),
      );
    };
    paint(opening.get());
    const unsubscribe = opening.on("change", paint);
    return () => {
      unsubscribe();
      clear();
    };
  }, [flat, opening]);

  useEffect(() => {
    const triggers = ScrollTrigger.getAll().filter((trigger) =>
      ref.current.contains(trigger.trigger),
    );
    triggers.forEach((trigger) => {
      if (available || flat) trigger.enable(false, true);
      else {
        trigger.getTween()?.pause();
        trigger.disable(false, false);
      }
    });
  }, [available, flat]);

  useEffect(() => {
    if (flat || paused || hoveringControls || !available || !selectedPhoto)
      return;
    const timer = setInterval(() => changePhoto(active, 1, false), 7000);
    return () => clearInterval(timer);
  }, [flat, paused, hoveringControls, available, active, selectedPhoto]);

  useEffect(() => {
    const hash = location.hash;
    if (
      !chapters.some((chapter) => hash === `#journey-${chapter.year}`) &&
      hash !== "#timeline"
    )
      return;
    let cancelled = false;
    let frame = 0;
    const cancel = () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
    const events = ["wheel", "touchstart", "pointerdown", "keydown"];
    events.forEach((event) =>
      window.addEventListener(event, cancel, { passive: true, once: true }),
    );
    document.fonts.ready.then(() => {
      if (!cancelled)
        frame = requestAnimationFrame(() => {
          if (!cancelled && location.hash === hash)
            document
              .getElementById(hash.slice(1))
              ?.scrollIntoView({ block: "start", behavior: "instant" });
        });
    });
    return () => {
      cancel();
      events.forEach((event) => window.removeEventListener(event, cancel));
    };
  }, []);

  const travel = (index) => {
    setActive(index);
    document.getElementById(`journey-${chapters[index].year}`).scrollIntoView({
      block: "start",
      behavior: flat ? "instant" : "smooth",
    });
  };
  const toggleReading = () => {
    setReading((value) => !value);
    requestAnimationFrame(() =>
      document
        .getElementById(`journey-${chapters[active].year}`)
        .scrollIntoView({ block: "start", behavior: "instant" }),
    );
  };

  return (
    <section
      id="timeline"
      className={`journey-scroll journey-continuous section-wrap ${flat ? "journey-flat" : ""}`}
      ref={ref}
    >
      <div className="journey-intro">
        <p className="section-label">THE LIFE THAT SHAPED THE WORK</p>
        <h2>
          <Ink>
            A few chapters.
            <br />A lot of good people.
          </Ink>
        </h2>
        <p className="section-description">
          Kuala Lumpur, Dubai and Melbourne shaped how I see the world. Come
          through the moments that helped me find my people, my confidence and
          my direction.
        </p>
        <span className="journey-scroll-cue">
          SCROLL THROUGH MY STORY <span aria-hidden="true">↓</span>
        </span>
      </div>
      <div className="journey-route-wrap" ref={route}>
        <div
          className="journey-route"
          role="group"
          aria-label="Choose a chapter"
        >
          {chapters.map((chapter, index) => (
            <button
              key={chapter.year}
              aria-pressed={index === active}
              onClick={() => travel(index)}
            >
              {chapter.year}
              <span aria-hidden="true" />
            </button>
          ))}
        </div>
        {!compact && !calm && (
          <button
            className="journey-reading-toggle"
            aria-pressed={reading}
            onClick={toggleReading}
          >
            {reading ? "Explore with motion" : "Read as page"}
          </button>
        )}
      </div>
      <span className="journey-year-probe" aria-hidden="true">
        <span style={{ fontVariationSettings: YEAR_REST }}>2026</span>
        <span style={{ fontVariationSettings: YEAR_HOVER }}>2026</span>
        <span style={{ fontVariationSettings: YEAR_REST }}>20</span>
        <span style={{ fontVariationSettings: YEAR_HOVER }}>20</span>
      </span>
      <div
        className="journey-cinema"
        ref={cinema}
        data-active-year={chapters[active].year}
        data-photo-index={indices[active]}
        data-layout={flat ? "reading" : "immersive"}
      >
        <div className="journey-media-pin" aria-hidden="true">
          <ScrollExpand
            useWindowScroll
            externalProgress={opening}
            enabled={!flat}
            startWidth={FRAME_START_WIDTH}
            startHeight={68}
            startRadius={28}
            endRadius={5}
            mediaZoom={1.08}
            className="journey-expansion"
            mediaContent={<PhotoLayers photo={selectedPhoto} calm={flat} />}
          />
        </div>
        {!flat && (
          <div
            className="journey-photo-console"
            onPointerEnter={() => setHoveringControls(true)}
            onPointerLeave={() => setHoveringControls(false)}
            onFocus={() => setHoveringControls(true)}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget))
                setHoveringControls(false);
            }}
          >
            <PhotoControls
              chapter={selectedChapter}
              index={indices[active]}
              change={(delta) => changePhoto(active, delta)}
              enlarge={enlarge}
              paused={paused}
              toggle={() => setPaused((value) => !value)}
            />
          </div>
        )}
        <div className="journey-flow">
          {photoChapters.map((chapter, index) => {
            const photo = chapter.photos[indices[index]];
            const final = index === photoChapters.length - 1;
            const stackYear = !flat && yearLayout.stacked;
            return (
              <article
                id={`journey-${chapter.year}`}
                className={`journey-stop ${active === index ? "is-current" : ""} ${storyShown[index] ? "is-story" : ""}`}
                key={chapter.year}
                aria-labelledby={`journey-title-${chapter.year}`}
                data-photo-count={chapter.photos.length}
                data-final={final ? "true" : undefined}
              >
                <div className="journey-year-sheet" aria-hidden="true">
                  <div className="journey-year-content">
                    <span className="journey-year-place">
                      {settings[index][0]}
                    </span>
                    <div
                      className="journey-year-fit"
                      ref={index === 0 ? firstYear : undefined}
                    >
                      <VariableProximity
                        label={
                          stackYear
                            ? `${chapter.year.slice(0, 2)}\n${chapter.year.slice(2)}`
                            : chapter.year
                        }
                        className="journey-year-type"
                        fromFontVariationSettings={YEAR_REST}
                        toFontVariationSettings={YEAR_HOVER}
                        containerRef={cinema}
                        radius={yearLayout.radius}
                        falloff="linear"
                        enabled={!flat}
                        active={available && active === index}
                      />
                    </div>
                    <span className="journey-year-note">
                      {settings[index][1]}
                      <span>↓</span>
                    </span>
                  </div>
                </div>
                {flat && photo && (
                  <div className="journey-reading-photo">
                    <img src={photo.src} alt={photo.title} loading="lazy" />
                    <div className="journey-reading-controls">
                      <PhotoControls
                        chapter={chapter}
                        index={indices[index]}
                        change={(delta) => changePhoto(index, delta)}
                        enlarge={enlarge}
                        compact
                      />
                    </div>
                  </div>
                )}
                <div className="journey-story">
                  <motion.div
                    className="journey-story-drag"
                    style={flat ? undefined : { y: drag }}
                  >
                    <div className="journey-story-copy">
                      <p className="journey-stop-place">
                        {chapter.year} <span aria-hidden="true">/</span>{" "}
                        {settings[index][0]}
                      </p>
                      <MaskedHeading
                        id={`journey-title-${chapter.year}`}
                        text={chapter.title}
                        tag="h3"
                        src={photo?.src || PRESENT_TEXTURE}
                        className="journey-masked-title"
                        align="left"
                        reveal="wipe"
                        trigger="view"
                        fillScale={1.3}
                        parallax={34}
                        drift={10}
                        brightness={photo ? 1.1 : 1}
                        saturation={1.12}
                        duration={1.1}
                        stagger={0.05}
                        enabled={!flat && armed}
                        active={available && storyShown[index]}
                        replayKey={revealTokens[index]}
                      />
                      <ScrollReveal
                        containerClassName="journey-stop-intro"
                        triggerSelector=".journey-stop"
                        start={wordsStart}
                        wordAnimationEnd={wordsEnd}
                        rotationEnd={tiltEnd}
                        scrub={SCRUB}
                        enabled={!flat && armed}
                        active={available}
                        baseOpacity={0}
                        enableBlur
                        baseRotation={5}
                        blurStrength={10}
                      >
                        {chapter.intro}
                      </ScrollReveal>
                      <div className="journey-chapter-details">
                        <p className="journey-detail-label">
                          WHAT I TOOK PART IN
                        </p>
                        <ul>
                          {chapter.details.map((detail) => (
                            <li key={detail}>{detail}</li>
                          ))}
                        </ul>
                      </div>
                      {final && (
                        <a
                          className="text-link journey-next-page"
                          href="#projects"
                        >
                          See what I’m making <ArrowUpRight size={18} />
                        </a>
                      )}
                    </div>
                  </motion.div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
      <a
        className="text-link journey-source"
        href={`${originalUrl}#timeline`}
        target="_blank"
        rel="noreferrer"
      >
        Explore the original photo archive <ArrowUpRight size={17} />
      </a>
    </section>
  );
}
