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
ESP8266WebServer server(80); // HTTP server on port 80

// — Calibration & data —
float       biasX=0, biasY=0, biasZ=0; // biases for accelerometer axes
float       ax, ay, az, speed=0; // acceleration in g's, speed in m/s
// Note: MPU6050's accelerometer range is ±2g, so 1g = 16384 LSB
unsigned long lastMicros; // last time in microseconds

// — Lap flags —
volatile bool gotStart  = false; // true if start signal received
volatile bool gotFinish = false; // true if finish signal received

// — Handlers —
void handleData() { // Send current acceleration and speed as JSON
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
  server.send(200, "text/plain", "OK"); // Respond with "OK" to acknowledge start signal
}

void handleFinish() {
  gotFinish = true;
  server.send(200, "text/plain", "OK"); // Respond with "OK" to acknowledge finish signal
}

void setup() {
  Serial.begin(115200); // Initialize serial communication for debugging 115200 baud
  Wire.begin(); 

  // — MPU init & bias —
  mpu.initialize();
  long sumX=0, sumY=0, sumZ=0; // sum of accelerometer readings for bias calculation
  for (int i=0; i<500; i++) {
    int16_t rx,ry,rz; // raw accelerometer readings
    mpu.getAcceleration(&rx,&ry,&rz); 
    sumX+=rx; sumY+=ry; sumZ+=rz; 
    delay(2); // wait 2 ms between readings 
  }
  biasX = (sumX/500.0f)/16384.0f; // convert to g's (1g = 16384 LSB)
  biasY = (sumY/500.0f)/16384.0f;
  biasZ = (sumZ/500.0f)/16384.0f;
  Serial.printf("Biases: X=%.3fg Y=%.3fg Z=%.3fg\n", biasX,biasY,biasZ); 

  // — Start open AP with static IP —
  WiFi.softAPConfig(AP_IP, AP_GW, AP_SN); // Configure static IP for AP
  WiFi.softAP(AP_SSID); // Start AP with SSID
  Serial.print("📡 CarUnit AP IP=");
  Serial.println(WiFi.softAPIP()); 

  // — HTTP routes —
  server.on("/data",   HTTP_GET,  handleData);
  server.on("/start",  HTTP_POST, handleStart);
  server.on("/finish", HTTP_POST, handleFinish);
  server.begin();
  lastMicros = micros(); // Initialize lastMicros for speed calculation
}

void loop() {
  server.handleClient();

  // — Read & integrate accel → speed —
  int16_t rx, ry, rz;
  mpu.getAcceleration(&rx,&ry,&rz); // Read raw accelerometer data
  // Convert raw data to g's and subtract biases
  // Note: MPU6050's accelerometer range is ±2g, so 1g = 16384 LSB
  // Biases are already in g's, so we can directly subtract them
  ax = rx/16384.0f - biasX;
  ay = ry/16384.0f - biasY;
  az = rz/16384.0f - biasZ;

  unsigned long now = micros(); // Get current time in microseconds
  float dt = (now - lastMicros)*1e-6f; // Calculate time difference in seconds
  lastMicros = now; // Update lastMicros for next iteration

  speed += ax * dt; // Integrate acceleration to get speed 
  if (fabs(ax) < 0.02f) speed = 0;  // kill drift: if acceleration is small, reset speed to 0

  delay(10);  // ~100 Hz
}
