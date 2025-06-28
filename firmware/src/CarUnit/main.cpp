// CarUnit/src/main.cpp

#include <Wire.h>
#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <MPU6050.h>

// — AP settings —
const char* AP_SSID = "RaceTimerNet";
IPAddress   AP_IP(192,168,4,1);
IPAddress   AP_GW(192,168,4,1);
IPAddress   AP_SN(255,255,255,0);

// — MPU & server —
MPU6050          mpu;
ESP8266WebServer server(80);

// — Calibration & data —
float       biasX=0, biasY=0, biasZ=0;
float       ax, ay, az, speed=0;
unsigned long lastMicros;

// — Lap flags —
volatile bool gotStart  = false;
volatile bool gotFinish = false;

// — Handlers —
void handleData() {
  String json = "{";
  json += "\"ax\":"    + String(ax,3)    + ",";
  json += "\"ay\":"    + String(ay,3)    + ",";
  json += "\"az\":"    + String(az,3)    + ",";
  json += "\"speed\":" + String(speed,2) + ",";
  json += "\"start\":" + String(gotStart  ? "true":"false") + ",";
  json += "\"finish\":" + String(gotFinish ? "true":"false");
  json += "}";
  server.send(200, "application/json", json);
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

  // — MPU init & bias —
  mpu.initialize();
  long sumX=0, sumY=0, sumZ=0;
  for (int i=0; i<500; i++) {
    int16_t rx,ry,rz;
    mpu.getAcceleration(&rx,&ry,&rz);
    sumX+=rx; sumY+=ry; sumZ+=rz;
    delay(2);
  }
  biasX = (sumX/500.0f)/16384.0f;
  biasY = (sumY/500.0f)/16384.0f;
  biasZ = (sumZ/500.0f)/16384.0f;
  Serial.printf("Biases: X=%.3fg Y=%.3fg Z=%.3fg\n", biasX,biasY,biasZ);

  // — Start open AP with static IP —
  WiFi.softAPConfig(AP_IP, AP_GW, AP_SN);
  WiFi.softAP(AP_SSID);
  Serial.print("📡 CarUnit AP IP=");
  Serial.println(WiFi.softAPIP());

  // — HTTP routes —
  server.on("/data",   HTTP_GET,  handleData);
  server.on("/start",  HTTP_POST, handleStart);
  server.on("/finish", HTTP_POST, handleFinish);
  server.begin();
  lastMicros = micros();
}

void loop() {
  server.handleClient();

  // — Read & integrate accel → speed —
  int16_t rx, ry, rz;
  mpu.getAcceleration(&rx,&ry,&rz);
  ax = rx/16384.0f - biasX;
  ay = ry/16384.0f - biasY;
  az = rz/16384.0f - biasZ;

  unsigned long now = micros();
  float dt = (now - lastMicros)*1e-6f;
  lastMicros = now;

  speed += ax * dt;
  if (fabs(ax) < 0.02f) speed = 0;  // kill drift

  delay(10);  // ~100 Hz
}
