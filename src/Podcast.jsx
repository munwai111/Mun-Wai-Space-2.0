import Ink from "./Ink";
import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  Play,
  Pause,
  ArrowCounterClockwise,
  ArrowClockwise,
} from "@phosphor-icons/react";
import { chapters, formatTime, findCue, clampSeek } from "./podcast-timing";
import VoiceField from "./VoiceField";
import ListeningRoom from "./ListeningRoom";
import { createPodcastSignal } from "./podcast-audio";
import "./podcast.css";

export default function Podcast({ calm }) {
  const audio = useRef(null),
    context = useRef(null),
    source = useRef(null),
    section = useRef(null);
  const [analyser, setAnalyser] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(2040.058);
  const [error, setError] = useState("");
  const [visualError, setVisualError] = useState(false);
  const [captions, setCaptions] = useState(true);
  const [nativeControls, setNativeControls] = useState(false);
  const [transcript, setTranscript] = useState(null);
  const [captionError, setCaptionError] = useState(false);
  const [captionAttempt, setCaptionAttempt] = useState(0);
  const [rate, setRate] = useState(1);
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    const abort = new AbortController();
    let requested = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || requested) return;
        requested = true;
        setCaptionError(false);
        fetch("/audio/ai-unplugged-captions.json", {
          signal: abort.signal,
          cache: "no-cache",
        })
          .then((r) => {
            if (!r.ok) throw new Error("Captions unavailable");
            return r.json();
          })
          .then(setTranscript)
          .catch((e) => {
            if (e.name !== "AbortError") setCaptionError(true);
          });
      },
      { rootMargin: "400px" },
    );
    observer.observe(section.current);
    return () => {
      abort.abort();
      observer.disconnect();
    };
  }, [captionAttempt]);

  useEffect(() => {
    if (!playing) return;
    let frame,
      previous = 0;
    const tick = (now) => {
      if (now - previous >= 50) {
        setPosition(audio.current.currentTime);
        previous = now;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing]);
  useEffect(
    () => () => {
      context.current?.close();
    },
    [],
  );

  const prepareSignal = () => {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) {
      setVisualError(true);
      return;
    }
    try {
      if (!context.current) {
        context.current = new AudioContext();
        const { analyser: node } = createPodcastSignal(context.current);
        source.current = context.current.createMediaElementSource(
          audio.current,
        );
        source.current.connect(node);
        setAnalyser(node);
      }
      context.current.resume().catch(() => setVisualError(true));
    } catch {
      setVisualError(true);
    }
  };
  const play = () => {
    setError("");
    prepareSignal();
    setWaiting(true);
    audio.current.play().catch((e) => {
      setWaiting(false);
      if (e.name !== "AbortError")
        setError(
          "The recording couldn’t play. Try again, or use the standard controls below.",
        );
    });
  };
  const seek = (time) => {
    const value = clampSeek(time, duration);
    audio.current.currentTime = value;
    setPosition(value);
  };
  const cueIndex = findCue(transcript?.cues || [], position);
  const cue = transcript?.cues[cueIndex];
  const activeChapter = Math.max(
    0,
    chapters.findLastIndex(([time]) => time <= position),
  );
  const reset = () => {
    audio.current.pause();
    audio.current.currentTime = 0;
    setPlaying(false);
    setWaiting(false);
    setStarted(false);
    setPosition(0);
  };

  return (
    <section ref={section} id="listen" className="podcast section-wrap">
      <div className="podcast-top">
        <p className="section-label">A SEAT AT THE MICROPHONE</p>
        <span>MONASH DEEPNEURON · 23 OCT 2025 · 34 MIN</span>
      </div>
      <div className="podcast-grid">
        <div className="podcast-conversation">
          <h2>
            <Ink>
              Psychology meets AI.
              <br />
              Let’s talk about it.
            </Ink>
          </h2>
          <p className="section-description">
            I joined Evangeline Wong and Aarush Pandey on AI Unplugged to
            discuss evaluating AI, human judgement and what a psychology
            background brings to the conversation.
          </p>
          <VoiceField analyser={null} playing={false} calm={calm} />
          {visualError && (
            <p className="player-note" role="status">
              Audio is available. This browser couldn’t activate the voice
              visualisation.
            </p>
          )}
          <div
            className="spoken-caption"
            data-captions={captions ? "on" : "off"}
          >
            <div className="caption-heading">
              <span className="section-label">
                {cue && captions ? cue.speaker : "IN THEIR OWN WORDS"}
              </span>
              <button
                aria-pressed={captions}
                aria-label={`CC ${captions ? "On" : "Off"} — closed captions`}
                onClick={() => setCaptions(!captions)}
              >
                CC <span>{captions ? "On" : "Off"}</span>
              </button>
            </div>
            {captions ? (
              <>
                <p
                  className="caption-words"
                  aria-label={
                    cue
                      ? `${cue.speaker}: ${cue.words.map((w) => w.text).join(" ")}`
                      : undefined
                  }
                >
                  {cue ? (
                    cue.words.map((word, i) => (
                      <span
                        key={`${cueIndex}-${i}`}
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
                    <span className="caption-idle">
                      {captionError
                        ? "The recording can continue without captions."
                        : !transcript
                          ? "Preparing the words…"
                          : !started
                            ? "Press play. Follow every voice, word by word."
                            : position >= duration - 0.5
                              ? "Thanks for listening."
                              : "[No speech]"}
                    </span>
                  )}
                </p>
                <p className="caption-disclosure">
                  {captionError ? (
                    <>
                      Captions couldn’t load.{" "}
                      <button onClick={() => setCaptionAttempt((x) => x + 1)}>
                        Try again
                      </button>
                    </>
                  ) : !transcript ? (
                    "Loading captions…"
                  ) : (
                    "Automatic captions & speaker labels · occasional errors may remain."
                  )}
                </p>
              </>
            ) : (
              <p className="caption-idle">
                Captions are off. Settle in and listen.
              </p>
            )}
          </div>
        </div>
        <div className="listening-desk">
          <div className="episode-card">
            <span className="episode-edition" aria-hidden="true">
              AI
              <br />
              UNPLUGGED
            </span>
            <div>
              <span className="section-label">THE EPISODE</span>
              <h3>What if your job was to break AI?</h3>
              <p>Evangeline Wong and Aarush Pandey, with guest Mun Wai Looi</p>
            </div>
          </div>
          <audio
            ref={audio}
            src="/audio/ai-unplugged-mun-wai.m4a"
            preload="none"
            controls={nativeControls}
            aria-label="AI Unplugged full episode"
            onLoadedMetadata={() => setDuration(audio.current.duration)}
            onTimeUpdate={() => setPosition(audio.current.currentTime)}
            onPlay={() => {
              setStarted(true);
              prepareSignal();
            }}
            onPlaying={() => {
              setWaiting(false);
              setPlaying(true);
              setError("");
            }}
            onPause={() => {
              setPlaying(false);
              setWaiting(false);
            }}
            onWaiting={() => setWaiting(true)}
            onCanPlay={() => setWaiting(false)}
            onSeeked={() => {
              setPosition(audio.current.currentTime);
              setWaiting(false);
            }}
            onEnded={reset}
            onRateChange={() => setRate(audio.current.playbackRate)}
            onVolumeChange={() =>
              setVolume(audio.current.muted ? 0 : audio.current.volume)
            }
            onError={() => {
              setWaiting(false);
              setPlaying(false);
              setError(
                "The recording couldn’t load. Check your connection and try again.",
              );
            }}
          />
          <div className="episode-transport">
            <button
              className="episode-play"
              onClick={() => (playing ? audio.current.pause() : play())}
              aria-label={
                playing
                  ? "Pause episode"
                  : started
                    ? "Continue listening to the episode"
                    : "Listen here — play episode"
              }
            >
              {playing ? <Pause weight="fill" /> : <Play weight="fill" />}
              <span>
                {playing
                  ? "Pause"
                  : started
                    ? "Continue listening"
                    : "Listen here"}
              </span>
            </button>
            <button
              className="skip-audio"
              aria-label="Back 15 seconds"
              onClick={() => seek(position - 15)}
            >
              <ArrowCounterClockwise />
              <span>15</span>
            </button>
            <button
              className="skip-audio"
              aria-label="Forward 15 seconds"
              onClick={() => seek(position + 15)}
            >
              <ArrowClockwise />
              <span>15</span>
            </button>
          </div>
          <div className="episode-scrubber">
            <label htmlFor="episode-position" className="sr-only">
              Episode position
            </label>
            <input
              id="episode-position"
              type="range"
              min="0"
              max={duration}
              step="0.1"
              value={position}
              aria-valuetext={`${formatTime(position)} of ${formatTime(duration)}`}
              onChange={(e) => seek(Number(e.target.value))}
            />
            <div>
              <span>{formatTime(position)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
          <div className="episode-options">
            <label>
              Speed{" "}
              <select
                aria-label="Playback speed"
                value={rate}
                onChange={(e) => {
                  audio.current.playbackRate = Number(e.target.value);
                }}
              >
                {[0.75, 1, 1.25, 1.5, 2].map((speed) => (
                  <option key={speed} value={speed}>
                    {speed}×
                  </option>
                ))}
              </select>
            </label>
            <label>
              Volume{" "}
              <input
                aria-label="Episode volume"
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => {
                  audio.current.muted = false;
                  audio.current.volume = Number(e.target.value);
                }}
              />
            </label>
          </div>
          <p className="playback-status" role="status">
            {error ||
              (waiting
                ? "Loading audio…"
                : playing
                  ? "Playing · full episode"
                  : started
                    ? "Paused · pick up whenever you like"
                    : "Full episode · no Spotify sign-in needed")}
          </p>
          {error && (
            <button
              className="button outline"
              onClick={() => {
                audio.current.load();
                play();
              }}
            >
              Retry audio
            </button>
          )}
          <button
            className="standard-controls"
            aria-pressed={nativeControls}
            onClick={() => setNativeControls(!nativeControls)}
          >
            {nativeControls ? "Hide" : "Show"} standard audio controls
          </button>
          <a
            className="text-link"
            href="https://open.spotify.com/episode/4PGM2iWZIBl0OCHZOANxnC"
            target="_blank"
            rel="noreferrer"
          >
            Open episode on Spotify <ArrowUpRight />
          </a>
          <p className="podcast-credit">
            AI Unplugged is produced by Monash DeepNeuron. The episode is theirs
            and is shared here with credit.
          </p>
          <div
            className="podcast-chapters"
            aria-label="Episode chapters"
            tabIndex={0}
          >
            {chapters.map(([time, title], i) => (
              <button
                key={time}
                aria-current={activeChapter === i ? "true" : undefined}
                onClick={() => {
                  seek(time);
                  play();
                }}
              >
                <span>{formatTime(time)}</span>
                {title}
              </button>
            ))}
          </div>
          <div className="podcast-source-links">
            <a
              className="text-link"
              href="/audio/ai-unplugged-transcript.txt"
              download
            >
              Read the transcript <ArrowUpRight />
            </a>
            <a
              className="text-link"
              href="https://www.instagram.com/munwai111/p/DQPTKEwk_a4/"
              target="_blank"
              rel="noreferrer"
            >
              Behind the microphone <ArrowUpRight />
            </a>
          </div>
        </div>
      </div>
      <ListeningRoom
        active={playing}
        analyser={analyser}
        calm={calm}
        position={position}
        duration={duration}
        cue={cue}
        captions={captions}
        waiting={waiting}
        onCaptions={() => setCaptions(!captions)}
        onPause={() => audio.current.pause()}
        onReset={reset}
        onSeek={seek}
        rate={rate}
        onRate={(value) => {
          audio.current.playbackRate = value;
        }}
        volume={volume}
        onVolume={(value) => {
          audio.current.muted = false;
          audio.current.volume = value;
        }}
      />
    </section>
  );
}
