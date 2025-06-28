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

Happy testing!