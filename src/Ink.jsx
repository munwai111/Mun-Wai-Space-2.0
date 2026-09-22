import {
  Children,
  isValidElement,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useInView } from "motion/react";
let runtimePromise;
const loadWriting = () => (runtimePromise ||= import("./ink-runtime"));

function textTokens(children) {
  return Children.toArray(children).flatMap((child) => {
    if (typeof child === "string" || typeof child === "number")
      return String(child).split(/(\s+)/).filter(Boolean);
    if (isValidElement(child) && child.type === "br") return ["\n"];
    return [];
  });
}

// Real text reserves the layout. Temporary SVG masks follow original pen
// routes; the exact native letterforms take over as each letter is finished.
export default function Ink({ children, typewriter = false }) {
  const ref = useRef(null);
  const id = useId().replace(/:/g, "");
  const seen = useInView(ref, { once: true, amount: 0.2 });
  const tokens = textTokens(children);
  const contentKey = `${typewriter}:${tokens.join("")}`;
  const [kind, setKind] = useState("manrope");
  const [maximum, setMaximum] = useState(2200);
  const [ready, setReady] = useState(false);
  const [runtime, setRuntime] = useState(null);
  const [completed, setCompleted] = useState(null);

  useLayoutEffect(() => {
    const signature = !!ref.current?.closest(".assembly");
    setKind(signature ? "assembly" : "manrope");
    setMaximum(signature ? 2800 : ref.current?.closest("h3") ? 1400 : 2200);
  }, []);

  const font = runtime?.[kind];
  const PenGlyph = runtime?.PenGlyph;
  const timeline = useMemo(
    () =>
      seen && runtime && !typewriter
        ? runtime.writingTimeline(tokens, font, maximum)
        : null,
    // The textual key avoids rebuilding for unrelated parent state changes.
    [contentKey, seen, font, maximum, runtime],
  );
  const finished = completed === contentKey;
  const drawing = seen && ready && (typewriter || !!runtime) && !finished;

  useEffect(() => {
    if (!seen) return;
    let alive = true;
    if (
      document.documentElement.dataset.calm === "true" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setCompleted(contentKey);
      setReady(true);
      return;
    }
    // Reading must never depend on an animation asset or a font request.
    const fallback = setTimeout(() => {
      if (alive) setCompleted(contentKey);
    }, 1200);
    Promise.all([document.fonts.ready, typewriter ? null : loadWriting()])
      .then(([, writing]) => {
        if (!alive) return;
        clearTimeout(fallback);
        if (writing) setRuntime(writing);
        setReady(true);
      })
      .catch(() => {
        if (!alive) return;
        clearTimeout(fallback);
        setCompleted(contentKey);
        setReady(true);
      });
    return () => {
      alive = false;
      clearTimeout(fallback);
    };
  }, [seen, contentKey, typewriter]);

  useEffect(() => {
    if (!drawing) return;
    const node = ref.current;
    const finish = () => setCompleted(contentKey);
    const check = () => {
      const root = document.documentElement;
      const hiddenByScene =
        (root.classList.contains("listening-open") ||
          root.classList.contains("impact-open") ||
          root.classList.contains("film-open")) &&
        !node.closest("dialog[open]");
      if (
        document.hidden ||
        root.dataset.calm === "true" ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
        hiddenByScene
      )
        finish();
    };
    check();
    const visibility = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) finish();
    });
    visibility.observe(node);
    const settings = new MutationObserver(check);
    settings.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-calm"],
    });
    document.addEventListener("visibilitychange", check);
    const duration = typewriter
      ? tokens.join("").length * 65 + 150
      : timeline.duration;
    const timer = setTimeout(finish, duration + 100);
    return () => {
      clearTimeout(timer);
      visibility.disconnect();
      settings.disconnect();
      document.removeEventListener("visibilitychange", check);
    };
  }, [drawing, contentKey, timeline, typewriter]);

  let index = 0;
  const letters = (items) =>
    Children.map(items, (item) => {
      if (typeof item === "string" || typeof item === "number") {
        return String(item)
          .split(/(\s+)/)
          .map((word, n) =>
            /^\s+$/.test(word) ? (
              word
            ) : (
              <span className="ink-word" key={n}>
                {Array.from(word).map((character) => {
                  const position = index++;
                  const letter = timeline?.letters[position];
                  return (
                    <span
                      className="ink-letter"
                      key={`${contentKey}-${position}`}
                      style={{
                        "--ink-delay": `${position * 65}ms`,
                        "--glyph-end": `${letter?.end || 0}ms`,
                      }}
                    >
                      <span className="ink-native">{character}</span>
                      {drawing && !typewriter && letter && (
                        <PenGlyph
                          letter={letter}
                          font={font}
                          family={
                            kind === "assembly" ? "Mun Wai Assembly" : "Manrope"
                          }
                          maskId={`${id}-pen-${position}`}
                        />
                      )}
                    </span>
                  );
                })}
              </span>
            ),
          );
      }
      if (isValidElement(item) && item.type === "br") return <br />;
      return item;
    });

  return (
    <span
      ref={ref}
      className={`ink-writing ${typewriter ? "ink-typewriter" : ""}`}
      data-written={seen}
      data-phase={finished ? "finished" : drawing ? "drawing" : "waiting"}
      data-ink-font={kind}
    >
      <span className="sr-only">{children}</span>
      <span aria-hidden="true">{seen ? letters(children) : children}</span>
    </span>
  );
}
