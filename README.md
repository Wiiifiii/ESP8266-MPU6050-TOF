# ESP8266‑MPU6050‑TOF Race Timer System

A hardware + mobile app race timer using ESP8266, MPU6050 (car telemetry), VL53L1X ToF sensors (start/finish), and a React Native + Expo app.

## Project Overview

This project consists of three main components:

1. Firmware — three ESP8266 units (Car = AP + IMU, Start = ToF, Finish = ToF)
2. Mobile App — React Native/Expo controller + live telemetry
3. Hardware — simple I2C wiring: MPU6050 on Car; VL53L1X on Start/Finish

### System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    Car Unit     │    │   Start Unit    │    │  Finish Unit    │
│   (ESP8266)     │    │   (ESP8266)     │    │   (ESP8266)     │
│                 │    │                 │    │                 │
│ • MPU6050 (IMU) │    │ • VL53L1X ToF   │    │ • VL53L1X ToF   │
│ • Wi‑Fi AP      │    │ • Wi‑Fi Station │    │ • Wi‑Fi Station │
│ • Telemetry     │    │ • Start Detect  │    │ • Finish Detect │
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

## Hardware requirements

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

## Mobile app

### Features

- Live telemetry (speed/accel/distance)
- Stepper flow: Distance → Connect → Drive → Ready → Running → Finished
- Automatic discovery of Start/Finish IPs on the race AP
- History of last 10 laps (best-first display)

### Screen Flow

1) Distance — set track distance (m)
2) Connect — ensure Car+Start reachable (Finish optional)
3) Drive to Start — approach until near threshold (mm)
4) Ready — manual start by button (or optional auto)
5) Running — live telemetry; finish auto-detected
6) Finished — summary + best/last 10 laps

### Technology Stack

- **React Native** with Expo framework
- **React Navigation** for screen management
- **Axios** for HTTP API communication
- **React Native Chart Kit** for data visualization
- **NetInfo** for network connectivity monitoring

## Firmware architecture

### Unit Types

#### 1) Car Unit (AP)
- **Purpose**: Mounted on racing vehicle for telemetry
- **Sensors**: MPU6050 (accelerometer/gyroscope)
- **Network**: Soft‑AP “RaceTimerNet” at 192.168.4.1
- **Data**: Real-time acceleration, speed, distance calculation
- **API Endpoint**: `http://192.168.4.1/data`

#### 2) Start Unit (STA)
- **Purpose**: Race start line detection and WiFi access point
- **Sensors**: VL53L1X time-of-flight sensor
- **Network**: Wi‑Fi station joining Car AP at 192.168.4.2
- **Function**: Detects vehicle presence and triggers race start
- **API Endpoint**: `http://192.168.4.2/status`

#### 3) Finish Unit (STA)
- **Purpose**: Race finish line detection
- **Sensors**: VL53L1X time-of-flight sensor
- **Network**: Wi‑Fi station joining Car AP at 192.168.4.3
- **Function**: Detects vehicle crossing finish line
- **API Endpoint**: `http://192.168.4.3/status`

### Network configuration

```
Access Point: Car Unit “RaceTimerNet”
Subnet: 192.168.4.0/24

Default device IPs:
├─ Car Unit (AP):   192.168.4.1  → GET /data
├─ Start Unit:      192.168.4.2  → GET /status
└─ Finish Unit:     192.168.4.3  → GET /status

App discovery: If 192.168.4.2/.3 are not found, the app probes a few DHCP‑style fallbacks (e.g., 192.168.4.10/20/30/40/50/60) and uses the first that answers.
```

## Installation & setup

### Firmware setup

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

#### 3) Flash firmware

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

#### 4) COM ports (optional)
By default, Car’s `upload_port` is set; Start/Finish auto-detect. Edit `firmware/platformio.ini` if needed:
```ini
[env:car]
upload_port = COM4  ; set to your COM port or remove to auto-detect
```

### Mobile app setup

#### Prerequisites
- Node.js 18+ LTS recommended
- Expo (local dev server)
- iOS Simulator or Android Emulator (optional)

#### 1. Navigate to App Directory
```bash
cd ESP8266-MPU6050-TOF/app
```

#### 2) Install dependencies
```bash
npm install
```

#### 3) Start dev server
```bash
npm start
# or
expo start
```

#### 4) Run on device/simulator
- **iOS**: Press `i` in terminal or scan QR code with Camera app
- **Android**: Press `a` in terminal or scan QR code with Expo Go app
- **Web**: Press `w` in terminal

##  Usage

### 1) Hardware
1. Power on all three ESP8266 units
2. Wait for Start Unit to create "RaceTimerNet" WiFi network
3. Verify Car Unit and Finish Unit connect to network
4. Position sensors at start/finish lines and mount car unit on vehicle

### 2) App flow
1. Connect phone to "RaceTimerNet" WiFi network
2. Launch mobile app
3. Follow on-screen instructions through race sequence:
  - **Distance**: Set track distance (meters)
   - **Drive to Start**: Position vehicle at start line
   - **Ready**: Confirm race readiness  
   - **Running**: Monitor live telemetry during race
   - **Finished**: View race results

### 3) Race flow
1. Vehicle approaches start line (triggers ready state)
2. Vehicle crosses start line (triggers race start timer)
3. App displays real-time speed, acceleration, distance
4. Vehicle crosses finish line (stops timer, shows results)

##  API reference

### Car Unit (192.168.4.1)

