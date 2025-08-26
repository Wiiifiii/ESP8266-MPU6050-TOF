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
};

class ImuFusion {
public:
  void begin();
  void update();
  const ImuState& state() const { return st; }

private:
  bool readScaled(float& ax_g, float& ay_g, float& az_g, float& gx_dps, float& gy_dps, float& gz_dps);
  void calibrate();
  float lpf(float prev, float x, float a) { return prev + a*(x - prev); }

  ImuBias bias;
  ImuState st;
  unsigned long lastUs = 0;
  unsigned long sampWinUs = 0;
  uint16_t sampCount = 0;

  // tunables
  const float ALPHA_COMP = 0.98f;    // complementary filter weight
  const float LPF_A      = 0.20f;    // low-pass filter factor
  const float LEAK       = 0.9990f;  // speed leak per update
  const float ZUPT_A     = 0.20f;    // accel stillness threshold (m/s^2)
  const float ZUPT_G     = 5.0f;     // gyro stillness threshold (deg/s sum)
  const float G          = 9.80665f; // gravity
};
