import { useState } from "react";
import { ArrowUpRight } from "@phosphor-icons/react";
import ResearchResourceCard from "./ResearchResourceCard";
import { research, RESEARCH_FOOTNOTE } from "./research";
import "./research-case.css";

function External({ href, children, className }) {
  return (
    <a
      className={className}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
      <ArrowUpRight size={14} weight="bold" aria-label="opens in a new tab" />
    </a>
  );
}

// Everything between the hero and the evidence spine: who says so, how it
// started, and the question the work was actually about.
export function ResearchIntro({ record: c }) {
  if (!c.feature && !c.story && !c.question) return null;

  return (
    <>
      {c.feature && (
        <section
          className="feature-card"
          aria-labelledby="rmit-feature-title"
        >
          <p className="feature-card__tag">{c.feature.tag}</p>
          <h2 id="rmit-feature-title">{c.feature.title}</h2>
          <p className="feature-card__body">{c.feature.body}</p>
          <blockquote>
            <p>{c.feature.quote}</p>
            <cite>{c.feature.attribution}</cite>
          </blockquote>
          <External className="feature-card__cta" href={c.feature.href}>
            {c.feature.cta}
          </External>
        </section>
      )}

      {c.story && (
        <section className="story" aria-label="How this started">
          {c.story.map((para) => (
            <p key={para.slice(0, 32)}>{para}</p>
          ))}
        </section>
      )}

      {c.question && (
        <section className="question" aria-labelledby="research-question">
          <h2 id="research-question">{c.question.headline}</h2>
          <p>{c.question.body}</p>
          <ul className="dimensions">
            {c.question.dimensions.map(([name, note]) => (
              <li key={name}>
                <strong>{name}</strong>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

// Everything after the spine: why psychology, where the work sits in a
// lineage of publications that are not mine, and what came of it.
export function ResearchDepth({ record: c }) {
  const [showAll, setShowAll] = useState(false);
  if (!c.lineage && !c.adoptic && !c.variables && !c.psychology) return null;

  const featured = research.filter((r) => r.featured);
  const rest = research.filter((r) => !r.featured);

  return (
    <>
      {c.psychology && (
        <section className="psych" aria-labelledby="psych-title">
          <h2 id="psych-title">{c.psychology.headline}</h2>
          <p>{c.psychology.body}</p>
          <ul className="psych__factors">
            {c.psychology.factors.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
          <p className="psych__caveat">{c.psychology.caveat}</p>
        </section>
      )}

      {c.lineage && (
        <section className="lineage" aria-labelledby="lineage-title">
          <h2 id="lineage-title">{c.lineage.title}</h2>
          <p className="lineage__note">{c.lineage.note}</p>
          <ol>
            {c.lineage.entries.map((e) => (
              <li
                key={e.year + e.what}
                className={e.mine ? "is-mine" : undefined}
              >
                <p className="lineage__year">
                  {e.year}
                  {e.mine && <span>MY CONTRIBUTION</span>}
                </p>
                <div>
                  <h3>{e.what}</h3>
                  <p className="lineage__who">{e.who}</p>
                  <p className="lineage__where">{e.where}</p>
                  {e.idea && <p className="lineage__idea">{e.idea}</p>}
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {c.adoptic && (
        <section className="adoptic" aria-labelledby="adoptic-title">
          <h2 id="adoptic-title">{c.adoptic.title}</h2>
          <p>{c.adoptic.body}</p>
          <ol className="adoptic__chain">
            {c.adoptic.chain.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <p className="adoptic__boundary">{c.adoptic.boundary}</p>
          <External className="adoptic__cta" href={c.adoptic.href}>
            {c.adoptic.cta}
          </External>
        </section>
      )}

      {c.variables && (
        <section className="variables" aria-labelledby="variables-title">
          <div className="variables__count">
            <strong>{c.variables.count}</strong>
            <span>{c.variables.label}</span>
          </div>
          <div className="variables__body">
            <h2 id="variables-title">Not my number, and not my variables.</h2>
            <blockquote>
              <p>{c.variables.quote}</p>
              <cite>{c.variables.attribution}</cite>
            </blockquote>
            <p>{c.variables.body}</p>
            <ul>
              {c.variables.shown.map((v) => (
                <li key={v}>{v}</li>
              ))}
            </ul>
            <External className="variables__cta" href={c.variables.href}>
              {c.variables.cta}
            </External>
          </div>
        </section>
      )}

      <section className="library" aria-labelledby="library-title">
        <h2 id="library-title">Research foundations</h2>
        <p className="library__intro">{RESEARCH_FOOTNOTE}</p>

        <div className="library__grid">
          {featured.map((item) => (
            <ResearchResourceCard key={item.id} item={item} />
          ))}
        </div>

        <button
          type="button"
          className="library__toggle"
          onClick={() => setShowAll((v) => !v)}
          aria-expanded={showAll}
          aria-controls="library-rest"
        >
          {showAll
            ? "Hide the rest"
            : `View all research and sources (${rest.length} more)`}
        </button>

        <div
          id="library-rest"
          className="library__grid"
          hidden={!showAll}
        >
          {rest.map((item) => (
            <ResearchResourceCard key={item.id} item={item} />
          ))}
        </div>
      </section>
    </>
  );
}
