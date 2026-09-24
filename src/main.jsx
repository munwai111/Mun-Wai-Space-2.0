import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { motion, MotionConfig, useReducedMotion } from "motion/react";
import {
  ArrowUpRight,
  ArrowRight,
  ArrowDown,
  X,
  Plus,
  Minus,
  Sun,
  Moon,
  Pause,
  Play,
  List,
  MagnifyingGlass,
  Check,
  Copy,
  EnvelopeSimple,
  LinkedinLogo,
  InstagramLogo,
  GithubLogo,
} from "@phosphor-icons/react";
import NeuralBrain from "./NeuralBrain";
import HeroPortrait from "./HeroPortrait";
import Journey from "./Journey";
import Ink from "./Ink";
import ImpactNote from "./ImpactNote";
import Podcast from "./Podcast";
import Worlds from "./Worlds";
import FilmJournal from "./FilmJournal";
import QuietField from "./QuietField";
import PageThread from "./PageThread";
import {
  projects,
  experience,
  perspectives,
  linkedin,
  email,
  originalUrl,
} from "./data";
import credentials from "./credentials.json";
import { cardFacts } from "./cases";
import "./styles.css";
import "./journal.css";
import "./refinements.css";
import "./journey-expand.css";

function Reveal({ children, className = "", calm }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce || calm ? false : { opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.08 }}
      transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
