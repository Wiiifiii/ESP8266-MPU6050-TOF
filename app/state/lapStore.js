// Notes: Keeps last 10 laps; pins best lap (lowest time). No persistence.
/**
 * app/state/lapStore.js
 * Simple in-memory lap store used by Finished screen's History.
 */

/** @typedef {{ id: string; startedAt: number; endedAt: number; timeMs: number; stats?: { maxSpeed?: number; maxAccel?: number; [k: string]: any } }} Lap */

// Minimal in-memory store (no external libs). If an app-level store exists, adapt API accordingly.
/** @type {Lap[]} */
const _laps = [];
/** @type {Lap | null} */
let _current = null;
/** @typedef {() => void} Listener */
/** @type {Listener[]} */
const _listeners = [];

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
  /** @param {Lap} lap */
  closeAndPush(lap) {
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
  /** @returns {Lap[]} */
  getAll() {
    return _laps.slice();
  },

  // Selectors
  /** @returns {Lap | undefined} */
  getBestLap() {
    if (_laps.length === 0) return undefined;
    return _laps.reduce(
      /** @type {(best: Lap | undefined, cur: Lap) => Lap | undefined} */ (
      (best, cur) => {
        if (!best) return cur;
        if (cur.timeMs < best.timeMs) return cur;
        if (cur.timeMs === best.timeMs) {
          const bi = _laps.indexOf(best),
            ci = _laps.indexOf(cur);
          return ci < bi ? cur : best; // prefer newer on tie
        }
        return best;
      }),
      /** @type {Lap | undefined} */ (undefined)
    );
  },

  /** @param {number} [limit=10] */
  /** @returns {Lap[]} */
  getRecent(limit = 10) {
    const arr = _laps.slice(0, limit); // newest first already
    return arr;
  },

  // Subscribe
  /** @param {Listener} fn */
  subscribe(fn) {
    _listeners.push(fn);
    return () => {
      const i = _listeners.indexOf(fn);
      if (i >= 0) _listeners.splice(i, 1);
    };
  },
};
