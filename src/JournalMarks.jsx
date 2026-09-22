const notes = {
  UNIQLO: ["TOKYO ↔ KL", "GLOBAL MANAGEMENT", "Commercial practice", "ON SITE"],
  VTAC: ["MELBOURNE", "STUDENT PATHWAYS", "Research into design", "INTERNSHIP"],
  "RMIT CIAIRI": [
    "MELBOURNE",
    "RESEARCH NOTES",
    "Ask. Test. Refine.",
    "INTERNSHIP",
  ],
  Xolvit: [
    "TEAM CHALLENGE",
    "IDEAS IN COMPANY",
    "Three perspectives",
    "COLLABORATION",
  ],
  "YakBit AI": [
    "INDUSTRY PROJECT",
    "HUMAN SIGNALS",
    "Listen to the room",
    "TEAMWORK",
  ],
  "Kansai University": [
    "OSAKA / JAPAN",
    "WINTER EXCHANGE",
    "A wider perspective",
    "JAN 2023",
  ],
  SuperAI: ["SINGAPORE", "AI FIELD NOTES", "Meet. Listen. Explore.", "2025"],
};
export default function JournalMarks({ name }) {
  const [place, label, note, kind] = notes[name];
  return (
    <div className="journal-marks" aria-label={`${name} journal keepsakes`}>
      <span className="journal-sticker">
        <span>{name}</span>
      </span>
      <span className="journal-stamp">
        <small>{place}</small>
        <strong>{label}</strong>
        <small>{kind}</small>
      </span>
      <span className="journal-pin" aria-hidden="true" />
      <span className="journal-handnote">{note}</span>
    </div>
  );
}
