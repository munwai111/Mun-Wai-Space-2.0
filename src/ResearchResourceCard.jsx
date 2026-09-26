import { ArrowUpRight } from "@phosphor-icons/react";

// One source in the research library. Category is carried as text, never by
// colour alone, so it survives a monochrome or high-contrast rendering.
export default function ResearchResourceCard({ item }) {
  const meta = [item.year, item.journal].filter(Boolean).join(" · ");

  return (
    <article className="resource" data-featured={item.featured || undefined}>
      <p className="resource__cat">
        <span>{item.category}</span>
        {item.featured && <span className="resource__star">FEATURED</span>}
      </p>

      <h3>
        <a href={item.href} target="_blank" rel="noopener noreferrer">
          {item.title}
          <ArrowUpRight
            size={13}
            weight="bold"
            aria-label="opens in a new tab"
          />
        </a>
      </h3>

      <p className="resource__source">{item.source}</p>
      {meta && <p className="resource__meta">{meta}</p>}
      {item.note && <p className="resource__note">{item.note}</p>}

      <p className="resource__foot">
        {item.doi && (
          <span className="resource__doi">
            DOI <code>{item.doi}</code>
          </span>
        )}
        {item.openAccess && (
          <a
            className="resource__oa"
            href={item.openAccess.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            {item.openAccess.label}
            <ArrowUpRight
              size={11}
              weight="bold"
              aria-label="opens in a new tab"
            />
          </a>
        )}
      </p>
    </article>
  );
}