function Dialog({ item, close, children, title }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!item) return;
    const previous = document.activeElement;
    const priorOverflow = document.body.style.overflow;
    ref.current.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = priorOverflow;
      previous?.focus();
    };
  }, [item]);
  return item ? (
    <dialog
      ref={ref}
      aria-labelledby="dialog-title"
      onCancel={close}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="dialog-body">
        <button
          className="icon-button dialog-close"
          onClick={close}
          aria-label="Close dialog"
        >
          <X size={22} />
        </button>
        <h2 id="dialog-title">
          <Ink>{title}</Ink>
        </h2>
        {children}
      </div>
    </dialog>
  ) : null;
}
function ProjectDialog({ project, close }) {
  return (
    <Dialog item={project} close={close} title={project?.name}>
      {project && (
        <>
          <p className="dialog-intro">{project.subtitle}</p>
          <div className="project-status">
            {project.status} <span>{project.year}</span>
          </div>
          <p className="role">
            <strong>My role</strong>
            {project.role}
          </p>
          {[
            ["The question", project.challenge],
            ["How I approached it", project.approach],
            ["What came out of it", project.outcome],
            ["What I learnt", project.learning],
          ].map(([label, text]) => (
            <section className="case-section" key={label}>
              <h3>
                <Ink>{label}</Ink>
              </h3>
              <p>{text}</p>
            </section>
          ))}
          <div className="tags">
            {project.stack.map((s) => (
              <span key={s}>{s}</span>
            ))}
          </div>
          {project.link && (
            <a
              className="button primary"
              href={project.link}
              target="_blank"
              rel="noreferrer"
            >
              {project.linkText}
              <ArrowUpRight size={18} />
            </a>
          )}
          <p className="source-note">
            {project.source}{" "}
            <a href={originalUrl + "#builds"} target="_blank" rel="noreferrer">
              Original portfolio <ArrowUpRight size={12} />
            </a>
          </p>
        </>
      )}
    </Dialog>
  );
}
function App() {
  const [theme, setTheme] = useState(
    () => document.documentElement.dataset.theme || "light",
  );
  const [calm, setCalm] = useState(() => {
    try {
      return localStorage.getItem("mw-calm") === "true";
    } catch {
      return false;
    }
  });
  const [menu, setMenu] = useState(false);
  const menuTrigger = useRef(null);
  const [filter, setFilter] = useState("All work");
  const [expanded, setExpanded] = useState(false);
  const [project, setProject] = useState(null);
  const [perspective, setPerspective] = useState(0);
  const [lightbox, setLightbox] = useState(null);
  const [credentialOpen, setCredentialOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [credentialCategory, setCredentialCategory] =
    useState("All disciplines");
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [draft, setDraft] = useState(null);
  const [richness, setRichness] = useState(0);
  const [reduced, setReduced] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(preference.matches);
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);
  const motionOff = calm || reduced;
  const exploreImpactWork = (id) => {
    // Anything with a case study goes to its own page, the same destination as
    // the project card, so there is one route to each piece of evidence.
    const href =
      cardFacts[id]?.href || (id === "experience-uniqlo" ? "/work/uniqlo/" : null);
    if (href) {
      window.location.assign(href);
      return;
    }
    const selectedProject = projects.find((item) => item.id === id);
    if (selectedProject) {
      setProject(selectedProject);
      return;
    }
    const role = document.getElementById(id);
    if (!role) return;
    role.open = true;
    window.history.replaceState(null, "", "#experience");
    role.scrollIntoView({
      behavior: motionOff ? "instant" : "smooth",
      block: "center",
    });
    role.querySelector("summary")?.focus({ preventScroll: true });
  };
  useEffect(() => {
    const update = () => {
      document.documentElement.dataset.pageHidden = String(document.hidden);
    };
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  useEffect(() => {
    if (!menu) return;
    const dismiss = (event) => {
      if (event.key !== "Escape") return;
      setMenu(false);
      menuTrigger.current?.focus();
    };
    document.addEventListener("keydown", dismiss);
    return () => document.removeEventListener("keydown", dismiss);
  }, [menu]);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("mw-theme", theme);
    } catch {}
  }, [theme]);
  useEffect(() => {
    document.documentElement.dataset.calm = motionOff ? "true" : "false";
    try {
      localStorage.setItem("mw-calm", String(calm));
    } catch {}
  }, [calm, motionOff]);
  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2400);
    return () => clearTimeout(t);
  }, [copied]);
  const visibleProjects = projects
    .filter((p) => filter === "All work" || p.category === filter)
    .slice(0, expanded || filter !== "All work" ? 99 : 4);
  const matches = credentials.filter(
    (c) =>
      (credentialCategory === "All disciplines" ||
        c.category === credentialCategory) &&
      `${c.title} ${c.organisation} ${c.skills.join(" ")}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const life = [
    {
      title: "People I can be myself around.",
      body: "Across Kuala Lumpur, Dubai and Melbourne, people have made places feel like home. I make room for the long conversation, the club event and the friend who needs a hand.",
      label: "Connection",
      image: "/images/journey-2-0.webp",
      alt: "RMIT University Malaysian Association community group",
    },
    {
      title: "Enough curiosity to be a beginner.",
      body: "Psychology, AI, music and research give me different ways into a question. I like learning something unfamiliar, testing it and finding out where my first assumption was wrong.",
      label: "Curiosity",
      image: "/images/journey-3-0.webp",
      alt: "Mun Wai at an RMIT scholarship presentation",
    },
    {
      title: "The nerve to have a go.",
      body: "I entered a hackathon and built Career OS in 18 days. I did not make the first cohort. I came away with a working product and a better understanding of what I can build.",
      label: "Courage",
      image: "/images/journey-5-0.webp",
      alt: "Mun Wai with a fellow Xolvit challenge participant",
    },
    {
      title: "Energy for life outside the work.",
      body: "Badminton gives me a different kind of problem to solve. Music, time with friends and a good conversation keep life bigger than whatever I am building next.",
      label: "Perspective",
      image: "/images/journey-6-0.webp",
      alt: "RMIT Badminton Club activities",
    },
  ];
  const nav = [
    ["About", "about"],
    ["Projects", "projects"],
    ["Experience", "experience"],
    ["Timeline", "timeline"],
    ["Listen", "listen"],
    ["Credentials", "credentials"],
  ];
  return (
    <MotionConfig reducedMotion={motionOff ? "always" : "user"}>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <header className="site-header">
        <PageThread />
        <a href="#home" className="wordmark" aria-label="Mun Wai Space">
          Mun Wai{" "}
          <span>
            <span className="wordmark-word">
              Space
              <sup className="wordmark-tm" aria-hidden="true">
                ™
              </sup>
            </span>
            <span className="wordmark-square" />
          </span>
        </a>
        <nav className="desktop-nav" aria-label="Main navigation">
          {nav.map(([name, id], i) => (
            <a
              key={id}
              href={"#" + id}
              style={{ "--nav-delay": `${i * -1.1}s` }}
            >
              <span>{name}</span>
            </a>
          ))}
        </nav>
        <div className="header-actions">
          <button
            className="icon-button theme-button"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          >
            {theme === "light" ? <Moon size={19} /> : <Sun size={19} />}
          </button>
          <a href="#contact" className="nav-contact">
            <span>Say hello</span>
            <span className="hello-arrow">
              <ArrowUpRight size={16} />
            </span>
          </a>
          <button
            ref={menuTrigger}
            className="icon-button mobile-menu"
            aria-label={menu ? "Close navigation" : "Open navigation"}
            aria-expanded={menu}
            aria-controls={menu ? "mobile-navigation" : undefined}
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X size={23} /> : <List size={23} />}
          </button>
        </div>
        {menu && (
          <nav
            id="mobile-navigation"
            className="menu-panel"
            aria-label="Mobile navigation"
          >
            {nav.map(([name, id]) => (
              <a key={id} href={"#" + id} onClick={() => setMenu(false)}>
                {name}
                <ArrowUpRight size={20} />
              </a>
            ))}
            <a href="#contact" onClick={() => setMenu(false)}>
              Contact
              <ArrowUpRight size={20} />
            </a>
          </nav>
        )}
      </header>
      <main id="main">
        <section className="hero section-wrap" id="home">
          <div className="hero-text">
            <p className="eyebrow">
              Commercial analysis across 60+ stores. Research across 5,000+
              records. Systems I build and ship myself.
            </p>
            <h1 className="assembly">
              <Ink>
                People first.
                <br />
                Always curious.
              </Ink>
            </h1>
            <p className="hero-intro">
              I'm Mun Wai.{" "}
              <ImpactNote calm={motionOff} onExplore={exploreImpactWork} />{" "}
              taught me to ask what people are actually doing. Commercial work
              taught me the answer arrives with a deadline and a number attached.{" "}
              <span className="hero-belief">
                Build with AI. Grow with People. Love Innovation.
              </span>
            </p>
            <div className="hero-cta">
              <a className="button primary" href="#projects">
                Explore my work
                <ArrowDown size={19} />
              </a>
              <a className="text-link" href="#about">
                Meet the person
                <ArrowUpRight size={19} />
              </a>
            </div>
            {/* Straight to the evidence, for anyone who has 60 seconds. */}
            <div className="hero-proof">
              <p className="hero-proof__label">
                Or go straight to the receipts
              </p>
              <ul>
                <li>
                  <a href="/projects/career-os/">
                    <strong>Career OS</strong>
                    <span>Solo build · 18 days · deployed MVP</span>
                  </a>
                </li>
                <li>
                  <a href="/projects/ciairi/">
                    <strong>RMIT CIAIRI</strong>
                    <span>Research team · 5,000+ Scopus records</span>
                  </a>
                </li>
                <li>
                  <a href="/work/uniqlo/">
                    <strong>UNIQLO Malaysia HQ</strong>
                    <span>Current role · 60+ store network</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <HeroPortrait calm={motionOff} theme={theme} />
        </section>
        <section id="about" className="about section-wrap">
          <Reveal calm={motionOff}>
            <p className="section-label">THE PERSON BEHIND THE WORK</p>
            <h2>
              <Ink>
                I started with
                <br />
                psychology.
              </Ink>
            </h2>
            <div className="about-copy">
              <p>
                I studied how people think. Then I started building things to
                see what that understanding could do.
              </p>
              <p>
                Now I work on lease terms, P&amp;L, document review and Copilot
                workflows at UNIQLO Malaysia HQ, across a network of more than
                60 stores. Delivery is shared across the department and its
                partners. I grew up in Kuala Lumpur, Dubai and Melbourne.
              </p>
            </div>
          </Reveal>
          <Reveal className="perspective-panel" calm={motionOff}>
            <div className="perspective-art">
              <NeuralBrain mode={perspective} calm={motionOff} theme={theme} />
            </div>
            <div
              className="perspective-tabs"
              role="group"
              aria-label="Explore my approach"
            >
              {perspectives.map((p, i) => (
                <button
                  key={p.name}
                  className={perspective === i ? "selected" : ""}
                  aria-pressed={perspective === i}
                  onClick={() => setPerspective(i)}
                >
                  {p.name}
                </button>
              ))}
            </div>
            <div className="perspective-copy" aria-live="polite">
              <h3>
                <Ink>{perspectives[perspective].line}</Ink>
              </h3>
              <p>{perspectives[perspective].text}</p>
              <div className="tags">
                {perspectives[perspective].tags.map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
            </div>
          </Reveal>
        </section>
        <section
          className="projects section-wrap has-quiet-field"
          id="projects"
        >
          <QuietField calm={motionOff} />
          <span id="builds" className="anchor" />
          <Reveal calm={motionOff}>
            <p className="section-label">SELECTED WORK</p>
            <h2>
              <Ink>
                Understand how I think. Then see what I’ve executed.
              </Ink>
            </h2>
            <p className="section-description">
              Each of these began as a question I could not settle by reading
              about it. Every one is set out the same way: the problem, what I
              did, the evidence, what was delivered and what actually came of
              it. Limits included.
            </p>
          </Reveal>
          {/* Four areas, each pointed at the work that demonstrates it rather
              than described as a skill. */}
          <Reveal calm={motionOff}>
            <ul className="positioning">
              {[
                [
                  "Psychology and behaviour",
                  "Benchmarking that found the load was in the comparison, not the volume",
                  "/projects/vtac/",
                ],
                [
                  "Research and evidence",
                  "5,000+ Scopus records screened and classified into five categories",
                  "/projects/ciairi/",
                ],
                [
                  "Data and analytics",
                  "Behavioural variables, repeated observations, confidence stated with the result",
                  "/projects/metaxy/",
                ],
                [
                  "Commercial judgement",
                  "Rent read against performance across a 60+ store network",
                  "/work/uniqlo/",
                ],
              ].map(([area, proof, href]) => (
                <li key={area}>
                  <a href={href}>
                    <strong>{area}</strong>
                    <span>{proof}</span>
                  </a>
                </li>
              ))}
            </ul>
          </Reveal>
          <div className="filter-row" role="group" aria-label="Filter projects">
            {["All work", "AI & product", "Research & strategy"].map((f) => (
              <button
                key={f}
                aria-pressed={filter === f}
                className={filter === f ? "selected" : ""}
                onClick={() => setFilter(f)}
              >
                {f}
                {f === "All work" && <span>{projects.length}</span>}
              </button>
            ))}
          </div>
          <div className="project-grid" aria-live="polite">
            {visibleProjects.map((p) => {
              const facts = cardFacts[p.id];
              // Projects with a full case study open their own URL, so the page
              // can be sent to someone. The rest open in place.
              const Open = facts?.href ? "a" : "button";
              const openProps = facts?.href
                ? { href: facts.href }
                : { type: "button", onClick: () => setProject(p) };
              return (
              <Reveal key={p.id} calm={motionOff}>
                <article className={"project-card " + p.kind}>
                  <Open
                    className="project-open"
                    {...openProps}
                    aria-label={`Read ${p.name} case study`}
                  >
                    <span className={"project-art " + p.kind}>
                      <span className="poster-mark assembly">{p.mark}</span>
                      <span className="poster-caption">
                        {p.id === "career-os"
                          ? "YOUR NEXT CHAPTER"
                          : p.id === "midas"
                            ? "A DIFFERENT PERSPECTIVE"
                            : p.id === "vtac"
                              ? "A CLEARER WAY THROUGH"
                              : p.id === "research"
                                ? "ASK A BETTER QUESTION"
                                : p.id === "insight"
                                  ? "KEEP THE GOOD IDEAS"
                                  : p.id === "metaxy"
                                    ? "CONTEXT MATTERS"
                                    : "LEARNING, CONNECTED"}
                      </span>
                      <span className="open-project">
                        <ArrowUpRight size={25} />
                      </span>
                    </span>
                    <span className="project-meta">
                      <span>{p.category}</span>
                      <span>{p.status}</span>
                    </span>
                    <span className="project-title">{p.name}</span>
                    <span className="project-summary">{p.summary}</span>
                    {facts && (
                      <span className="project-facts">
                        <span>
                          <em>Role</em>
                          {facts.role}
                        </span>
                        <span>
                          <em>Scale</em>
                          {facts.scale}
                        </span>
                        <span>
                          <em>Delivered</em>
                          {facts.delivered}
                        </span>
                      </span>
                    )}
                  </Open>
                </article>
              </Reveal>
              );
            })}
          </div>
          {filter === "All work" && (
            <button
              className="button outline more-work"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded
                ? "Show selected work"
                : `Explore all ${projects.length} projects`}
              {expanded ? <Minus size={18} /> : <Plus size={18} />}
            </button>
          )}
        </section>
        <Worlds calm={motionOff} />
        <section id="experience" className="experience section-wrap">
          <Reveal calm={motionOff}>
            <h2>
              <Ink>
                Where I’ve put
                <br />
                it into practice.
              </Ink>
            </h2>
            <p className="section-description">
              A retail head office, a research centre, a design internship, a
              programme in Tokyo. What do we actually know, and what happens
              next?
            </p>
          </Reveal>
          <div className="experience-list">
            {experience.map((e, i) => (
              <details
                key={e.name}
                id={i === 0 ? "experience-uniqlo" : undefined}
                open={i === 0 ? true : undefined}
              >
                <summary>
                  <span className="experience-year">{e.time}</span>
                  <span className="experience-name">
                    {e.name}
                    <small>{e.title}</small>
                  </span>
                  <Plus className="details-plus" size={21} />
                </summary>
                <div className="experience-body">
                  <p>{e.body}</p>
                </div>
              </details>
            ))}
          </div>
        </section>
        <Journey calm={motionOff} enlarge={setLightbox} />
        <section className="life section-wrap">
          <div className="life-heading">
            <Reveal calm={motionOff}>
              <h2>
                <Ink>
                  My kind
                  <br />
                  of rich.
                </Ink>
              </h2>
              <p className="section-description">
                Friends, music, badminton, and the conversations that go nowhere
                useful.
              </p>
            </Reveal>
            <div
              className="life-tabs"
              role="group"
              aria-label="What makes life rich"
            >
              {life.map((l, i) => (
                <button
                  className={richness === i ? "selected" : ""}
                  key={l.label}
                  aria-pressed={richness === i}
                  onClick={() => setRichness(i)}
                >
                  <span>{l.label}</span>
                  <ArrowUpRight size={20} />
                </button>
              ))}
            </div>
          </div>
          <div className="life-story">
            <motion.img
              key={life[richness].image}
              initial={motionOff ? false : { opacity: 0, y: 12, scale: 1.015 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              src={life[richness].image}
              alt={life[richness].alt}
              loading="lazy"
              width="650"
              height="420"
            />
            <div aria-live="polite">
              <h3>
                <Ink>{life[richness].title}</Ink>
              </h3>
              <p>{life[richness].body}</p>
            </div>
          </div>
        </section>
        <Podcast calm={motionOff} />
        <section id="voice" className="public-voice section-wrap">
          <p className="section-label">OUT IN THE WORLD</p>
          <h2>
            <Ink>
              Occasionally,
              <br />I put it out there.
            </Ink>
          </h2>
          <p className="section-description">
            Conversations, creative experiments and the communities that make
            the work mean something. Mostly other people’s cameras and
            questions.
          </p>
          <FilmJournal calm={motionOff} />
          <div className="voice-stories">
            {[
              {
                label: "01 / BUILDING IN PUBLIC",
                title: "Eighteen days of building",
                body: "A candid reflection on building Career OS solo, entering the Talentbank hackathon and finding community through the process.",
                link: "7477384511383556096",
                action: "Read the build reflection",
              },
              {
                label: "02 / CREATIVE PRACTICE",
                title: "Finding a third space",
                body: "A community gathering with FMTY became a film experiment: capturing the people, music and small moments that made it feel like belonging.",
                link: "7391351382198505472",
                action: "Watch the storytelling post",
              },
              {
                label: "03 / SHARED LEARNING",
                title: "From a challenge to an internship",
                body: "An interview with Xolvit reflecting on the VTAC challenge, stepping into industry and what the experience taught me.",
                link: "7396752940243443713",
                action: "Read the interview feature",
              },
            ].map((story) => (
              <a
                className="voice-story"
                key={story.link}
                href={`https://www.linkedin.com/feed/update/urn:li:activity:${story.link}/`}
                target="_blank"
                rel="noreferrer"
              >
                <span className="section-label">{story.label}</span>
                <h3>
                  <Ink>{story.title}</Ink>
                </h3>
                <p>{story.body}</p>
                <span className="voice-action">
                  {story.action}
                  <ArrowUpRight size={20} />
                </span>
              </a>
            ))}
          </div>
        </section>
        <section id="credentials" className="credentials section-wrap">
          <Reveal calm={motionOff}>
            <h2>
              <Ink>
                A degree, and what
                <br />
                came after it.
              </Ink>
            </h2>
            <p className="section-description">
              Psychology at RMIT, then continued learning across AI, business,
              leadership and culture.
            </p>
          </Reveal>
          <div className="credential-preview">
            <div className="degree">
              <span>RMIT UNIVERSITY</span>
              <h3>
                <Ink>
                  Bachelor of Applied Science
                  <br />
                  (Psychology)
                </Ink>
              </h3>
              <p>
                2022 - 2024 <span>Graduated with Distinction</span>
              </p>
            </div>
            <button
              className="credential-button"
              onClick={() => setCredentialOpen(true)}
            >
              <span className="credential-count">{credentials.length}</span>
              <span>
                Credentials across
                <br />
                five disciplines
              </span>
              <ArrowUpRight size={28} />
            </button>
          </div>
        </section>
        <section id="contact" className="contact section-wrap has-quiet-field">
          <QuietField calm={motionOff} />
          <div>
            <p className="section-label">THERE’S ROOM FOR A CONVERSATION</p>
            <h2>
              <Ink>
                What are you
                <br />
                thinking about?
              </Ink>
            </h2>
            <p className="section-description">
              A role, a collaboration, or a conversation over coffee. Tell me
              what you are working on, what you already know, and where it is
              stuck.
            </p>
            <div className="contact-links">
              <a href={"mailto:" + email}>
                <EnvelopeSimple size={20} />
                {email}
                <ArrowUpRight size={18} />
              </a>
              <button
                className="icon-button"
                aria-label="Copy email address"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(email);
                    setCopied(true);
                    setCopyError(false);
                  } catch {
                    setCopyError(true);
                  }
                }}
              >
                {copied ? <Check size={20} /> : <Copy size={20} />}
              </button>
              <a
                className="contact-social"
                href={linkedin}
                target="_blank"
                rel="noreferrer"
              >
                <LinkedinLogo size={21} />
                LinkedIn
                <ArrowUpRight size={18} />
              </a>
              <a
                className="contact-social"
                href="https://www.instagram.com/munwai111/"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram, @munwai111"
              >
                <InstagramLogo size={21} aria-hidden="true" />
                Instagram
                <ArrowUpRight size={18} aria-hidden="true" />
              </a>
              <a
                className="contact-social"
                href="https://github.com/munwai111"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub, @munwai111"
              >
                <GithubLogo size={21} aria-hidden="true" />
                GitHub
                <ArrowUpRight size={18} aria-hidden="true" />
              </a>
            </div>
            <p className="copy-status" role="status">
              {copied
                ? "Email copied."
                : copyError
                  ? "Select the email address to copy it manually."
                  : ""}
            </p>
            <p className="contact-location">
              Based in Kuala Lumpur. Melbourne is a return, not a new beginning.
            </p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              setDraft({
                name: fd.get("name"),
                email: fd.get("email"),
                subject: fd.get("subject"),
                message: fd.get("message"),
              });
            }}
          >
            <label htmlFor="name">Your name</label>
            <input
              id="name"
              name="name"
              autoComplete="name"
              placeholder="What should I call you?"
              required
              maxLength="100"
            />
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="you@example.com"
              required
              maxLength="200"
            />
            <label htmlFor="subject">What’s this about?</label>
            <input
              id="subject"
              name="subject"
              placeholder="An opportunity, an idea, a hello..."
              required
              maxLength="180"
            />
            <label htmlFor="message">Tell me more</label>
            <textarea
              id="message"
              name="message"
              rows="3"
              placeholder="What’s on your mind?"
              required
              maxLength="4000"
            />
            <button type="submit" className="button primary">
              Prepare an email
              <ArrowUpRight size={19} />
            </button>
            <p className="form-note">
              Creates a draft for your email app. Nothing is sent or stored
              here.
            </p>
          </form>
        </section>
      </main>
      <footer className="section-wrap">
        <div className="footer-bottom">
          <span>
            Mun Wai Space™ · © {new Date().getFullYear()} Looi Mun Wai. All
            rights reserved.
          </span>
          <span>Made with curiosity. Grounded in people.</span>
          {reduced ? (
            <span className="motion-toggle">
              Reduced motion · device preference
            </span>
          ) : (
            <button
              className="motion-toggle"
              onClick={() => setCalm(!calm)}
              aria-pressed={calm}
            >
              {motionOff ? <Play size={15} /> : <Pause size={15} />}{" "}
              {calm ? "Motion paused" : "Pause motion"}
            </button>
          )}
        </div>
      </footer>
      <ProjectDialog project={project} close={() => setProject(null)} />
      <Dialog
        item={lightbox}
        close={() => setLightbox(null)}
        title={lightbox?.title}
      >
        {lightbox && (
          <img
            className="lightbox-image"
            src={lightbox.src}
            alt={lightbox.title}
          />
        )}
      </Dialog>
      <Dialog
        item={credentialOpen}
        close={() => setCredentialOpen(false)}
        title="Always learning."
      >
        <p className="dialog-intro">
          A current learning archive, refreshed from LinkedIn. Open a record to
          see the issuer or source where available.
        </p>
        <div className="credential-search">
          <MagnifyingGlass size={20} />
          <input
            type="search"
            aria-label="Search credentials"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a topic, skill or organisation"
          />
        </div>
        <label className="sr-only" htmlFor="credential-category">
          Credential discipline
        </label>
        <select
          id="credential-category"
          value={credentialCategory}
          onChange={(e) => setCredentialCategory(e.target.value)}
        >
          {[
            "All disciplines",
            ...new Set(credentials.map((c) => c.category)),
          ].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <p className="results-count" role="status">
          {matches.length} {matches.length === 1 ? "credential" : "credentials"}
        </p>
        <div className="credential-results">
          {matches.map((c) => (
            <article key={c.id}>
              <p>
                {c.organisation} <span>{c.date}</span>
              </p>
              <h3>
                <Ink>{c.title}</Ink>
              </h3>
              <div className="tags">
                {c.skills.slice(0, 3).map((s) => (
                  <span key={s}>{s}</span>
                ))}
              </div>
              {c.url ? (
                <a
                  href={c.url}
                  className="text-link"
                  target="_blank"
                  rel="noreferrer"
                >
                  {c.url.includes("/details/certifications/")
                    ? "View LinkedIn record"
                    : "View credential"}
                  <ArrowUpRight size={16} />
                </a>
              ) : (
                <span className="source-note">
                  Listed in original portfolio
                </span>
              )}
            </article>
          ))}
        </div>
        {matches.length === 0 && (
          <div className="empty-state">
            <h3>
              <Ink>No matching credentials.</Ink>
            </h3>
            <p>Try a broader topic or a different discipline.</p>
            <button
              className="button outline"
              onClick={() => {
                setQuery("");
                setCredentialCategory("All disciplines");
              }}
            >
              Clear filters
            </button>
          </div>
        )}
      </Dialog>
      <Dialog
        item={draft}
        close={() => setDraft(null)}
        title="Your email is ready."
      >
        {draft && (
          <>
            <p className="dialog-intro">
              Review your message, then open it in your preferred email app to
              send.
            </p>
            <div className="email-preview">
              <p>
                <strong>To</strong> {email}
              </p>
              <p>
                <strong>Subject</strong> {draft.subject}
              </p>
              <p>{draft.message}</p>
              <p>
                {draft.name}
                <br />
                {draft.email}
              </p>
            </div>
            <a
              className="button primary"
              href={`mailto:${email}?subject=${encodeURIComponent(draft.subject)}&body=${encodeURIComponent(`${draft.message}\n\n${draft.name}\n${draft.email}`)}`}
            >
              Open email app
              <ArrowUpRight size={18} />
            </a>
            <p className="source-note">
              If an email app does not open, copy the message and send it to{" "}
              {email}.
            </p>
          </>
        )}
      </Dialog>
    </MotionConfig>
  );
}
createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
