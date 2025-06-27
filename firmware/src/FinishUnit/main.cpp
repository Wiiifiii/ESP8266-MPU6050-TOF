#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>

const char* ssid = "RaceTimerNet";
const char* host = "http://192.168.4.1";  // CarUnit AP

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid);
  while (WiFi.status() != WL_CONNECTED) {
    delay(200);
    Serial.print(".");
  }
  Serial.println("\nFinishUnit connected");
}

void loop() {
  // dummy: wait 10 s then fire finish once
  static bool done = false;
  if (!done && millis() > 10000) {
    HTTPClient http;
    http.begin(String(host) + "/finish");
    int code = http.POST("");
    Serial.printf("POST /finish → %d\n", code);
    http.end();
    done = true;
  }
  delay(500);
}
