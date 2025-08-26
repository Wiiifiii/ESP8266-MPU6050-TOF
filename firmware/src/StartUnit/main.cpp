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
constexpr uint16_t READY_MM   = 120;  // ≤120 mm → “ready” (manual start alignment)

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
  // 1) read new TOF data if available
  if (tof.dataReady()) {
    uint16_t raw = tof.distance();     // millimeters
    tof.clearInterrupt();
    addSample(raw);

    // 2) update flag (no auto-trigger in manual start flow)
    uint16_t filt = getMedian();
    ready = (filt <= READY_MM);
  }

  // 3) build JSON response
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
  Serial.print("⏳ Initializing VL53L1X…");
  if (!tof.begin()) {
    Serial.println(" ❌ not found, /status will return errors");
  } else {
    Serial.println(" ✅ OK");
    delay(50); yield();

  // Use a stable timing budget; distance mode left at library default if not available
  tof.setTimingBudget(50); // milliseconds
    Serial.print("⏳ Starting continuous mode…");
    tof.startRanging();  // ~30 Hz by default
    Serial.println(" ✅ OK");
  }

  // Setup HTTP endpoint
  server.on("/status", HTTP_GET, handleStatus);
  server.begin();
  Serial.println("✔ HTTP server up: GET /status");
}

void loop() {
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
