/**
 * app/hooks/useLaps.js
 * App hook (polling/stopwatch/telemetry)
 */

import { useEffect, useState } from 'react';
import { lapStore } from '../state/lapStore';

/**
 * Subscribe to lapStore changes and return current laps array.
 * @returns {import('../state/lapStore').Lap[]}
 */
export function useLaps() {
  const [laps, setLaps] = useState(lapStore.getAll());
  useEffect(() => {
    const unsub = lapStore.subscribe(() => setLaps(lapStore.getAll()));
    return unsub;
  }, []);
  return laps;
}
