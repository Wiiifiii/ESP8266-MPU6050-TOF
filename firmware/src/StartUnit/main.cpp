// StartUnit/main.cpp

#include <Wire.h>
#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <Adafruit_VL53L1X.h>

// — Wi-Fi settings —
const char*    SSID         = "RaceTimerNet";
IPAddress      STA_IP_START(192,168,4,2);
IPAddress      STA_GW      (192,168,4,1);
IPAddress      STA_SN      (255,255,255,0);

// — Globals —
ESP8266WebServer serverStart(80);
Adafruit_VL53L1X tofStart;

// thresholds & state
const float READY_THRESH  = 0.05f;  //  5 cm → “ready”
const float START_THRESH  = 0.05f;  //  5 cm → “trigger”
bool  ready     = false;
bool  triggered = false;
float dist_m    = 0;

void handleStatusStart() {
  // if new data is ready, pull it
  if (tofStart.dataReady()) {
    uint16_t mm = tofStart.distance();  // returns Range in millimeters
    tofStart.clearInterrupt();
    dist_m = mm / 1000.0f;

    // Debug print to Serial
    Serial.print("mm=");     Serial.print(mm);
    Serial.print(" dist_m="); Serial.println(dist_m, 3);
  }

  // update flags
  ready = (dist_m <= READY_THRESH);
  if (!triggered && dist_m <= START_THRESH) {
    triggered = true;
    Serial.println("🚦 Start triggered!");
  }

  // build JSON
  String js = "{";
  js += "\"distance\":"  + String(dist_m,3) + ",";
  js += "\"ready\":"     + String(ready    ? "true" : "false") + ",";
  js += "\"triggered\":" + String(triggered? "true" : "false");
  js += "}";

  serverStart.send(200, "application/json", js);
}

void setup() {
  // Serial for debug
  Serial.begin(115200);
  Serial.println("\n⏳ StartUnit Booting...");

  // I2C on non-strap pins
  Wire.begin(4, 5);  
  Serial.println("✅ I2C on SDA=GPIO4, SCL=GPIO5");

  // Join CarUnit AP
  WiFi.mode(WIFI_STA);
  WiFi.config(STA_IP_START, STA_GW, STA_SN);
  WiFi.begin(SSID);
  Serial.print("📶 StartUnit joining");
  while (WiFi.status() != WL_CONNECTED) {
    delay(200);
    Serial.print('.');
  }
  Serial.print(" ✓ IP="); Serial.println(WiFi.localIP());

  // Initialize VL53L1X
  if (!tofStart.begin()) {
    Serial.println("❌ VL53L1X not found");
    while (1) delay(10);
  }
  tofStart.startRanging();  // continuous mode
  Serial.println("✅ VL53L1X ranging");

  // HTTP /status endpoint
  serverStart.on("/status", HTTP_GET, handleStatusStart);
  serverStart.begin();
  Serial.println("✔ StartUnit HTTP up");
}

void loop() {
  serverStart.handleClient();
}
