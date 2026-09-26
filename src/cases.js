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
    problem:
      "Students choosing a course are comparing options that do not line up with each other, across more information than anyone reads, while the decision itself carries years of consequence.",
    role: "Behavioural benchmarking, UX research and interface design, within a three-person project at VTAC.",
    evidence:
      "Comparable course and pathway services, each one ranked against named criteria with the pros and cons of its features written up: six services behind the pathway tool, five behind the comparison tool. Alongside that, the decision journeys students move through when comparing options.",
    benchmark: {
      title: "What each service was ranked on",
      sets: [
        {
          tool: "Pathway tool",
          count: "6 services compared",
          criteria: [
            "User friendliness and familiarity",
            "Visual design",
            "Seamless navigation",
            "Information formatting and display",
          ],
        },
        {
          tool: "Comparison tool",
          count: "5 services compared",
          criteria: [
            "Visual design",
            "Ease of use and capabilities",
            "Relevance of presented information",
            "Other relevant findings and aspects",
          ],
        },
      ],
      note: "From the project deck, 14 April 2025. The services compared are not named here. Information formatting and display was one of the criteria before it was a finding, which is where the argument on this page started.",
    },
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
          body: "The tool asks for one thing at a time instead of presenting everything at once, and the differences between the domestic and international routes are stated before the options rather than buried inside them. A supporting FAQ page sits alongside the flow.",
          steps: [
            "Student type",
            "Area of interest",
            "Sub-area of interest",
            "Dream institutions",
            "Course list",
            "Pathway viewer",
            "Saved favourites",
          ],
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
    validation:
      "Presented to stakeholders at VTAC on 14 April 2025. I was one of the two presenters.",
    learning:
      "A useful interface does not always need more information. Sometimes it needs a clearer sequence and a more obvious next decision.",
    mapping: {
      title: "UX mapping phase",
      objective:
        "Ascertain the essential features and functions for the MVP prototype.",
      focus: [
        "Pathway stages",
        "Relevant course information",
        "Ease of use, specifically for year-12 students",
        "Additional tools to support first-time applicants",
      ],
      note: "Mapping the high-level pathway process is where the supporting features came from. A help route available across the whole process and a way to save pathways were notes on the map first; they became the FAQ page and the favourites list in the wireframe that followed.",
    },
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
    name: "Researching why innovation succeeds, or fails",
    line: "What the evidence supports, and what it only suggests.",
    kind: "TEAM RESEARCH",
    discipline: "Research methodology · Bibliometrics",
    eyebrow: ["RMIT UNIVERSITY", "INDUSTRIAL AI", "BEHAVIOURAL RESEARCH"],
    org: "RMIT Centre for Industrial AI Research and Innovation",
    period: "July 2024 to April 2025",
    disciplines: [
      "Behavioural science",
      "Research translation",
      "AI",
      "Innovation science",
      "Data analysis",
      "Psychology",
    ],
    scale: "5,000+ Scopus records",
    scanRole: "Research assistant and data analyst",
    delivered: "Validated research structure and bibliometric analysis",
    spine: "research",
    responsibility:
      "My contribution sat inside a multidisciplinary team of researchers, HDR candidates and professors.",

    // The one source that is about him rather than around him.
    feature: {
      tag: "OFFICIAL RMIT FEATURE",
      title: "RMIT wrote about how this internship started.",
      body: "RMIT's own article names him, his psychology degree and the centre, and records that the placement turned into paid research assistant and data analyst work after the team saw progress.",
      quote:
        "One of them took me on because he was doing a research project on an AI tool that can help determine the causal factors of success and failures. So that's where the internship started.",
      attribution: "Mun Wai, quoted by RMIT University",
      cta: "Read the RMIT feature",
      href: "https://www.rmit.edu.au/study-with-us/discover-rmit/four-tips-for-landing-your-dream-internship-in-australia",
    },

    story: [
      "I did not arrive at industrial AI through software. I arrived through psychology.",
      "The placement was a compulsory subject in my Applied Science (Psychology) degree, so I started asking my lecturers. One of them was working on an AI tool meant to determine the causal factors behind why projects succeed and fail, and took me on.",
      "The psychology turned out to be the useful part. Whether an innovation gets adopted is a question about people: what they are motivated by, what they judge to be worth the risk, what they resist and why. The team saw progress, I asked about an extension, and the placement became paid research assistant and data analyst work.",
    ],

    question: {
      headline: "Why do promising innovations fail?",
      body: "Rarely for one reason, and rarely only a technical one. The research treats it as a question with many dimensions at once.",
      dimensions: [
        ["Technology", "Whether the thing works is the start of the question, not the end of it."],
        ["Behaviour", "Adoption is a decision a person makes, with all that implies."],
        ["Adoption", "Being available and being taken up are different outcomes."],
        ["Market", "A real need, and someone who will act on it."],
        ["Resources", "Time and funding decide what can be finished."],
        ["Team", "Who is doing it, and whether they can carry it."],
        ["Risk", "What is at stake if it does not work."],
        ["Delivery", "Getting from a result to something usable."],
        ["Translation", "Moving research out of the place that produced it."],
        ["Stakeholders", "The people whose agreement the outcome depends on."],
      ],
    },

    problem:
      "Innovation research is scattered across disciplines that rarely cite each other. Before anything can be concluded about what helps an idea get adopted, the evidence has to be found, organised and checked.",
    role: "Research assistant and data analyst. Research methodology, evidence collection and organisation, analysis, bibliometric visualisation, interpretation, validation, and interface specifications for the associated web tool.",
    contribution: {
      note: "Owner-stated, and consistent with the research assistant and data analyst role RMIT describes.",
      groups: [
        {
          label: "Finding the evidence",
          items: [
            "Systematic literature research",
            "Academic database research",
            "Boolean search strategy",
            "Scopus",
          ],
        },
        {
          label: "Structuring it",
          items: [
            "Multidimensional literature review",
            "Research taxonomy and knowledge categorisation",
            "Data extraction",
            "Data cleaning and validation",
          ],
        },
        {
          label: "Reading it",
          items: [
            "Bibliometric analysis",
            "VOSviewer",
            "Qualitative and quantitative evidence integration",
            "Behavioural interpretation",
            "Research synthesis",
          ],
        },
        {
          label: "How the work was done",
          items: ["AI-assisted research workflows"],
        },
      ],
    },
    evidence:
      "Over 5,000 Scopus records, retrieved through a defined search strategy, screened and classified into five research categories.",
    method:
      "Systematic literature review with a documented search strategy, screening and classification, keyword and thematic structuring, bibliometric visualisation, then validation of what the records actually support.",
    deliveredDetail:
      "A validated research structure, bibliometric analysis and visualisation, and inputs to the framework work, alongside UI/UX specifications for the grants-related tool.",
    result: "Contributed to the wider ADOPTIC and innovation-commercialisation research.",
    widerOutcome:
      "The wider research programme received ARC support. That funding belongs to the programme and the researchers who secured it, not to me.",
    validation:
      "Research assistant intern at RMIT University CIAIRI, July 2024 to April 2025. Named in RMIT's own feature on internships.",
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

    psychology: {
      headline: "The AI problem was also a human problem.",
      body: "A tool that predicts whether a project will be adopted is making a claim about how people decide. That is the part a psychology degree is actually for.",
      factors: [
        "Motivation",
        "Perception",
        "Risk",
        "Value",
        "Resistance",
        "Social influence",
        "Decision making",
      ],
      caveat:
        "Psychology does not decide on its own whether an innovation succeeds. It is one dimension among the several the research treats together.",
    },

    lineage: {
      title: "The research lineage",
      note: "These publications are the context around the work, not my work. I am not an author of any of them.",
      entries: [
        {
          year: "2019",
          who: "Timothy Eric Stroh",
          what: "A Practitioner's Perspective on the Benefits of Open Innovation",
          where: "Journal of Innovation Management",
        },
        {
          year: "2022",
          who: "Tim Stroh, Anne-Laure Mention and Cameron Duff",
          what: "How Do Psychological Factors Affect Innovation and Adoption Decisions?",
          where: "International Journal of Innovation Management",
          idea: "Psychological mechanisms shape adoption and innovation outcomes.",
        },
        {
          year: "2023",
          who: "Tim Stroh, Anne-Laure Mention and Cameron Duff",
          what: "The Impact of Evolved Psychological Mechanisms on Innovation and Adoption: A Systematic Literature Review",
          where: "Technovation",
          idea: "A systematic synthesis of the mechanisms behind adoption and resistance.",
        },
        {
          year: "2023",
          who: "Jason Scholz, Timothy E. Stroh, Joseph J. Richardson, David F. Downes and Swee L. Mak",
          what: "A Framework for Assessing and Improving Decision-Making in the Translation of Research and Innovation for Impact",
          where: "Journal of Innovation Management",
          idea: "A multidimensional assessment framework for research-translation decisions.",
        },
        {
          year: "2024 to 2025",
          who: "Mun Wai",
          what: "Research assistant and data analyst at RMIT CIAIRI",
          where: "Not a publication. My contribution to the research environment.",
          mine: true,
        },
        {
          year: "2025",
          who: "ARC Centre of Excellence for Engineered Quantum Systems",
          what: "Fact to Impact",
          where: "White paper",
          idea: "An external programme reports analysing its projects with the Adoptic framework.",
        },
        {
          year: "2026",
          who: "Tim Stroh, Parker Stroh and Cailan Lhuede",
          what: "The Surprising Predictability of Impact and Guidance to Increase Yours",
          where: "SSRN",
          idea: "Empirical testing against projects from two ARC Centres of Excellence.",
        },
      ],
    },

    adoptic: {
      title: "From research questions to decision systems",
      body: "The wider programme moved from asking what drives adoption towards building something decision makers could use. Adoptic describes itself publicly as a research-governed system for deciding on innovation, rooted in the science of innovation and entrepreneurship.",
      chain: [
        "Research",
        "Synthesis",
        "Causal factors",
        "Decision framework",
        "Adoption",
        "Impact",
      ],
      boundary:
        "I did not build Adoptic and I am not presented here as having done so. I worked as a research assistant and data analyst inside the RMIT research environment this came out of.",
      cta: "Explore Adoptic",
      href: "https://www.adoptic.ai/",
    },

    variables: {
      count: 70,
      label: "causal variables",
      quote:
        "a research-based set of 70 causal variables of impact success developed by RMIT and Innovation Sciences Network",
      attribution:
        "ARC Centre of Excellence for Engineered Quantum Systems, Fact to Impact, 2025",
      body: "The figure is the white paper's, not mine, and the variables are not mine either. EQUS charts six of them as showing the greatest movement across its projects.",
      shown: [
        "Adaptation",
        "Risk",
        "Customer relations",
        "Delivery",
        "Team initiative",
        "Translation experience",
      ],
      cta: "View the EQUS report",
      href: "https://equs.org/legacy/wp-content/uploads/2025/09/EQUS-Translation-white-paper-final.pdf",
    },
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
