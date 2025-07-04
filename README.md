# Android “Preview” Build & Install with EAS

Use these steps whenever you want to generate a standalone Android ## Updating Firmware on Your ESP8266 Devices

Whenever you've made changes to a unit's `main.cpp`, use these commands to build, upload, and verify on each device.

### Prerequisites (Windows Setup)

If you get a `pio : The term 'pio' is not recognized` error, you need to install PlatformIO CLI:

1. **Install Python** (if not already installed):
   ```powershell
   winget install Python.Python.3.12
   ```

2. **Install PlatformIO CLI**:
   ```powershell
   python -m pip install platformio
   ```

3. **Create a shortcut** (recommended):
   ```powershell
   # Create pio.bat in firmware folder for easier commands
   echo @echo off > pio.bat
   echo C:/Users/wefky/AppData/Local/Programs/Python/Python312/Scripts/pio.exe %* >> pio.bat
   ```

4. **Test installation**:
   ```powershell
   C:/Users/wefky/AppData/Local/Programs/Python/Python312/Scripts/pio.exe --version
   ```

### Quick Command Reference

**Full path commands:**
```powershell
# Build and upload
C:/Users/wefky/AppData/Local/Programs/Python/Python312/Scripts/pio.exe run -e car --target upload
C:/Users/wefky/AppData/Local/Programs/Python/Python312/Scripts/pio.exe run -e start --target upload
C:/Users/wefky/AppData/Local/Programs/Python/Python312/Scripts/pio.exe run -e finish --target upload

# Monitor serial output
C:/Users/wefky/AppData/Local/Programs/Python/Python312/Scripts/pio.exe device monitor -e car
C:/Users/wefky/AppData/Local/Programs/Python/Python312/Scripts/pio.exe device monitor -e start
C:/Users/wefky/AppData/Local/Programs/Python/Python312/Scripts/pio.exe device monitor -e finish

# List available ports
C:/Users/wefky/AppData/Local/Programs/Python/Python312/Scripts/pio.exe device list
```

**If you have pio.bat in firmware folder:**
```powershell
# Build and upload
.\pio run -e car --target upload
.\pio run -e start --target upload
.\pio run -e finish --target upload

# Monitor serial output
.\pio device monitor -e car
.\pio device monitor -e start
.\pio device monitor -e finish

# List available ports
.\pio device list
```

---or quick testing or sharing (e.g. with your teacher).

---

## 1. Initialize EAS (once per project)

```bash
cd app
npm install -g eas-cli            # if you haven’t already
eas login                         # authenticate with your Expo account
eas init                          # link your project to EAS (managed workflow)
```

---

## 2. Configure your `app.json`

Make sure your **app.json** has the correct slug and version:

```jsonc
{
  "expo": {
    "name": "ESP8266-MPU6050-TOF",
    "slug": "esp8266-mpu6050-tof",
    "version": "1.0.0",
    "sdkVersion": "53.0.0",
    // …
  }
}
```

Commit any changes:

```bash
git add app.json
git commit -m "chore: update expo name and slug"
```

---

## 3. Run the preview build

```bash
eas build --platform android --profile preview
```

* When prompted for **Android application id**, enter a reverse-domain identifier, e.g.:

  ```
  com.wiiifiii.esp8266mpu6050tof
  ```

* Choose **Generate a new Keystore** unless you already have one.

* Wait for the build to finish. You’ll see a link like:

  ```
  https://expo.dev/accounts/wiiifiii/projects/app/builds/<BUILD_ID>
  ```

---

## 4. Install & run on an emulator (optional)

Right after the build completes, you can let EAS install it on a running emulator:

```text
√ Install and run the Android build on an emulator? … yes
√ Successfully downloaded app
√ Select an emulator to run your app on » Pixel_6_API_35
```

EAS will launch your selected AVD and install the APK automatically.

---

## 5. Share the APK link

Share the **Build URL** (from step 3) with anyone who needs to sideload the app:

```text
https://expo.dev/accounts/wiiifiii/projects/app/builds/f443fe56-0c61-4c15-87a2-51bd6d9f7c07

```

