# ESP8266-MPU6050-TOF Race Timer System

A comprehensive race timing system built with ESP8266 microcontrollers, MPU6050 accelerometer/gyroscope sensors, VL53L1X time-of-flight sensors, and a React Native mobile application. This system provides accurate timing, speed tracking, and distance measurement for racing applications.

## 🏁 Project Overview

This project consists of three main components:

1. **Firmware** - ESP8266-based units for race timing and car telemetry
2. **Mobile App** - React Native/Expo app for race monitoring and control
3. **Hardware Integration** - MPU6050 and VL53L1X sensor integration

### System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Start Unit    │    │    Car Unit     │    │  Finish Unit    │
│   (ESP8266)     │    │   (ESP8266)     │    │   (ESP8266)     │
│                 │    │                 │    │                 │
│ • VL53L1X TOF   │    │ • MPU6050       │    │ • VL53L1X TOF   │
│ • WiFi AP       │    │ • WiFi Client   │    │ • WiFi Client   │
│ • Start Detect  │    │ • Accelerometer │    │ • Finish Detect │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │  Mobile App     │
                    │ (React Native)  │
                    │                 │
                    │ • Race Control  │
                    │ • Real-time UI  │
                    │ • Data Display  │
                    └─────────────────┘
```

## 🔧 Hardware Requirements

### Electronic Components

- **3x ESP8266 Development Boards** (NodeMCU or similar)
- **1x MPU6050** 6-axis accelerometer/gyroscope
- **2x VL53L1X** time-of-flight distance sensors
- **Jumper wires** for connections
- **Breadboards** or custom PCBs
- **Power supply** (USB or battery packs)

### Wiring Diagrams

#### Car Unit (MPU6050)
```
ESP8266    →    MPU6050
GPIO4 (D2) →    SDA
GPIO5 (D1) →    SCL
3.3V       →    VCC
GND        →    GND
```

#### Start/Finish Units (VL53L1X)
```
ESP8266    →    VL53L1X
GPIO4 (D2) →    SDA
GPIO5 (D1) →    SCL
3.3V       →    VIN
GND        →    GND
```

## 📱 Mobile Application

### Features

- **Real-time Race Monitoring** - Live telemetry from car unit
- **Multi-screen Interface** - Step-by-step race flow
- **WiFi Integration** - Connects to ESP8266 race network
- **Data Visualization** - Charts and progress indicators

### Screen Flow

1. **Distance Screen** - Initial connection and distance measurement
2. **Drive to Start** - Positioning guidance
3. **Ready Screen** - Pre-race preparation
4. **Running Screen** - Live race data with speed/acceleration
5. **Finished Screen** - Race results and statistics

### Technology Stack

- **React Native** with Expo framework
- **React Navigation** for screen management
- **Axios** for HTTP API communication
- **React Native Chart Kit** for data visualization
- **NetInfo** for network connectivity monitoring

## 🖥️ Firmware Architecture

### Unit Types

#### 1. Car Unit
- **Purpose**: Mounted on racing vehicle for telemetry
- **Sensors**: MPU6050 (accelerometer/gyroscope)
- **Network**: WiFi client connecting to start unit
- **Data**: Real-time acceleration, speed, distance calculation
- **API Endpoint**: `http://192.168.4.1/data`

#### 2. Start Unit
- **Purpose**: Race start line detection and WiFi access point
- **Sensors**: VL53L1X time-of-flight sensor
- **Network**: WiFi access point ("RaceTimerNet")
- **Function**: Detects vehicle presence and triggers race start
- **API Endpoint**: `http://192.168.4.2/status`

#### 3. Finish Unit
- **Purpose**: Race finish line detection
- **Sensors**: VL53L1X time-of-flight sensor
- **Network**: WiFi client connecting to start unit
- **Function**: Detects vehicle crossing finish line
- **API Endpoint**: `http://192.168.4.3/status`

### Network Configuration

```
Access Point: RaceTimerNet
IP Range: 192.168.4.0/24

Device IPs:
├── Start Unit (AP):  192.168.4.1
├── Car Unit:         192.168.4.2 (dynamic)
└── Finish Unit:      192.168.4.3
```

## 🚀 Installation & Setup

### Firmware Setup

