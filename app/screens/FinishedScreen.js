// app/screens/FinishedScreen.js
import React, { useContext, useEffect } from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  FlatList,
} from 'react-native';
import StepperHeader from '../components/StepperHeader';
import { LapContext } from '../context/LapContext';

export default function FinishedScreen({ navigation }) {
  const {
    trackDistance,
    startTime,
    finishTime,
    readings,
    lapHistory,
    setLapHistory,
    resetSession,
  } = useContext(LapContext);

  // On mount: compute this lap’s summary and add it to history
  useEffect(() => {
    const duration   = ((finishTime - startTime) / 1000).toFixed(2);
    const speeds     = readings.map(r => r.speed);
    const accels     = readings.map(r => r.accel);
    const avgSpeed   = (speeds.reduce((a, b) => a + b, 0) / speeds.length || 0).toFixed(2);
    const maxSpeed   = (Math.max(...speeds) || 0).toFixed(2);
    const avgAccel   = (accels.reduce((a, b) => a + b, 0) / accels.length || 0).toFixed(2);
    const maxAccel   = (Math.max(...accels) || 0).toFixed(2);

    const summary = {
      id:        Date.now().toString(),
      distance:  trackDistance,
      duration,
      avgSpeed,
      maxSpeed,
      avgAccel,
      maxAccel,
      date:      new Date(startTime).toLocaleString(),
    };

    setLapHistory(prev => {
      const all = [summary, ...prev];
      return all.slice(0, 10);
    });
  }, []);

  // Reset and start a new lap
  const onNewLap = () => {
    resetSession();
    navigation.replace('Distance');
  };

  // Prepare sorted history: shortest duration first
  const sortedHistory = [...lapHistory].sort((a, b) => {
    return parseFloat(a.duration) - parseFloat(b.duration);
  });

  // Render each lap entry, star for the best (index===0)
  const renderHistory = ({ item, index }) => (
    <View style={styles.historyItem}>
      <Text style={styles.hDate}>
        {index === 0 && <Text style={styles.star}>★ </Text>}
        {index + 1}. {item.date}
      </Text>
      <Text style={styles.hText}>
        {item.distance} m • {item.duration}s • {item.avgSpeed} m/s avg • {item.maxSpeed} m/s max
      </Text>
    </View>
  );

  return (
    <View style={styles.screen}>
      <StepperHeader stepIndex={5} />

      <View style={styles.body}>
        <Text style={styles.header}>🏁 Lap Complete!</Text>

        <View style={styles.summary}>
          <Text style={styles.label}>Distance</Text>
          <Text style={styles.value}>{trackDistance} m</Text>

          <Text style={styles.label}>Time</Text>
          <Text style={styles.value}>{((finishTime - startTime) / 1000).toFixed(2)} s</Text>

          <Text style={styles.label}>Avg Speed</Text>
          <Text style={styles.value}>
            {(readings.reduce((sum, r) => sum + r.speed, 0) / readings.length || 0).toFixed(2)} m/s
          </Text>

          <Text style={styles.label}>Max Speed</Text>
          <Text style={styles.value}>
            {Math.max(...readings.map(r => r.speed), 0).toFixed(2)} m/s
          </Text>

          <Text style={styles.label}>Avg Accel</Text>
          <Text style={styles.value}>
            {(readings.reduce((sum, r) => sum + r.accel, 0) / readings.length || 0).toFixed(2)} m/s²
          </Text>

          <Text style={styles.label}>Max Accel</Text>
          <Text style={styles.value}>
            {Math.max(...readings.map(r => r.accel), 0).toFixed(2)} m/s²
          </Text>
        </View>

        <View style={styles.button}>
          <Button title="New Lap" onPress={onNewLap} color="#7055e1" />
        </View>

        <Text style={styles.historyHeader}>Best & Last 10 Laps</Text>
        <FlatList
          data={sortedHistory}
          keyExtractor={item => item.id}
          renderItem={renderHistory}
          style={styles.historyList}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen:        { flex: 1, backgroundColor: '#f7f7f7' },
  body:          { flex: 1, padding: 20 },
  header:        {
    fontSize:    28,
    fontWeight:  'bold',
    color:       '#7055e1',
    textAlign:   'center',
    marginBottom: 20,
  },
  summary:       {
    backgroundColor: '#fff',
    padding:         15,
    borderRadius:    8,
    elevation:       2,
    marginBottom:    20,
  },
  label:         { fontSize: 14, color: '#2b2a33', marginTop: 8 },
  value:         { fontSize: 20, fontWeight: 'bold', color: '#2b2a33' },
  button:        { marginVertical: 20, width: '60%', alignSelf: 'center' },
  historyHeader: {
    fontSize:     18,
    fontWeight:   'bold',
    color:        '#2b2a33',
    marginBottom: 10,
  },
  historyList:  { flex: 1 },
  historyItem:  {
    paddingBottom:    10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom:     10,
  },
  hDate:        { fontSize: 14, color: '#7055e1' },
  hText:        { fontSize: 14, color: '#2b2a33', marginTop: 4 },
  star:         { color: '#fe4040', fontSize: 16 },
});
