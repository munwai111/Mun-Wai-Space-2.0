// Sources behind the RMIT CIAIRI case study.
//
// ATTRIBUTION RULE, applied without exception in this file:
// none of these publications are Mun Wai's. He is not an author of any of
// them and is never presented as one. They are the research context around
// the environment he worked in. The only entry that is *about* him is the
// RMIT feature, and it is categorised separately as external validation.
//
// Every DOI below was checked against Crossref: title, authors, year and
// journal all match. The EQUS figure was read out of the white paper itself.

export const RESEARCH_CATEGORIES = [
  "External validation",
  "Core research",
  "Adoptic",
  "Real-world application",
  "Context",
];

export const research = [
  {
    id: "rmit-feature",
    featured: true,
    category: "External validation",
    title: "Four tips to help you land your dream internship in Australia",
    source: "RMIT University",
    year: "Feature",
    note: "RMIT names Mun Wai, his psychology degree, the CIAIRI internship and its progression into paid research assistant and data analyst work. The only source here that is about him rather than around him.",
    href: "https://www.rmit.edu.au/study-with-us/discover-rmit/four-tips-for-landing-your-dream-internship-in-australia",
  },
  {
    id: "adoptic",
    featured: true,
    category: "Adoptic",
    title: "Adoptic",
    source: "Innovation Sciences Network",
    year: "Current",
    note: "Describes itself as a research-governed system for decision making on innovation, rooted in the science of innovation and entrepreneurship.",
    href: "https://www.adoptic.ai/",
  },
  {
    id: "scholz-2023",
    featured: true,
    category: "Core research",
    title:
      "A Framework for Assessing and Improving Decision-Making in the Translation of Research and Innovation for Impact",
    source:
      "Jason Scholz, Timothy E. Stroh, Joseph J. Richardson, David F. Downes and Swee L. Mak",
    year: "2023",
    journal: "Journal of Innovation Management",
    doi: "10.24840/2183-0606_011.003_L001",
    note: "Proposes a multidimensional way to assess decision making in research translation.",
    href: "https://journalsojs3.fe.up.pt/index.php/jim/article/view/2183-0606_011.003_L001",
  },
  {
    id: "stroh-2022",
    category: "Core research",
    title: "How Do Psychological Factors Affect Innovation and Adoption Decisions?",
    source: "Tim Stroh, Anne-Laure Mention and Cameron Duff",
    year: "2022",
    journal: "International Journal of Innovation Management",
    doi: "10.1142/S1363919622400266",
    note: "The paper closest to why a psychology graduate was useful here: adoption decisions run on psychological mechanisms.",
    href: "https://doi.org/10.1142/S1363919622400266",
    openAccess: {
      label: "Open-access full text",
      href: "https://trepo.tuni.fi/bitstream/10024/221875/1/s1363919622400266.pdf",
    },
  },
  {
    id: "technovation-2023",
    category: "Core research",
    title:
      "The Impact of Evolved Psychological Mechanisms on Innovation and Adoption: A Systematic Literature Review",
    source: "Tim Stroh, Anne-Laure Mention and Cameron Duff",
    year: "2023",
    journal: "Technovation, volume 125, article 102759",
    doi: "10.1016/j.technovation.2023.102759",
    note: "A systematic review of the psychological mechanisms behind innovation, adoption and resistance.",
    href: "https://www.sciencedirect.com/science/article/pii/S0166497223000706",
  },
  {
    id: "equs-2025",
    featured: true,
    category: "Real-world application",
    title: "Fact to Impact",
    source: "ARC Centre of Excellence for Engineered Quantum Systems (EQUS)",
    year: "2025",
    journal: "White paper",
    note: "Reports analysing its Translational Research Program with the Adoptic framework, and is where the figure of 70 causal variables is publicly stated.",
    href: "https://equs.org/legacy/wp-content/uploads/2025/09/EQUS-Translation-white-paper-final.pdf",
  },
  {
    id: "stroh-2026",
    featured: true,
    category: "Core research",
    title: "The Surprising Predictability of Impact and Guidance to Increase Yours",
    source: "Tim Stroh, Parker Stroh and Cailan Lhuede",
    year: "2026",
    journal: "SSRN",
    doi: "10.2139/ssrn.6253393",
    note: "Tests a synthesised framework against projects from two Australian Research Council Centres of Excellence.",
    href: "https://papers.ssrn.com/sol3/papers.cfm?abstract_id=6253393",
  },
  {
    id: "stroh-2019",
    category: "Core research",
    title: "A Practitioner's Perspective on the Benefits of Open Innovation",
    source: "Timothy Eric Stroh",
    year: "2019",
    journal: "Journal of Innovation Management",
    doi: "10.24840/2183-0606_007.002_0002",
    note: "The earliest paper in this lineage.",
    href: "https://journalsojs3.fe.up.pt/index.php/jim/article/view/2183-0606_007.002_0002",
  },
  {
    id: "cruxes",
    category: "Adoptic",
    title: "Research Translation to Impact Framework",
    source: "Cruxes Innovation",
    year: "Current",
    note: "Named in the EQUS acknowledgements, alongside Innovation Sciences Network, for the Adoptic model and its analysis of the programme's data.",
    href: "https://www.cruxesinnovation.com/researchtranslation",
  },
  {
    id: "scholz-profile",
    category: "Context",
    title: "Professor Jason Scholz",
    source: "RMIT University",
    year: "Profile",
    note: "Lead author of the 2023 framework paper.",
    href: "https://www.rmit.edu.au/profiles/s/jason-scholz",
  },
  {
    id: "stroh-profile",
    category: "Context",
    title: "Timothy Stroh",
    source: "ARDC Research Link Australia",
    year: "Profile",
    note: "ORCID 0000-0002-3955-0267. Author on most of the papers in this lineage and founder of Innovation Sciences Network.",
    href: "https://researchlink.ardc.edu.au/view/researcher?id=0000-0002-3955-0267",
  },
  {
    id: "ai-industry-day",
    category: "Context",
    title: "AI for Industry Day",
    source: "RMIT University",
    year: "2023",
    note: "Institutional context for the centre and its industry-facing remit.",
    href: "https://www.rmit.edu.au/events/2023/april/ai-industry-day",
  },
  {
    id: "eip-launch",
    category: "Context",
    title: "Building an impact-focused research and innovation ecosystem",
    source: "RMIT University",
    year: "2022",
    note: "Why research translation was a live question at RMIT in the first place.",
    href: "https://www.rmit.edu.au/news/all-news/2022/nov/eip-launch",
  },
  {
    id: "vms",
    category: "Context",
    title: "Venture Mentoring Service",
    source: "RMIT University",
    year: "Current",
    note: "Part of the commercialisation ecosystem around the research. Professor Swee Mak is a co-author on the 2023 framework paper.",
    href: "https://www.rmit.edu.au/research/our-research/venture-mentoring-service",
  },
  {
    id: "ispim",
    category: "Context",
    title: "ISPIM 2025 discussion referencing RMIT and Adoptic",
    source: "LinkedIn, Dr Tzameret H. Rubin",
    year: "2025",
    note: "Secondary evidence of the framework being discussed in the innovation-management community.",
    href: "https://www.linkedin.com/posts/dr-tzameret-h-rubin-11b89410_ispim2025-rmit-adoptic-activity-7344761534742454272-dyCH",
  },
];

export const RESEARCH_FOOTNOTE =
  "The publications here are the academic context and research lineage around this work. Mun Wai is not an author of any of them. His contribution is the research assistant and data analyst work he did inside RMIT's Centre for Industrial AI Research and Innovation.";
