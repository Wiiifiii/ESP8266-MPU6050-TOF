#include <Wire.h>
#include <MPU6050.h>
#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>

// — AP settings —
const char* AP_SSID = "RaceTimerNet";
IPAddress AP_IP(192,168,4,1);
IPAddress AP_GW(192,168,4,1);
IPAddress AP_SN(255,255,255,0);

// — MPU & server —
MPU6050 mpu;
ESP8266WebServer server(80);

// — Calibration & data —
float biasX = 0, biasY = 0, biasZ = 0;
float ax = 0, ay = 0, az = 0;
float speed = 0, distance = 0;
const float GRAVITY = 9.80665f;
unsigned long lastMicros;

void handleData() {
  String json = "{";
  json += "\"ax\":" + String(ax, 3) + ",";
  json += "\"ay\":" + String(ay, 3) + ",";
  json += "\"az\":" + String(az, 3) + ",";
  json += "\"speed\":" + String(speed, 2) + ",";
  json += "\"distance\":" + String(distance, 3);
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

  // Initialize MPU6050 without testConnection (skip WHO_AM_I mismatch)
  mpu.initialize();
  Serial.println("ℹ MPU6050 initialized");

  // Calibrate biases
  long sumX = 0, sumY = 0, sumZ = 0;
  for (int i = 0; i < 500; i++) {
    int16_t rx, ry, rz;
    mpu.getAcceleration(&rx, &ry, &rz);
    sumX += rx;
    sumY += ry;
    sumZ += rz;
    delay(2);
  }
  biasX = sumX / 500.0f / 16384.0f;
  biasY = sumY / 500.0f / 16384.0f;
  biasZ = sumZ / 500.0f / 16384.0f;
  Serial.printf("📐 Biases: X=%.3fg  Y=%.3fg  Z=%.3fg\n", biasX, biasY, biasZ);

  // Start Soft-AP
  WiFi.softAPConfig(AP_IP, AP_GW, AP_SN);
  WiFi.softAP(AP_SSID);
  Serial.printf("📡 CarUnit AP \"%s\" -> IP=%s\n", AP_SSID, WiFi.softAPIP().toString().c_str());

  // HTTP endpoint
  server.on("/data", HTTP_GET, handleData);
  server.begin();
  Serial.println("✔ CarUnit HTTP server up");

  lastMicros = micros();
}

void loop() {
  server.handleClient();

  // Read acceleration
  int16_t rx, ry, rz;
  mpu.getAcceleration(&rx, &ry, &rz);
  ax = rx / 16384.0f - biasX;
  ay = ry / 16384.0f - biasY;
  az = rz / 16384.0f - biasZ;

  // Compute delta time
  unsigned long now = micros();
  float dt = (now - lastMicros) * 1e-6f;
  lastMicros = now;

  // Integrate acceleration to speed
  float accel_m_s2 = ax * GRAVITY;
  speed += accel_m_s2 * dt;
  if (fabs(speed) < 0.02f) speed = 0;

  // Integrate speed to distance
  distance += speed * dt;

  delay(10);
}






// #include <Arduino.h>
// #include <Wire.h>

// void setup() {
//   Serial.begin(115200);
//   delay(100);
//   Wire.begin(4, 5);   // SDA = GPIO4 (D2), SCL = GPIO5 (D1)
//   Serial.println();
//   Serial.println("I2C Scanner starting...");
// }

// void loop() {
//   Serial.println("Scanning I2C bus...");
//   byte error, address;
//   int  nDevices = 0;

//   for (address = 1; address < 127; address++) {
//     Wire.beginTransmission(address);
//     error = Wire.endTransmission();

//     if (error == 0) {
//       Serial.print("  [FOUND] 0x");
//       if (address < 16) Serial.print("0");
//       Serial.println(address, HEX);
//       nDevices++;
//     } 
//     else if (error == 4) {
//       Serial.print("  [ERROR] 0x");
//       if (address < 16) Serial.print("0");
//       Serial.println(address, HEX);
//     }
//   }

//   if (nDevices == 0) {
//     Serial.println("  >>> No I2C devices found");
//   } else {
//     Serial.print("  >>> Scan complete, ");
//     Serial.print(nDevices);
//     Serial.println(" device(s) found");
//   }

//   Serial.println();
//   delay(5000);
// }
