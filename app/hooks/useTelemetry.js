// app/hooks/useTelemetry.js
import { useEffect, useRef, useState } from 'react';
import { useStopwatch } from './useStopwatch';

async function getJSON(url, timeout = 1500) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), timeout);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    clearTimeout(id);
    if (!res.ok) throw new Error(String(res.status));
    return await res.json();
  } catch {
    clearTimeout(id);
    return null;
  }
}

export function useTelemetry(endpoints, running) {
  const elapsedMs = useStopwatch(running, 0);
  const [car, setCar] = useState({});
  const [start, setStart] = useState({});
  const [finish, setFinish] = useState({});
  const [lastSeen, setLastSeen] = useState({});
  const prevFinished = useRef(false);

  useEffect(() => {
    let alive = true;
    const tick = async () => {
      const [c, s, f] = await Promise.all([
        getJSON(`${endpoints.car}/data`),
        getJSON(`${endpoints.start}/status`),
        getJSON(`${endpoints.finish}/status`),
      ]);
      if (!alive) return;
      const now = Date.now();
      if (c) { setCar(c);   setLastSeen(ls => ({ ...ls, car: now })); }
      if (s) { setStart(s); setLastSeen(ls => ({ ...ls, start: now })); }
      if (f) { setFinish(f);setLastSeen(ls => ({ ...ls, finish: now })); }
      setTimeout(tick, 200);
    };
    tick();
    return () => { alive = false; };
  }, [endpoints.car, endpoints.start, endpoints.finish]);

  const finishEdge = finish.finished === true && !prevFinished.current;
  useEffect(() => { prevFinished.current = finish.finished === true; }, [finish.finished]);

  return { elapsedMs, car, start, finish, finishEdge, lastSeen };
}
