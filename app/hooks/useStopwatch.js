/**
 * Project: ESP8266-MPU6050-TOF
 * Module/File: app/hooks/useStopwatch.js
 * Purpose: App hook (polling/stopwatch/telemetry)
 * Notes: Auto-generated header; behavior unchanged.
 */

// app/hooks/useStopwatch.js
/**
 * Module: app/hooks/useStopwatch.js
 * Purpose: Lightweight elapsed time hook using requestAnimationFrame.
 */
import { useEffect, useRef, useState } from 'react';

/**
 * Hook: Stopwatch.
 * @param {boolean} running whether to tick
 * @param {number} [startAtMs=0] start offset in ms
 * @returns {number} elapsed milliseconds
 */
export function useStopwatch(running, startAtMs = 0) {
  const [elapsedMs, setElapsedMs] = useState(0);
  const rafRef = useRef(null);
  const t0Ref = useRef(0);

  useEffect(() => {
    if (running)
      t0Ref.current =
        (typeof performance !== 'undefined' ? performance.now() : Date.now()) - startAtMs;
  }, [running, startAtMs]);

  useEffect(() => {
    if (!running) return;
    const nowFn = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
    const tick = () => {
      setElapsedMs(nowFn() - t0Ref.current);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [running]);

  return elapsedMs;
}
