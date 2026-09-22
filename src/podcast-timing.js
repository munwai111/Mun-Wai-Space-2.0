export const chapters = [
  [0, "A conversation about psychology and AI"],
  [70, "The work of a prompt consultant"],
  [192, "THE-ARC: a framework for evaluating responses"],
  [640, "Human judgement and bias in AI"],
  [758, "Contributing to AI from outside computer science"],
  [812, "Where psychology meets artificial intelligence"],
  [999, "How model responses are ranked"],
  [1310, "Advice for students exploring their options"],
  [1509, "Red teaming and testing model limits"],
  [1809, "What prompt engineering involves"],
  [1946, "Bringing the conversation back to people"],
];
export function formatTime(seconds) {
  const value = Math.max(0, Math.floor(Number.isFinite(seconds) ? seconds : 0));
  return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, "0")}`;
}
// Binary search also handles seeking backwards and gaps between speech.
export function findCue(cues, time) {
  let low = 0,
    high = cues.length - 1,
    result = -1;
  while (low <= high) {
    const mid = (low + high) >> 1;
    if (cues[mid].start <= time) {
      result = mid;
      low = mid + 1;
    } else high = mid - 1;
  }
  return result >= 0 && time < cues[result].end ? result : -1;
}
export function clampSeek(time, duration) {
  return Math.max(
    0,
    Math.min(time, Number.isFinite(duration) ? duration : 2040.058),
  );
}
