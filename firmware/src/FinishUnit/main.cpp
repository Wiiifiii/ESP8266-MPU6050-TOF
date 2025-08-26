// FinishUnit/main.cpp

#include <Wire.h>
#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <Adafruit_VL53L1X.h>

// — Wi-Fi settings —
const char*    SSID        = "RaceTimerNet";
IPAddress      STA_IP_FIN(192,168,4,3);
IPAddress      STA_GW    (192,168,4,1);
IPAddress      STA_SN    (255,255,255,0);

// — Globals —
ESP8266WebServer serverFinish(80);
Adafruit_VL53L1X tofFinish;

// finish thresholds & state (with hysteresis)
constexpr uint16_t FINISH_ON_MM  = 50; // beam broken when ≤ 50 mm
constexpr uint16_t FINISH_OFF_MM = 80; // reset when > 80 mm
bool  finished = false;
uint16_t dist_mm  = 9999;

void handleStatusFinish() {
  // pull new sample if ready
  if (tofFinish.dataReady()) {
    dist_mm = tofFinish.distance();       // millimeters
    tofFinish.clearInterrupt();

    Serial.print("mm="); Serial.println(dist_mm);
  }

  // detect finish with hysteresis
  if (!finished && dist_mm <= FINISH_ON_MM) {
    finished = true;
    Serial.println("🏁 Finish triggered!");
  } else if (finished && dist_mm > FINISH_OFF_MM) {
    finished = false;
  }

  // send JSON status
  String js = "{";
  js += "\"distanceMm\":"  + String(dist_mm) + ",";
  js += "\"finished\":"  + String(finished ? "true":"false");
  js += "}";
  serverFinish.send(200, "application/json", js);
}

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
  // Use a stable timing budget; keep default distance mode if library doesn't expose it here
  tofFinish.setTimingBudget(50);
  tofFinish.startRanging();  // ← replaces startContinuous()
  Serial.println("✅ VL53L1X ranging");

  // HTTP endpoint
  serverFinish.on("/status", HTTP_GET, handleStatusFinish);
  serverFinish.begin();
  Serial.println("✔ FinishUnit HTTP up");
}

void loop() {
  serverFinish.handleClient();
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