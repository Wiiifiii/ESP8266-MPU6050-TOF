// components/StepperHeader.js
import React from 'react';
import { View, Text } from 'react-native';

const labels = ['Distance', 'Connect', 'Drive', 'Ready', 'Run', 'Finish'];
const TOTAL = labels.length;

export default function StepperHeader({ stepIndex = 0 }) {
  const clamped = Math.max(0, Math.min(stepIndex, TOTAL - 1));
  const pct = ((clamped) / (TOTAL - 1)) * 100;

  return (
    <View style={{ paddingTop: 14, paddingHorizontal: 16, paddingBottom: 12, backgroundColor: 'white' }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
        <Text style={{ fontWeight: '800', fontSize: 18 }}>{labels[clamped]}</Text>
        <Text style={{ color: '#666' }}>{clamped + 1}/{TOTAL}</Text>
      </View>

      <View style={{ height: 8, backgroundColor: '#eee', borderRadius: 999, overflow: 'hidden' }}>
        <View style={{ height: '100%', width: `${pct}%`, backgroundColor: '#6c47ff' }} />
      </View>
    </View>
  );
}
