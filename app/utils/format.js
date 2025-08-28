// app/utils/format.js
export function fmtTime(ms) {
  const s = ms / 1000;
  const whole = Math.floor(s);
  const msPart = Math.floor((s - whole) * 1000);
  return `${whole}.${msPart.toString().padStart(3, '0')} s`;
}
export const fmtSpeed = (v) => `${(Number(v) || 0).toFixed(2)} m/s`;
export const fmtAccel = (v) => `${(Number(v) || 0).toFixed(2)} m/s²`;
