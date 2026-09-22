import { useEffect, useRef, useState } from "react";
import Polaroid from "./Polaroid";
import JournalMarks from "./JournalMarks";
import Ink from "./Ink";
import "./polaroid.css";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowUpRight,
  ArrowLeft,
  ArrowRight,
  Pause,
  Play,
} from "@phosphor-icons/react";
const worlds = [
  {
    name: "UNIQLO",
    tag: "COMMERCIAL PRACTICE",
    headline: "Think clearly. Work with people.",
    body: "Store development at Malaysia HQ brings commercial decisions into the real world: leases, stakeholders, operational priorities and a network of stores. My earlier Global Management Program experience in Tokyo added an international perspective.",
    colour: "#861923",
    paper: "#f5e9e4",
    photos: ["/images/journey-9-1.webp", "/images/journey-9-0.webp"],
    alt: "Archive photograph from the UNIQLO Global Management Program",
    url: "https://www.linkedin.com/feed/update/urn:li:activity:7451107800451268608/",
    linkLabel: "Read the role announcement",
    mark: "01 / EVERYDAY DECISIONS",
    visualNote: "TOKYO / 2024",
    visualDetail: "GLOBAL MANAGEMENT PROGRAM",
  },
  {
    name: "VTAC",
    tag: "STUDENT EXPERIENCE",
    headline: "Make the next step easier to see.",
    body: "A team challenge became an internship opportunity. I brought behavioural research, interface design and marketing communication together around a practical question: how can students find a pathway that makes sense for them?",
    colour: "#284f8a",
    paper: "#e9eef5",
    photos: ["/images/journey-12-1.webp", "/images/journey-12-0.webp"],
    alt: "Archive photograph from the VTAC chapter",
    url: "https://www.linkedin.com/feed/update/urn:li:activity:7396752940243443713/",
    linkLabel: "Open the internship chapter",
    mark: "02 / CLEARER PATHWAYS",
    visualNote: "STUDENT PATHWAYS / 2025",
    visualDetail: "RESEARCH / INTERFACE / COMMUNICATION",
  },
  {
    name: "RMIT CIAIRI",
    tag: "APPLIED RESEARCH",
    headline: "Ask what the evidence can support.",
    body: "At RMIT’s Centre for Industrial AI Research & Innovation, my research assistant internship involved literature review, bibliometric analysis, methodology and data validation. It is where curiosity had to become a defensible method.",
    colour: "#982f37",
    paper: "#eee9e7",
    photos: ["/images/journey-11-1.webp", "/images/journey-11-0.webp"],
    alt: "Archive photograph from the RMIT research chapter",
    url: "https://munwai-portfolio-enhanced-main.vercel.app/",
    linkLabel: "Open the original portfolio archive",
    mark: "03 / RESEARCH IN PRACTICE",
    visualNote: "RESEARCH / 2024–25",
    visualDetail: "METHOD / EVIDENCE / VALIDATION",
  },
  {
    name: "Xolvit",
    tag: "COLLABORATIVE PROBLEM-SOLVING",
    headline: "A good idea gets better in company.",
    body: "The VTAC and Xolvit challenge brought three of us together to work on education access. The later interview was a chance to reflect on the experience, the internship and learning by working with others.",
    colour: "#654399",
    paper: "#eee9f4",
    photos: ["/images/journey-5-0.webp"],
    alt: "Archive photograph from the Xolvit challenge",
    url: "https://www.linkedin.com/feed/update/urn:li:activity:7396752911017414658/",
    linkLabel: "Open the challenge reflection",
    mark: "04 / SHARED MOMENTUM",
    visualNote: "WORKSHOP NOTES",
    visualDetail: "THREE PERSPECTIVES / ONE PROBLEM",
  },
  {
    name: "YakBit AI",
    tag: "INDUSTRY PROJECT",
    headline: "Listen for what the numbers miss.",
    body: "In a short industry project, I worked with a multidisciplinary team on customer journey analysis and a strategic proposal for YakBit. Its focus on participation and meeting behaviour connected naturally with my psychology background.",
    colour: "#266a61",
    paper: "#e4efeb",
    photos: [null],
    alt: "",
    url: "https://yakbit.ai/",
    linkLabel: "Explore the organisation",
    mark: "05 / HUMAN SIGNALS",
  },
  {
    name: "Kansai University",
    tag: "WINTER EXCHANGE · JAPAN",
    headline: "Learn by being somewhere new.",
    body: "A winter exchange in January 2023 brought Osaka’s mercantile history, introductory Japanese and new relationships into the same experience. An academic chapter, and a reminder that learning also happens outside the classroom.",
    colour: "#64462f",
    paper: "#f3eadb",
    photos: ["/images/journey-7-1.webp", "/images/journey-7-0.webp"],
    alt: "Archive photograph from the Kansai University winter exchange",
    url: "https://www.kansai-u.ac.jp/English/",
    linkLabel: "Explore the university",
    mark: "06 / A WIDER PERSPECTIVE",
    visualNote: "OSAKA / JAN 2023",
    visualDetail: "WINTER EXCHANGE",
  },
  {
    name: "SuperAI",
    tag: "AI COMMUNITY · SINGAPORE",
    headline: "Go where the conversation is happening.",
    body: "Attending SuperAI in Singapore was a chance to step outside my own projects and meet people exploring what AI could become. A different setting for the same curiosity: how do we turn an interesting idea into something people can use?",
    colour: "#343d8d",
    paper: "#ececf6",
    photos: ["/images/journey-13-0.webp", "/images/journey-13-1.webp"],
    alt: "Mun Wai’s archive photograph from SuperAI in Singapore",
    url: "https://www.superai.com/",
    linkLabel: "Explore SuperAI",
    mark: "07 / CONVERSATIONS BEYOND THE SCREEN",
    visualNote: "SINGAPORE / 2025",
    visualDetail: "SUPERAI · EVENT ATTENDEE",
  },
];
const frames = worlds.flatMap((world, chapter) =>
  world.photos.map((image, photo) => ({ chapter, photo, image })),
);
export default function Worlds({ calm }) {
  const [cursor, setCursor] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  const [available, setAvailable] = useState(!document.hidden);
  const stage = useRef(null);
  const { chapter: selected, photo, image } = frames[cursor];
  const w = worlds[selected];
  const running =
    visible && available && !calm && !paused && !hovered && !focused;
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.15 },
    );
    observer.observe(stage.current);
    const update = () =>
      setAvailable(
        !document.hidden &&
          !document.documentElement.classList.contains("listening-open") &&
          !document.documentElement.classList.contains("impact-open") &&
          !document.documentElement.classList.contains("film-open"),
      );
    const modal = new MutationObserver(update);
    modal.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    document.addEventListener("visibilitychange", update);
    update();
    return () => {
      observer.disconnect();
      modal.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, []);
  useEffect(() => {
    if (!running) return;
    const timer = setTimeout(
      () => setCursor((v) => (v + 1) % frames.length),
      7000,
    );
    return () => clearTimeout(timer);
  }, [running, cursor]);
  const step = (direction) =>
    setCursor((v) => (v + direction + frames.length) % frames.length);
  return (
    <section className="worlds section-wrap" id="worlds">
      <p className="section-label">ONE PERSON. DIFFERENT SETTINGS.</p>
      <h2>
        <Ink>
          The places that
          <br />
          changed my perspective.
        </Ink>
      </h2>
      <p className="section-description">
        A few moments from the places that shaped me. Let them unfold, or choose
        a chapter.
      </p>
      <div
        className="world-tabs"
        role="group"
        aria-label="Explore organisations"
      >
        {worlds.map((x, i) => (
          <button
            key={x.name}
            aria-pressed={selected === i}
            aria-controls="world-panel"
            onClick={() =>
              setCursor(frames.findIndex((frame) => frame.chapter === i))
            }
          >
            {x.name}
          </button>
        ))}
      </div>
      <div
        ref={stage}
        id="world-panel"
        className="world-stage"
        style={{ "--world-ink": w.colour, "--world-paper": w.paper }}
        role="region"
        aria-roledescription="carousel"
        aria-label="Experience photo stories"
        onPointerEnter={(e) => {
          if (e.pointerType === "mouse") setHovered(true);
        }}
        onPointerLeave={() => setHovered(false)}
        onFocusCapture={() => setFocused(true)}
        onBlurCapture={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false);
        }}
      >
        <div className="world-content">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={w.name}
              className="world-copy"
              initial={calm ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: calm ? 0 : -8 }}
              transition={{ duration: calm ? 0 : 0.25 }}
            >
              <span className="section-label">{w.tag}</span>
              <JournalMarks name={w.name} />
              <h3>
                <Ink>{w.headline}</Ink>
              </h3>
              <p>{w.body}</p>
              <a href={w.url} target="_blank" rel="noreferrer">
                {w.linkLabel}
                <ArrowUpRight size={20} />
              </a>
              <span className="world-folio">{w.mark}</span>
            </motion.div>
          </AnimatePresence>
          <Polaroid
            world={w}
            image={image}
            photo={photo}
            calm={calm}
            floating={visible && available && !paused && !calm}
          />
        </div>
        <div className="world-carousel-controls">
          <span
            className="world-counter"
            aria-live={running ? "off" : "polite"}
            aria-atomic="true"
          >
            {String(cursor + 1).padStart(2, "0")} /{" "}
            {String(frames.length).padStart(2, "0")}
            <span>
              {w.name} ·{" "}
              {image
                ? `Photo ${photo + 1} of ${w.photos.length}`
                : "Illustrated chapter"}
            </span>
          </span>
          <div className="world-carousel-buttons">
            <button onClick={() => step(-1)} aria-label="Previous moment">
              <ArrowLeft size={19} />
            </button>
            <button
              className="world-autoplay"
              aria-pressed={paused || calm}
              disabled={calm}
              onClick={() => setPaused((v) => !v)}
              aria-label={
                paused ? "Play photo carousel" : "Pause photo carousel"
              }
            >
              {paused || calm ? <Play size={16} /> : <Pause size={16} />}
              <span>{calm ? "Still view" : paused ? "Play" : "Pause"}</span>
            </button>
            <button onClick={() => step(1)} aria-label="Next moment">
              <ArrowRight size={19} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
