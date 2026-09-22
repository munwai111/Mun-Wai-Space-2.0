import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Play, X, InstagramLogo } from "@phosphor-icons/react";
import { films } from "./films";
import Ink from "./Ink";
import "./film-journal.css";

function FilmViewer({ film, close }) {
  const dialog = useRef(null);
  const [status, setStatus] = useState("loading");
  useEffect(() => {
    const opener = document.activeElement;
    const overflow = document.body.style.overflow;
    dialog.current.showModal();
    document.body.style.overflow = "hidden";
    document.documentElement.classList.add("film-open");
    const timeout = setTimeout(
      () => setStatus((current) => (current === "loading" ? "slow" : current)),
      10000,
    );
    return () => {
      clearTimeout(timeout);
      document.body.style.overflow = overflow;
      document.documentElement.classList.remove("film-open");
      opener?.focus({ preventScroll: true });
    };
  }, []);
  return createPortal(
    <dialog
      ref={dialog}
      className="film-viewer"
      aria-labelledby="film-viewer-title"
      aria-describedby="film-provider-note"
      onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        const first = dialog.current.querySelector("a, button");
        const last = dialog.current.querySelector(".film-viewer-copy a");
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }}
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const rect = event.currentTarget.getBoundingClientRect();
        if (
          event.clientX < rect.left ||
          event.clientX > rect.right ||
          event.clientY < rect.top ||
          event.clientY > rect.bottom
        )
          close();
      }}
    >
      <div className="film-viewer-header">
        <span>THE FILM JOURNAL</span>
        <a
          className="film-header-original"
          href={film.url}
          target="_blank"
          rel="noreferrer"
          aria-label="Open this reel on Instagram"
        >
          Instagram <ArrowUpRight size={13} />
        </a>
        <button
          className="icon-button"
          onClick={close}
          aria-label="Close reel and return to the journal"
          autoFocus
        >
          <X size={21} />
        </button>
      </div>
      <div className="film-viewer-body">
        <div className="film-embed">
          <iframe
            src={`https://www.instagram.com/reel/${film.url.split("/reel/")[1]}embed/`}
            title={`${film.title} — Instagram reel by ${film.creator}`}
            allow="encrypted-media; fullscreen; picture-in-picture"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            onLoad={() => setStatus("loaded")}
            onError={() => setStatus("error")}
          />
        </div>
        <div className="film-viewer-copy">
          <p className="film-kicker">{film.setting}</p>
          <h2 id="film-viewer-title">
            <Ink>{film.title}</Ink>
          </h2>
          <p>{film.description}</p>
          <span className="film-credit">
            {film.creator}
            <br />
            {film.date}
            {film.duration && ` · ${film.duration}`}
          </span>
          <a
            className="button primary"
            href={film.url}
            target="_blank"
            rel="noreferrer"
          >
            Open reel on Instagram <ArrowUpRight size={18} />
          </a>
          <p id="film-provider-note" className="film-provider-note">
            Instagram may ask you to sign in. You can also watch through the
            original post.
          </p>
          <p className="film-load-status" role="status">
            {status === "loading"
              ? "Opening the Instagram reel…"
              : status === "error" || status === "slow"
                ? "If the reel hasn’t appeared, use the Instagram link above."
                : ""}
          </p>
        </div>
      </div>
    </dialog>,
    document.body,
  );
}

