export const originalUrl = "https://munwai-portfolio-enhanced-main.vercel.app/";
export const linkedin = "https://www.linkedin.com/in/mun-wai-looi-086886225/";
export const email = "l_munwai@yahoo.com";
export const projects = [
  {
    id: "career-os",
    name: "Career OS",
    subtitle: "Built for both sides of the hire.",
    category: "AI & product",
    status: "Hackathon MVP",
    year: "2026",
    mark: "YOU",
    kind: "career",
    summary:
      "A two-sided career platform built solo in 18 days, connecting candidate goals with what employers actually need.",
    role: "Solo build. Product concept, experience design, AI workflows and full-stack implementation",
    challenge:
      "A CV gives you a history. It rarely gives you a direction. I wanted candidates to explore their next move and employers to understand the person behind the application.",
    approach:
      "I built onboarding for both sides of the hiring process, with AI career coaching, salary benchmarking and skills-based matching. The matching approach combines skills and goal alignment.",
    outcome:
      "A working hackathon MVP with authentication, a database, API routes and multiple AI integrations. I did not advance to the first cohort; building and presenting the product was still a concrete step forward.",
    learning:
      "The hardest part was connecting the experience from first sign-in to a useful next action. Shipping the entire journey taught me more than adding another isolated AI feature.",
    stack: ["Next.js", "TypeScript", "Clerk", "Supabase", "pgvector", "Claude"],
    link: "https://career-os-dusky.vercel.app/",
    linkText: "Open original demo",
    source:
      "Original portfolio and founder-provided build account. Demo availability may change.",
  },
  {
    id: "midas",
    name: "M.I.D.A.S",
    subtitle: "Opposing arguments, and accounts it can only read.",
    category: "AI & product",
    status: "Private personal system",
    year: "Ongoing",
    mark: "M",
    kind: "midas",
    summary:
      "A personal financial-intelligence system that puts opposing AI perspectives around the same decision.",
    role: "Solo build. Product direction, system architecture, consent design and implementation",
    challenge:
      "I wanted a way to challenge my financial assumptions before acting on them, while keeping ownership of the decision.",
    approach:
      "A multi-model council considers opposing arguments. A synthesis layer brings the discussion together, and an adversarial review challenges the result. Research and account data provide context.",
    outcome:
      "A private personal system described in my original portfolio. Brokerage integrations are read-only: the system does not place trades or move money.",
    learning:
      "A confident answer is not enough. The sources, the disagreement and the point where a human gives consent all need to be visible.",
    stack: ["Next.js", "TypeScript", "Supabase", "Python", "Multi-model AI"],
    source:
      "Original portfolio. Private implementation; no public performance or financial-return claims.",
  },
  {
    id: "vtac",
    name: "A clearer path to university",
    subtitle: "Where does this course lead?",
    category: "Research & strategy",
    status: "Team design project",
    year: "2025",
    mark: "PATH",
    kind: "path",
    summary:
      "A student-centred course pathway and comparison experience, developed during my VTAC internship.",
    role: "Behavioural benchmarking, UX research and interface design within a three-person project",
    challenge:
      "Choosing a university pathway can turn into a maze of courses, requirements and comparison tabs. Our project focused on making that decision easier to navigate.",
    approach:
      "We mapped the student journey, compared existing tools and identified points of confusion. I used a behavioural evaluation scale to assess features and inform our Figma designs.",
    outcome:
      "A multi-tiered MVP design for pathway building and course selection, presented to stakeholders. This is design work, not a claim that VTAC deployed the entire proposal.",
    learning:
      "A more useful interface does not always need more information. Sometimes it needs a better sequence and a clearer next step.",
    stack: ["Figma", "User research", "Behavioural analysis", "Canva"],
    source: "Original portfolio and public LinkedIn project description.",
  },
  {
    id: "research",
    name: "Researching why innovation succeeds, or fails",
    subtitle: "Looking beyond the technology.",
    category: "Research & strategy",
    status: "Research internship",
    year: "2024-25",
    mark: "WHY",
    kind: "research",
    summary:
      "A multidisciplinary literature review at RMIT CIAIRI, exploring what helps innovation succeed or fail.",
    role: "Research assistant intern, behavioural and data analysis",
    challenge:
      "Technically promising ideas do not automatically become useful innovations. Our research examined the factors surrounding adoption and impact.",
    approach:
      "I contributed to a systematic literature review, research methodology, bibliometric visualisation and data validation. The work connected innovation, entrepreneurship and human behaviour.",
    outcome:
      "Contributions to the ADOPTIC Innovation & Impact Framework and UI/UX specifications for a web-based tool supporting RMIT Grants. The wider research project received ARC funding.",
    learning:
      "Frameworks need evidence underneath them. Research taught me to question the categories, trace the sources and make interpretation explicit.",
    stack: ["Scopus", "VOSviewer", "Literature review", "Data analysis"],
    source:
      "Original portfolio. Team contribution; not a claim of sole authorship or personal ARC grant funding.",
  },
  {
    id: "insight",
    name: "Insight Engine",
    subtitle: "A second chance for saved ideas.",
    category: "AI & product",
    status: "In progress",
    year: "Ongoing",
    mark: "IN",
    kind: "insight",
    summary:
      "Turning saved links into an organised collection that can resurface when it is useful.",
    role: "Solo build. Workflow architecture and implementation",
    challenge:
      "Saving an interesting link is easy. Finding it again, remembering why it mattered and doing something with it are different problems.",
    approach:
      "Telegram ingestion feeds a two-stage Claude classifier. Semantic checks reduce duplicates, while a planned digest brings selected material back into view.",
    outcome:
      "A personal pipeline in development, with a defined taxonomy and a security-focused ingestion design.",
    learning:
      "The useful measure is whether an idea comes back when I need it, rather than how many links I can collect.",
    stack: ["TypeScript", "Telegram", "Claude", "Supabase", "Vercel"],
    source: "Original portfolio and current owner-provided project context.",
  },
  {
    id: "metaxy",
    name: "Metaxy",
    subtitle: "What do the counts leave out?",
    category: "AI & product",
    status: "Exploratory prototype",
    year: "2026",
    mark: "MX",
    kind: "metaxy",
    summary:
      "An exploration of how unstructured social information can become interpretable behavioural observations.",
    role: "Solo build. Concept, research framing, analysis workflow and product design",
    challenge:
      "Counts and engagement totals leave out much of the context in human interaction. I wanted to explore more useful ways to organise and interpret it.",
    approach:
      "I developed reusable analysis logic and a client-side interface to turn messy source material into a structured view.",
    outcome:
      "An exploratory behavioural-analysis prototype. Its interpretations are hypotheses, not validated psychological assessments or proof of someone’s intentions.",
    learning:
      "When software interprets people, it needs to communicate uncertainty as clearly as it communicates a result.",
    stack: ["React", "Behavioural research", "Client-side analysis"],
    source: "Public LinkedIn project entry and owner-provided context.",
  },
  {
    id: "second-brain",
    name: "Second Brain",
    subtitle: "Plain Markdown, with the source link kept.",
    category: "AI & product",
    status: "Personal workflow",
    year: "Ongoing",
    mark: "II",
    kind: "brain",
    summary:
      "A sourced knowledge library built around plain Markdown and custom AI ingestion skills.",
    role: "Solo build. Knowledge architecture and workflow design",
    challenge:
      "Notes, transcripts and useful references were too easy to scatter across tools.",
    approach:
      "Custom ingestion and audit skills organise raw material into a structured, searchable library, retaining source links.",
    outcome:
      "A self-operated knowledge system that uses plain Markdown rather than relying on a single proprietary application.",
    learning:
      "The format should outlast the tool. Retrieval and source quality matter more than the size of the archive.",
    stack: ["Markdown", "Custom AI skills", "yt-dlp"],
    source: "Original portfolio.",
  },
];
export const chapters = [
  {
    year: "2021",
    title: "More than one way to contribute.",
    intro:
      "At Werribee Secondary College, I moved between leadership, technology, music and badminton. The All Rounder Award recognised that breadth.",
    ids: [1],
    details: [
      "Led a small team on a smart-home prototype.",
      "Supported accessibility and culturally respectful facilities.",
      "Performed with the school choir and represented the college in badminton.",
    ],
  },
  {
    year: "2022",
    title: "Finding my people in Melbourne.",
    intro:
      "Starting psychology at RMIT also meant finding a community. I joined in, volunteered and eventually helped make that experience welcoming for other people.",
    ids: [2, 3, 4, 6],
    details: [
      "RMIT International School Leaver Scholarship recipient.",
      "Activity Officer with the RMIT University Malaysian Association.",
      "Badminton club promotion and university volunteering.",
    ],
  },
  {
    year: "2023",
    title: "A wider world. A closer listen.",
    intro:
      "An exchange in Japan, peer mentoring and tutoring put me in situations where listening mattered as much as knowing the answer.",
    ids: [7, 8],
    details: [
      "Winter exchange programme at Kansai University.",
      "RMIT peer mentoring and support for other students.",
      "Tutoring across academic subjects with an approach adapted to each learner.",
    ],
  },
  {
    year: "2024",
    title: "Taking the conversation further.",
    intro:
      "Tokyo put strategy into an international team setting. Research gave me a more rigorous way to ask questions. Graduation brought those experiences together.",
    ids: [9, 10, 11],
    details: [
      "Completed the UNIQLO Global Management Program and presented to executives in Tokyo.",
      "Contributed to research at RMIT CIAIRI.",
      "Graduated from RMIT with a Bachelor of Applied Science (Psychology), with Distinction.",
    ],
  },
  {
    year: "2025",
    title: "From understanding to designing.",
    intro:
      "At VTAC, behavioural thinking became decisions about the interface in front of a student. Outside work, I kept meeting people building with AI.",
    ids: [12, 13],
    details: [
      "UX/UI and marketing communication internship at VTAC.",
      "Student pathway and course comparison design.",
      "Attended SuperAI and continued exploring practical AI tools.",
    ],
  },
  {
    year: "2026",
    title: "Building with a reason to build.",
    intro:
      "My days now span store development at UNIQLO Malaysia HQ and self-directed AI projects. Lease terms in the morning, a classifier in the evening.",
    ids: [],
    details: [
      "Senior Assistant, Store Development and Design at UNIQLO Malaysia HQ.",
      "Built Career OS solo for the Talentbank Tech Hackathon.",
      "Continuing personal systems including M.I.D.A.S, Insight Engine and Metaxy.",
    ],
  },
];
export const experience = [
  {
    name: "UNIQLO Malaysia HQ",
    title: "Senior Assistant, Store Development and Design",
    time: "Current",
    body: "I work directly with my department Director and across design, maintenance, legal, marketing and store operations. My scope includes commercial lease negotiation, P&L oversight, document review and Copilot workflow integration across a 60+ store network.",
    note: "Current role and scope supplied by Mun Wai; role announcement corroborated by a public LinkedIn post.",
  },
  {
    name: "VTAC",
    title: "UX/UI Design & Marketing Communication Intern",
    time: "Mar - Apr 2025",
    body: "Behavioural and market benchmarking for student-facing pathway tools, Figma interface design and stakeholder presentations within a team project.",
    note: "Source: original portfolio and LinkedIn project entry.",
  },
  {
    name: "RMIT University CIAIRI",
    title: "Research Assistant Intern",
    time: "Jul 2024 - Apr 2025",
    body: "Systematic literature review, bibliometric analysis, methodology and data validation, alongside contributions to a web-based tool’s UX specifications.",
    note: "Source: original portfolio.",
  },
  {
    name: "UNIQLO Global Management Program",
    title: "Programme participant, Tokyo",
    time: "Jul - Aug 2024",
    body: "Market research, customer and stakeholder analysis, and a team strategy proposal presented to UNIQLO executives. An international collaboration experience, rather than a full-time employment role.",
    note: "Source: original portfolio and public programme-related activity.",
  },
  {
    name: "YakBit",
    title: "Customer journey research project",
    time: "Jun 2024",
    body: "Worked with a team from different professional backgrounds on a customer journey analysis and strategic proposal for an AI business.",
    note: "Source: original portfolio.",
  },
];
export const perspectives = [
  {
    name: "People",
    line: "Start with the person.",
    text: "Before I ask what a system should do, I ask what the person in front of it is trying to get done. That question is the same whether they are standing in a store or opening a tool for the first time.",
    tags: ["Psychology", "User research", "Peer mentoring"],
  },
  {
    name: "Strategy",
    line: "Make the next move clearer.",
    text: "Most decisions are not short of options; they are short of a clear next move. I name the constraint and the incentive out loud, then work out what the decision actually turns on.",
    tags: [
      "Commercial thinking",
      "Stakeholder collaboration",
      "Decision framing",
    ],
  },
  {
    name: "Systems",
    line: "Build something they can use.",
    text: "A working thing teaches more than a described thing. I use AI tools to get from a question to something usable, then keep the parts that survive being used.",
    tags: ["AI orchestration", "Full-stack building", "Workflow design"],
  },
];
