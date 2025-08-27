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
    const tick = () => {
      // Fire-and-forget polls; each stamps lastSeen only on success.
      (async () => {
        const f = await getJSON(`${endpoints.finish}/status`);
        if (!alive) return;
        if (f) {
          setFinish(f);
          const ts = Date.now();
          setLastSeen(ls => ({ ...ls, finish: ts }));
        }
      })();

      (async () => {
        const s = await getJSON(`${endpoints.start}/status`);
        if (!alive) return;
        if (s) {
          setStart(s);
          const ts = Date.now();
          setLastSeen(ls => ({ ...ls, start: ts }));
        }
      })();

      (async () => {
        const c = await getJSON(`${endpoints.car}/data`);
        if (!alive) return;
        if (c) {
          setCar(c);
          const ts = Date.now();
          setLastSeen(ls => ({ ...ls, car: ts }));
        }
      })();

      // Keep a steady cadence regardless of slow/failed requests
      setTimeout(() => alive && tick(), 250);
    };
    tick();
    return () => { alive = false; };
  }, [endpoints.car, endpoints.start, endpoints.finish]);

  const finishEdge = finish.finished === true && !prevFinished.current;
  useEffect(() => { prevFinished.current = finish.finished === true; }, [finish.finished]);

  return { elapsedMs, car, start, finish, finishEdge, lastSeen };
}
