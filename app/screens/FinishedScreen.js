import React from 'react';
import { View, Text, Pressable } from 'react-native';
import StepperHeader from '../components/StepperHeader';
import { useLap } from '../context/LapContext';
import { computeMetrics } from '../utils/metrics';

function fmtTime(ms) {
  const s = ms / 1000;
  const whole = Math.floor(s);
  const msPart = Math.floor((s - whole) * 1000);
  return `${whole}.${msPart.toString().padStart(3,'0')} s`;
}

export default function FinishedScreen({ navigation }) {
  const {
    trackDistance,
    startTime, endTime,
    readings,
    lastSummary, setLastSummary,
    resetLap,
  } = useLap();

  const summary = lastSummary ?? computeMetrics({
    readings,
    trackDistance: Number(trackDistance) || 0,
    startTime, endTime,
  });

  const stats = [
    { label: 'Travel time', value: fmtTime(summary.elapsedMs) },
    { label: 'Top speed',   value: `${summary.topSpeed.toFixed(2)} m/s` },
    { label: 'Max accel',   value: `${summary.maxAccel.toFixed(2)} m/s²` },
    { label: 'Avg speed',   value: `${summary.avgSpeed.toFixed(2)} m/s` },
  ];

  return (
    <View style={{ flex: 1 }}>
      <StepperHeader stepIndex={5} />
      <View style={{ padding: 20, gap: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: '800' }}>Finished</Text>
        <Text style={{ color: '#666' }}>Track: {Number(trackDistance)} m</Text>

        <View style={{
          borderWidth: 1, borderColor: '#eee', borderRadius: 16, padding: 16, gap: 12
        }}>
          {stats.map((s, i) => (
            <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: '#666' }}>{s.label}</Text>
              <Text style={{ fontWeight: '700' }}>{s.value}</Text>
            </View>
          ))}
        </View>

        <Pressable
          onPress={() => {
            resetLap();
            setLastSummary(null);
            navigation.popToTop(); // back to Distance
          }}
          style={({ pressed }) => ({
            backgroundColor: '#6c47ff',
            paddingVertical: 14,
            borderRadius: 12,
            alignItems: 'center',
            opacity: pressed ? 0.85 : 1
          })}
        >
          <Text style={{ color: 'white', fontWeight: '700', fontSize: 16 }}>New Lap</Text>
        </Pressable>
      </View>
    </View>
  );
}
