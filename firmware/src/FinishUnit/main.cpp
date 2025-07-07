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

// finish threshold & state
const float FINISH_THRESH = 0.05f;  // 5 cm
bool  finished = false;
float dist_m  = 0;

void handleStatusFinish() {
  // pull new sample if ready
  if (tofFinish.dataReady()) {
    uint16_t mm = tofFinish.distance();       // millimeters
    tofFinish.clearInterrupt();
    dist_m = mm / 1000.0f;                    // meters

    Serial.print("mm="); Serial.print(mm);
    Serial.print(" dist_m="); Serial.println(dist_m,3);
  }

  // detect finish
  if (!finished && dist_m <= FINISH_THRESH) {
    finished = true;
    Serial.println("🏁 Finish triggered!");
  }

  // send JSON status
  String js = "{";
  js += "\"distance\":"  + String(dist_m,3) + ",";
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
