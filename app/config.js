// app/config.js
// export const USE_DEMO = true; // set to false on real hardware
export const USE_DEMO = false; // real hardware
export const NEAR_THRESHOLD_MM  = 120; // used on Drive screen
export const READY_THRESHOLD_MM = 60;  // used on Ready screen (≈ 6 cm)

// Telemetry options
export const SHOW_DEBUG = true;          // toggle a raw JSON/values line for quick hardware checks
export const ACCEL_UNITS = 'g';          // 'g' if firmware sends ax/ay in g; 'mps2' if already m/s^2
export const G = 9.80665;
export const ACCEL_SCALE = ACCEL_UNITS === 'g' ? G : 1;
