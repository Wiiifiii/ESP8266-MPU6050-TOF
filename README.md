# ESP8266-MPU6050-TOF

Three-unit lap timer:
- Car (MPU6050 IMU): `/data` → speed, accel, pitch/roll.
- Start (VL53L1X): `/status` → {distanceMm, ready}.
- Finish (VL53L1X): `/status` → {distanceMm, finished}.

## Firmware (PlatformIO)
- Car (AP): `192.168.4.1`
- Start (STA): `192.168.4.2`
- Finish (STA): `192.168.4.3`

Build & upload:

```

pio device list
pio run -e car    -t upload --upload-port COMx
pio run -e start  -t upload --upload-port COMy
pio run -e finish -t upload --upload-port COMz

```

Thresholds (Finish) switch via `platformio.ini`:
- Indoor: `-DFINISH_ON_MM=50 -DFINISH_OFF_MM=80 -DTIMING_BUDGET_MS=100`
- Track : `-DFINISH_ON_MM=120 -DFINISH_OFF_MM=180 -DTIMING_BUDGET_MS=50`

## App (Expo)
```

cd app
npm i
npx expo start -c

```
- `USE_DEMO=false` for real hardware.
- Auto-discovers Start/Finish via `/whoami`.
- Running screen ends lap on fresh rising edge; fallback dwell for table tests.
- History: best lap pinned + last 10 recent.

## How the app works (short)

### Data flow & roles
- **Car (ESP8266 + MPU6050, 192.168.4.1)** → `GET /data`
  - Firmware removes gravity using a complementary filter (roll/pitch), then computes **linear accel** in body axes.
  - **Auto-set Forward** learns which axis/sign is “forward”. Forward accel is low-pass filtered.
  - **Speed** is the time-integral of forward accel with:
    - **Leak** (prevents unbounded drift),
    - **ZUPT** (zero-velocity update) when accel and gyro indicate the car is still,
    - Clamps to a safe range.
  - Exposes: `speed`, `accel` (forward), `ax/ay/az` (gravity-removed), `aLat/aVert`, `pitch/roll`, `sampleHz`.

- **Start (ESP8266 + VL53L1X, 192.168.4.2)** → `GET /status`
  - Reports `distanceMm`.
  - `ready=true` when `distanceMm ≤ READY_MM` (e.g., 60–120 mm).

- **Finish (ESP8266 + VL53L1X, 192.168.4.3)** → `GET /status`
  - Reports `distanceMm` and debounced `finished` using **hysteresis**:
    - `finished=true` if `distanceMm ≤ FINISH_ON_MM`,
    - back to `false` when `distanceMm > FINISH_OFF_MM`.
  - Treats `0 mm` as “very close.” Auto-recovers (restart/re-init) if the sensor stalls.

- **Mobile app (Expo/React Native)** polls ~4–5 Hz and shows live telemetry.

### Timing (when the lap is measured)
- **Start \(t₀\)**: when the user taps **Start lap** on the Ready screen.
- **Finish \(t₁\)**: first **fresh** Finish trigger (data age < ~1.5–2.0 s) after a 0.5 s hold-off.
- **Elapsed**: `t₁ − t₀`. A smooth local stopwatch drives the on-screen time while polling continues.

*Corner cases handled by the app:*
- If you start already on the line, a **dwell fallback** ends the lap when Finish stays TRUE for ~250 ms after the hold-off.
- Finish only counts once (rising-edge + lockout). Old/stale readings are ignored.

### Speed & acceleration (who calculates what)
- **Firmware (Car)**: does the heavy lifting
  - Gravity removal (roll/pitch) → **linear accel** (m/s²).
  - Forward axis learned → **forward accel** filtered → **speed** via integration + leak + ZUPT.
- **App**: displays values from firmware
  - Speed in m/s and km/h.
  - Forward accel in m/s² and **g** (`accel / 9.80665`).
  - Optional lateral/vertical accel, pitch/roll.

### Thresholds & profiles
- **Start**: `READY_MM` (e.g., 60–120).
- **Finish**: `FINISH_ON_MM` / `FINISH_OFF_MM` hysteresis (e.g., 50/80 for indoor; 120/180 for track).
- Switch **indoor vs track** via `platformio.ini` build flags—no app code changes.

### Networking & resilience
- The app discovers roles via `/whoami` (or infers from `/status`) and ensures Start/Finish never share the same IP.
- If Start/Finish polling fails repeatedly, the app **auto-discovers and re-joins**.
- Optional footer shows live connectivity (toggle in config).

### History
- Best lap pinned; last 10 recent laps kept. Each entry stores time and peak stats.

## Notes
- Car supports Auto-set Forward (orientation-agnostic).
- Finish treats 0 mm as “very close”.
- Optional footer shows live connectivity; toggle in `app/config.js`.
- Follow existing code style and formatting
- Add comments for complex logic
- Test thoroughly on hardware before submitting
- Update documentation for new features

##  Acknowledgments

- [I2Cdevlib](https://github.com/jrowberg/i2cdevlib) for MPU6050 library
- [Adafruit](https://github.com/adafruit) for VL53L1X library  
- [PlatformIO](https://platformio.org/) for embedded development platform
- [Expo](https://expo.dev/) for React Native development tools

##  Support

Open an issue or PR if something doesn’t work or could be improved.

- **GitHub Issues**: [Report bugs or request features](https://github.com/Wiiifiii/ESP8266-MPU6050-TOF/issues)
- **Documentation**: Check this README and inline code comments
- **Hardware Support**: Refer to ESP8266 and sensor datasheets

---

