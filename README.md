# ESP8266-MPU6050-TOF

Three-unit lap timer:
- Car (MPU6050 IMU): `/data` → speed, accel, pitch/roll.
- Start (VL53L1X): `/status` → {distanceMm, ready}.
- Finish (VL53L1X): `/status` → {distanceMm, finished}.

## Firmware (PlatformIO)
- Car (AP): `192.168.4.1`
- Start (STA): `192.168.4.2`
- Finish (STA): `192.168.4.3`

Build & upload:

```

pio device list
pio run -e car    -t upload --upload-port COMx
pio run -e start  -t upload --upload-port COMy
pio run -e finish -t upload --upload-port COMz

```

Thresholds (Finish) switch via `platformio.ini`:
- Indoor: `-DFINISH_ON_MM=50 -DFINISH_OFF_MM=80 -DTIMING_BUDGET_MS=100`
- Track : `-DFINISH_ON_MM=120 -DFINISH_OFF_MM=180 -DTIMING_BUDGET_MS=50`

## App (Expo)
```

cd app
npm i
npx expo start -c

```
- `USE_DEMO=false` for real hardware.
- Auto-discovers Start/Finish via `/whoami`.
- Running screen ends lap on fresh rising edge; fallback dwell for table tests.
- History: best lap pinned + last 10 recent.

## Notes
- Car supports Auto-set Forward (orientation-agnostic).
- Finish treats 0 mm as “very close”.
- Optional footer shows live connectivity; toggle in `app/config.js`.
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

