import React, { useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import StepperHeader from '../components/StepperHeader';
import { useLap } from '../context/LapContext';
import { computeMetrics } from '../utils/metrics';
import { fmtTime, fmtSpeed, fmtAccel } from '../utils/format';
import HistoryList from '../components/HistoryList';

export default function FinishedScreen({ navigation }) {
  const {
    trackDistance,
    startTime, endTime,
    readings,
    lastSummary, setLastSummary,
    lapHistory, setLapHistory,
    resetLap,
  } = useLap();

  // Compute or reuse summary
  const summary = lastSummary ?? computeMetrics({
    readings,
    trackDistance: Number(trackDistance) || 0,
    startTime, endTime,
  });

  // Ensure it’s in history once
  useEffect(() => {
    if (!summary) return;
    if (!lastSummary) setLastSummary(summary);

    // Only push if an identical "when" isn't already in history
    const withWhen = { ...summary, when: endTime || Date.now() };
    const already =
      lapHistory?.some(s => Math.abs((s.when ?? 0) - (withWhen.when ?? 1)) < 5) ?? false;
    if (!already) {
      setLapHistory(prev => [withWhen, ...(prev || [])].slice(0, 10));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <StepperHeader stepIndex={5} />

      <View style={{ padding: 20, gap: 18 }}>
        <Text style={{ fontSize: 26, fontWeight: '800' }}>Finished</Text>
        <Text style={{ color: '#666' }}>Track: {Number(trackDistance)} m</Text>

        {/* Hero card like your screenshot */}
        <View style={{
          borderWidth: 1, borderColor: '#eee', borderRadius: 16, padding: 16, gap: 14
        }}>
          <BigStat label="Travel time" value={fmtTime(summary.elapsedMs)} />
          <Row label="Top speed" value={fmtSpeed(summary.topSpeed)} />
          <Row label="Max accel" value={fmtAccel(summary.maxAccel)} />
          <Row label="Avg speed" value={fmtSpeed(summary.avgSpeed)} />
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

        {/* Lap history list */}
        <Text style={{ marginTop: 8, fontWeight: '800' }}>Lap history</Text>
        <HistoryList items={lapHistory} />

        {/* Optional: clear history */}
        <Pressable
          onPress={() => setLapHistory([])}
          style={({ pressed }) => ({
            marginTop: 12,
            paddingVertical: 10,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: '#ddd',
            alignItems: 'center',
            opacity: pressed ? 0.85 : 1
          })}
        >
          <Text style={{ fontWeight: '700' }}>Clear history</Text>
        </Pressable>
      </View>
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

function BigStat({ label, value }) {
  return (
    <View>
      <Text style={{ color: '#666', marginBottom: 4 }}>{label}</Text>
      <Text style={{ fontSize: 40, fontWeight: '900', letterSpacing: 0.5 }}>{value}</Text>
    </View>
  );
}
