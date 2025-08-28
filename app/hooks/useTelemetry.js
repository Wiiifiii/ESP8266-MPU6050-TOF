/**
 * Module: app/hooks/useTelemetry.js
 * Purpose: Polls Car/Start/Finish; stamps lastSeen; auto-discovers endpoints on repeated failures.
 */
import { useEffect, useRef, useState } from 'react';
import { useStopwatch } from './useStopwatch';
import api, {
  getCar,
  getStart,
  getFinish,
  discoverUnits,
  getStartBase,
  getFinishBase,
} from '../api';

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

/**
 * Hook: Telemetry poller.
 * @param {object} [endpoints] unused; API getters are used for bases.
 * @param {boolean} running keep elapsed time ticking
 * @returns {{elapsedMs:number, car:any, start:any, finish:any, finishEdge?:boolean, lastSeen:Record<string,number>}}
 */
export function useTelemetry(endpoints, running) {
  const elapsedMs = useStopwatch(running, 0);
  const [car, setCar] = useState({});
  const [start, setStart] = useState({});
  const [finish, setFinish] = useState({});
  const [lastSeen, setLastSeen] = useState({});
  const prevFinished = useRef(false);
  const fail = useRef({ car: 0, start: 0, finish: 0 });
  const recovering = useRef(false);

  useEffect(() => {
    let alive = true;
    const tick = async () => {
      // Poll FINISH
      try {
        const r = await getFinish();
        if (alive && r?.data) {
          setFinish(r.data);
          const ts = Date.now();
          setLastSeen((ls) => ({ ...ls, finish: ts }));
          fail.current.finish = 0;
        }
      } catch {
        fail.current.finish++;
      }

      // Poll START
      try {
        const r = await getStart();
        if (alive && r?.data) {
          setStart(r.data);
          const ts = Date.now();
          setLastSeen((ls) => ({ ...ls, start: ts }));
          fail.current.start = 0;
        }
      } catch {
        fail.current.start++;
      }

      // Poll CAR
      try {
        const r = await getCar();
        if (alive && r?.data) {
          setCar(r.data);
          const ts = Date.now();
          setLastSeen((ls) => ({ ...ls, car: ts }));
          fail.current.car = 0;
        }
      } catch {
        fail.current.car++;
      }

      // Auto-recovery: if Start or Finish fails repeatedly, try discovery once
      const needRecover = fail.current.start >= 8 || fail.current.finish >= 8;
      if (needRecover && !recovering.current) {
        recovering.current = true;
        try {
          await discoverUnits();
        } catch {}
        fail.current.start = 0;
        fail.current.finish = 0;
        setTimeout(() => {
          recovering.current = false;
        }, 1000);
      }

      if (alive) setTimeout(tick, 250);
    };
    tick();
    return () => {
      alive = false;
    };
  }, [running]);

  const finishEdge = finish.finished === true && !prevFinished.current;
  useEffect(() => {
    prevFinished.current = finish.finished === true;
  }, [finish.finished]);

  return { elapsedMs, car, start, finish, finishEdge, lastSeen };
}
