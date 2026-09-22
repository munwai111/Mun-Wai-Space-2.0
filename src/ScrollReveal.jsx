// Adapted from React Bits ScrollReveal (JS-CSS), MIT + Commons Clause.
// Licence: licences/react-bits-LICENSE.md. Provenance: vendor/react-bits/PROVENANCE.md.
import { useEffect, useRef, useMemo } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./ScrollReveal.css";

gsap.registerPlugin(ScrollTrigger);

export default function ScrollReveal({
  children,
  scrollContainerRef,
  enableBlur = true,
  baseOpacity = 0,
  baseRotation = 5,
  blurStrength = 10,
  containerClassName = "",
  textClassName = "",
  rotationEnd = "bottom 72%",
  wordAnimationEnd = "bottom 72%",
  start = "top 94%",
  scrub = 0.45,
  // An ancestor, such as a sticky chapter track, can own the scroll range.
  // start and end then accept ScrollTrigger functions measured against it.
  triggerSelector = "",
  enabled = true,
  active = true,
}) {
  const containerRef = useRef(null);
  const triggersRef = useRef([]);
  const text = typeof children === "string" ? children : "";
  const words = useMemo(
    () =>
      text.split(/(\s+)/).map((word, index) =>
        /^\s+$/.test(word) ? (
          word
        ) : (
          <span className="word" key={index}>
            {word}
          </span>
        ),
      ),
    [text],
  );

  useEffect(() => {
    const el = containerRef.current;
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    let context;
    const setup = () => {
      context?.revert();
      triggersRef.current = [];
      const wordElements = el.querySelectorAll(".word");
      if (!enabled || preference.matches) {
        gsap.set(el, { rotate: 0 });
        gsap.set(wordElements, { opacity: 1, filter: "none" });
        el.dataset.revealProgress = "1";
        return;
      }
      context = gsap.context(() => {
        const scroller = scrollContainerRef?.current || window;
        const trigger = (triggerSelector && el.closest(triggerSelector)) || el;
        // Function positions are re-measured on every refresh. The tweens are not
        // invalidated, which would let unstarted words lose their hidden state.
        const tilt = gsap.fromTo(
          el,
          { transformOrigin: "0% 50%", rotate: baseRotation },
          {
            rotate: 0,
            ease: "none",
            scrollTrigger: {
              trigger,
              scroller,
              start,
              end: rotationEnd,
              scrub,
            },
          },
        );
        const reveal = gsap.fromTo(
          wordElements,
          {
            opacity: baseOpacity,
            filter: enableBlur ? `blur(${blurStrength}px)` : "none",
          },
          {
            opacity: 1,
            filter: "blur(0px)",
            stagger: 0.045,
            ease: "none",
            scrollTrigger: {
              trigger,
              scroller,
              start,
              end: wordAnimationEnd,
              scrub,
              onUpdate: (self) => {
                el.dataset.revealProgress = self.progress.toFixed(4);
              },
            },
          },
        );
        triggersRef.current = [tilt.scrollTrigger, reveal.scrollTrigger];
      }, el);
    };
    setup();
    preference.addEventListener("change", setup);
    return () => {
      context?.revert();
      triggersRef.current = [];
      preference.removeEventListener("change", setup);
    };
  }, [
    text,
    enabled,
    scrollContainerRef,
    baseOpacity,
    baseRotation,
    enableBlur,
    blurStrength,
    rotationEnd,
    wordAnimationEnd,
    start,
    scrub,
    triggerSelector,
  ]);

  useEffect(() => {
    // The section's native scroll position survives overlay and tab suspension.
    triggersRef.current.forEach((trigger) => {
      if (!trigger) return;
      if (active) trigger.enable(false, true);
      else {
        trigger.getTween()?.pause();
        trigger.disable(false, false);
      }
    });
  }, [active, enabled]);

  return (
    <div ref={containerRef} className={`scroll-reveal ${containerClassName}`}>
      <p className={`scroll-reveal-text ${textClassName}`}>
        <span className="sr-only">{text}</span>
        <span aria-hidden="true">{words}</span>
      </p>
    </div>
  );
}
