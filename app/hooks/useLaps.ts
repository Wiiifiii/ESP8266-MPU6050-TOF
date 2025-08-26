import { useEffect, useState } from "react";
import { lapStore, type Lap } from "../state/lapStore";

export function useLaps() {
  const [laps, setLaps] = useState(lapStore.getAll() as Lap[]);
  useEffect(() => {
    const unsub = lapStore.subscribe(() => setLaps(lapStore.getAll()));
    return unsub;
  }, []);
  return laps;
}
