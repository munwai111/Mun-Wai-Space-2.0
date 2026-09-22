import "./case-evidence.css";

const buildFacts = [
  ["18", "days"],
  ["89", "commits"],
  ["36", "API routes"],
  ["8", "AI integrations"],
];

const decisionFlow = [
  {
    title: "Read-only context",
    body: "Research and account information enter as context. Brokerage connections cannot place trades or move money.",
  },
  {
    title: "Opposing views",
    body: "Multiple AI perspectives make disagreement visible rather than collapsing it into one confident answer.",
  },
  {
    title: "Synthesis + challenge",
    body: "A synthesis layer assembles the reasoning, then an adversarial review tests its assumptions.",
  },
  {
    title: "Owner decision",
    body: "Sources, disagreement and consent remain visible so the final judgement stays with Mun Wai.",
  },
];

const archiveEvidence = {
  vtac: {
    label: "VTAC · TEAM DESIGN PROJECT",
    title: "From behavioural evidence to a clearer pathway.",
    image: "/images/journey-12-1.webp",
    width: 1400,
    height: 951,
    alt: "Archive photograph from Mun Wai's VTAC internship chapter",
    steps: [
      "Behavioural benchmarking",
      "Student journey mapping",
      "Interface design",
      "Stakeholder presentation",
    ],
    note: "Project account: a three-person course-pathway project. Mun Wai contributed behavioural benchmarking, UX research and interface design. The archive image documents the chapter; it is not a product screenshot.",
  },
  research: {
    label: "RMIT CIAIRI · RESEARCH INTERNSHIP",
    title: "A question made defensible through method.",
    image: "/images/journey-11-1.webp",
    width: 1400,
    height: 720,
    alt: "Archive photograph from Mun Wai's RMIT CIAIRI research chapter",
    steps: [
      "Systematic literature review",
      "Bibliometric visualisation",
      "Data validation",
      "UX specifications",
    ],
    note: "Project account: Mun Wai contributed research, analysis and interface specifications within a wider team. The archive image documents the chapter; it is not a product screenshot or a claim of sole authorship.",
  },
};

function CareerEvidence() {
  return (
    <section
      className="case-evidence case-evidence--career"
      aria-labelledby="career-evidence-title"
    >
      <header className="case-evidence__header">
        <p className="case-evidence__kicker">THE BUILD RECORD</p>
        <h3 id="career-evidence-title">From sign-in to a working MVP.</h3>
      </header>
      <div
        className="case-evidence__stats"
        role="list"
        aria-label="Build facts"
      >
        {buildFacts.map(([value, label]) => (
          <div role="listitem" key={label}>
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
      <div className="case-evidence__career-foot">
        <p>
          The product reached a deployed hackathon MVP. It did not advance to
          the first cohort; the working build remains the result.
        </p>
        <a
          href="https://www.linkedin.com/feed/update/urn:li:activity:7477384511383556096/"
          target="_blank"
          rel="noreferrer"
        >
          Read the public build reflection <span aria-hidden="true">↗</span>
        </a>
      </div>
      <p className="case-evidence__source">
        Build figures from my project record. The public reflection tells the
        story of the build and the hackathon.
      </p>
    </section>
  );
}

function MidasEvidence() {
  return (
    <section
      className="case-evidence case-evidence--midas"
      aria-labelledby="midas-evidence-title"
    >
      <header className="case-evidence__header">
        <p className="case-evidence__kicker">THE DECISION BOUNDARY</p>
        <h3 id="midas-evidence-title">The final decision stays with me.</h3>
      </header>
      <ol className="case-evidence__flow">
        {decisionFlow.map((step, index) => (
          <li
            key={step.title}
            className={index === decisionFlow.length - 1 ? "is-owner-gate" : ""}
          >
            <span className="case-evidence__step-number">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h4>{step.title}</h4>
            <p>{step.body}</p>
          </li>
        ))}
      </ol>
      <p className="case-evidence__source">
        An explanatory flow based on my private project account.
      </p>
    </section>
  );
}

function ArchiveEvidence({ evidence, variant }) {
  const titleId = `${variant}-evidence-title`;
  return (
    <section
      className={`case-evidence case-evidence--archive case-evidence--${variant}`}
      aria-labelledby={titleId}
    >
      <figure className="case-evidence__archive-grid">
        <div className="case-evidence__archive-photo">
          <img
            src={evidence.image}
            width={evidence.width}
            height={evidence.height}
            alt={evidence.alt}
            loading="lazy"
          />
          <span>ARCHIVE / DOCUMENTED CHAPTER</span>
        </div>
        <figcaption>
          <p className="case-evidence__kicker">{evidence.label}</p>
          <h3 id={titleId}>{evidence.title}</h3>
          <ol className="case-evidence__method">
            {evidence.steps.map((step, index) => (
              <li key={step}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                {step}
              </li>
            ))}
          </ol>
        </figcaption>
      </figure>
      <p className="case-evidence__source">{evidence.note}</p>
    </section>
  );
}

export default function CaseEvidence({ project }) {
  const id = typeof project === "string" ? project : project?.id;

  if (id === "career-os") return <CareerEvidence />;
  if (id === "midas") return <MidasEvidence />;
  if (archiveEvidence[id]) {
    return <ArchiveEvidence evidence={archiveEvidence[id]} variant={id} />;
  }

  return null;
}