export default function FilmJournal({ calm }) {
  const coverButton = useRef(null);
  const [filter, setFilter] = useState("All films");
  const [selectedId, setSelectedId] = useState(films[0].id);
  const [opened, setOpened] = useState(null);
  const visible =
    filter === "All films"
      ? films
      : films.filter((film) => film.category === filter);
  const selected = visible.find((film) => film.id === selectedId) || visible[0];
  const external = selected.playback === "instagram";
  const WatchCover = external ? "a" : "button";
  const categories = [
    "All films",
    ...new Set(films.map((film) => film.category)),
  ];
  return (
    <div className="film-journal">
      <div className="film-journal-topline">
        <span>THE FILM JOURNAL</span>
        <span>
          {String(films.length).padStart(2, "0")} moments, kept in motion
        </span>
      </div>
      <div className="film-filters" role="group" aria-label="Filter films">
        {categories.map((category) => (
          <button
            key={category}
            aria-pressed={filter === category}
            onClick={() => {
              setFilter(category);
            }}
          >
            {category}
          </button>
        ))}
      </div>
      <div className="film-stage">
        <div className="film-feature">
          <WatchCover
            ref={coverButton}
            className="film-cover"
            data-external={external}
            aria-describedby="film-feature-title"
            aria-haspopup={external ? undefined : "dialog"}
            href={external ? selected.url : undefined}
            target={external ? "_blank" : undefined}
            rel={external ? "noreferrer" : undefined}
            onClick={external ? undefined : () => setOpened(selected)}
          >
            <AnimatePresence initial={false} mode="sync">
              <motion.div
                key={selected.id}
                className="film-cover-scene"
                initial={calm ? false : { opacity: 0, scale: 1.025 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: calm ? 0 : 0.55,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                {selected.cover ? (
                  <img
                    src={selected.cover}
                    alt={selected.coverAlt}
                    width="650"
                    height="650"
                    loading="lazy"
                  />
                ) : (
                  <div className="film-lettering" aria-hidden="true">
                    <svg viewBox="0 0 400 400" fill="none">
                      {Array.from({ length: 12 }, (_, i) => (
                        <path
                          key={i}
                          d={`M-40 ${130 + i * 16} C 95 ${-50 + i * 22}, 185 ${455 - i * 20}, 450 ${110 + i * 17}`}
                        />
                      ))}
                    </svg>
                    <span className="assembly">
                      {selected.lettering.map((line) => (
                        <span key={line}>{line}</span>
                      ))}
                    </span>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
            <span className="film-cover-label">
              {selected.coverNote || selected.setting}
            </span>
            <span className="film-play">
              {external ? (
                <ArrowUpRight size={21} />
              ) : (
                <Play size={21} weight="fill" />
              )}{" "}
              <span>{external ? "Watch on Instagram" : "Watch reel"}</span>
            </span>
            {selected.duration && (
              <span className="film-duration">{selected.duration}</span>
            )}
          </WatchCover>
          <div
            className="film-feature-copy"
            aria-live="polite"
            aria-atomic="true"
          >
            <p className="film-kicker">{selected.setting}</p>
            <h3 id="film-feature-title">
              <Ink>{selected.title}</Ink>
            </h3>
            <p>{selected.description}</p>
            <a
              className="film-original"
              href={selected.url}
              target="_blank"
              rel="noreferrer"
            >
              <InstagramLogo size={16} />
              <span>{selected.creator}</span>
              <ArrowUpRight size={15} />
            </a>
          </div>
        </div>
        <div className="film-index">
          <p className="film-index-label">
            CHOOSE A MOMENT{" "}
            <span>{String(visible.length).padStart(2, "0")}</span>
          </p>
          <div className="film-list" role="group" aria-label="Choose a film">
            {visible.map((film, index) => (
              <button
                key={film.id}
                aria-pressed={film.id === selected.id}
                className="film-choice"
                onClick={() => {
                  setSelectedId(film.id);
                  if (matchMedia("(max-width:700px)").matches) {
                    requestAnimationFrame(() => {
                      coverButton.current?.focus({ preventScroll: true });
                      coverButton.current?.scrollIntoView({
                        behavior: calm ? "instant" : "smooth",
                        block: "center",
                      });
                    });
                  }
                }}
              >
                <span className="film-number">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="film-choice-copy">
                  <span>{film.title}</span>
                  <small>
                    {film.creator} · {film.date}
                  </small>
                </span>
                <Play
                  size={15}
                  weight={film.id === selected.id ? "fill" : "regular"}
                />
              </button>
            ))}
          </div>
          <p className="film-index-note">
            Interviews, university days and a few detours with good company.
          </p>
        </div>
      </div>
      {opened && <FilmViewer film={opened} close={() => setOpened(null)} />}
    </div>
  );
}
