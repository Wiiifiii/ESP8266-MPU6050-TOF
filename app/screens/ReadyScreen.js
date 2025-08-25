// screens/ReadyScreen.js
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import StepperHeader from '../components/StepperHeader';
import { getStart, startDemoRun } from '../api';
import { useLap } from '../context/LapContext';
import { READY_THRESHOLD_MM, SHOW_DEBUG, AUTO_START_ON_READY } from '../config';

export default function ReadyScreen({ navigation }) {
  const { setStartTime } = useLap();
  const [distanceMm, setDistanceMm] = useState(null);
  const [ready, setReady] = useState(false);

  const pollRef = useRef(null);
  const readySinceRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    async function tick() {
      try {
  const { data } = await getStart();
        if (!mounted) return;

  // Use either distanceMm or distance from firmware
  const mm = Number(data?.distanceMm ?? data?.distance ?? NaN);
  setDistanceMm(Number.isFinite(mm) ? mm : null);

  // Compute ready locally from mm
  const isReady = Number.isFinite(mm) && mm > 0 && mm <= READY_THRESHOLD_MM;
  setReady(isReady);

        if (AUTO_START_ON_READY) {
          const now = Date.now();
          if (isReady) {
            if (!readySinceRef.current) readySinceRef.current = now;
            if (now - readySinceRef.current >= 600) {
              beginRun();
              return;
            }
          } else {
            readySinceRef.current = null;
          }
        }
      } catch {
        // ignore transient errors; keep polling
      } finally {
        pollRef.current = setTimeout(tick, 250);
      }
    }

    tick();
    return () => {
      mounted = false;
      clearTimeout(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function beginRun() {
    clearTimeout(pollRef.current);
    setStartTime(Date.now());
    if (typeof startDemoRun === 'function') startDemoRun();
    navigation.replace('Running');
  }

  const nearText = distanceMm == null ? '—' : `${distanceMm} mm`;

  return (
    <View style={{ flex: 1 }}>
      <StepperHeader stepIndex={3} />
      <View style={{ padding: 20, gap: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: '800' }}>Get ready</Text>
  <Text style={{ color: '#666' }}>Move car within ≤ {READY_THRESHOLD_MM} mm.</Text>

        <View style={{
          borderWidth: 1, borderColor: ready ? '#1a7f37' : '#eee',
          borderRadius: 16, padding: 16, gap: 8
        }}>
          <Row label="Distance to start" value={nearText} />
          <Row label="Ready" value={ready ? 'YES' : 'NO'} valueStyle={{ color: ready ? '#1a7f37' : '#c00', fontWeight: '800' }} />
          {SHOW_DEBUG && <Text style={{ color:'#999', fontSize:12 }}>Raw: {distanceMm == null ? '—' : `${distanceMm} mm`}</Text>}
        </View>

        <Pressable
          onPress={beginRun}
          disabled={!ready}
          style={({ pressed }) => ({
            backgroundColor: ready ? '#6c47ff' : '#ccc',
            paddingVertical: 14,
            borderRadius: 12,
            alignItems: 'center',
            opacity: pressed ? 0.85 : 1
          })}
        >
          <Text style={{ color: 'white', fontWeight: '700' }}>Start lap</Text>
        </Pressable>

        <Text style={{ color: '#999', fontSize: 12 }}>
          Tip: Press “Start lap” when you’re ready. Auto-start is disabled.
        </Text>
      </View>
    </View>
  );
}

function Row({ label, value, valueStyle }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <Text style={{ color: '#666' }}>{label}</Text>
      <Text style={[{ fontWeight: '800' }, valueStyle]}>{value}</Text>
    </View>
  );
}
