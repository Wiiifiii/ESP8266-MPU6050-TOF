#include <Wire.h>
#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <MPU6050.h>

const char* apSsid = "RaceTimerNet";

ESP8266WebServer server(80);
MPU6050 mpu;

// live data
float ax=0, ay=0, az=0, speed=0;
unsigned long lastMicros=0;
volatile bool gotStart = false, gotFinish = false;

void handleData() {
  String s = "{";
  s += "\"ax\":"    + String(ax,3)   + ",";
  s += "\"ay\":"    + String(ay,3)   + ",";
  s += "\"az\":"    + String(az,3)   + ",";
  s += "\"speed\":" + String(speed,2)+ ",";
  s += "\"start\":" + String(gotStart?"true":"false") + ",";
  s += "\"finish\":" + String(gotFinish?"true":"false");
  s += "}";
  server.send(200, "application/json", s);
}

void handleStart() {
  gotStart = true;
  server.send(200, "text/plain", "OK");
}

void handleFinish() {
  gotFinish = true;
  server.send(200, "text/plain", "OK");
}

void setup() {
  Serial.begin(115200);
  Wire.begin();
  mpu.initialize();

  // start SoftAP
  WiFi.softAP(apSsid);
  Serial.print("AP IP=");
  Serial.println(WiFi.softAPIP());

  // route endpoints
  server.on("/data",   HTTP_GET,  handleData);
  server.on("/start",  HTTP_POST, handleStart);
  server.on("/finish", HTTP_POST, handleFinish);
  server.begin();

  lastMicros = micros();
}

void loop() {
  server.handleClient();

  // read accel, integrate speed
  int16_t rx, ry, rz;
  mpu.getAcceleration(&rx,&ry,&rz);
  ax = rx/16384.0f;
  ay = ry/16384.0f;
  az = rz/16384.0f;

  unsigned long now = micros();
  float dt = (now - lastMicros)*1e-6f;
  lastMicros = now;
  speed += ax * dt;
  if (fabs(ax) < 0.02f) speed = 0;  // kill drift

  delay(10);  // ~100 Hz
}