They can open that link on their Android device, tap the “Download APK” button, then install and open your app.

---

## 6. Iterating

Whenever you push new changes:

1. Update your code.

1. `git add . && git commit -m "feat: …"`

1. Re-run:

   ```bash
   eas update --branch default --message "Your update message"
   ```

   *and/or*

   ```bash
   eas build --platform android --profile preview
   ```

1. Share the new **Build URL** with your tester.

---

## Updating Firmware on Your ESP8266 Devices

Whenever you’ve made changes to a unit’s `main.cpp`, use these commands to build, upload, and verify on each device.

---

## 1. CarUnit (Soft-AP + MPU-6050)

```powershell
# Navigate to firmware folder
cd D:/GitHub/ESP8266-MPU6050-TOF/firmware

# Build and upload to CarUnit
.\pio run -e car --target upload
# OR use full path:
# C:/Users/wefky/AppData/Local/Programs/Python/Python312/Scripts/pio.exe run -e car --target upload

# Monitor serial output (Ctrl+C to exit)
.\pio device monitor -e car
# OR use full path:
# C:/Users/wefky/AppData/Local/Programs/Python/Python312/Scripts/pio.exe device monitor -e car
```

**What to expect in monitor:**
- WiFi AP started on 192.168.4.1
- MPU6050 initialization messages
- Speed and acceleration readings
- HTTP server status

---

## 2. StartUnit (STA + VL53L1X)

```powershell
# From the same firmware folder
cd D:/GitHub/ESP8266-MPU6050-TOF/firmware

# Build and upload to StartUnit
.\pio run -e start --target upload
# OR use full path:
# C:/Users/wefky/AppData/Local/Programs/Python/Python312/Scripts/pio.exe run -e start --target upload

# Monitor serial output (Ctrl+C to exit)
.\pio device monitor -e start
# OR use full path:
# C:/Users/wefky/AppData/Local/Programs/Python/Python312/Scripts/pio.exe device monitor -e start
```

**What to expect in monitor:**
- WiFi connection to CarUnit AP (192.168.4.1)
- VL53L1X sensor initialization
- Distance readings in mm
- HTTP server responding on /status endpoint

---

## 3. FinishUnit (STA + VL53L1X + POST /finish)

```powershell
# Still in firmware folder
cd D:/GitHub/ESP8266-MPU6050-TOF/firmware

# Build and upload to FinishUnit
.\pio run -e finish --target upload
# OR use full path:
# C:/Users/wefky/AppData/Local/Programs/Python/Python312/Scripts/pio.exe run -e finish --target upload

# Monitor serial output (Ctrl+C to exit)
.\pio device monitor -e finish
# OR use full path:
# C:/Users/wefky/AppData/Local/Programs/Python/Python312/Scripts/pio.exe device monitor -e finish
```

**What to expect in monitor:**
- WiFi connection to CarUnit AP (192.168.4.1)
- VL53L1X sensor initialization
- Distance readings in mm
- HTTP server responding on /finish endpoint
- POST requests when finish line is triggered

---

### Testing Your Setup

1. **Check available serial ports:**
   ```powershell
   .\pio device list
   ```

2. **Test CarUnit first** (creates WiFi AP):
   - Upload CarUnit firmware
   - Monitor output until you see "AP started"
   - Look for IP address 192.168.4.1

3. **Test StartUnit/FinishUnit** (connects to CarUnit):
   - Make sure CarUnit is running first
   - Upload StartUnit or FinishUnit firmware
   - Monitor output for WiFi connection success

4. **Test HTTP endpoints** (use browser or curl):
   ```
   http://192.168.4.1/data      (CarUnit - speed/accel data)
   http://192.168.4.2/status    (StartUnit - distance/trigger)
   http://192.168.4.3/finish    (FinishUnit - distance/trigger)
   ```

5. **Monitor tips:**
   - Press **Ctrl+C** to exit monitor
   - Unplug/replug USB if upload fails
   - Check that correct COM port is detected
   - Only one device can use a COM port at a time

---

## Hardware Integration Guide

