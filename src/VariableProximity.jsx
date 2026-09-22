// Adapted from React Bits VariableProximity (JS-CSS), MIT + Commons Clause.
// Licence: licences/react-bits-LICENSE.md. Provenance: vendor/react-bits/PROVENANCE.md.
import { Fragment, forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useSceneActivity from './useSceneActivity';
import './VariableProximity.css';

// Reads "'wght' 400, 'opsz' 9" into ordered [axis, value] pairs, as the registry source does.
const parseSettings = settings => String(settings || '')
  .split(',')
  .map(part => part.trim().match(/^["']?([A-Za-z0-9]{4})["']?\s+(-?\d+(?:\.\d+)?)$/))
  .filter(Boolean)
  .map(match => [match[1], Number(match[2])]);
// Every axis of the "from" settings interpolates towards its "to" value (or stays put).
const readAxes = (from, to) => {
  const targets = new Map(parseSettings(to));
  return parseSettings(from).map(([axis, value]) => ({ axis, from: value, to: targets.get(axis) ?? value }));
};
const settingsAt = (axes, amount) => axes.length
  ? axes.map(({ axis, from, to }) => `"${axis}" ${(from + (to - from) * amount).toFixed(2)}`).join(', ')
  : 'normal';

const VariableProximity = forwardRef(function VariableProximity({
  label = '',
  fromFontVariationSettings = '"wght" 400',
  toFontVariationSettings = '"wght" 800',
  containerRef,
  radius = 120,
  falloff = 'linear',
  enabled = true,
  active = true,
  className = '',
  style,
  ...rest
}, forwardedRef) {
  const rootRef = useRef(null);
  const letterRefs = useRef([]);
  const [reduced, setReduced] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  const sceneActive = useSceneActivity(rootRef, !enabled || !active || reduced);
  const content = String(label);
  const tokens = useMemo(() => content.split(/(\s+)/u).filter(Boolean), [content]);
  const axes = useMemo(() => readAxes(fromFontVariationSettings, toFontVariationSettings),
    [fromFontVariationSettings, toFontVariationSettings]);
  const axesKey = axes.map(({ axis, from, to }) => `${axis}:${from}:${to}`).join('|');
  const axesRef = useRef(axes);
  axesRef.current = axes;
  const restSettings = settingsAt(axes, 0);
  const setRef = useCallback(element => {
    rootRef.current = element;
    if (typeof forwardedRef === 'function') forwardedRef(element);
    else if (forwardedRef) forwardedRef.current = element;
  }, [forwardedRef]);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(query.matches);
    query.addEventListener('change', update);
    update();
    return () => query.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const container = containerRef?.current || rootRef.current;
    const letters = letterRefs.current.filter(element => element?.isConnected);
    const axes = axesRef.current;
    // Each letter animates one proximity amount (0 at rest, 1 at the pointer),
    // mapped onto every variation axis at once.
    const write = (element, amount) => { element.style.fontVariationSettings = settingsAt(axes, amount); };
    const reset = () => letters.forEach(element => write(element, 0));
    reset();
    if (!sceneActive || !container || !letters.length || !axes.length) return;

    const amounts = letters.map(() => 0);
    const targets = letters.map(() => 0);
    const pointer = { x: 0, y: 0, inside: false };
    let frameId = 0;
    let dirty = false;
    let last = performance.now();
    const reach = Math.max(1, radius);
    const influence = distance => {
      if (distance >= reach) return 0;
      const normal = Math.max(0, 1 - distance / reach);
      if (falloff === 'exponential') return normal * normal;
      // Normalise the Gaussian to zero at the edge, avoiding a jump there.
      if (falloff === 'gaussian') return (Math.exp(-2 * (distance / reach) ** 2) - Math.exp(-2)) / (1 - Math.exp(-2));
      return normal;
    };
    const frame = now => {
      frameId = 0;
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
      last = now;
      if (dirty) {
        dirty = false;
        // Read geometry together before writing any font settings.
        letters.forEach((letter, index) => {
          if (!pointer.inside) { targets[index] = 0; return; }
          const box = letter.getBoundingClientRect();
          const distance = Math.hypot(pointer.x - box.left - box.width / 2, pointer.y - box.top - box.height / 2);
          targets[index] = influence(distance);
        });
      }
      const ease = 1 - Math.exp(-dt / 0.085);
      let moving = false;
      letters.forEach((letter, index) => {
        const difference = targets[index] - amounts[index];
        if (Math.abs(difference) <= 0.0002) {
          if (amounts[index] !== targets[index]) write(letter, targets[index]);
          amounts[index] = targets[index];
          return;
        }
        amounts[index] += difference * ease;
        write(letter, amounts[index]);
        moving = true;
      });
      if (moving) frameId = requestAnimationFrame(frame);
    };
    const start = () => {
      if (frameId) return;
      last = performance.now();
      frameId = requestAnimationFrame(frame);
    };
    const move = event => {
      if (event.pointerType === 'touch') return;
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.inside = true;
      dirty = true;
      start();
    };
    const leave = () => {
      pointer.inside = false;
      dirty = true;
      start();
    };
    container.addEventListener('pointermove', move, { passive: true });
    container.addEventListener('pointerenter', move, { passive: true });
    container.addEventListener('pointerleave', leave);
    container.addEventListener('pointercancel', leave);
    window.addEventListener('blur', leave);
    return () => {
      cancelAnimationFrame(frameId);
      container.removeEventListener('pointermove', move);
      container.removeEventListener('pointerenter', move);
      container.removeEventListener('pointerleave', leave);
      container.removeEventListener('pointercancel', leave);
      window.removeEventListener('blur', leave);
      reset();
    };
  }, [sceneActive, containerRef, content, axesKey, radius, falloff]);

  let letterIndex = 0;
  return (
    <span ref={setRef} className={`variable-proximity ${className}`.trim()}
      data-motion-active={sceneActive ? 'true' : 'false'}
      style={{ fontVariationSettings: restSettings, ...style }} {...rest}>
      <span aria-hidden="true">
        {tokens.map((token, index) => /\S/u.test(token)
          ? <span key={index} className="variable-proximity__word">
              {Array.from(token).map(letter => {
                const currentIndex = letterIndex++;
                return <span key={currentIndex} className="variable-proximity__letter"
                  ref={element => { letterRefs.current[currentIndex] = element; }}
                  style={{ fontVariationSettings: restSettings }}>{letter}</span>;
              })}
            </span>
          : <Fragment key={index}>{token}</Fragment>)}
      </span>
      <span className="variable-proximity__label">{content}</span>
    </span>
  );
});

export default VariableProximity;
