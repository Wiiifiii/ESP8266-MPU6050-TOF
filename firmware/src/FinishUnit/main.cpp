// FinishUnit/main.cpp
#include <Wire.h>
#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <Adafruit_VL53L1X.h>

// — Wi-Fi settings —
const char*    SSID_FIN    = "RaceTimerNet";
IPAddress      STA_IP_FIN  (192,168,4,3);
IPAddress      STA_GW_FIN  (192,168,4,1);
IPAddress      STA_SN_FIN  (255,255,255,0);

ESP8266WebServer serverFin(80);
Adafruit_VL53L1X   tofFin = Adafruit_VL53L1X();

const float FINISH_THRESH = 0.05f; // 5 cm
bool finished = false;
float distF = 0;

void handleStatusFin() {
  if (tofFin.dataReady()) {
    uint16_t mm = tofFin.distance();
    tofFin.clearInterrupt();
    distF = mm / 1000.0f;
  }
  if (!finished && distF <= FINISH_THRESH) {
    finished = true;
    Serial.println("🏁 Finish triggered");
  }
  String json = "{";
  json += "\"distance\":" + String(distF,3) + ",";
  json += "\"finished\":" + String(finished ? "true" : "false");
  json += "}";
  serverFin.send(200, "application/json", json);
}

void setup() {
  Serial.begin(115200);
  Serial.println();
  Serial.println("⏳ FinishUnit Booting...");

  // I²C on non-strap pins
  Wire.begin(4, 5);
  Serial.println("✅ I2C on SDA=GPIO4, SCL=GPIO5");

  // Join CarUnit AP
  WiFi.mode(WIFI_STA);
  WiFi.config(STA_IP_FIN, STA_GW_FIN, STA_SN_FIN);
  WiFi.begin(SSID_FIN);
  Serial.print("📶 FinishUnit joining");
  while (WiFi.status() != WL_CONNECTED) { delay(300); Serial.print('.'); }
  Serial.print(" ✓ IP="); Serial.println(WiFi.localIP());

  // VL53L1X init
  if (!tofFin.begin()) {
    Serial.println("❌ VL53L1X not found");
    while (1) delay(10);
  }
  tofFin.startRanging();
  Serial.println("✅ VL53L1X ranging");

  // HTTP route
  serverFin.on("/status", HTTP_GET, handleStatusFin);
  serverFin.begin();
  Serial.println("✔ FinishUnit HTTP up");
}

void loop() {
  serverFin.handleClient();
}
