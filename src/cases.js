// Evidence records for the case-study pages.
//
// Claim discipline, applied throughout:
// - "contributed to" is never written as "created".
// - A prototype is reported as delivered, never as an outcome it did not measure.
// - Work done by a team is labelled as such, and the wider outcome is kept
//   separate from the personal contribution.
// - Figures are marked verified only where they can be checked from a public
//   source; everything else is labelled as owner-stated.
// - No confidential employer material appears here. The UNIQLO diagrams are
//   recreated shapes with invented values, labelled as recreated.

export const cases = {
  "career-os": {
    slug: "career-os",
    href: "/projects/career-os/",
    name: "Career OS",
    line: "A CV gives you a history. It rarely gives you a direction.",
    kind: "SOLO BUILD",
    discipline: "Product build · AI workflows",
    scale: "18 days, alone",
    scanRole: "Solo build, end to end",
    delivered: "Deployed hackathon MVP",
    spine: "build",
    stats: [
      { value: "18", unit: "days", note: "28 May to the 15 June deadline", verified: true },
      { value: "89", unit: "commits", note: "at submission", verified: true },
      { value: "35", unit: "API routes", note: "account, candidate, employer, webhooks", verified: true },
      { value: "8", unit: "AI integrations", note: "owner-stated", verified: false },
    ],
    problem:
      "A CV records where someone has been. It rarely helps them decide where to go next, and it tells an employer very little about the person behind the application.",
    role: "Everything. Product concept, experience design, AI workflows, database, API and front end. No collaborators.",
    evidence:
      "The two sides of a hiring conversation: what a candidate is trying to move towards, and what an employer is actually trying to fill.",
    method:
      "Onboarding built separately for each side, then matching on skills and goal alignment rather than keyword overlap. AI career coaching and salary benchmarking sit inside the same flow, so the advice arrives where the decision is made.",
    deliveredDetail:
      "A working platform with authentication, a database and 35 API routes, deployed and still open to anyone with the link. It ships under the product name Y.O.U, Your Odyssey Vector.",
    result:
      "It did not advance to the first cohort. The build works and remains live, and the repository is public, so the claims on this page can be checked.",
    validation:
      "Submitted to the Talentbank Tech Hackathon 2026. Repository and demo are both public.",
    learning:
      "The hardest part was the line from first sign-in to a useful next action. Shipping the whole journey taught me more than adding another isolated AI feature.",
    stack: ["Next.js", "TypeScript", "Clerk", "Supabase", "pgvector", "Claude"],
    links: [
      {
        label: "Open Y.O.U, the live build",
        href: "https://career-os-dusky.vercel.app/",
      },
      {
        label: "Read the code",
        href: "https://github.com/munwai111/Talentbank-tech-hackathon-2026-challenge-Mun_Wai",
      },
    ],
  },

  vtac: {
    slug: "vtac",
    href: "/projects/vtac/",
    name: "A clearer path to university",
    line: "More information is not automatically better decision support.",
    kind: "TEAM PROJECT",
    discipline: "Behavioural research · UX design",
    scale: "Three-person project",
    scanRole: "Behavioural benchmarking, UX research, interface design",
    delivered: "Multi-tiered pathway and course-comparison MVP",
    spine: "research",
    responsibility:
      "My responsibility: behavioural benchmarking, UX research and interface design.",
    problem:
      "Students choosing a course are comparing options that do not line up with each other, across more information than anyone reads, while the decision itself carries years of consequence.",
    role: "Behavioural benchmarking, UX research and interface design, within a three-person project at VTAC.",
    evidence:
      "Competitor course and pathway sites, examined for how each one structures and presents the same kind of information, and the decision journeys students move through when comparing options.",
    method:
      "Benchmark how comparable services sequence information, then follow the points where a student has to hold several things in mind at once to make a comparison.",
    finding:
      "The difficulty was not only the amount of information. The structure and presentation of it can add to the load: how options are sequenced, what is shown beside what, and how comparable two entries are when placed together.",
    interpretation:
      "Adding information does not reliably improve a decision. Sometimes the behavioural problem is the sequence, the hierarchy and how interpretable the information already on the page is.",
    deliveredDetail:
      "A multi-tiered MVP concept for pathway building and course comparison, designed in Figma and presented to stakeholders.",
    result:
      "A design and research project, delivered and presented. VTAC is not described here as having deployed it.",
    deliveredOwner: "team",
    artefacts: {
      note: "Team output from a three-person project. My contribution was the behavioural benchmarking, the UX research and the interface design. Both files open in Figma without an account.",
      items: [
        {
          title: "Course comparison",
          body: "Courses sit side by side, and one \u201cview as\u201d switch (domestic ATAR, international ATAR, non-ATAR) changes which entry requirements are shown, so a student reads only the ones that apply to them. Columns can be reordered, and the frames cover adding a course and reading a result.",
          links: [
            {
              label: "Walk the prototype",
              href: "https://www.figma.com/proto/Vev53yfio5OzPArPveiI1w/Course-Comparison-Prototype?node-id=1-5&starting-point-node-id=1%3A5",
            },
            {
              label: "Open the file",
              href: "https://www.figma.com/design/Vev53yfio5OzPArPveiI1w/Course-Comparison-Prototype?node-id=0-1",
            },
          ],
        },
        {
          title: "Pathway tool",
          body: "A pathway is built from the student type first, with the differences between the domestic and international routes stated before the options rather than buried inside them. The workflow runs from a pathway list to a viewer, an expanded detail view and a saved set of favourites.",
          links: [
            {
              label: "Walk the prototype",
              href: "https://www.figma.com/proto/FZeedyCzYtWLZJihcuIsqn/Pathways-Wireframe-Prototype-Workflows?node-id=0-1",
            },
            {
              label: "Open the file",
              href: "https://www.figma.com/design/FZeedyCzYtWLZJihcuIsqn/Pathways-Wireframe-Prototype-Workflows?node-id=0-1&m=dev",
            },
          ],
        },
      ],
    },
    validation: "Presented to stakeholders at VTAC.",
    learning:
      "A useful interface does not always need more information. Sometimes it needs a clearer sequence and a more obvious next decision.",
    reasoning: [
      "Students say they lack information",
      "The same information exists, presented differently across services",
      "Load comes from comparison, not volume",
      "Alternative: some students genuinely lack the information",
      "Hypothesis: sequence and comparability carry the friction",
      "Test: rebuild the comparison around one next decision",
    ],
  },

  ciairi: {
    slug: "ciairi",
    href: "/projects/ciairi/",
    name: "Why good ideas get adopted",
    line: "What the evidence supports, and what it only suggests.",
    kind: "TEAM RESEARCH",
    discipline: "Research methodology · Bibliometrics",
    scale: "5,000+ Scopus records",
    scanRole: "Methodology, analysis, bibliometrics, validation",
    delivered: "Validated research structure and bibliometric analysis",
    spine: "research",
    responsibility:
      "My contribution sat inside a multidisciplinary team of researchers, HDR candidates and professors.",
    problem:
      "Innovation research is scattered across disciplines that rarely cite each other. Before anything can be concluded about what helps an idea get adopted, the evidence has to be found, organised and checked.",
    role: "Research methodology, evidence collection and organisation, analysis, bibliometric visualisation, interpretation, validation, and interface specifications for the associated web tool.",
    evidence:
      "Over 5,000 Scopus records, retrieved through a defined search strategy, screened and classified into five research categories.",
    method:
      "Systematic literature review with a documented search strategy, screening and classification, keyword and thematic structuring, bibliometric visualisation, then validation of what the records actually support.",
    deliveredDetail:
      "A validated research structure, bibliometric analysis and visualisation, and inputs to the framework work, alongside UI/UX specifications for the grants-related tool.",
    result: "Contributed to the wider ADOPTIC and innovation-commercialisation research.",
    widerOutcome:
      "The wider research programme received ARC support. That funding belongs to the programme and the researchers who secured it, not to me.",
    validation: "Research assistant intern at RMIT University CIAIRI, July 2024 to April 2025.",
    learning:
      "Most of the work was deciding what the records did not support. A clean structure is what makes a later claim defensible.",
    pipeline: [
      "Research question",
      "Scopus search strategy",
      "5,000+ records",
      "Screening and classification",
      "5 research categories",
      "Keyword and thematic structure",
      "Bibliometric visualisation",
      "Evidence validation",
      "Framework and research outputs",
    ],
  },

  metaxy: {
    slug: "metaxy",
    href: "/projects/metaxy/",
    name: "Metaxy",
    line: "A hypothesis, with its alternative kept beside it.",
    kind: "SOLO BUILD",
    discipline: "Behavioural analytics · Exploratory",
    scale: "Structured and unstructured social data",
    scanRole: "Solo build, concept to interface",
    delivered: "Reusable behavioural-analysis workflow and interface",
    spine: "reasoning",
    problem:
      "Ordinary social interaction leaves a messy trail: unstructured, uneven and easy to read whatever you like into.",
    role: "Solo build. Concept, research framing, analysis workflow and product design.",
    evidence:
      "Structured and unstructured records of social interaction, turned into named behavioural variables that can be observed more than once.",
    method:
      "Structure the variables first, then look for repetition before naming a pattern. Every candidate pattern carries an alternative explanation and a stated confidence, and both travel with the output.",
    deliveredDetail:
      "A reusable workflow and an interface that shows the hypothesis, the alternative reading and the uncertainty together.",
    result:
      "Exploratory throughout. The outputs are behavioural hypotheses, not assessments.",
    boundary:
      "These are hypotheses about behaviour. They are not clinical assessments, they do not establish anyone's intentions, and the uncertainty is part of the output rather than a caveat under it.",
    learning:
      "Writing the alternative explanation beside the finding changed what I was willing to conclude.",
    chain: [
      "Raw social interaction data",
      "Structured behavioural variables",
      "Repeated observations",
      "Candidate pattern",
      "Behavioural hypothesis",
      "Alternative explanation",
      "Confidence and uncertainty",
      "Interpretation",
    ],
  },

  midas: {
    slug: "midas",
    href: "/projects/midas/",
    name: "M.I.D.A.S",
    line: "Opposing arguments, and accounts it can only read.",
    kind: "SOLO BUILD",
    discipline: "Decision systems · Personal",
    scale: "Private personal system",
    scanRole: "Solo build, architecture and consent design",
    delivered: "Multi-model decision council with read-only account access",
    spine: "build",
    problem:
      "Financial decisions are easiest to justify to yourself right before you act on them.",
    role: "Solo build. Product direction, system architecture, consent design and implementation.",
    evidence:
      "Research and account context, read into the decision rather than acted on by it.",
    method:
      "A multi-model council argues opposing positions on the same decision. A synthesis layer draws it together and an adversarial pass attacks the result. The decision stays with me.",
    deliveredDetail:
      "A working private system with a read-only connection to brokerage data.",
    result:
      "Used privately. Brokerage access is read-only by design: it can read accounts and it cannot trade.",
    boundary:
      "Read-only is a hard rule in the architecture, not a setting. The system never places an order.",
    learning:
      "Building the argument against my own position was more useful than any recommendation the system could give me.",
    links: [
      { label: "Open the public demo", href: "https://m1das-demo.vercel.app" },
    ],
    linksNote:
      "The demo runs on a synthetic case file. Every figure in it is invented and it reads no real account, so the system can be shown without opening my own ledger.",
  },

  uniqlo: {
    slug: "uniqlo",
    href: "/work/uniqlo/",
    name: "UNIQLO Malaysia HQ",
    line: "Where the analysis has money, contracts and deadlines attached.",
    kind: "CURRENT ROLE",
    discipline: "Commercial analysis · Store development",
    scale: "60+ store network",
    scanRole: "Commercial analysis and stakeholder coordination",
    delivered: "Commercial recommendations, reviews and workflow automation",
    spine: "commercial",
    problem:
      "A store network is a portfolio of commitments. Every tenancy carries a rent, a set of terms, a break-even point and a renewal date, and the call to renew, renegotiate or walk has to be made before the deadline, with several departments holding different parts of the picture.",
    role: "Senior Assistant, Store Development and Design. I work with my department Director and across design, maintenance, legal, marketing and store operations.",
    evidence:
      "Store performance, rental structures, tenancy terms and contract documents, read against the commercial standards the business works to.",
    method:
      "Work the portfolio store by store: read the performance against the rent, find where the terms create exposure, then put a recommendation in front of the people who can act on it before the date forces the decision. Recurring paperwork gets automated so the time goes to the judgement instead.",
    deliveredDetail:
      "Commercial recommendations and reviews to my Director and to cross-functional stakeholders, plus automated workflows that replaced manual recurring processes.",
    result:
      "This is my current role, and the outcomes belong to the department rather than to me. What is mine is the work itself: the analysis, the reviews, the recommendations and the automation.",
    scope: [
      "Commercial lease negotiation and tenancy renewals",
      "P&L oversight and store performance",
      "Rental structures and break-even considerations",
      "Contractual risk and document review",
      "Cross-functional stakeholder coordination",
      "Automation and AI-assisted workflow improvement",
    ],
    confidentiality:
      "Nothing on this page is real commercial material. The diagrams below are recreated shapes of the reasoning, with invented values, so the method can be shown without the data.",
    flows: [
      {
        title: "Tenancy review",
        recreated: true,
        steps: [
          "Agreement received",
          "Clause review",
          "Comparison against standards",
          "Commercial and legal risk",
          "Stakeholder review",
          "Negotiation or next action",
        ],
      },
      {
        title: "Portfolio view",
        recreated: true,
        steps: [
          "Store performance indicators",
          "Rental structure",
          "Break-even consideration",
          "Tenancy conditions",
          "Risk identified",
          "Recommendation or escalation",
        ],
      },
      {
        title: "Recurring process, automated",
        recreated: true,
        steps: [
          "Manual recurring process",
          "Structured spreadsheet automation",
          "Input handling",
          "Document generation",
          "Print and file workflow",
        ],
      },
      {
        title: "Clause review with Copilot",
        recreated: true,
        steps: [
          "Contract clause",
          "Relevant global criterion",
          "Compliance or deviation",
          "Explanation",
          "Structured comment",
          "Human review",
        ],
      },
    ],
    boundary:
      "The AI step is decision support. It drafts the comparison and the comment; a person reviews and decides. It does not make a legal judgement.",
    validation:
      "Completed the UNIQLO Global Management Program and presented to executives in Tokyo.",
    learning:
      "A recommendation is only useful if the person receiving it can act on it that week.",
  },
};

