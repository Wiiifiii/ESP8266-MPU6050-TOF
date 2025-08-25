let demoStartedAt = 0;

// call this when the run begins
export function startDemoRun() {
  demoStartedAt = Date.now();
}

export async function getCar() {
  // simulate ~3.24 m/s avg, small noise, and accel spikes
  const t = (Date.now() - demoStartedAt) / 1000;
  const speed = 3.2 + Math.sin(t * 2) * 0.6;      // m/s
  const ax = 0.3 + Math.sin(t * 5) * 0.2;         // m/s^2 (approx)
  const ay = 0.05, az = 9.81;                      // gravity mostly on z
  const distance = Math.max(0, speed * t);         // crude integration
  return { data: { ax, ay, az, speed, distance } };
}

export async function getStart() {
  // always close enough & ready in demo
  return { data: { distanceMm: 35, ready: true, triggered: false, elapsedMs: demoStartedAt ? Date.now() - demoStartedAt : 0 } };
}

export async function getFinish() {
  const finished = demoStartedAt && (Date.now() - demoStartedAt >= 2450); // ~2.45s
  return { data: { distance: 60, finished } };
}

// keep same shape as real default export
export default { getCar, getStart, getFinish, startDemoRun };
