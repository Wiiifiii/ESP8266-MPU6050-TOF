// app/screens/ReadyScreen.js
// screens/ReadyScreen.js
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import StepperHeader from '../components/StepperHeader';
import { getStart, startDemoRun } from '../api';
import { useLap } from '../context/LapContext';

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

        setDistanceMm(Number(data?.distanceMm ?? data?.distance ?? 0));
        const isReady = !!data?.ready;
        setReady(isReady);

        const now = Date.now();
        if (isReady) {
          if (!readySinceRef.current) readySinceRef.current = now;
          // auto-advance if ready has been continuously true for 600ms
          if (now - readySinceRef.current >= 600) {
            beginRun();
            return; // stop polling, navigate happens in beginRun
          }
        } else {
          readySinceRef.current = null;
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
        <Text style={{ color: '#666' }}>Move the car to the start zone until it’s detected.</Text>

        <View style={{
          borderWidth: 1, borderColor: ready ? '#1a7f37' : '#eee',
          borderRadius: 16, padding: 16, gap: 8
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: '#666' }}>Distance to start</Text>
            <Text style={{ fontWeight: '700' }}>{nearText}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: '#666' }}>Ready</Text>
            <Text style={{ fontWeight: '800', color: ready ? '#1a7f37' : '#c00' }}>
              {ready ? 'YES' : 'NO'}
            </Text>
          </View>
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
          <Text style={{ color: 'white', fontWeight: '700' }}>Start run</Text>
        </Pressable>

        <Text style={{ color: '#999', fontSize: 12 }}>
          Tip: This advances automatically once “Ready” stays true for ~0.6s.
        </Text>
      </View>
    </View>
  );
}
