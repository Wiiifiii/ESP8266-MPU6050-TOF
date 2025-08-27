// FinishUnit/main.cpp

#include <Wire.h>
#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <Adafruit_VL53L1X.h>



// Thresholds (allow overrides via -DFINISH_ON_MM=... -DFINISH_OFF_MM=...)
#ifndef FINISH_ON_MM
#define FINISH_ON_MM 50
#endif
#ifndef FINISH_OFF_MM
#define FINISH_OFF_MM 80
#endif
#ifndef TIMING_BUDGET_MS
#define TIMING_BUDGET_MS 100
#endif

// — Wi-Fi settings —
const char*    SSID        = "RaceTimerNet";
IPAddress      STA_IP_FIN(192,168,4,3);
IPAddress      STA_GW    (192,168,4,1);
IPAddress      STA_SN    (255,255,255,0);

// — Globals —
ESP8266WebServer serverFinish(80);
Adafruit_VL53L1X tofFinish;

// finish thresholds & state (with hysteresis)
bool  finished = false;
uint16_t dist_mm  = 9999;
uint32_t samples = 0;
uint32_t lastSampleMs = 0;
bool sensorAlive = false;
uint32_t invalidCount = 0;

void handleStatusFinish() {
  // send JSON status (latest sampled values)
  const uint32_t age = millis() - lastSampleMs;
  sensorAlive = (age < 500);
  String js = "{";
  js += "\"role\":\"FINISH\",";
  js += "\"distanceMm\":"  + String(dist_mm) + ",";
  js += "\"finished\":"  + String(finished ? "true":"false") + ",";
  js += "\"alive\":"     + String(sensorAlive ? "true":"false") + ",";
  js += "\"samples\":"   + String(samples) + ",";
  js += "\"lastSampleAgeMs\":" + String(age);
  js += ",\"invalid\":" + String(invalidCount);
  js += "}";
  serverFinish.send(200, "application/json", js);
}
void handleWhoAmI() { serverFinish.send(200, "application/json", "{\"role\":\"FINISH\"}"); }

void setup() {
  Serial.begin(115200);
  Serial.println("\n⏳ FinishUnit Booting...");

  // I2C on SDA=GPIO4, SCL=GPIO5
  Wire.begin(4, 5);
  Serial.println("✅ I2C on SDA=GPIO4, SCL=GPIO5");

  // Join the RaceTimerNet AP
  WiFi.mode(WIFI_STA);
  WiFi.config(STA_IP_FIN, STA_GW, STA_SN);
  WiFi.begin(SSID);
  WiFi.setSleep(false);
  WiFi.setAutoReconnect(true);
  WiFi.persistent(true);
  Serial.print("📶 FinishUnit joining");
  while (WiFi.status() != WL_CONNECTED) {
    delay(200);
    Serial.print('.');
  }
  Serial.print(" ✓ IP="); Serial.println(WiFi.localIP());

  // init VL53L1X
  if (!tofFinish.begin()) {
    Serial.println("❌ VL53L1X not found");
    while (1) delay(10);
  }
  // Configure sensor for close-range, stable readings
  // Use ST-style method exposed by Adafruit wrapper where available
  (void)tofFinish.VL53L1X_SetDistanceMode(1); // 1 = SHORT, ignore return if not supported
  tofFinish.setTimingBudget(TIMING_BUDGET_MS);
  tofFinish.startRanging();  // ← replaces startContinuous()
  Serial.println("✅ VL53L1X ranging");
  Serial.print("Thresholds: ON≤"); Serial.print(FINISH_ON_MM);
  Serial.print("mm, OFF>"); Serial.print(FINISH_OFF_MM);
  Serial.print("mm, Budget="); Serial.print(TIMING_BUDGET_MS);
  Serial.println("ms");

  // HTTP endpoint
  serverFinish.on("/status", HTTP_GET, handleStatusFinish);
  serverFinish.on("/whoami", HTTP_GET, handleWhoAmI);
  serverFinish.begin();
  Serial.println("✔ FinishUnit HTTP up");
}

void loop() {
  // Sample sensor independently of HTTP polling
  static uint32_t lastLogMs = 0;
  uint8_t ready = 0;
  // Prefer ST-style calls to avoid stale/invalid reads
  if (tofFinish.VL53L1X_CheckForDataReady(&ready) == 0 && ready) {
    uint16_t mm = 0;
    if (tofFinish.VL53L1X_GetDistance(&mm) == 0) {
      // Filter obviously invalid readings
      if (mm == 0 || mm == 65535 || mm > 4000) {
        invalidCount++;
      } else {
        dist_mm = mm;
        samples++;
        lastSampleMs = millis();

        // Hysteresis
        if (!finished && dist_mm <= FINISH_ON_MM) {
          finished = true;
          Serial.println("🏁 Finish triggered!");
        } else if (finished && dist_mm > FINISH_OFF_MM) {
          finished = false;
        }
      }
    }
    tofFinish.VL53L1X_ClearInterrupt();

    if (millis() - lastLogMs > 500) {
      lastLogMs = millis();
      Serial.print("mm="); Serial.print(dist_mm);
      Serial.print(" finished="); Serial.print(finished ? "1" : "0");
      Serial.print(" invalid="); Serial.println(invalidCount);
    }
  }
  // Keep ranging alive if stale
  const uint32_t now = millis();
  if (now - lastSampleMs > 1500) {
    tofFinish.stopRanging();
    delay(5);
    tofFinish.startRanging();
  }

  serverFinish.handleClient();
  delay(5);
}

// #include <Arduino.h>
// #include <Wire.h>

// void setup() {
//   Serial.begin(115200);
//   delay(100);
//   Wire.begin(4, 5);   // SDA = GPIO4 (D2), SCL = GPIO5 (D1)
//   Serial.println();
//   Serial.println("I2C Scanner starting...");
// }

// void loop() {
//   Serial.println("Scanning I2C bus...");
//   byte error, address;
//   int  nDevices = 0;

//   for (address = 1; address < 127; address++) {
//     Wire.beginTransmission(address);
//     error = Wire.endTransmission();

//     if (error == 0) {
//       Serial.print("  [FOUND] 0x");
//       if (address < 16) Serial.print("0");
//       Serial.println(address, HEX);
//       nDevices++;
//     } 
//     else if (error == 4) {
//       Serial.print("  [ERROR] 0x");
//       if (address < 16) Serial.print("0");
//       Serial.println(address, HEX);
//     }
//   }

//   if (nDevices == 0) {
//     Serial.println("  >>> No I2C devices found");
//   } else {
//     Serial.print("  >>> Scan complete, ");
//     Serial.print(nDevices);
//     Serial.println(" device(s) found");
//   }

//   Serial.println();
//   delay(5000);
// }