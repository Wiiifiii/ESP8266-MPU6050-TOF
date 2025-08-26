// app/config.js
// export const USE_DEMO = true; // set to false on real hardware
export const USE_DEMO = false; // real hardware
export const NEAR_THRESHOLD_MM  = 120; // used on Drive screen
export const READY_THRESHOLD_MM = 60;  // used on Ready screen (≈ 6 cm)
export const FINISH_TOO_CLOSE_UI_MM = 10; // UI guard: block start if finish is closer than this

// Telemetry options
export const SHOW_DEBUG = false;         // hide debug UI for demo
export const ACCEL_UNITS = 'g';          // 'g' if firmware sends ax/ay in g; 'mps2' if already m/s^2
export const G = 9.80665;
export const ACCEL_SCALE = ACCEL_UNITS === 'g' ? G : 1;

// NEW: manual start preference (keep false for button-only start)
export const AUTO_START_ON_READY = false;
