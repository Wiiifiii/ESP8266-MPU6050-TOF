// app/hooks/useStopwatch.js
import { useEffect, useRef, useState } from 'react';

export function useStopwatch(running, startAtMs = 0) {
  const [elapsedMs, setElapsedMs] = useState(0);
  const rafRef = useRef(null);
  const t0Ref = useRef(0);

  useEffect(() => {
    if (running) t0Ref.current = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - startAtMs;
  }, [running, startAtMs]);

  useEffect(() => {
    if (!running) return;
    const nowFn = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
    const tick = () => {
      setElapsedMs(nowFn() - t0Ref.current);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [running]);

  return elapsedMs;
}
