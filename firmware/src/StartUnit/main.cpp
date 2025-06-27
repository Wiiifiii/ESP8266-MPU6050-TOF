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
  Serial.println("\nStartUnit connected");
}

void loop() {
  // dummy: send a start‐line "distance" every second
  HTTPClient http;
  http.begin(String(host) + "/start");
  int code = http.POST("");
  Serial.printf("POST /start → %d\n", code);
  http.end();

  delay(1000);
}
