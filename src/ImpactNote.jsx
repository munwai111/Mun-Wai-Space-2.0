import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, X } from "@phosphor-icons/react";
import Ink from "./Ink";
import "./impact-note.css";

const contributions = [
  {
    id: "career-os",
    name: "Build a working product",
    setting: "Career OS",
    role: "SOLO BUILDER · 2026",
    title: "From an open brief to a working platform.",
    work: "I designed and built Career OS in 18 days, connecting candidate and employer journeys with sign-in, a database, AI career coaching and skills-based matching.",
    application:
      "That meant turning a question about people’s next career move into a product they could interact with, then connecting the pieces from onboarding to a useful next action.",
    resultLabel: "DELIVERED",
    result: "A deployed hackathon MVP",
    scope:
      "The working build is documented. Adoption and hiring outcomes have not been established.",
    link: "Explore the build",
  },
  {
    id: "vtac",
    name: "Turn behaviour into design",
    setting: "VTAC",
    role: "UX/UI INTERN · THREE-PERSON TEAM · 2025",
    title: "A course pathway students could navigate.",
    work: "I benchmarked course-pathway tools, assessed their features through a behavioural lens and contributed to our team’s Figma interface designs.",
    application:
      "I used the research to inform how students would compare courses and find their next step. The contribution was specific: behavioural evaluation, UX research and interface design within the team.",
    resultLabel: "DELIVERED",
    result: "A design proposal presented to stakeholders",
    scope:
      "A team design project. Deployment and student outcomes have not been established.",
    link: "Read the design case",
  },
  {
    id: "research",
    name: "Make research usable",
    setting: "RMIT CIAIRI",
    role: "RESEARCH ASSISTANT INTERN · 2024–25",
    title: "Evidence behind why ideas get adopted.",
    work: "I contributed to a systematic literature review, bibliometric analysis and data validation examining the conditions that help innovation succeed or fail.",
    application:
      "Psychology helped me examine the human factors alongside the technology. The practical work was tracing sources, testing categories and contributing to a framework and interface specifications.",
    resultLabel: "CONTRIBUTED",
    result: "Research for ADOPTIC and web-tool UX specifications",
    scope:
      "Part of a wider research team, with contributions to the Innovation & Impact Framework and a tool supporting RMIT Grants.",
    link: "Read the research case",
  },
  {
    id: "experience-uniqlo",
    name: "Work through commercial complexity",
    setting: "UNIQLO Malaysia HQ",
    role: "SENIOR ASSISTANT · CURRENT ROLE",
    title: "Decisions with people, costs and constraints.",
    work: "I work with my department Director and colleagues across design, legal, maintenance and store operations on commercial leases, P&L oversight and document review.",
    application:
      "This makes understanding people practical: working through different priorities, checking the detail and communicating across the teams involved in a decision. My scope also includes Copilot workflow integration.",
    resultLabel: "CURRENT RESPONSIBILITY",
    result: "Store development within a 60+ store network",
    scope:
      "The network describes the setting for my role. Delivery is shared across the department and its partners.",
    link: "View my current role",
  },
];

