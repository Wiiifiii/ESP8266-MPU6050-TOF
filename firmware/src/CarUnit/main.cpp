//CarUnit main.cpp
#include <Wire.h>
#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <math.h>
#include "imu_fusion.h"

// — AP settings —
const char* AP_SSID = "RaceTimerNet";
IPAddress AP_IP(192,168,4,1);
IPAddress AP_GW(192,168,4,1);
IPAddress AP_SN(255,255,255,0);

// — MPU & server —
ESP8266WebServer server(80);
static ImuFusion imu;

void handleData() {
  const ImuState& st = imu.state();
  String json = "{";
  json += "\"speed\":"     + String(st.speed_mps, 5) + ",";
  json += "\"accel\":"     + String(st.aF_mps2, 5) + ",";
  json += "\"pitch\":"     + String(st.pitchDeg, 2) + ",";
  json += "\"roll\":"      + String(st.rollDeg, 2) + ",";
  // gravity-removed linear acceleration (m/s^2) and convenience axes
  json += "\"ax\":"        + String(st.aX_mps2, 5) + ",";
  json += "\"ay\":"        + String(st.aY_mps2, 5) + ",";
  json += "\"az\":"        + String(st.aZ_mps2, 5) + ",";
  json += "\"aLat\":"      + String(st.aLat_mps2, 5) + ",";
  json += "\"aVert\":"     + String(st.aVert_mps2, 5) + ",";
  json += "\"distance\":"  + String(st.distance_m, 3) + ",";
  json += "\"sampleHz\":"  + String(st.sampleHz, 1) + ",";
  json += "\"rssi\":"      + String(WiFi.RSSI());
  json += "}";
  server.send(200, "application/json", json);
}

void setup() {
  Serial.begin(115200);
  delay(100);
  Serial.println();
  Serial.println("⏳ CarUnit Booting...");

  // Initialize I2C bus
  Wire.begin(4, 5);
  Serial.println("✅ I2C on SDA=GPIO4, SCL=GPIO5");

  // Initialize IMU fusion
  imu.begin();
  Serial.println("ℹ IMU fusion initialized & calibrated");

  // Start Soft-AP
  WiFi.softAPConfig(AP_IP, AP_GW, AP_SN);
  WiFi.softAP(AP_SSID);
  Serial.printf("📡 CarUnit AP \"%s\" -> IP=%s\n", AP_SSID, WiFi.softAPIP().toString().c_str());

  // HTTP endpoint
  server.on("/data", HTTP_GET, handleData);
  server.on("/learn_forward/start", HTTP_GET, [](){ imu.beginLearnForward(); server.send(200, "application/json", "{\"ok\":true}"); });
  server.on("/learn_forward/stop",  HTTP_GET, [](){ bool ok = imu.endLearnForward(); server.send(200, "application/json", String("{\"ok\":" ) + (ok?"true":"false") + "}"); });
  server.begin();
  Serial.println("✔ CarUnit HTTP server up");

  // nothing else
}

void loop() {
  server.handleClient();

  // Update IMU fusion
  imu.update();

  yield();
  delay(10);
}
