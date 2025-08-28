/**
 * Project: ESP8266-MPU6050-TOF
 * File: CarUnit/imu_fusion.h
 * Role: CAR unit firmware (IMU fusion interface)
 * Summary:
 *  - Gravity removal: subtract gravity estimated from pitch/roll before integrating.
 *  - LPF: low-pass filter linear acceleration to reduce noise.
 *  - ZUPT: zero-velocity update when both accel and gyro indicate stillness.
 *  - Forward-axis learn: pick body axis and sign that best matches forward accel.
 * Notes:
 *  - Tunables chosen for stability over absolute accuracy.
 *  - Behavior preserved; comments only.
 */
#pragma once
#include <Arduino.h>

struct ImuBias { float ax=0, ay=0, az=0, gx=0, gy=0, gz=0; };

struct ImuState {
  // raw (g, deg/s) after bias removal
  float ax_g=0, ay_g=0, az_g=0, gx_dps=0, gy_dps=0, gz_dps=0;

  // orientation (deg)
  float pitchDeg=0, rollDeg=0;

  // linear accel in forward X (m/s^2) and integrated speed (m/s)
  float aF_mps2=0;
  float speed_mps=0;

  // integrated distance (m)
  float distance_m=0;

  // optional diagnostics
  float sampleHz=0;

  // NEW: gravity-removed linear acceleration (m/s^2) in body axes
  float aX_mps2=0, aY_mps2=0, aZ_mps2=0;
  // convenience: lateral (Y) & vertical (Z) in body frame
  float aLat_mps2=0, aVert_mps2=0;
};

class ImuFusion {
public:
  enum Axis { X=0, Y=1, Z=2 };
  void begin();
  void update();
  const ImuState& state() const { return st; }

  void setForward(Axis axis, int sign) { fwdAxis = axis; fwdSign = (sign >= 0) ? 1 : -1; }
  void beginLearnForward();
  bool endLearnForward(); // returns true if a forward axis was found and set

private:
  bool readScaled(float& ax_g, float& ay_g, float& az_g, float& gx_dps, float& gy_dps, float& gz_dps);
  void calibrate();
  float lpf(float prev, float x, float a) { return prev + a*(x - prev); }

  ImuBias bias;
  ImuState st;
  unsigned long lastUs = 0;
  unsigned long sampWinUs = 0;
  uint16_t sampCount = 0;

  // forward-axis selection
  Axis fwdAxis = X;
  int  fwdSign = +1;
  bool learning = false;
  uint16_t learnCount = 0;
  float sumX=0,sumY=0,sumZ=0, sumAbsX=0,sumAbsY=0,sumAbsZ=0;

  // LPF state for linear accel on each axis
  float aX_lpf=0, aY_lpf=0, aZ_lpf=0;

  // tunables
  const float ALPHA_COMP = 0.98f;    // complementary filter weight
  const float LPF_A      = 0.20f;    // low-pass filter factor
  const float LEAK       = 0.9990f;  // speed leak per update
  const float ZUPT_A     = 0.20f;    // accel stillness threshold (m/s^2)
  const float ZUPT_G     = 5.0f;     // gyro stillness threshold (deg/s sum)
  const float G          = 9.80665f; // gravity
};
