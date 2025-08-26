#include "imu_fusion.h"

// Select backend. If your project uses Adafruit, define USE_ADAFRUIT via build_flags.
// Otherwise default to I2Cdevlib when available.
#if defined(USE_ADAFRUIT)
  #include <Adafruit_MPU6050.h>
  #include <Adafruit_Sensor.h>
  #include <Wire.h>
  static Adafruit_MPU6050 mpu;
#elif defined(USE_I2CDEVLIB)
  #include <Wire.h>
  #include <MPU6050.h>
  static MPU6050 mpu;
#else
  #if __has_include(<MPU6050.h>)
    #define USE_I2CDEVLIB
    #include <Wire.h>
    #include <MPU6050.h>
    static MPU6050 mpu;
  #elif __has_include(<Adafruit_MPU6050.h>)
    #define USE_ADAFRUIT
    #include <Adafruit_MPU6050.h>
    #include <Adafruit_Sensor.h>
    #include <Wire.h>
    static Adafruit_MPU6050 mpu;
  #else
    #error "No MPU6050 library found. Install Adafruit_MPU6050 or I2Cdevlib MPU6050."
  #endif
#endif

void ImuFusion::begin() {
  // Assuming bus already begun in main; start if not
  Wire.begin(4, 5);
  delay(50);

  #if defined(USE_ADAFRUIT)
    if (mpu.begin()) {
      mpu.setAccelerometerRange(MPU6050_RANGE_8_G);
      mpu.setGyroRange(MPU6050_RANGE_500_DEG);
      mpu.setFilterBandwidth(MPU6050_BAND_21_HZ);
      delay(10);
    }
  #elif defined(USE_I2CDEVLIB)
    mpu.initialize();
    mpu.setFullScaleAccelRange(MPU6050_ACCEL_FS_2);
    mpu.setFullScaleGyroRange(MPU6050_GYRO_FS_250);
    delay(10);
  #endif

  calibrate();
  lastUs = micros();
  sampWinUs = lastUs;
}

bool ImuFusion::readScaled(float& ax_g, float& ay_g, float& az_g, float& gx_dps, float& gy_dps, float& gz_dps) {
  #if defined(USE_ADAFRUIT)
    sensors_event_t a, g, temp;
    if (!mpu.begin()) return false;
    mpu.getEvent(&a, &g, &temp);
    ax_g = a.acceleration.x / G;
    ay_g = a.acceleration.y / G;
    az_g = a.acceleration.z / G;
    gx_dps = g.gyro.x * 57.29578f;
    gy_dps = g.gyro.y * 57.29578f;
    gz_dps = g.gyro.z * 57.29578f;
    return true;
  #elif defined(USE_I2CDEVLIB)
    int16_t ax, ay, az, gx, gy, gz;
    mpu.getMotion6(&ax,&ay,&az,&gx,&gy,&gz);
    ax_g = ax / 16384.0f;   // ±2g
    ay_g = ay / 16384.0f;
    az_g = az / 16384.0f;
    gx_dps = gx / 131.0f;   // ±250 dps
    gy_dps = gy / 131.0f;
    gz_dps = gz / 131.0f;
    return true;
  #else
    return false;
  #endif
}

void ImuFusion::calibrate() {
  const int N = 400;
  double ax=0, ay=0, az=0, gx=0, gy=0, gz=0;
  for (int i=0; i<N; ++i) {
    float axg,ayg,azg,gxd,gyd,gzd;
    if (readScaled(axg,ayg,azg,gxd,gyd,gzd)) {
      ax += axg; ay += ayg; az += azg; gx += gxd; gy += gyd; gz += gzd;
    }
    delay(4);
  }
  bias.ax = ax/N; bias.ay = ay/N; bias.az = az/N;
  bias.gx = gx/N; bias.gy = gy/N; bias.gz = gz/N;
}

void ImuFusion::update() {
  unsigned long nowUs = micros();
  float dt = (nowUs - lastUs) * 1e-6f;
  lastUs = nowUs;
  if (dt <= 0 || dt > 0.1f) dt = 0.0f; // clamp long stalls

  float axg,ayg,azg,gxd,gyd,gzd;
  if (!readScaled(axg,ayg,azg,gxd,gyd,gzd)) return;

  // bias-correct
  axg -= bias.ax; ayg -= bias.ay; azg -= bias.az;
  gxd -= bias.gx; gyd -= bias.gy; gzd -= bias.gz;

  // Save bias-corrected raw (g/deg/s)
  st.ax_g = axg; st.ay_g = ayg; st.az_g = azg;
  st.gx_dps = gxd; st.gy_dps = gyd; st.gz_dps = gzd;

  // Complementary filter for pitch/roll (degrees)
  float pitchAcc = atan2f(axg, sqrtf(ayg*ayg + azg*azg)) * 57.29578f;
  float rollAcc  = atan2f(ayg, azg) * 57.29578f;
  st.pitchDeg = ALPHA_COMP*(st.pitchDeg + gxd*dt) + (1.0f-ALPHA_COMP)*pitchAcc;
  st.rollDeg  = ALPHA_COMP*(st.rollDeg  + gyd*dt) + (1.0f-ALPHA_COMP)*rollAcc;

  // Gravity along forward X in g
  float sp = sinf(st.pitchDeg*0.0174533f);
  float gxg = -sp;

  // Linear accel X (m/s^2), low-pass
  float ax_lin = (axg - gxg) * G;
  st.aF_mps2 = lpf(st.aF_mps2, ax_lin, LPF_A);

  // Integrate to speed with leak
  st.speed_mps += st.aF_mps2 * dt;
  st.speed_mps *= LEAK;

  // ZUPT when calm
  float gyroSum = fabsf(gxd)+fabsf(gyd)+fabsf(gzd);
  if (fabsf(st.aF_mps2) < ZUPT_A && gyroSum < ZUPT_G) {
    st.speed_mps = 0;
  }

  // Integrate distance
  st.distance_m += st.speed_mps * dt;

  // Sample rate estimate every 0.5 s
  ++sampCount;
  if (nowUs - sampWinUs >= 500000) {
    st.sampleHz = sampCount / ((nowUs - sampWinUs)*1e-6f);
    sampWinUs = nowUs; sampCount = 0;
  }
}
