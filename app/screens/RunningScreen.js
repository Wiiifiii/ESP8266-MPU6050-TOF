// screens/RunningScreen.js
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import StepperHeader from '../components/StepperHeader';
import { getCar, getFinish } from '../api';
import { useLap } from '../context/LapContext';
import { computeMetrics } from '../utils/metrics';
import { SHOW_DEBUG, FINISH_TOO_CLOSE_UI_MM } from '../config';
import { useTelemetry } from '../hooks/useTelemetry';
import { lapStore } from '../state/lapStore';

export default function RunningScreen({ navigation }) {
  const { trackDistance, startTime, endTime, setEndTime, readings, setReadings, setLastSummary, setLapHistory } = useLap();
  const prevFinished = useRef(false);
  const finishingLock = useRef(false);
  const armedRef = useRef(true);           // start armed; re-arm after idle
  const lastFinishChangeRef = useRef(0);   // hold-off timer

  // Use new telemetry hook (fixed IP endpoints to match firmware)
  const endpoints = { car: 'http://192.168.4.1', start: 'http://192.168.4.2', finish: 'http://192.168.4.3' };
  const { elapsedMs, car, start, finish, lastSeen } = useTelemetry(endpoints, true);

  // Append latest car sample into readings for metrics/history
  useEffect(() => {
    const now = Date.now();
    setReadings(prev => {
      const item = { t: now, ...car };
      const next = [...prev, item];
      return next.length > 2000 ? next.slice(-2000) : next;
    });
  }, [car?.speed, car?.accel, car?.pitch, car?.roll, car?.ax, car?.ay, car?.az, car?.distance]);

  // Decide robust finish signal: require freshness + boolean OR near distance
  const FINISH_ON_MM_UI = Math.max(FINISH_TOO_CLOSE_UI_MM, 45);
  const FRESH_MS = 1500;
  const HOLD_MS  = 500;  // hold-off from start
  const DWELL_MS = 250;  // continuous true dwell to allow fail-safe
  const nowTs = Date.now();
  const seenFinish = !!lastSeen?.finish && (nowTs - (lastSeen.finish ?? 0) < FRESH_MS);
  const fBool = finish?.finished === true || finish?.finished === 'true';
  const fNear = (typeof finish?.distanceMm === 'number') && (finish.distanceMm <= FINISH_ON_MM_UI);
  const fFresh = seenFinish && (fBool || fNear);   // ← only trust fresh signals

  // UI tri-state with freshness and distance display
  // (keep tri-state UI; this uses a looser 2s 'seen' window for display)
  const FRESH_MS_UI = 2000;
  const seenFinishUI = !!lastSeen?.finish && (nowTs - (lastSeen.finish ?? 0) < FRESH_MS_UI);
  const hasMm = typeof finish?.distanceMm === 'number';
  let finishState = 'N/A';
  if (seenFinishUI) finishState = (fBool || fNear) ? 'TRIGGERED' : 'IDLE';

  // Touch-to-finish fail-safe support
  const runStartRef = useRef(Date.now());
  const firstTrueTsRef = useRef(null);
  const sawFalseRef = useRef(false);

  // Initialize on mount (RUNNING begins)
  useEffect(() => {
    runStartRef.current = Date.now();
    armedRef.current = false;
    prevFinished.current = false;
    lastFinishChangeRef.current = Date.now();
    firstTrueTsRef.current = null;
    sawFalseRef.current = false;
  }, []);

  // Maintain arming after idle (>500ms no finish)
  useEffect(() => {
    const now = Date.now();
    const raw = fFresh; // only fresh signals affect arming/edges
    const prev = prevFinished.current;
    if (raw !== prev) lastFinishChangeRef.current = now;
    if (!raw) {
      sawFalseRef.current = true;           // observed idle
      firstTrueTsRef.current = null;        // reset dwell
      // arm when sensor has been idle (no true) for ≥500 ms
      if (now - lastFinishChangeRef.current >= HOLD_MS) armedRef.current = true;
    } else if (firstTrueTsRef.current == null) {
      firstTrueTsRef.current = now;         // start dwell on first TRUE
    }
    prevFinished.current = raw;
  }, [fFresh]);

  // Finish decision: normal rising-edge OR fail-safe dwell
  useEffect(() => {
    const now = Date.now();
    const holdOkNormal = (now - lastFinishChangeRef.current) >= HOLD_MS; // stability window for normal
    const holdOkStart  = (now - runStartRef.current) >= HOLD_MS;         // startup hold-off
    const dwellOk = firstTrueTsRef.current != null && (now - firstTrueTsRef.current) >= DWELL_MS;

    const canFinishNormal   = fFresh && holdOkNormal && armedRef.current && !finishingLock.current;
    const canFinishFailSafe = fFresh && holdOkStart  && dwellOk && !sawFalseRef.current && !finishingLock.current;

    if (canFinishNormal || canFinishFailSafe) {
      finishingLock.current = true;
      armedRef.current = false;
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
    }
  }, [fFresh, car?.speed, car?.accel]);

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
          {(() => { const g=9.80665; const af=car?.accel; const afg = af!=null ? (af/g) : undefined; return (
            <>
              <Row label="Accel F (m/s²)" value={num(af)} />
              <Row label="Accel F (g)" value={afg!=null ? afg.toFixed(2) : '—'} />
            </>
          ); })()}
          <Row label="Accel Lat (m/s²)" value={num(car?.aLat)} />
          <Row label="Accel Vert (m/s²)" value={num(car?.aVert)} />
          <Row label="Pitch (°)" value={num(car?.pitch,1)} />
          <Row label="Roll (°)" value={num(car?.roll,1)} />
          <Row label="Distance (m)" value={num(car?.distance,2)} />
          <Row label="Start dist (mm)" value={num(start?.distanceMm,0)} />
          <Row label="Start ready" value={start?.ready ? '✓' : '—'} />
      <Row label="Finish" value={ finishState + (hasMm ? ` (${Math.round(finish.distanceMm)} mm)` : '') } />
          {SHOW_DEBUG && (
            <>
              <Row label="Finish.bool" value={String(finish?.finished)} />
        <Row label="Finish.mm" value={typeof finish?.distanceMm==='number' ? String(Math.round(finish.distanceMm)) : '—'} />
            </>
          )}
          <Row label="ax (m/s²)" value={num(car?.ax,3)} />
          <Row label="ay (m/s²)" value={num(car?.ay,3)} />
          <Row label="az (m/s²)" value={num(car?.az,3)} />
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
