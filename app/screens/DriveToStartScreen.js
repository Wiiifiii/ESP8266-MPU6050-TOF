// screens/DriveToStartScreen.js
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import StepperHeader from '../components/StepperHeader';
import { getStart } from '../api';
import { NEAR_THRESHOLD_MM, SHOW_DEBUG } from '../config';
import { useLap } from '../context/LapContext';

const READY_NEAR_MM = NEAR_THRESHOLD_MM; // show "Continue" when within threshold

export default function DriveToStartScreen({ navigation }) {
  const { trackDistance } = useLap();
  const [distanceMm, setDistanceMm] = useState(null);
  const [near, setNear] = useState(false);
  const pollRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    async function tick() {
      try {
        const { data } = await getStart();
        if (!mounted) return;
        const mm = Number(data?.distanceMm ?? data?.distance ?? NaN);
        setDistanceMm(Number.isFinite(mm) ? mm : null);
        setNear(Number.isFinite(mm) && mm <= READY_NEAR_MM);
      } catch {
        // keep previous values on transient errors
      } finally {
        pollRef.current = setTimeout(tick, 250);
      }
    }
    tick();
    return () => {
      mounted = false;
      clearTimeout(pollRef.current);
    };
  }, []);

  const mm = distanceMm ?? NaN;
  const ratio = Number.isFinite(mm)
    ? Math.max(0, Math.min(1, 1 - (mm / READY_NEAR_MM)))
    : 0;

  return (
    <View style={{ flex: 1 }}>
      <StepperHeader stepIndex={2} />
      <View style={{ padding: 20, gap: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: '800' }}>Drive to start area</Text>
        <Text style={{ color: '#666' }}>
          Track: <Text style={{ fontWeight: '700' }}>{Number(trackDistance)} m</Text>. Move the car toward the start sensor until it’s close enough.
        </Text>

        <View style={{ borderWidth: 1, borderColor: near ? '#1a7f37' : '#eee', borderRadius: 16, padding: 16, gap: 12 }}>
          <Row label="Distance to start" value={Number.isFinite(mm) ? `${mm} mm` : '—'} bold />
          <Row
            label="Near enough"
            value={near ? 'YES' : 'NO'}
            valueStyle={{ color: near ? '#1a7f37' : '#c00', fontWeight: '800' }}
          />

          {/* Progress toward near-threshold */}
          <View style={{ height: 10, backgroundColor: '#eee', borderRadius: 999, overflow: 'hidden', marginTop: 6 }}>
            <View style={{ height: '100%', width: `${ratio * 100}%`, backgroundColor: near ? '#1a7f37' : '#6c47ff' }} />
          </View>
          <Text style={{ color: '#999', fontSize: 12 }}>
            Hint: The button enables at ≤ {READY_NEAR_MM} mm. Next screen will arm the start and auto-begin when fully ready.
          </Text>
          {SHOW_DEBUG && (
            <Text style={{ color:'#999', fontSize:12, marginTop:6 }}>
              Raw: {Number.isFinite(mm) ? mm : '—'} mm
            </Text>
          )}
        </View>

        <Pressable
          onPress={() => navigation.navigate('Ready')}
          disabled={!near}
          style={({ pressed }) => ({
            backgroundColor: near ? '#6c47ff' : '#ccc',
            paddingVertical: 14,
            borderRadius: 12,
            alignItems: 'center',
            opacity: pressed ? 0.85 : 1
          })}
        >
          <Text style={{ color: 'white', fontWeight: '700' }}>Continue</Text>
        </Pressable>
      </View>
    </View>
  );
}

function Row({ label, value, bold, valueStyle }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <Text style={{ color: '#666' }}>{label}</Text>
      <Text style={[{ fontWeight: bold ? '800' : '700' }, valueStyle]}>{value}</Text>
    </View>
  );
}
