// Adapted from React Bits MaskedHeading (JS-CSS), MIT + Commons Clause.
// Licence: licences/react-bits-LICENSE.md. Provenance: vendor/react-bits/PROVENANCE.md.
import { Fragment, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';
import useSceneActivity from './useSceneActivity';
import './MaskedHeading.css';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const CROSSFADE_MS = 760;

function useReducedMotion() {
  const [reduced, setReduced] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return reduced;
}

// The native heading remains underneath the decorative image at every stage.
// If media, clipping or animation is unavailable, its content is still readable.
export default function MaskedHeading({
  text = 'Designed in the details',
  tag = 'h2',
  mediaType = 'image',
  src = '',
  poster = '',
  fillScale = 1.25,
  parallax = 26,
  drift = 18,
  brightness = 1,
  saturation = 1,
  grayscale = false,
  reveal = 'wipe',
  duration = 1.1,
  stagger = 0.09,
  trigger = 'view',
  align = 'center',
  weight = 700,
  tracking = -0.03,
  lineHeight = 1.06,
  textScale = null,
  enabled = true,
  active = true,
  replayKey = 0,
  className = '',
  style,
  ...rest
}) {
  const rootRef = useRef(null);
  const measureRef = useRef(null);
  const revealRef = useRef(null);
  const mediaRef = useRef(null);
  const videoRef = useRef(null);
  const wordRefs = useRef([]);
  const baseRefs = useRef([]);
  const glyphRefs = useRef([]);
  const sizeRef = useRef({ width: 0, height: 0 });
  const offsetRef = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const revealedRef = useRef('');
  const sourceKey = `${mediaType}:${src}`;
  // A changed source crossfades inside the lettering instead of replaying the reveal.
  const [layers, setLayers] = useState(() => (src ? [{ key: sourceKey, src, mediaType, poster, loaded: false }] : []));
  const [measuredText, setMeasuredText] = useState(null);
  const reduced = useReducedMotion();
  const sceneActive = useSceneActivity(rootRef, !enabled || !active || reduced);
  const content = String(text);
  const ready = layers.some(layer => layer.loaded) && measuredText === content;
  const animate = sceneActive && ready;
  const clipId = `mh-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const tokens = useMemo(() => {
    let index = 0;
    return content.split(/(\s+)/u).filter(Boolean).map(value => ({
      value,
      wordIndex: /\S/u.test(value) ? index++ : null,
    }));
  }, [content]);
  const words = useMemo(() => tokens.filter(token => token.wordIndex !== null), [tokens]);
  const settingsRef = useRef({});
  settingsRef.current = { fillScale: Math.max(1, fillScale), parallax, drift, textScale, fontSize: style?.fontSize };

  useEffect(() => {
    setLayers(current => {
      if (!src) return current.length ? [] : current;
      if (current[current.length - 1]?.key === sourceKey) return current;
      const existing = current.find(layer => layer.key === sourceKey && layer.loaded);
      const base = current.filter(layer => layer.loaded && layer.key !== sourceKey).slice(-1);
      return [...base, existing || { key: sourceKey, src, mediaType, poster, loaded: false }];
    });
  }, [sourceKey, src, mediaType, poster]);

  useEffect(() => {
    if (layers.length < 2 || !layers[layers.length - 1].loaded) return;
    const timer = setTimeout(() => setLayers(current => current.slice(-1)), CROSSFADE_MS);
    return () => clearTimeout(timer);
  }, [layers]);

  const markLoaded = useCallback(key => {
    setLayers(current => current.map(layer => (layer.key === key && !layer.loaded ? { ...layer, loaded: true } : layer)));
  }, []);
  const dropLayer = useCallback(key => {
    setLayers(current => current.filter(layer => layer.key !== key));
  }, []);

  const place = useCallback(() => {
    const media = mediaRef.current;
    if (!media) return;
    const { width, height } = sizeRef.current;
    const { fillScale: scale } = settingsRef.current;
    const offset = offsetRef.current;
    const maxX = ((scale - 1) / 2) * width;
    const maxY = ((scale - 1) / 2) * height;
    media.style.transform = `translate3d(${clamp(offset.x, -maxX, maxX).toFixed(2)}px, ${clamp(offset.y, -maxY, maxY).toFixed(2)}px, 0) scale(${scale})`;
  }, []);

  const sync = useCallback(() => {
    const root = rootRef.current;
    const measure = measureRef.current;
    if (!root || !measure) return;
    const { textScale: scale, fontSize } = settingsRef.current;
    root.style.fontSize = typeof scale === 'number' && scale > 0
      ? `${clamp(root.clientWidth * scale, 20, 200).toFixed(1)}px`
      : typeof fontSize === 'number' ? `${fontSize}px` : fontSize || '';
    const rootBox = root.getBoundingClientRect();
    const cs = window.getComputedStyle(measure);
    sizeRef.current = { width: root.clientWidth, height: root.clientHeight };
    words.forEach(({ wordIndex: index }) => {
      const word = wordRefs.current[index];
      const baseline = baseRefs.current[index];
      const glyph = glyphRefs.current[index];
      if (!word || !baseline || !glyph) return;
      // The zero-height inline marker sits on the native text's alphabetic baseline.
      // Rectangles, rather than offsetTop, also handle wrapped and centred lines.
      const box = word.getBoundingClientRect();
      glyph.setAttribute('x', String(box.left - rootBox.left));
      glyph.setAttribute('y', String(baseline.getBoundingClientRect().top - rootBox.top));
      ['fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'fontStretch',
        'fontKerning', 'fontFeatureSettings', 'fontVariationSettings', 'letterSpacing',
        'textTransform'].forEach(property => { glyph.style[property] = cs[property]; });
    });
    setMeasuredText(content);
    place();
  }, [content, words, place]);

  useEffect(() => {
    const root = rootRef.current;
    // A disabled heading shows its native text, so measuring waits until it is enabled.
    if (!root || !enabled) return;
    let mounted = true;
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(root);
    const fontSync = () => { if (mounted) sync(); };
    document.fonts?.ready.then(fontSync).catch(() => {});
    document.fonts?.addEventListener('loadingdone', fontSync);
    return () => {
      mounted = false;
      observer.disconnect();
      document.fonts?.removeEventListener('loadingdone', fontSync);
    };
  }, [sync, enabled]);

  useEffect(() => { if (enabled) sync(); }, [sync, enabled, tag, align, weight, tracking, lineHeight, textScale, style?.fontSize, fillScale]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const offset = offsetRef.current;
    if (!animate) {
      offset.x = offset.y = offset.tx = offset.ty = 0;
      place();
      return;
    }
    let frameId = 0;
    let last = performance.now();
    let clock = 0;
    const frame = now => {
      frameId = 0;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      clock += dt;
      const settings = settingsRef.current;
      const driftX = Math.sin(clock * 0.21) * settings.drift;
      const driftY = Math.sin(clock * 0.17) * settings.drift * 0.6;
      const targetX = offset.tx + driftX;
      const targetY = offset.ty + driftY;
      const ease = 1 - Math.exp(-dt / 0.18);
      offset.x += (targetX - offset.x) * ease;
      offset.y += (targetY - offset.y) * ease;
      place();
      if (settings.drift > 0 || Math.abs(targetX - offset.x) + Math.abs(targetY - offset.y) > 0.02) {
        frameId = requestAnimationFrame(frame);
      }
    };
    const start = () => {
      if (frameId) return;
      last = performance.now();
      frameId = requestAnimationFrame(frame);
    };
    const move = event => {
      if (event.pointerType === 'touch' || settingsRef.current.parallax <= 0) return;
      const box = root.getBoundingClientRect();
      offset.tx = clamp((event.clientX - box.left) / (box.width || 1) * 2 - 1, -1, 1) * -settingsRef.current.parallax;
      offset.ty = clamp((event.clientY - box.top) / (box.height || 1) * 2 - 1, -1, 1) * -settingsRef.current.parallax;
      start();
    };
    const leave = () => { offset.tx = offset.ty = 0; start(); };
    root.addEventListener('pointermove', move, { passive: true });
    root.addEventListener('pointerleave', leave);
    root.addEventListener('pointercancel', leave);
    if (settingsRef.current.drift > 0) start();
    return () => {
      cancelAnimationFrame(frameId);
      root.removeEventListener('pointermove', move);
      root.removeEventListener('pointerleave', leave);
      root.removeEventListener('pointercancel', leave);
    };
  }, [animate, place, drift, parallax]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (sceneActive) video.play().catch(() => {});
    else video.pause();
    return () => video.pause();
  }, [sceneActive, src, mediaType, layers]);

  useEffect(() => {
    const root = rootRef.current;
    const layer = revealRef.current;
    const glyphs = glyphRefs.current.slice(0, words.length).filter(Boolean);
    if (!root || !layer || !glyphs.length) return;
    let tween;
    const settle = () => {
      gsap.set(glyphs, { y: 0 });
      gsap.set(layer, { opacity: 1, scale: 1, clipPath: 'inset(0% 0% 0% 0%)' });
    };
    // Replays follow the owner's replayKey, never a photograph change.
    const key = `${content}:${replayKey}`;
    const play = () => {
      tween?.kill();
      settle();
      revealedRef.current = key;
      if (reveal === 'rise') {
        tween = gsap.fromTo(glyphs,
          { y: (parseFloat(getComputedStyle(root).fontSize) || 48) * 1.15 },
          { y: 0, duration, stagger, ease: 'power4.out' });
      } else if (reveal === 'wipe') {
        tween = gsap.fromTo(layer, { clipPath: 'inset(0% 100% 0% 0%)' },
          { clipPath: 'inset(0% 0% 0% 0%)', duration, ease: 'power3.inOut' });
      } else if (reveal !== 'none') {
        tween = gsap.fromTo(layer, { opacity: 0, scale: 1.04 },
          { opacity: 1, scale: 1, duration, ease: 'power3.out' });
      }
    };
    settle();
    if (!animate || reveal === 'none') return;
    if (trigger === 'hover') root.addEventListener('pointerenter', play);
    else if (revealedRef.current !== key) play();
    return () => {
      root.removeEventListener('pointerenter', play);
      // Each instance owns just this tween; other scenes' GSAP work is untouched.
      tween?.kill();
      settle();
    };
  }, [animate, content, replayKey, words, reveal, trigger, duration, stagger]);

  const Tag = tag;
  const newest = layers.length - 1;
  return (
    <Tag ref={rootRef} className={`masked-heading ${className}`.trim()}
      data-media-ready={ready ? 'true' : 'false'} data-motion-active={animate ? 'true' : 'false'}
      style={{ textAlign: align, fontWeight: weight, letterSpacing: `${tracking}em`, lineHeight, ...style }} {...rest}>
      <span ref={measureRef} className="masked-heading__measure">
        {tokens.map(({ value, wordIndex }, index) => wordIndex === null
          ? <Fragment key={`space-${index}`}>{value.includes('\n')
            ? value.split('\n').map((part, line) => <Fragment key={line}>{line > 0 && <br />}{part}</Fragment>)
            : ' '}</Fragment>
          : <span key={`word-${index}`} ref={element => { wordRefs.current[wordIndex] = element; }} className="masked-heading__word">
              {value}<i aria-hidden="true" ref={element => { baseRefs.current[wordIndex] = element; }} className="masked-heading__baseline" />
            </span>)}
      </span>
      <svg className="masked-heading__defs" aria-hidden="true" focusable="false">
        <defs><clipPath id={clipId} clipPathUnits="userSpaceOnUse">
          {words.map(({ value, wordIndex }) => <text key={wordIndex} dominantBaseline="alphabetic"
            ref={element => { glyphRefs.current[wordIndex] = element; }}>{value}</text>)}
        </clipPath></defs>
      </svg>
      <span ref={revealRef} className="masked-heading__reveal" aria-hidden="true">
        <span className="masked-heading__clip" style={{ clipPath: `url(#${clipId})` }}>
          <span ref={mediaRef} className="masked-heading__media"
            style={{ filter: `brightness(${brightness}) saturate(${saturation})${grayscale ? ' grayscale(1)' : ''}` }}>
            {layers.map((layer, index) => layer.mediaType === 'video'
              ? <video key={layer.key} ref={index === newest ? videoRef : undefined} className="masked-heading__source"
                  data-loaded={layer.loaded ? 'true' : 'false'} src={layer.src} poster={layer.poster}
                  muted loop playsInline preload="metadata" tabIndex={-1}
                  onLoadedData={() => markLoaded(layer.key)} onError={() => dropLayer(layer.key)} />
              : <img key={layer.key} className="masked-heading__source" data-loaded={layer.loaded ? 'true' : 'false'}
                  src={layer.src} alt="" draggable={false} loading="lazy" decoding="async"
                  onLoad={() => markLoaded(layer.key)} onError={() => dropLayer(layer.key)} />)}
            <span className="masked-heading__lift" />
          </span>
        </span>
      </span>
    </Tag>
  );
}
