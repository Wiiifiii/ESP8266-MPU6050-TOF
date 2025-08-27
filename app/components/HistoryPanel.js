import React from 'react';
import { View, Text } from 'react-native';
import { lapStore } from '../state/lapStore';

const prettyMs = (ms) => {
  const s = Math.floor(ms/1000);
  const m = Math.floor(s/60);
  const sec = (s % 60).toString().padStart(2,'0');
  const cs  = Math.floor((ms%1000)/10).toString().padStart(2,'0');
  return `${m}:${sec}.${cs}`;
};

function Row({ lap, highlight=false }) {
  return (
    <View style={{
      padding: 12, borderRadius: 12,
      backgroundColor: highlight ? '#ebeef1ff' : '#dadee7ff',
      borderWidth: highlight ? 1 : 0, borderColor: '#374151',
      marginBottom: 8
    }}>
      <Text style={{ fontSize: 16, fontWeight: '700', marginBottom: 4 }}>
        {highlight ? '★ Best lap' : 'Lap'}
      </Text>
      <Text style={{ fontSize: 20 }}>{prettyMs(lap.timeMs)}</Text>
      {lap.stats && (
        <Text style={{ opacity: 0.8, marginTop: 4 }}>
          {lap.stats.maxSpeed != null ? `Max speed: ${(lap.stats.maxSpeed*3.6).toFixed(1)} km/h  ` : ''}
          {lap.stats.maxAccel != null ? `Max accel: ${Number(lap.stats.maxAccel).toFixed(2)} m/s²` : ''}
        </Text>
      )}
      <Text style={{ opacity: 0.6, marginTop: 2 }}>
        {new Date(lap.endedAt).toLocaleTimeString()}
      </Text>
    </View>
  );
}

export default function HistoryPanel() {
  const best = lapStore.getBestLap();
  const recentAll = lapStore.getRecent(10);
  const recent = best ? recentAll.filter(l => l.id !== best.id) : recentAll;

  return (
    <View style={{ padding: 12 }}>
      {best && <Row lap={best} highlight />}
      <Text style={{ marginTop: best ? 6 : 0, marginBottom: 6, color: '#9CA3AF' }}>
        Recent (last 10)
      </Text>
      {recent.length === 0 ? (
        <Text style={{ opacity: 0.7 }}>No laps yet.</Text>
      ) : (
        recent.map(l => <Row key={l.id} lap={l} />)
      )}
    </View>
  );
}