When your StartUnit and FinishUnit hardware is available, follow these steps to replace the dummy logic in your Expo app:

---

## 1. DriveToStartScreen → Real StartUnit `/status`

**File:** `app/screens/DriveToStartScreen.js`

**Before** (dummy countdown):

```js
useEffect(() => {
  // simulate approach…
  const stepMs = 100;
  const delta  = maxDist / (3000/stepMs);
  const id = setInterval(() => {
    setDist(d => { … })
    if (d <= threshold) {
      setStartTime(Date.now());
      navigation.replace('Running');
    }
  }, stepMs);
  return () => clearInterval(id);
}, […]);
```

**After** (poll StartUnit):

```diff
useEffect(() => {
-  // dummy approach…
-  const id = setInterval(…);
+  // real StartUnit status
+  const id = setInterval(async () => {
+    try {
+      const res = await fetch('http://192.168.4.2/status');
+      const { distance, triggered } = await res.json();
+      setDist(distance);
+      if (triggered) {
+        setStartTime(Date.now());
+        navigation.replace('Running');
+        clearInterval(id);
+      }
+    } catch {
+      // optionally show “Waiting for StartUnit…"
+    }
+  }, 200);
  return () => clearInterval(id);
}, [navigation, setStartTime]);
```

---

## 2. (Optional) ReadyScreen

If you still want a “Ready…” pause after the start trigger, keep your existing `ReadyScreen.js`. Otherwise, you can skip this screen entirely and jump straight from DriveToStart → Running.

---

## 3. RunningScreen → Real FinishUnit `/finish`

**File:** `app/screens/RunningScreen.js`

**Before** (finish by distance):

```js
// inside your polling loop
if (traveledDistance + s*dt >= trackDistance) {
  clearInterval(id);
  setFinishTime(now);
  navigation.replace('Finished');
}
```

**After** (poll FinishUnit):

```diff
// still fetch CarUnit /data for speed & accel
const car = await fetch('http://192.168.4.1/data').then(r=>r.json());
// … integrate traveledDistance …

- // old finish-by-distance
- if (traveledDistance + s*dt >= trackDistance) {
-   clearInterval(id);
-   setFinishTime(now);
-   navigation.replace('Finished');
- }
+ // new finish trigger
+ const fin = await fetch('http://192.168.4.3/finish').then(r=>r.json());
+ if (fin.triggered) {
+   clearInterval(id);
+   setFinishTime(Date.now());
+   navigation.replace('Finished');
+ }
```

---

## 4. CarUnit Firmware

No changes—continue serving `/data` with live `speed` & `ax` readings.

---

## 5. Summary

| Screen           | Dummy Logic                        | Real Hardware Integration       |
| ---------------- | ---------------------------------- | ------------------------------- |
| **DriveToStart** | Countdown to 0 m                   | `GET http://<START_IP>/status`  |
| **Ready**        | 0.5 s timeout (optional)           | unchanged (or remove entirely)  |
| **Running**      | finish on distance ≥ trackDistance | `GET http://<FINISH_IP>/finish` |
| **Finished**     | summary & history                  | unchanged                       |

Once your ESP8266 StartUnit is at `192.168.4.2` and FinishUnit at `192.168.4.3`, simply drop in the new URLs above and remove all dummy countdown logic. Your existing context, navigation and summary screens remain the same.

---

Happy testing!

---

## Troubleshooting

### IntelliSense Errors (Red Squiggles)

If you see red squiggles in VS Code saying "cannot open source file" for ESP8266 libraries:

1. **Reload VS Code window**: `Ctrl+Shift+P` → "Developer: Reload Window"
2. **Check C++ configuration**: The `.vscode/c_cpp_properties.json` file should be configured for PlatformIO
3. **Install C++ Extension**: Make sure you have the "C/C++" extension by Microsoft installed

The code will still compile and upload correctly even with red squiggles - this is just an editor display issue.

### Port Issues

If you get "could not open port" errors:
- Check which COM port your ESP8266 is connected to in Device Manager
- Make sure only one device is connected at a time
- The `platformio.ini` file now auto-detects ports, so it should work on any available port