#### Prerequisites
- [PlatformIO IDE](https://platformio.org/) or PlatformIO CLI
- USB cables for ESP8266 programming

#### 1. Clone Repository
```bash
git clone https://github.com/Wiiifiii/ESP8266-MPU6050-TOF.git
cd ESP8266-MPU6050-TOF/firmware
```

#### 2. Configure PlatformIO
The project includes three build environments in `platformio.ini`:

- `car` - Car unit with MPU6050
- `start` - Start unit with VL53L1X  
- `finish` - Finish unit with VL53L1X

#### 3. Flash Firmware

**Option A: PlatformIO IDE**
1. Open firmware folder in PlatformIO
2. Select appropriate environment (car/start/finish)
3. Build and upload to respective ESP8266

**Option B: Command Line**
```bash
# Flash car unit
pio run -e car --target upload

# Flash start unit  
pio run -e start --target upload

# Flash finish unit
pio run -e finish --target upload
```

#### 4. Update COM Ports
Edit `platformio.ini` and update upload ports:
```ini
[env:car]
upload_port = COM3    # Update to your port

[env:start]  
upload_port = COM4    # Update to your port

[env:finish]
upload_port = COM5    # Update to your port
```

### Mobile App Setup

#### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or later)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- iOS Simulator or Android Emulator (optional)

#### 1. Navigate to App Directory
```bash
cd ESP8266-MPU6050-TOF/app
```

#### 2. Install Dependencies
```bash
npm install
```

#### 3. Start Development Server
```bash
npm start
# or
expo start
```

#### 4. Run on Device/Simulator
- **iOS**: Press `i` in terminal or scan QR code with Camera app
- **Android**: Press `a` in terminal or scan QR code with Expo Go app
- **Web**: Press `w` in terminal

## 🎯 Usage Instructions

### 1. Hardware Setup
1. Power on all three ESP8266 units
2. Wait for Start Unit to create "RaceTimerNet" WiFi network
3. Verify Car Unit and Finish Unit connect to network
4. Position sensors at start/finish lines and mount car unit on vehicle

### 2. Mobile App Operation
1. Connect phone to "RaceTimerNet" WiFi network
2. Launch mobile app
3. Follow on-screen instructions through race sequence:
   - **Distance**: Verify connectivity and distance readings
   - **Drive to Start**: Position vehicle at start line
   - **Ready**: Confirm race readiness  
   - **Running**: Monitor live telemetry during race
   - **Finished**: View race results

### 3. Race Flow
1. Vehicle approaches start line (triggers ready state)
2. Vehicle crosses start line (triggers race start timer)
3. App displays real-time speed, acceleration, distance
4. Vehicle crosses finish line (stops timer, shows results)

## 📊 API Reference

### Car Unit API (`192.168.4.1`)

#### GET `/data`
Returns real-time telemetry data.

**Response:**
```json
{
  "ax": 0.123,      // X-axis acceleration (m/s²)
  "ay": -0.045,     // Y-axis acceleration (m/s²) 
  "az": 9.789,      // Z-axis acceleration (m/s²)
  "speed": 15.67,   // Current speed (m/s)
  "distance": 123.45 // Total distance (m)
}
```

### Start Unit API (`192.168.4.2`)

#### GET `/status`
Returns start line sensor status.

**Response:**
```json
{
  "distance": 0.045,    // Distance to object (m)
  "ready": true,        // Ready state (≤50mm)
  "triggered": false,   // Start triggered (≤2mm)
  "startTime": 0        // Start timestamp (ms)
}
```

### Finish Unit API (`192.168.4.3`)

#### GET `/status`  
Returns finish line sensor status.

**Response:**
```json
{
  "distance": 0.123,    // Distance to object (m)
  "finished": false     // Finish triggered (≤50mm)
}
```

## 🔧 Configuration

### Sensor Calibration

#### MPU6050 (Car Unit)
- Automatic bias calibration on startup
- 1000 sample averaging for offset correction
- Configurable in `CarUnit/main.cpp`

#### VL53L1X (Start/Finish Units)
- Distance thresholds configurable:
  - Ready: ≤50mm 
  - Trigger: ≤2mm (start), ≤50mm (finish)
- Median filtering for noise reduction

### Network Settings
WiFi credentials and IP addresses can be modified in respective unit source files:
```cpp
const char* SSID = "RaceTimerNet";
IPAddress STA_IP(192,168,4,2);  // Update as needed
```

## 🐛 Troubleshooting

### Common Issues

#### 1. WiFi Connection Problems
- Verify "RaceTimerNet" network is active
- Check ESP8266 power and reset units if needed
- Ensure mobile device is connected to correct network

#### 2. Sensor Reading Issues
- Verify I2C wiring (SDA/SCL connections)
- Check 3.3V power supply stability  
- Monitor serial output for sensor initialization errors

#### 3. Mobile App Connection
- Confirm app and ESP8266s are on same network
- Check firewall settings on mobile device
- Verify API endpoints are responding (test with browser)

#### 4. Inaccurate Measurements
- Recalibrate MPU6050 (restart car unit)
- Clean VL53L1X sensor windows
- Verify sensor mounting and positioning

### Debug Commands

#### Check Serial Output
```bash
# Monitor car unit
pio device monitor -e car

# Monitor start unit  
pio device monitor -e start

# Monitor finish unit
pio device monitor -e finish
```

#### Test API Endpoints
```bash
# Test car unit (replace with actual IP)
curl http://192.168.4.1/data

# Test start unit
curl http://192.168.4.2/status

# Test finish unit  
curl http://192.168.4.3/status
```

## 📈 Performance Specifications

### Timing Accuracy
- **Start/Finish Detection**: <10ms response time
- **Distance Measurement**: ±3mm accuracy (VL53L1X)
- **Speed Calculation**: Real-time with 100Hz sampling

### Range Specifications
- **VL53L1X Range**: 4cm to 4m
- **MPU6050 Acceleration**: ±2g to ±16g (configurable)
- **WiFi Range**: ~30m line-of-sight

### Power Consumption
- **ESP8266**: ~80mA active, ~20µA deep sleep
- **MPU6050**: ~3.5mA active, ~40µA sleep
- **VL53L1X**: ~20mA active measurement

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow existing code style and formatting
- Add comments for complex logic
- Test thoroughly on hardware before submitting
- Update documentation for new features

## 📄 License

This project is licensed under the 0BSD License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [I2Cdevlib](https://github.com/jrowberg/i2cdevlib) for MPU6050 library
- [Adafruit](https://github.com/adafruit) for VL53L1X library  
- [PlatformIO](https://platformio.org/) for embedded development platform
- [Expo](https://expo.dev/) for React Native development tools

## 📞 Support

For questions, issues, or contributions:

- **GitHub Issues**: [Report bugs or request features](https://github.com/Wiiifiii/ESP8266-MPU6050-TOF/issues)
- **Documentation**: Check this README and inline code comments
- **Hardware Support**: Refer to ESP8266 and sensor datasheets

---

**Built with ❤️ for the racing community**