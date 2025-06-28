# Android “Preview” Build & Install with EAS

Use these steps whenever you want to generate a standalone Android APK for quick testing or sharing (e.g. with your teacher).

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

```bash
# Go to the firmware folder
cd D:/GitHub/ESP8266-MPU6050-TOF/firmware

# Compile & upload to the CarUnit
pio run -e car --target upload

# (Optional) Open serial monitor to verify output
pio device monitor -e car
```

---

## 2. StartUnit (STA + VL53L1X)

```bash
# From the same firmware folder
cd D:/GitHub/ESP8266-MPU6050-TOF/firmware

# Compile & upload to the StartUnit
pio run -e start --target upload

# (Optional) Monitor serial output
pio device monitor -e start
```

---

## 3. FinishUnit (STA + VL53L1X + POST /finish)

```bash
# Still in firmware folder
cd D:/GitHub/ESP8266-MPU6050-TOF/firmware

# Compile & upload to the FinishUnit
pio run -e finish --target upload

# (Optional) Monitor serial output
pio device monitor -e finish
```

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