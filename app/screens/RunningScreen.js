// app/screens/RunningScreen.js
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import StepperHeader from '../components/StepperHeader';
import { getCar, getFinish } from '../api';
import { useLap } from '../context/LapContext';
import { computeMetrics } from '../utils/metrics';

export default function RunningScreen({ navigation }) {
  const {
    trackDistance,
    startTime, setStartTime,
    endTime, setEndTime,
    readings, setReadings,
    setLastSummary, setLapHistory,
  } = useLap();

  const [tick, setTick] = useState(0); // repaint timer
  const timerRef = useRef(null);

  useEffect(() => {
    // ensure start time exists (demo/real)
    if (!startTime) setStartTime(Date.now());

    let isMounted = true;
    const loop = async () => {
      try {
        const [{ data: car }, { data: fin }] = await Promise.all([getCar(), getFinish()]);
        if (!isMounted) return;

        setReadings(prev => {
          const item = { t: Date.now(), ...car }; // expects {speed, ax, ay, az, distance}
          const next = [...prev, item];
          // keep last 2000 samples max
          return next.length > 2000 ? next.slice(-2000) : next;
        });

        if (fin?.finished) {
          const ended = Date.now();
          setEndTime(ended);

          const summary = computeMetrics({
            readings,
            trackDistance: Number(trackDistance) || 0,
            startTime: startTime || Date.now(),
            endTime: ended,
          });
          setLastSummary(summary);
          setLapHistory(prev => [summary, ...(prev || [])].slice(0, 10));

          navigation.replace('Finished');
          return; // stop loop
        }
      } catch (e) {
        // ignore transient errors during run; UI will keep ticking
      } finally {
        // schedule next tick
        if (isMounted) timerRef.current = setTimeout(loop, 150);
      }
    };

    timerRef.current = setTimeout(loop, 150);

    // paint timer
    const paint = setInterval(() => setTick(x => x + 1), 80);

    return () => {
      isMounted = false;
      clearTimeout(timerRef.current);
      clearInterval(paint);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const now = Date.now();
  const elapsedMs = Math.max(0, (endTime ?? now) - (startTime ?? now));
  const secs = (elapsedMs / 1000);
  const secsText = `${Math.floor(secs).toString().padStart(2, '0')}.${Math.floor((secs % 1) * 1000).toString().padStart(3,'0')}`;

  return (
    <View style={{ flex: 1 }}>
      <StepperHeader stepIndex={4} />
      <View style={{ padding: 20, gap: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: '700' }}>Running…</Text>

        {/* Big timer */}
        <Text style={{ fontSize: 48, fontWeight: '800', letterSpacing: 1 }}>{secsText} s</Text>

        {/* Simple live stats from last reading */}
        <LiveStats readings={readings} />
      </View>

      {/* Optional stop button for demo/testing */}
      <View style={{ padding: 20, marginTop: 'auto' }}>
        <Pressable
          onPress={() => navigation.replace('Finished')}
          style={({ pressed }) => ({
            backgroundColor: '#eee',
            paddingVertical: 12,
            borderRadius: 10,
            alignItems: 'center',
            opacity: pressed ? 0.8 : 1
          })}
        >
          <Text style={{ fontWeight: '600' }}>Force Finish (debug)</Text>
        </Pressable>
      </View>
    </View>
  );
}

function LiveStats({ readings }) {
  const last = readings?.[readings.length - 1] || {};
  const speed = Number(last.speed ?? 0);
  const ax = Number(last.ax ?? 0), ay = Number(last.ay ?? 0);
  const accel = Math.hypot(ax, ay);

  return (
    <View style={{ flexDirection: 'row', gap: 16 }}>
      <Stat label="Speed" value={`${speed.toFixed(2)} m/s`} />
      <Stat label="Accel" value={`${accel.toFixed(2)} m/s²`} />
    </View>
  );
}

function Stat({ label, value }) {
  return (
    <View style={{ flex: 1, borderWidth: 1, borderColor: '#eee', borderRadius: 12, padding: 14 }}>
      <Text style={{ color: '#666', marginBottom: 4 }}>{label}</Text>
      <Text style={{ fontSize: 20, fontWeight: '700' }}>{value}</Text>
    </View>
  );
}
