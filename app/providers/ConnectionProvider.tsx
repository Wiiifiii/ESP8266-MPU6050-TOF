import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import api, { getCar, getStart, getFinish, getStartBase, getFinishBase } from "../api";

type Status = "online" | "stale" | "offline";
type Unit = "car" | "start" | "finish";

export type UnitState = {
  unit: Unit;
  base: string;
  status: Status;
  lastOk?: number;
  lastErr?: number;
  latencyMs?: number;
  errorsInRow: number;
};

type ConnCtx = {
  car: UnitState; start: UnitState; finish: UnitState;
  refreshOnce: () => Promise<void>;
};

const defaultState: UnitState = { unit: "car", base: "", status: "offline", errorsInRow: 0 };

const ConnectionContext = createContext<ConnCtx>({
  car: { ...defaultState, unit: "car" },
  start: { ...defaultState, unit: "start" },
  finish: { ...defaultState, unit: "finish" },
  refreshOnce: async () => {},
});

const ONLINE_MS = 2000;
const STALE_MS  = 5000;

export function ConnectionProvider({ children }:{ children: React.ReactNode }) {
  const [car, setCar]       = useState<UnitState>({ ...defaultState, unit: "car", base: "http://192.168.4.1" });
  const [start, setStart]   = useState<UnitState>({ ...defaultState, unit: "start", base: getStartBase?.() ?? "http://192.168.4.2" });
  const [finish, setFinish] = useState<UnitState>({ ...defaultState, unit: "finish", base: getFinishBase?.() ?? "http://192.168.4.3" });

  const timer = useRef<any>(null);

  const computeStatus = (u: UnitState): Status => {
    const now = Date.now();
    if (u.lastOk == null) return "offline";
    const age = now - u.lastOk;
    if (age < ONLINE_MS) return "online";
    if (age < STALE_MS)  return "stale";
    return "offline";
  };

  const pollOnce = async () => {
    const now = Date.now();

    // Car
    try {
      const t0 = Date.now();
      const r = await getCar();
      const latency = Date.now() - t0;
      if (r?.data) setCar(prev => ({ ...prev, lastOk: now, latencyMs: latency, errorsInRow: 0, status: "online" }));
    } catch (e) {
      setCar(prev => ({ ...prev, lastErr: now, errorsInRow: (prev.errorsInRow||0)+1, status: computeStatus(prev) }));
    }

    // Start
    try {
      const t0 = Date.now();
      const r = await getStart();
      const latency = Date.now() - t0;
      if (r?.data) setStart(prev => ({ ...prev, base: getStartBase?.() ?? prev.base, lastOk: now, latencyMs: latency, errorsInRow: 0, status: "online" }));
    } catch (e) {
      setStart(prev => ({ ...prev, base: getStartBase?.() ?? prev.base, lastErr: now, errorsInRow: (prev.errorsInRow||0)+1, status: computeStatus(prev) }));
    }

    // Finish
    try {
      const t0 = Date.now();
      const r = await getFinish();
      const latency = Date.now() - t0;
      if (r?.data) setFinish(prev => ({ ...prev, base: getFinishBase?.() ?? prev.base, lastOk: now, latencyMs: latency, errorsInRow: 0, status: "online" }));
    } catch (e) {
      setFinish(prev => ({ ...prev, base: getFinishBase?.() ?? prev.base, lastErr: now, errorsInRow: (prev.errorsInRow||0)+1, status: computeStatus(prev) }));
    }

    // after updating, recompute stale/offline flags
    setCar(prev => ({ ...prev, status: computeStatus(prev) }));
    setStart(prev => ({ ...prev, status: computeStatus(prev) }));
    setFinish(prev => ({ ...prev, status: computeStatus(prev) }));
  };

  useEffect(() => {
    // kick an immediate poll
    pollOnce();
    // 1 Hz interval
    timer.current = setInterval(pollOnce, 1000);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, []);

  const ctx = useMemo(() => ({
    car, start, finish,
    refreshOnce: pollOnce
  }), [car, start, finish]);

  return <ConnectionContext.Provider value={ctx}>{children}</ConnectionContext.Provider>;
}

export function useConnection() { return useContext(ConnectionContext); }
