// Module/File: app/utils/metrics.js

export function computeMetrics({ readings, trackDistance, startTime, endTime }) {
  const elapsedMs = Math.max(0, (endTime ?? Date.now()) - (startTime ?? Date.now()));
  const speeds = readings.map((r) => r.speed).filter(Number.isFinite);
  const topSpeed = speeds.length ? Math.max(...speeds) : 0;

  // use planar accel to avoid gravity on az if present
  const accels = readings.map((r) => Math.hypot(r.ax ?? 0, r.ay ?? 0)).filter(Number.isFinite);
  const maxAccel = accels.length ? Math.max(...accels) : 0;

  const avgSpeed = elapsedMs > 0 ? trackDistance / (elapsedMs / 1000) : 0;

  return { elapsedMs, topSpeed, maxAccel, avgSpeed };
}
