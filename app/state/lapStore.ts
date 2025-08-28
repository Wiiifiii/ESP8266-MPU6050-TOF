/**
 * Project: ESP8266-MPU6050-TOF
 * Module/File: app/state/lapStore.ts
 * Purpose: App state (history/best lap)
 * Notes: Auto-generated header; behavior unchanged.
 */

/**
 * Module: app/state/lapStore.ts
 * Purpose: Simple in-memory lap store used by Finished screen's History.
 * Notes: Keeps last 10 laps; pins best lap (lowest time). No persistence.
 */
export type Lap = {
  id: string;
  startedAt: number;
  endedAt: number;
  timeMs: number;
  stats?: { maxSpeed?: number; maxAccel?: number; [k: string]: any };
};

// Minimal in-memory store (no external libs). If an app-level store exists, adapt API accordingly.
const _laps: Lap[] = [];
let _current: Lap | null = null;
type Listener = () => void;
const _listeners: Listener[] = [];

function notify() {
  _listeners.forEach((l) => l());
}

export const lapStore = {
  // Start a fresh lap in-memory (optional helper)
  startNew() {
    _current = { id: String(Date.now()), startedAt: Date.now(), endedAt: 0, timeMs: 0 };
    notify();
  },

  // Close and push a lap; idempotent if same id already closed
  closeAndPush(lap: Lap) {
    const idx = _laps.findIndex((x) => x.id === lap.id);
    if (idx >= 0) {
      if (_laps[idx].endedAt) return; // already closed
      _laps[idx] = lap;
    } else {
      _laps.unshift(lap); // newest first
    }
    _current = null;
    notify();
  },

  get currentLap() {
    return _current;
  },
  getAll(): Lap[] {
    return _laps.slice();
  },

  // Selectors
  getBestLap(): Lap | undefined {
    if (_laps.length === 0) return undefined;
    return _laps.reduce(
      (best: Lap | undefined, cur) => {
        if (!best) return cur;
        if (cur.timeMs < best.timeMs) return cur;
        if (cur.timeMs === best.timeMs) {
          const bi = _laps.indexOf(best),
            ci = _laps.indexOf(cur);
          return ci < bi ? cur : best; // prefer newer on tie
        }
        return best;
      },
      undefined as Lap | undefined
    );
  },

  getRecent(limit = 10): Lap[] {
    const arr = _laps.slice(0, limit); // newest first already
    return arr;
  },

  // Subscribe
  subscribe(fn: Listener) {
    _listeners.push(fn);
    return () => {
      const i = _listeners.indexOf(fn);
      if (i >= 0) _listeners.splice(i, 1);
    };
  },
};
