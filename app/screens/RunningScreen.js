// screens/RunningScreen.js
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import StepperHeader from '../components/StepperHeader';
import { getCar, getFinish } from '../api';
import { useLap } from '../context/LapContext';
import { computeMetrics } from '../utils/metrics';
import { SHOW_DEBUG } from '../config';
import { useTelemetry } from '../hooks/useTelemetry';
import { lapStore } from '../state/lapStore';

export default function RunningScreen({ navigation }) {
  const { trackDistance, startTime, endTime, setEndTime, readings, setReadings, setLastSummary, setLapHistory } = useLap();
  const prevFinished = useRef(false);
  const finishingLock = useRef(false);

  // Use new telemetry hook (fixed IP endpoints to match firmware)
  const endpoints = { car: 'http://192.168.4.1', start: 'http://192.168.4.2', finish: 'http://192.168.4.3' };
  const { elapsedMs, car, start, finish } = useTelemetry(endpoints, true);

  // Append latest car sample into readings for metrics/history
  useEffect(() => {
    const now = Date.now();
    setReadings(prev => {
      const item = { t: now, ...car };
      const next = [...prev, item];
      return next.length > 2000 ? next.slice(-2000) : next;
    });
  }, [car?.speed, car?.accel, car?.pitch, car?.roll, car?.ax, car?.ay, car?.az, car?.distance]);

  // Rising-edge guard for finish
  useEffect(() => {
    const f = !!(finish && (finish.finished === true || finish.finished === 1));
    if (f && !prevFinished.current && !finishingLock.current) {
      finishingLock.current = true;
      const now = Date.now();
      setEndTime(now);
      const summary = computeMetrics({ readings: [...(readings || []), { t: now, ...car }], trackDistance: Number(trackDistance) || 0, startTime: startTime || now, endTime: now });
      setLastSummary(summary);
      setLapHistory(prev => [summary, ...(prev || [])].slice(0, 10));
      // Push to lapStore for the new History panel (idempotent by id)
      const lap = {
        id: String(startTime || now),
        startedAt: startTime || now,
        endedAt: now,
        timeMs: summary?.elapsedMs || (now - (startTime || now)),
        stats: { maxSpeed: summary?.topSpeed, maxAccel: summary?.maxAccel }
      };
      lapStore.closeAndPush(lap);
      navigation.replace('Finished');
      setTimeout(() => { finishingLock.current = false; }, 300);
      return;
    }
    prevFinished.current = f;
  }, [finish?.finished, car?.speed, car?.accel]);

  const prettyMs = (ms) => {
    const s = Math.floor(ms/1000);
    const m = Math.floor(s/60);
    const sec = (s % 60).toString().padStart(2,'0');
    const ms2 = Math.floor((ms%1000)/10).toString().padStart(2,'0');
    return `${m}:${sec}.${ms2}`;
  };
  const num = (n, d=2) => n==null || Number.isNaN(n) ? '—' : Number(n).toFixed(d);

  return (
    <View style={{ flex: 1 }}>
      <StepperHeader stepIndex={4} />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 36, fontWeight: '900' }}>{prettyMs(elapsedMs)}</Text>
        <View style={{ borderWidth:1, borderColor:'#eee', borderRadius:12, padding:12, marginTop:12 }}>
          <Row label="Speed (m/s)" value={num(car?.speed)} />
          <Row label="Speed (km/h)" value={num(car?.speed != null ? car.speed*3.6 : undefined)} />
          <Row label="Accel (m/s²)" value={num(car?.accel)} />
          <Row label="Pitch (°)" value={num(car?.pitch,1)} />
          <Row label="Roll (°)" value={num(car?.roll,1)} />
          <Row label="Distance (m)" value={num(car?.distance,2)} />
          <Row label="Start dist (mm)" value={num(start?.distanceMm,0)} />
          <Row label="Start ready" value={start?.ready ? '✓' : '—'} />
          <Row label="Finish" value={finish?.finished ? 'TRIGGERED' : '—'} />
          <Row label="ax (g)" value={num(car?.ax,3)} />
          <Row label="ay (g)" value={num(car?.ay,3)} />
          <Row label="az (g)" value={num(car?.az,3)} />
          <Row label="RSSI" value={num(car?.rssi,0)} />
          <Row label="Sample Hz" value={num(car?.sampleHz,1)} />
        </View>
        {SHOW_DEBUG && <Text style={{ color:'#999', fontSize:12, marginTop:8 }}>Raw: {JSON.stringify({car,start,finish})}</Text>}
      </ScrollView>

      {SHOW_DEBUG && (
        <View style={{ padding: 20, marginTop: 'auto' }}>
          <Pressable onPress={() => navigation.replace('Finished')}
            style={({ pressed }) => ({ backgroundColor:'#eee', paddingVertical:12, borderRadius:10, alignItems:'center', opacity:pressed?0.8:1 })}>
            <Text style={{ fontWeight:'600' }}>Force Finish (debug)</Text>
          </Pressable>
        </View>
      )}
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