#### GET `/data`
Returns real‑time telemetry from the IMU + integration.

**Response:**
```json
{
  "ax": 0.123,      // X acceleration in g (app can scale to m/s²)
  "ay": -0.045,     // Y acceleration in g
  "az": 0.998,      // Z acceleration in g (gravity mostly here)
  "speed": 3.25,    // Current speed (m/s)
  "distance": 12.34 // Integrated distance (m)
}
```

### Start Unit (192.168.4.2)

#### GET `/status`
Returns start line status from VL53L1X.

**Response:**
```json
{
  "distanceMm": 35,     // Distance to object (mm, median‑filtered)
  "ready": true,        // Ready (≤ ~50 mm)
  "triggered": false,   // Start edge seen (≤ ~2 mm)
  "startMs": 1234567,   // Optional when triggered
  "elapsedMs": 420      // Optional when triggered
}
```

### Finish Unit (192.168.4.3)

#### GET `/status`  
Returns finish line status from VL53L1X.

**Response:**
```json
{
  "distance": 0.123,    // Distance to object (m)
  "finished": false     // Finish triggered (≤ ~50 mm)
}
```

## 🔧 Configuration (app)

Key flags in `app/config.js`:

- `USE_DEMO = false` — real hardware mode (demo available via `api.demo`)
- `NEAR_THRESHOLD_MM = 120` — “near” distance to enable Continue on Drive screen
- `READY_THRESHOLD_MM = 60` — “ready” distance for the Ready screen
- `SHOW_DEBUG = false` — show/hide extra raw debug values/buttons
- `ACCEL_UNITS = 'g'` — firmware sends ax/ay/az in g; app scales if needed
- `AUTO_START_ON_READY = false` — set true to auto‑start after stable ready

History keeps last 10 laps and displays best first on Finished screen.

## 🔧 Configuration (firmware)

#### MPU6050 (Car Unit)
- Automatic bias calibration on startup
- ~500 samples for offset correction
- Configurable in `CarUnit/main.cpp`

#### VL53L1X (Start/Finish Units)
- Distance thresholds configurable:
  - Ready: ≤50mm 
  - Trigger: ≤2mm (start), ≤50mm (finish)
- Median filtering for noise reduction

### Network settings
WiFi credentials and IP addresses can be modified in respective unit source files:
```cpp
// CarUnit (AP)
const char* AP_SSID = "RaceTimerNet";    // 192.168.4.1

// StartUnit (STA)
const char* SSID = "RaceTimerNet";       // joins AP
IPAddress   STA_IP(192,168,4,2);

// FinishUnit (STA)
const char* SSID = "RaceTimerNet";
IPAddress   STA_IP_FIN(192,168,4,3);
```

## Troubleshooting

### Common Issues

#### 1) Wi‑Fi / connectivity
- Verify "RaceTimerNet" network is active
- Car must be powered (it hosts the AP at 192.168.4.1)
- Ensure your phone is connected to RaceTimerNet and mobile data is off
- Start/Finish join automatically; the app can also discover alternate IPs

#### 2) Sensors
- Verify I2C wiring (SDA/SCL connections)
- Check 3.3V power supply stability  
- Monitor serial output for sensor initialization errors

#### 3) Mobile app
- Confirm app and ESP8266s are on same network
- Check firewall settings on mobile device
- Test endpoints in a browser (http://192.168.4.1/data, 4.2/status, 4.3/status)
  - iOS: cleartext HTTP is allowed via Info.plist (ATS); Android: usesCleartextTraffic=true

#### 4) Inaccurate measurements
- Recalibrate MPU6050 (restart car unit)
- Clean VL53L1X sensor windows
- Verify sensor mounting and positioning

### Debug Commands

#### Check serial output
```bash
# Monitor car unit
pio device monitor -e car

# Monitor start unit  
pio device monitor -e start

# Monitor finish unit
pio device monitor -e finish
```

#### Test API endpoints
```bash
# Test car unit (replace with actual IP)
curl http://192.168.4.1/data

# Test start unit
curl http://192.168.4.2/status

# Test finish unit  
curl http://192.168.4.3/status
```

##  Performance (indicative)

### Timing / sampling
- **Start/Finish Detection**: <10ms response time
- **Distance Measurement**: ±3mm accuracy (VL53L1X)
- **IMU loop**: ~100 Hz (integration on device)

### Ranges
- **VL53L1X Range**: 4cm to 4m
- **MPU6050 Acceleration**: ±2g to ±16g (configurable)
- **WiFi Range**: ~30m line-of-sight

### Power
- **ESP8266**: ~80mA active, ~20µA deep sleep
- **MPU6050**: ~3.5mA active, ~40µA sleep
- **VL53L1X**: ~20mA active measurement

##  Contributing

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

##  License

This project is licensed under the 0BSD License - see the [LICENSE](LICENSE) file for details.

##  Acknowledgments

- [I2Cdevlib](https://github.com/jrowberg/i2cdevlib) for MPU6050 library
- [Adafruit](https://github.com/adafruit) for VL53L1X library  
- [PlatformIO](https://platformio.org/) for embedded development platform
- [Expo](https://expo.dev/) for React Native development tools

##  Support

Open an issue or PR if something doesn’t work or could be improved.

- **GitHub Issues**: [Report bugs or request features](https://github.com/Wiiifiii/ESP8266-MPU6050-TOF/issues)
- **Documentation**: Check this README and inline code comments
- **Hardware Support**: Refer to ESP8266 and sensor datasheets

---

