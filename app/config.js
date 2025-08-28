// app/config.js

// export const USE_DEMO = true; // set to false on real hardware
export const USE_DEMO = false; // real hardware

// Indoor-friendly defaults
export const NEAR_THRESHOLD_MM = 120; // Drive screen
export const READY_THRESHOLD_MM = 60; // Ready screen (≈ 6 cm)

// Telemetry options
export const SHOW_DEBUG = false; // hide debug UI for demo
export const ACCEL_UNITS = 'g'; // 'g' if firmware sends ax/ay in g; 'mps2' if already m/s^2
export const G = 9.80665;
export const ACCEL_SCALE = ACCEL_UNITS === 'g' ? G : 1;

// manual start preference (keep false for button-only start)
export const AUTO_START_ON_READY = false;

// show/hide the connection footer
export const SHOW_CONNECTION_FOOTER = true; // show by default; flip to false to hide

// discover units on app boot
export const DISCOVER_UNITS_ON_BOOT = true;

// Ready gate (Finish too close) — OFF by default for indoor table tests.
export const BLOCK_WHEN_FINISH_TOO_CLOSE = false;
export const FINISH_TOO_CLOSE_UI_MM = 40;
