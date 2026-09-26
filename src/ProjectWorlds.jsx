import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowUpRight, ArrowLeft, ArrowRight } from "@phosphor-icons/react";
import Ink from "./Ink";
import JournalMarks from "./JournalMarks";
import { projects } from "./data";
import { cardFacts } from "./cases";
import "./project-worlds.css";

// The selected work, in the same journal language as the places section:
// one project at a time, tinted to its own colour, with the facts that were
// on the old cards kept visible and a way through to the full case study.
export default function ProjectWorlds({ calm, onOpen }) {
  const [index, setIndex] = useState(0);
  const tabs = useRef(null);
  const p = projects[index];
  const facts = cardFacts[p.id] || {};

  const step = (direction) =>
    setIndex((v) => (v + direction + projects.length) % projects.length);

  // Left/right arrows move between projects when the tab row has focus.
  useEffect(() => {
    const el = tabs.current;
    const onKey = (e) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      e.preventDefault();
      const next =
        (index + (e.key === "ArrowRight" ? 1 : -1) + projects.length) %
        projects.length;
      setIndex(next);
      el.querySelectorAll("button")[next]?.focus();
    };
    el.addEventListener("keydown", onKey);
    return () => el.removeEventListener("keydown", onKey);
  }, [index]);

  return (
    <div
      className="pworld"
      style={{ "--world-ink": facts.ink, "--world-paper": facts.paper }}
    >
      <div
        className="world-tabs"
        role="group"
        aria-label="Choose a project"
        ref={tabs}
      >
        {projects.map((x, i) => (
          <button
            key={x.id}
            type="button"
            aria-pressed={index === i}
            aria-controls="pworld-panel"
            onClick={() => setIndex(i)}
          >
            {cardFacts[x.id]?.tab || x.name}
          </button>
        ))}
      </div>

      <div
        id="pworld-panel"
        className="world-stage pworld-stage"
        role="region"
        aria-label="Selected work"
      >
        <div className="world-content">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={p.id}
              className="world-copy pworld-copy"
              initial={calm ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              // the outgoing panel stays mounted while it fades, so its
              // links are disabled to stop a fast click hitting the old project
              exit={{ opacity: 0, y: calm ? 0 : -8, pointerEvents: "none" }}
              transition={{ duration: calm ? 0 : 0.25 }}
            >
              <span className="section-label">{p.category}</span>
              <JournalMarks name={p.name} marks={facts.marks} />
              <h3>
                <Ink>{p.subtitle}</Ink>
              </h3>
              <p>{p.summary}</p>

              {facts.role && (
                <dl className="pworld-facts">
                  <div>
                    <dt>Role</dt>
                    <dd>{facts.role}</dd>
                  </div>
                  <div>
                    <dt>Scale</dt>
                    <dd>{facts.scale}</dd>
                  </div>
                  <div>
                    <dt>Delivered</dt>
                    <dd>{facts.delivered}</dd>
                  </div>
                </dl>
              )}

              <ul className="pworld-stack" aria-label="Built with">
                {p.stack.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>

              <div className="pworld-actions">
                {facts.href ? (
                  <a className="pworld-cta" href={facts.href}>
                    Explore the full case study
                    <ArrowRight size={17} weight="bold" />
                  </a>
                ) : (
                  <button
                    type="button"
                    className="pworld-cta"
                    onClick={() => onOpen(p)}
                  >
                    Explore this project
                    <ArrowRight size={17} weight="bold" />
                  </button>
                )}
                {p.link && (
                  <a
                    className="pworld-link"
                    href={p.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {p.linkText}
                    <ArrowUpRight
                      size={15}
                      weight="bold"
                      aria-label="opens in a new tab"
                    />
                  </a>
                )}
              </div>

              <span className="world-folio">
                {String(index + 1).padStart(2, "0")} / {p.status} · {p.year}
              </span>
            </motion.div>
          </AnimatePresence>

          <div className="pworld-visual">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={p.id}
                className={"project-art " + p.kind}
                initial={calm ? false : { opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: calm ? 0 : 0.3 }}
                aria-hidden="true"
              >
                <span className="poster-mark assembly">{p.mark}</span>
                <span className="poster-caption">{facts.caption}</span>
              </motion.span>
            </AnimatePresence>
          </div>
        </div>

        <div className="world-carousel-controls">
          <span className="world-counter" aria-live="polite" aria-atomic="true">
            {String(index + 1).padStart(2, "0")} /{" "}
            {String(projects.length).padStart(2, "0")}
            <span>{facts.tab || p.name}</span>
          </span>
          <div className="world-carousel-buttons">
            <button type="button" onClick={() => step(-1)} aria-label="Previous project">
              <ArrowLeft size={19} />
            </button>
            <button type="button" onClick={() => step(1)} aria-label="Next project">
              <ArrowRight size={19} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
