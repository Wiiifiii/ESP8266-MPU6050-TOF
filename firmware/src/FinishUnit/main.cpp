// FinishUnit/src/main.cpp

#include <Wire.h>
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <Adafruit_VL53L1X.h>

// — Wi-Fi + Static IP —
const char* SSID = "RaceTimerNet";
IPAddress   STA_IP(192,168,4,3);
IPAddress   STA_GW(192,168,4,1);
IPAddress   STA_SN(255,255,255,0);

// — CarUnit host (for POST /finish) —
const char* CAR_HOST = "http://192.168.4.1";

// — TOF sensor —
Adafruit_VL53L1X tof;

// — Trigger threshold (meters) —
const float TRIGGER_THRESH = 0.05f;
bool            triggered  = false;

// — WiFiClient instance for HTTP —
WiFiClient wifiClient;

void setup(){
  Serial.begin(115200);
  Wire.begin();

  // Join the open AP, static IP
  WiFi.mode(WIFI_STA);
  WiFi.config(STA_IP, STA_GW, STA_SN);
  WiFi.begin(SSID);
  Serial.print("📶 FinishUnit joining");
  while (WiFi.status() != WL_CONNECTED) {
    delay(300);
    Serial.print(".");
  }
  Serial.print(" ✓ IP=");
  Serial.println(WiFi.localIP());

  // Initialize VL53L1X
  if (!tof.begin()) {
    Serial.println("❌ VL53L1X not found!");
    while (1) delay(10);
  }
  tof.setTimingBudget(20);   // 20 ms per measurement
  tof.startRanging();        // continuous mode
}

void loop(){
  // Read distance when ready
  if (!triggered && tof.dataReady()) {
    uint16_t mm = tof.distance();
    tof.clearInterrupt();
    float m = mm / 1000.0f;

    // If we cross the line, POST once
    if (m <= TRIGGER_THRESH) {
      HTTPClient http;
      String url = String(CAR_HOST) + "/finish";

      // **NEW** API: supply a WiFiClient + URL
      http.begin(wifiClient, url);
      int code = http.POST("");
      Serial.printf("POST /finish → %d\n", code);
      http.end();

      triggered = true;
    }
  }

  delay(100);
}