export const caseOrder = ["career-os", "vtac", "ciairi", "metaxy", "midas", "uniqlo"];

// What a project card shows before anyone opens it: who did the work, how big
// it was, and what came out. Keyed by the project id used in data.js. `href`
// is present only where a full case study exists.
export const cardFacts = {
  "career-os": {
    role: "Solo build",
    scale: "18 days · 89 commits",
    delivered: "Deployed MVP",
    href: "/projects/career-os/",
  },
  midas: {
    role: "Solo build",
    scale: "Private system",
    delivered: "Read-only decision council",
    href: "/projects/midas/",
  },
  vtac: {
    role: "Research and design, in a team of three",
    scale: "Three-person project",
    delivered: "Course-comparison MVP concept",
    href: "/projects/vtac/",
  },
  research: {
    role: "Methodology and analysis, in a research team",
    scale: "5,000+ Scopus records",
    delivered: "Validated research structure",
    href: "/projects/ciairi/",
  },
  metaxy: {
    role: "Solo build",
    scale: "Exploratory",
    delivered: "Behavioural analysis workflow",
    href: "/projects/metaxy/",
  },
  insight: {
    role: "Solo build",
    scale: "In progress",
    delivered: "Ingestion and classification pipeline",
  },
  "second-brain": {
    role: "Solo build",
    scale: "Ongoing",
    delivered: "Sourced Markdown knowledge library",
  },
};
