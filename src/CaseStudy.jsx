import { useEffect, useState } from "react";
import { ArrowLeft, ArrowUpRight, Moon, Sun } from "@phosphor-icons/react";
import "./case-study.css";

// Ownership marker. Every claim on the page is attributed to one of these, so a
// reader can tell my contribution apart from the team's and from outside
// confirmation without reading the paragraph first.
const OWNER_LABEL = {
  me: "MINE",
  team: "TEAM",
  external: "EXTERNAL",
};

function Row({ index, label, owner, children, tone }) {
  return (
    <div className="spine-row" data-owner={owner || undefined} data-tone={tone}>
      <div className="spine-row__label">
        <span className="spine-row__index">
          {String(index).padStart(2, "0")}
        </span>
        <h2>{label}</h2>
        {owner && <span className="spine-row__owner">{OWNER_LABEL[owner]}</span>}
      </div>
      <div className="spine-row__body">{children}</div>
    </div>
  );
}

function Chain({ steps, title, note }) {
  return (
    <div className="chain">
      {title && <p className="chain__title">{title}</p>}
      <ol className="chain__list">
        {steps.map((step, i) => (
          <li key={step}>
            <span className="chain__num">{String(i + 1).padStart(2, "0")}</span>
            <span className="chain__step">{step}</span>
          </li>
        ))}
      </ol>
      {note && <p className="chain__note">{note}</p>}
    </div>
  );
}

function ThemeToggle() {
  const [theme, setTheme] = useState(
    () => document.documentElement.dataset.theme || "light",
  );
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("mw-theme", theme);
    } catch {}
  }, [theme]);
  return (
    <button
      type="button"
      className="case-theme"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  );
}

export default function CaseStudy({ record }) {
  const c = record;
  let n = 0;
  const next = () => (n += 1);

  return (
    <div className="case-page">
      <header className="case-top">
        <a className="case-back" href="/#projects">
          <ArrowLeft size={16} />
          <span>
            Mun Wai Space<sup aria-hidden="true">™</sup>
          </span>
        </a>
        <ThemeToggle />
      </header>

      <main>
        <article className="case-body">
          <header className="case-hero">
            <p className="case-kind">
              <span>{c.kind}</span>
              <span className="case-kind__sep" aria-hidden="true">
                ·
              </span>
              <span>{c.discipline}</span>
            </p>
            <h1>{c.name}</h1>
            <p className="case-line">{c.line}</p>

            {/* The scan strip: the recruiter's 15 seconds. */}
            <dl className="scan-strip">
              <div>
                <dt>My role</dt>
                <dd>{c.scanRole}</dd>
              </div>
              <div>
                <dt>Scale</dt>
                <dd>{c.scale}</dd>
              </div>
              <div>
                <dt>Delivered</dt>
                <dd>{c.delivered}</dd>
              </div>
            </dl>

            {c.links && (
              <p className="case-links">
                {c.links.map((l) => (
                  <a key={l.href} href={l.href} target="_blank" rel="noreferrer">
                    {l.label} <ArrowUpRight size={14} weight="bold" />
                  </a>
                ))}
              </p>
            )}
            {c.linksNote && <p className="case-links__note">{c.linksNote}</p>}
          </header>

          {c.stats && (
            <section className="case-stats" aria-label="Build record">
              {c.stats.map((s) => (
                <div key={s.unit}>
                  <strong>{s.value}</strong>
                  <span className="case-stats__unit">{s.unit}</span>
                  <span className="case-stats__note">{s.note}</span>
                </div>
              ))}
              <p className="case-stats__source">
                Days and commits are checkable in the public repository. The
                integration count is my own, from the project record.
              </p>
            </section>
          )}

          <div className="case-spine">
            <Row index={next()} label="Problem">
              <p>{c.problem}</p>
            </Row>

            <Row index={next()} label="My role" owner="me">
              <p>{c.role}</p>
              {c.responsibility && (
                <p className="spine-aside">{c.responsibility}</p>
              )}
              {c.scope && (
                <ul className="spine-list">
                  {c.scope.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              )}
            </Row>

            {c.evidence && (
              <Row index={next()} label="Evidence">
                <p>{c.evidence}</p>
              </Row>
            )}

            <Row index={next()} label="Method">
              <p>{c.method}</p>
              {c.pipeline && <Chain steps={c.pipeline} title="The pipeline" />}
              {c.chain && (
                <Chain
                  steps={c.chain}
                  title="How a hypothesis is formed"
                  note="The alternative explanation and the confidence are produced with the hypothesis, not added afterwards."
                />
              )}
              {c.reasoning && (
                <Chain
                  steps={c.reasoning}
                  title="The reasoning"
                  note="Observation, then pattern, then interpretation, with the competing explanation kept in view before any recommendation."
                />
              )}
            </Row>

            {c.finding && (
              <Row index={next()} label="Finding">
                <p>{c.finding}</p>
                {c.interpretation && (
                  <p className="spine-interpret">
                    <span>Interpretation</span>
                    {c.interpretation}
                  </p>
                )}
              </Row>
            )}

            {c.flows && (
              <Row index={next()} label="The work">
                <p className="spine-warning">{c.confidentiality}</p>
                <div className="flow-grid">
                  {c.flows.map((f) => (
                    <figure key={f.title} className="flow">
                      <figcaption>
                        <span className="flow__tag">RECREATED EXAMPLE</span>
                        <h3>{f.title}</h3>
                      </figcaption>
                      <ol>
                        {f.steps.map((s, i) => (
                          <li key={s}>
                            <span>{String(i + 1).padStart(2, "0")}</span>
                            {s}
                          </li>
                        ))}
                      </ol>
                    </figure>
                  ))}
                </div>
              </Row>
            )}

            <Row index={next()} label="Delivered" owner="me">
              <p>{c.deliveredDetail}</p>
            </Row>

            <Row index={next()} label="Result" tone="result">
              <p>{c.result}</p>
              {c.boundary && (
                <p className="spine-boundary">
                  <span>Where the claim stops</span>
                  {c.boundary}
                </p>
              )}
            </Row>

            {c.widerOutcome && (
              <Row
                index={next()}
                label="Wider project outcome"
                owner="team"
                tone="wider"
              >
                <p>{c.widerOutcome}</p>
              </Row>
            )}

            {c.validation && (
              <Row index={next()} label="Validation" owner="external">
                <p>{c.validation}</p>
              </Row>
            )}
          </div>

          <aside className="case-learning">
            <p className="case-learning__label">WHAT I TOOK FROM IT</p>
            <blockquote>{c.learning}</blockquote>
          </aside>

          {c.stack && (
            <p className="case-stack">
              {c.stack.map((s) => (
                <span key={s}>{s}</span>
              ))}
            </p>
          )}
        </article>
      </main>

      <footer className="case-foot">
        <a href="/#projects">See the rest of the work</a>
        <p>
          Mun Wai Space™ · © {new Date().getFullYear()} Looi Mun Wai. All rights
          reserved.
        </p>
      </footer>
    </div>
  );
}
