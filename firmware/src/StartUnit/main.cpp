// StartUnit/src/main.cpp

#include <Wire.h>
#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <Adafruit_VL53L1X.h>

// — Wi-Fi & static IP —
const char* SSID = "RaceTimerNet";
IPAddress   STA_IP(192,168,4,2);
IPAddress   STA_GW(192,168,4,1);
IPAddress   STA_SN(255,255,255,0);

// — HTTP & TOF —
ESP8266WebServer server(80);
Adafruit_VL53L1X tof = Adafruit_VL53L1X();

// — Threshold & state —
const float TRIGGER_THRESH = 0.05f;
bool            triggered  = false;

// — Handler: return JSON status —
void handleStatus() {
  float dist_m = NAN;
  if (tof.dataReady()) {
    uint16_t mm = tof.distance();
    tof.clearInterrupt();
    dist_m = mm / 1000.0f;
  }

  if (!triggered && dist_m <= TRIGGER_THRESH) {
    triggered = true;
    Serial.println("🚦 Start triggered!");
  }

  String js = "{";
  js += "\"distance\":" + String(dist_m,3) + ",";
  js += "\"triggered\":" + String(triggered?"true":"false");
  js += "}";
  server.send(200, "application/json", js);
}

void setup(){
  Serial.begin(115200);
  Wire.begin();

  // — Join AP with static IP —
  WiFi.mode(WIFI_STA);
  WiFi.config(STA_IP, STA_GW, STA_SN);
  WiFi.begin(SSID);
  Serial.print("📶 StartUnit joining");
  while (WiFi.status() != WL_CONNECTED) {
    delay(300); Serial.print(".");
  }
  Serial.print(" ✓ IP=");
  Serial.println(WiFi.localIP());

  // — TOF init & continuous ranging —
  if (!tof.begin()) {
    Serial.println("❌ VL53L1X not found");
    while (1) delay(10);
  }
  tof.setTimingBudget(20);   // ms per measurement
  tof.startRanging();        // continuous mode

  // — HTTP route —
  server.on("/status", HTTP_GET, handleStatus);
  server.begin();
  Serial.println("HTTP server started");
}

void loop(){
  server.handleClient();
}
