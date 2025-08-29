/**
 * app/screens/FinishedScreen.js
 * Show lap summary and recent history; allow new lap.
 */
import React, { useEffect } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import StepperHeader from '../components/StepperHeader';
import { useLap } from '../context/LapContext';
import { computeMetrics } from '../utils/metrics';
import { fmtTime, fmtSpeed, fmtAccel } from '../utils/format';
import HistoryPanel from '../components/HistoryPanel';

export default function FinishedScreen({ navigation }) {
  const {
    trackDistance,
    startTime,
    endTime,
    readings,
    lastSummary,
    setLastSummary,
    lapHistory,
    setLapHistory,
    resetLap,
  } = useLap();

  const summary =
    lastSummary ??
    computeMetrics({ readings, trackDistance: Number(trackDistance) || 0, startTime, endTime });

  useEffect(() => {
    if (!summary) return;
    if (!lastSummary) setLastSummary(summary);
  }, []);

  // HistoryPanel pins best lap and shows last 10 excluding best.
  return (
    <View style={{ flex: 1 }}>
      <StepperHeader stepIndex={5} />
      <ScrollView contentContainerStyle={{ padding: 20, gap: 18, paddingBottom: 40 }}>
        <Text style={{ fontSize: 26, fontWeight: '800' }}>Finished</Text>
        <Text style={{ color: '#666' }}>Track: {Number(trackDistance)} m</Text>
        <View
          style={{ borderWidth: 1, borderColor: '#eee', borderRadius: 16, padding: 16, gap: 14 }}
        >
          <Big label="Travel time" value={fmtTime(summary.elapsedMs)} />
          <Row label="Top speed" value={fmtSpeed(summary.topSpeed)} />
          <Row label="Max accel" value={fmtAccel(summary.maxAccel)} />
          <Row label="Avg speed" value={fmtSpeed(summary.avgSpeed)} />
        </View>
        <Pressable
          onPress={() => {
            resetLap();
            setLastSummary(null);
            navigation.popToTop();
          }}
          style={({ pressed }) => ({
            backgroundColor: '#6c47ff',
            paddingVertical: 14,
            borderRadius: 12,
            alignItems: 'center',
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <Text style={{ color: 'white', fontWeight: '700', fontSize: 16 }}>New Lap</Text>
        </Pressable>
        <Text style={{ marginTop: 8, fontWeight: '800' }}>Best & Last 10 Laps</Text>
        <HistoryPanel />
        <Pressable
          onPress={() => setLapHistory([])}
          style={({ pressed }) => ({
            marginTop: 12,
            paddingVertical: 10,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: '#ddd',
            alignItems: 'center',
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <Text style={{ fontWeight: '700' }}>Clear history</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function Row({ label, value }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <Text style={{ color: '#666' }}>{label}</Text>
      <Text style={{ fontWeight: '700' }}>{value}</Text>
    </View>
  );
}
function Big({ label, value }) {
  return (
    <View>
      <Text style={{ color: '#666', marginBottom: 4 }}>{label}</Text>
      <Text style={{ fontSize: 40, fontWeight: '900', letterSpacing: 0.5 }}>{value}</Text>
    </View>
  );
}
