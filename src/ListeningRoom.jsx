import { useEffect, useRef } from "react";
import {
  Pause,
  X,
  ArrowCounterClockwise,
  ArrowClockwise,
} from "@phosphor-icons/react";
import VoiceField from "./VoiceField";
import { chapters, formatTime } from "./podcast-timing";
import "./listening-room.css";

export default function ListeningRoom({
  active,
  analyser,
  calm,
  position,
  duration,
  cue,
  captions,
  onCaptions,
  onPause,
  onReset,
  onSeek,
  rate,
  onRate,
  volume,
  onVolume,
  waiting,
}) {
  const dialog = useRef(null),
    returnFocus = useRef(null),
    closeTimer = useRef(null);
  useEffect(() => {
    const room = dialog.current;
    clearTimeout(closeTimer.current);
    const close = () => {
      room.close();
      document.documentElement.classList.remove("listening-open");
      returnFocus.current?.focus({ preventScroll: true });
    };
    if (active) {
      if (!room.open) {
        returnFocus.current = document.activeElement;
        room.showModal();
        document.documentElement.classList.add("listening-open");
        room.querySelector(".room-pause").focus({ preventScroll: true });
      }
      room.dataset.phase = "open";
    } else if (room.open) {
      room.dataset.phase = "closing";
      closeTimer.current = setTimeout(close, calm ? 0 : 420);
    }
    return () => clearTimeout(closeTimer.current);
  }, [active, calm]);
  useEffect(
    () => () => {
      clearTimeout(closeTimer.current);
      document.documentElement.classList.remove("listening-open");
    },
    [],
  );
  const chapter = Math.max(
    0,
    chapters.findLastIndex(([time]) => time <= position),
  );
  return (
    <dialog
      ref={dialog}
      className="listening-room"
      aria-labelledby="room-title"
      onCancel={(event) => {
        event.preventDefault();
        onPause();
      }}
    >
      {(active || dialog.current?.open) && (
        <VoiceField
          analyser={analyser}
          playing={active && !waiting}
          calm={calm}
          immersive
        />
      )}
      <div className="room-shade" aria-hidden="true" />
      <header className="room-header">
        <div className="room-brand">
          Mun Wai<span>Space / Listening</span>
        </div>
        <button
          className="room-close"
          aria-label="Pause and return to portfolio"
          onClick={onPause}
        >
          <span>Back to the portfolio</span>
          <X size={22} />
        </button>
      </header>
      <div className="room-story">
        <p className="room-eyebrow">AI UNPLUGGED · MONASH DEEPNEURON</p>
        <h2 id="room-title">Psychology meets AI.</h2>
        <p className="room-guests">
          Evangeline Wong & Aarush Pandey, with guest Mun Wai Looi
        </p>
      </div>
      <div className="room-bottom">
        <div className="room-captions" data-captions={captions ? "on" : "off"}>
          <div className="room-speaker">
            <span className="room-speaker-dot" aria-hidden="true" />
            <span>
              {captions && cue
                ? cue.speaker
                : waiting
                  ? "Loading the conversation…"
                  : "AI Unplugged"}
            </span>
          </div>
          <p
            className="room-words"
            aria-label={
              captions && cue
                ? `${cue.speaker}: ${cue.words.map((w) => w.text).join(" ")}`
                : undefined
            }
          >
            {captions && cue ? (
              cue.words.map((word, i) => (
                <span
                  key={`${cue.start}-${i}`}
                  className={
                    position >= word.start && position < word.end
                      ? "word-current"
                      : position >= word.end
                        ? "word-spoken"
                        : "word-next"
                  }
                >
                  {word.text}{" "}
                </span>
              ))
            ) : (
              <span>
                {!captions
                  ? "A little room to listen."
                  : waiting
                    ? "The recording will continue in a moment."
                    : "[No speech]"}
              </span>
            )}
          </p>
        </div>
        <div className="room-controls">
          <div className="room-timeline">
            <span>{formatTime(position)}</span>
            <input
              aria-label="Listening room episode position"
              type="range"
              min="0"
              max={duration}
              step="0.1"
              value={position}
              aria-valuetext={`${formatTime(position)} of ${formatTime(duration)}`}
              onChange={(e) => onSeek(Number(e.target.value))}
            />
            <span>{formatTime(duration)}</span>
          </div>
          <div className="room-transport">
            <div className="room-playback">
              <button
                className="room-skip"
                aria-label="Back 15 seconds in listening room"
                onClick={() => onSeek(position - 15)}
              >
                <ArrowCounterClockwise size={25} />
                <span>15</span>
              </button>
              <button className="room-pause" onClick={onPause}>
                <Pause weight="fill" size={19} />
                Pause & return
              </button>
              <button
                className="room-skip"
                aria-label="Forward 15 seconds in listening room"
                onClick={() => onSeek(position + 15)}
              >
                <ArrowClockwise size={25} />
                <span>15</span>
              </button>
            </div>
            <div className="room-options">
              <label className="room-chapter-label">
                <span className="sr-only">Listening room chapter</span>
                <select
                  aria-label="Listening room chapter"
                  value={chapter}
                  onChange={(e) => onSeek(chapters[Number(e.target.value)][0])}
                >
                  {chapters.map(([time, title], i) => (
                    <option key={time} value={i}>
                      {formatTime(time)} · {title}
                    </option>
                  ))}
                </select>
              </label>
              <select
                aria-label="Listening room speed"
                value={rate}
                onChange={(e) => onRate(Number(e.target.value))}
              >
                {[0.75, 1, 1.25, 1.5, 2].map((speed) => (
                  <option key={speed} value={speed}>
                    {speed}×
                  </option>
                ))}
              </select>
              <button
                className="room-cc"
                aria-label="Listening room captions"
                aria-pressed={captions}
                onClick={onCaptions}
              >
                CC
              </button>
              <label className="room-volume">
                <span className="sr-only">Listening room volume</span>
                <input
                  type="range"
                  aria-label="Listening room volume"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={(e) => onVolume(Number(e.target.value))}
                />
              </label>
            </div>
          </div>
          <div className="room-footnote">
            <span>
              {captions
                ? "Automatic captions · occasional errors may remain"
                : "Captions off"}
              {calm ? " · Motion paused" : ""}
            </span>
            <button onClick={onReset}>Reset & return</button>
          </div>
        </div>
      </div>
    </dialog>
  );
}
