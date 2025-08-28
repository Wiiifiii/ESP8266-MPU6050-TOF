/**
 * Project: ESP8266-MPU6050-TOF
 * File: StartUnit/main.cpp
 * Role: START unit firmware
 * Summary:
 *  - CAR: computes gravity-removed accel and speed; exposes /data; supports Auto-set Forward.
 *  - START: ToF distance; exposes /status {distanceMm, ready}.
 *  - FINISH: ToF distance with hysteresis; exposes /status {distanceMm, finished}; auto-recover.
 * Notes:
 *  - Wi-Fi fixed IPs: Car .1 (AP), Start .2, Finish .3
 *  - Keep behavior stable for demo; comments only.
 */
// StartUnit/main.cpp

#include <Wire.h>
#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <Adafruit_VL53L1X.h>

// — Wi-Fi settings —
const char* SSID   = "RaceTimerNet";
IPAddress   STA_IP (192,168,4,2);
IPAddress   STA_GW (192,168,4,1);
IPAddress   STA_SN (255,255,255,0);

// — I²C pins & TOF sensor —
#define SDA_PIN 4    // D2
#define SCL_PIN 5    // D1
Adafruit_VL53L1X tof = Adafruit_VL53L1X();

// — HTTP server on port 80 —
ESP8266WebServer server(80);

// — Median filter state —
constexpr uint8_t    MEDIAN_SIZE = 5;
uint16_t             medBuf[MEDIAN_SIZE];
uint8_t              medIdx  = 0;
bool                 medFull = false;

// — Thresholds (in mm) —
// READY_MM defines when the car is considered "ready" near the start sensor.
// Keep generous to allow manual line-up; app uses this to enable the Start button.
constexpr uint16_t READY_MM   = 120;  // ≤120 mm → “ready”

// — Run state —
bool     ready     = false;

// Push a new raw sample into our circular median buffer
void addSample(uint16_t mm) {
  medBuf[medIdx++] = mm;
  if (medIdx >= MEDIAN_SIZE) {
    medIdx  = 0;
    medFull = true;
  }
}

// Compute the median of all collected samples so far
uint16_t getMedian() {
  uint8_t count = medFull ? MEDIAN_SIZE : medIdx;
  if (count == 0) return 0;
  // copy into tmp array & sort
  uint16_t tmp[MEDIAN_SIZE];
  memcpy(tmp, medBuf, count * sizeof(uint16_t));
  for (uint8_t i = 1; i < count; i++) {
    uint16_t key = tmp[i];
    int j = i - 1;
    while (j >= 0 && tmp[j] > key) {
      tmp[j + 1] = tmp[j];
      j--;
    }
    tmp[j + 1] = key;
  }
  return tmp[count/2];
}

// HTTP GET /status → JSON with { distanceMm, ready }
void handleStatus() {
  // Build JSON from the latest computed state (updated in loop)
  uint16_t distMm = getMedian();

  String js = "{";
  js += "\"distanceMm\":" + String(distMm)    + ",";
  js += "\"ready\":"      + String(ready ? "true":"false");
  js += "}";

  server.send(200, "application/json", js);
}

void setup() {
  Serial.begin(115200);
  yield();
  Serial.println("\n⏳ StartUnit Booting...");

  // I2C on GPIO4/5
  Wire.begin(SDA_PIN, SCL_PIN);
  Wire.setClock(400000);
  Serial.printf("✅ I2C on SDA=GPIO%d, SCL=GPIO%d\n",
                SDA_PIN, SCL_PIN);

  // Join RaceTimerNet as a station
  WiFi.mode(WIFI_STA);
  WiFi.config(STA_IP, STA_GW, STA_SN);
  WiFi.begin(SSID);
  WiFi.setSleep(false);
  WiFi.setAutoReconnect(true);
  WiFi.persistent(true);
  Serial.print("📶 Connecting to “"); Serial.print(SSID); Serial.print("”");
  uint32_t t0 = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - t0 < 10000) {
    delay(200);  // feeds the watchdog
    Serial.print('.');
  }
  Serial.println();
  if (WiFi.status() == WL_CONNECTED) {
    Serial.print("✓ IP="); Serial.println(WiFi.localIP());
  } else {
    Serial.println("❌ Wi-Fi failed, but continuing");
  }

  // Initialize VL53L1X
  #ifdef TOF_XSHUT_PIN
    pinMode(TOF_XSHUT_PIN, OUTPUT);
    digitalWrite(TOF_XSHUT_PIN, HIGH);
    delay(5);
  #endif
  Serial.print("⏳ Initializing VL53L1X…");
  if (!tof.begin()) {
    Serial.println(" ❌ not found, /status will return errors");
  } else {
    Serial.println(" ✅ OK");
    delay(50); yield();

  // Use a stable timing budget (ms). Larger → smoother but slower; smaller → faster updates.
    tof.setTimingBudget(50); // milliseconds
    Serial.print("⏳ Starting continuous mode…");
    tof.startRanging();  // ~30 Hz by default
    Serial.println(" ✅ OK");
  }

  // Setup HTTP endpoint
  server.on("/status", HTTP_GET, handleStatus);
  server.on("/whoami", HTTP_GET, [](){ server.send(200, "application/json", "{\"role\":\"START\"}"); });
  server.begin();
  Serial.println("✔ HTTP server up: GET /status");
}

void loop() {
  // Update sensor continuously so HTTP always serves fresh state
  if (tof.dataReady()) {
    uint16_t raw = tof.distance(); // millimeters (library returns 0 when out-of-range)
    tof.clearInterrupt();
    addSample(raw);

    uint16_t filt = getMedian();
  // Consider 0 as "not ready" here (very far or invalid). Ready when within threshold.
  ready = (filt > 0 && filt <= READY_MM);
    // Optional: lightweight debug every ~200ms when ready changes
    static bool prevReady = false;
    if (prevReady != ready) {
      prevReady = ready;
      Serial.print("[Start] dist="); Serial.print(filt); Serial.print(" mm ready="); Serial.println(ready ? "1" : "0");
    }
  }

  server.handleClient();  // non-blocking
  yield();
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
