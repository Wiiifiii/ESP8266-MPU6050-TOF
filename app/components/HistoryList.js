// components/HistoryList.js
import React from 'react';
import { View, Text } from 'react-native';
import { fmtTime, fmtSpeed, fmtAccel } from '../utils/format';

export default function HistoryList({ items = [] }) {
  if (!items.length) {
    return (
      <View style={{ borderWidth: 1, borderColor: '#eee', borderRadius: 16, padding: 16 }}>
        <Text style={{ color: '#666' }}>No laps yet.</Text>
      </View>
    );
  }

  return (
    <View style={{ borderWidth: 1, borderColor: '#eee', borderRadius: 16, paddingHorizontal: 16 }}>
      {items.map((item, index) => (
        <View
          key={`lap-${index}`}
          style={{
            paddingVertical: 12,
            borderBottomWidth: index === items.length - 1 ? 0 : 1,
            borderBottomColor: '#eee',
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
            <Text style={{ fontWeight: '700' }}>
              {index === 0 ? '★ ' : ''}Lap {index + 1}
            </Text>
            {item.when && (
              <Text style={{ color: '#999' }}>
                {new Date(item.when).toLocaleTimeString()}
              </Text>
            )}
          </View>
          <Row label="Travel time" value={fmtTime(item.elapsedMs)} />
          <Row label="Top speed"   value={fmtSpeed(item.topSpeed)} />
          <Row label="Max accel"   value={fmtAccel(item.maxAccel)} />
          <Row label="Avg speed"   value={fmtSpeed(item.avgSpeed)} />
        </View>
      ))}
    </View>
  );
}

function Row({ label, value }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 2 }}>
      <Text style={{ color: '#666' }}>{label}</Text>
      <Text style={{ fontWeight: '700' }}>{value}</Text>
    </View>
  );
}