export default function ImpactNote({ calm, onExplore }) {
  const trigger = useRef(null),
    dialog = useRef(null),
    closeTimer = useRef(null),
    afterClose = useRef(null);
  const [opened, setOpened] = useState(false);
  const [closing, setClosing] = useState(false);
  const [selected, setSelected] = useState(0);
  const originalOverflow = useRef(""),
    ownsLock = useRef(false);
  const finishClose = () => {
    dialog.current?.close();
    setOpened(false);
    setClosing(false);
    document.documentElement.classList.remove("impact-open");
    document.body.style.overflow = originalOverflow.current;
    ownsLock.current = false;
    trigger.current?.focus({ preventScroll: true });
    const next = afterClose.current;
    afterClose.current = null;
    next?.();
  };
  const close = (next) => {
    if (closing) return;
    afterClose.current = typeof next === "function" ? next : null;
    setClosing(true);
    closeTimer.current = setTimeout(finishClose, calm ? 0 : 220);
  };
  const open = () => {
    if (dialog.current.open) return;
    clearTimeout(closeTimer.current);
    afterClose.current = null;
    originalOverflow.current = document.body.style.overflow;
    ownsLock.current = true;
    document.body.style.overflow = "hidden";
    document.documentElement.classList.add("impact-open");
    setSelected(0);
    setClosing(false);
    setOpened(true);
    dialog.current.showModal();
    dialog.current.scrollTop = 0;
    dialog.current
      .querySelector(".impact-close")
      .focus({ preventScroll: true });
  };
  useEffect(
    () => () => {
      clearTimeout(closeTimer.current);
      if (ownsLock.current)
        document.body.style.overflow = originalOverflow.current;
      document.documentElement.classList.remove("impact-open");
    },
    [],
  );
  const onBackdrop = (event) => {
    if (event.target !== dialog.current) return;
    const box = dialog.current.getBoundingClientRect();
    if (
      event.clientX < box.left ||
      event.clientX > box.right ||
      event.clientY < box.top ||
      event.clientY > box.bottom
    )
      close();
  };
  const contribution = contributions[selected];
  return (
    <>
      <button
        ref={trigger}
        type="button"
        className="degree-link"
        aria-haspopup="dialog"
        aria-controls="impact-note"
        aria-expanded={opened}
        onClick={open}
      >
        Applied Science (Psychology)
        <svg viewBox="0 0 300 15" preserveAspectRatio="none" aria-hidden="true">
          <path
            pathLength="100"
            d="M3 9 C53 3 101 10 151 6 S246 3 295 7 M207 12 Q252 8 287 11"
          />
        </svg>
      </button>
      {createPortal(
        <dialog
          ref={dialog}
          id="impact-note"
          className="impact-note"
          data-phase={closing ? "closing" : "open"}
          aria-labelledby="impact-title"
          aria-describedby="impact-definition"
          onCancel={(event) => {
            event.preventDefault();
            close();
          }}
          onClick={onBackdrop}
        >
          <div className="impact-topline">
            <span>PSYCHOLOGY / PUT INTO PRACTICE</span>
            <button
              className="impact-close"
              aria-label="Close impact note"
              onClick={close}
            >
              <X size={21} />
            </button>
          </div>
          {opened && (
            <div className="impact-content">
              <p className="impact-origin">APPLIED SCIENCE (PSYCHOLOGY)</p>
              <h2 id="impact-title">
                <Ink>How I put that thinking to work.</Ink>
              </h2>
              <p id="impact-definition" className="impact-definition">
                Psychology taught me to investigate what people need and
                question my assumptions. I put that into practice through
                products, research, design and commercial work.
              </p>
              <div className="impact-columns">
                <div className="impact-work">
                  <p className="impact-section-label">WHAT I CAN CONTRIBUTE</p>
                  <div
                    className="impact-work-list"
                    role="group"
                    aria-label="Explore my contributions"
                  >
                    {contributions.map((item, index) => (
                      <button
                        key={item.id}
                        type="button"
                        aria-pressed={selected === index}
                        aria-controls="impact-work-detail"
                        onClick={() => setSelected(index)}
                      >
                        <span className="impact-work-number" aria-hidden="true">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span>
                          <strong>{item.name}</strong>
                          <small>{item.setting}</small>
                        </span>
                        <ArrowRight size={16} aria-hidden="true" />
                      </button>
                    ))}
                  </div>
                </div>
                <div
                  id="impact-work-detail"
                  className="impact-work-detail"
                  role="region"
                  aria-label={contribution.setting}
                  aria-live="polite"
                  aria-atomic="true"
                >
                  <p className="impact-role">{contribution.role}</p>
                  <h3>{contribution.title}</h3>
                  <p className="impact-work-copy">{contribution.work}</p>
                  <p className="impact-work-copy">{contribution.application}</p>
                  <div className="impact-result">
                    <span>{contribution.resultLabel}</span>
                    <strong>{contribution.result}</strong>
                    <p>{contribution.scope}</p>
                  </div>
                  <button
                    type="button"
                    className="impact-evidence-link"
                    onClick={() => close(() => onExplore(contribution.id))}
                    aria-haspopup={
                      contribution.id === "experience-uniqlo"
                        ? undefined
                        : "dialog"
                    }
                  >
                    {contribution.link}
                    <ArrowRight size={17} aria-hidden="true" />
                  </button>
                </div>
              </div>
              <div className="impact-decision">
                <span>HOW I JUDGE IMPACT</span>
                <p>
                  Who can use it? <span aria-hidden="true">/</span> What does it
                  help them do? <span aria-hidden="true">/</span> What evidence
                  shows it helped?
                </p>
              </div>
              <details className="impact-context">
                <summary>The wider perspective behind the work</summary>
                <p>
                  Growing up across Kuala Lumpur, Dubai and Melbourne made
                  context personal. Economics and geopolitics make me look at
                  incentives and constraints; history, culture and tradition
                  make me question whose assumptions a solution reflects.
                  Philosophy and religious teachings prompt questions about
                  responsibility, while emerging technologies give me new tools
                  to explore.
                </p>
                <p>
                  I bring those interests into how I ask questions, listen to
                  others and consider consequences. The work still has to stand
                  up to evidence and the experience of the people using it.
                </p>
              </details>
            </div>
          )}
        </dialog>,
        document.body,
      )}
    </>
  );
}
