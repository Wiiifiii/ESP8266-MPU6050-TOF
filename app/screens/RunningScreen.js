import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import StepperHeader from '../components/StepperHeader';
import { getCar, getFinish } from '../api';
import { useLap } from '../context/LapContext';
import { computeMetrics } from '../utils/metrics';
import { ACCEL_SCALE, SHOW_DEBUG } from '../config';

export default function RunningScreen({ navigation }) {
  const {
    trackDistance, startTime, setStartTime,
    endTime, setEndTime,
    readings, setReadings,
    setLastSummary, setLapHistory,
  } = useLap();

  const [live, setLive] = useState({ speed: 0, accel: 0, distance: 0 });
  const timerRef = useRef(null);
  const prevRef = useRef(null);

  useEffect(() => {
    if (!startTime) setStartTime(Date.now());
    let mounted = true;

    const loop = async () => {
      try {
        const [{ data: car }, { data: fin }] = await Promise.all([
          getCar().catch(() => ({ data: {} })),
          getFinish().catch(() => ({ data: {} })),
        ]);
        if (!mounted) return;

        const now = Date.now();
        const ax = Number(car.ax); const ay = Number(car.ay);
        let accelMag = (Number.isFinite(ax) && Number.isFinite(ay)) ? Math.hypot(ax, ay) * ACCEL_SCALE : NaN;

        const dist = Number(car.distance);
        let spd = Number(car.speed);

        // Fallbacks:
        const prev = prevRef.current;
        if ((!Number.isFinite(spd) || spd < 0) && Number.isFinite(dist) && prev && Number.isFinite(prev.distance)) {
          const dt = (now - prev.t) / 1000;
          if (dt > 0.02) spd = Math.max(0, (dist - prev.distance) / dt); // m/s
        }
        if ((!Number.isFinite(accelMag) || accelMag < 0) && prev && Number.isFinite(spd) && Number.isFinite(prev.speed)) {
          const dt = (now - prev.t) / 1000;
          if (dt > 0.02) accelMag = (spd - prev.speed) / dt;             // m/s^2
        }

        prevRef.current = { t: now, speed: spd, distance: dist };

        setLive({
          speed: Number.isFinite(spd) ? spd : 0,
          accel: Number.isFinite(accelMag) ? accelMag : 0,
          distance: Number.isFinite(dist) ? dist : 0,
        });

        setReadings(prevArr => {
          const item = { t: now, ...car, speed: spd, accel: accelMag, distance: dist };
          const next = [...prevArr, item];
          return next.length > 2000 ? next.slice(-2000) : next;
        });

        if (fin && (fin.finished === true || fin.finished === 1)) {
          const ended = Date.now();
          setEndTime(ended);
          const summary = computeMetrics({
            readings: [...(readings || []), { t: now, ...car, speed: spd, accel: accelMag, distance: dist }],
            trackDistance: Number(trackDistance) || 0,
            startTime: startTime || now,
            endTime: ended,
          });
          setLastSummary(summary);
          setLapHistory(prev => [summary, ...(prev || [])].slice(0, 10));
          navigation.replace('Finished');
          return;
        }
      } finally {
        timerRef.current = setTimeout(loop, 120);
      }
    };

    timerRef.current = setTimeout(loop, 120);
    return () => { mounted = false; clearTimeout(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const now = Date.now();
  const elapsedMs = Math.max(0, (endTime ?? now) - (startTime ?? now));
  const secs = elapsedMs / 1000;
  const secsText = `${Math.floor(secs).toString().padStart(2,'0')}.${Math.floor((secs % 1)*1000).toString().padStart(3,'0')}`;

  return (
    <View style={{ flex: 1 }}>
      <StepperHeader stepIndex={4} />
      <View style={{ padding: 20, gap: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: '800' }}>Running…</Text>
        <Text style={{ fontSize: 48, fontWeight: '900' }}>{secsText} s</Text>

        <Row label="Distance" value={`${live.distance.toFixed(2)} m`} />
        <Row label="Speed"    value={`${live.speed.toFixed(2)} m/s`} />
        <Row label="Accel"    value={`${live.accel.toFixed(2)} m/s²`} />
        {SHOW_DEBUG && <Text style={{ color:'#999', fontSize:12 }}>Raw: {JSON.stringify(live)}</Text>}
      </View>

      <View style={{ padding: 20, marginTop: 'auto' }}>
        <Pressable
          onPress={() => navigation.replace('Finished')}
          style={({ pressed }) => ({ backgroundColor:'#eee', paddingVertical:12, borderRadius:10, alignItems:'center', opacity:pressed?0.8:1 })}
        >
          <Text style={{ fontWeight:'600' }}>Force Finish (debug)</Text>
        </Pressable>
      </View>
    </View>
  );
}

function Row({ label, value }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <Text style={{ color:'#666' }}>{label}</Text>
      <Text style={{ fontWeight:'800' }}>{value}</Text>
    </View>
  );
}
