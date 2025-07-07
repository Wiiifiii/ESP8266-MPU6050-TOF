#include <Arduino.h>
#include <Wire.h>

void setup() {
  Serial.begin(115200);
  delay(100);
  Wire.begin(4, 5);   // SDA = GPIO4 (D2), SCL = GPIO5 (D1)
  Serial.println();
  Serial.println("I2C Scanner starting...");
}

void loop() {
  Serial.println("Scanning I2C bus...");
  byte error, address;
  int  nDevices = 0;

  for (address = 1; address < 127; address++) {
    Wire.beginTransmission(address);
    error = Wire.endTransmission();

    if (error == 0) {
      Serial.print("  [FOUND] 0x");
      if (address < 16) Serial.print("0");
      Serial.println(address, HEX);
      nDevices++;
    } 
    else if (error == 4) {
      Serial.print("  [ERROR] 0x");
      if (address < 16) Serial.print("0");
      Serial.println(address, HEX);
    }
  }

  if (nDevices == 0) {
    Serial.println("  >>> No I2C devices found");
  } else {
    Serial.print("  >>> Scan complete, ");
    Serial.print(nDevices);
    Serial.println(" device(s) found");
  }

  Serial.println();
  delay(5000);
}
