import React, { useContext, useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { LapContext } from '../context/LapContext';

export default function FinishedScreen({ navigation }) {
  const {
    trackDistance,
    startTime,
    finishTime,
    readings,
    lapHistory,
    setLapHistory,
    resetSession
  } = useContext(LapContext);

  // derive metrics
  const duration = ((finishTime - startTime)/1000).toFixed(2);
  const speeds   = readings.map(r => r.speed);
  const accels   = readings.map(r => r.accel);
  const avgSpeed = (speeds.reduce((a,b)=>a+b,0)/speeds.length).toFixed(2);
  const maxSpeed = Math.max(...speeds).toFixed(2);
  const avgAccel = (accels.reduce((a,b)=>a+b,0)/accels.length).toFixed(2);
  const maxAccel = Math.max(...accels).toFixed(2);

  // only run *after* finishTime is set, and only once per lap
  useEffect(() => {
    if (!finishTime) return;      // nothing to save yet

    const summary = {
      trackDistance,
      duration,
      avgSpeed,
      maxSpeed,
      avgAccel,
      maxAccel,
      date: new Date().toISOString()
    };

    setLapHistory(history =>
      [summary, ...history].slice(0, 10)
    );
  }, [finishTime, trackDistance, duration, avgSpeed, maxSpeed, avgAccel, maxAccel, setLapHistory]);

  const onNewLap = () => {
    resetSession();
    navigation.replace('Distance');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Lap Complete!</Text>
      <Text>Distance: {trackDistance} m</Text>
      <Text>Duration: {duration} s</Text>
      <Text>Avg Speed: {avgSpeed} m/s</Text>
      <Text>Max Speed: {maxSpeed} m/s</Text>
      <Text>Avg Accel: {avgAccel} m/s²</Text>
      <Text>Max Accel: {maxAccel} m/s²</Text>

      <View style={styles.button}>
        <Button title="New Lap" onPress={onNewLap} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, padding:20, backgroundColor:'#f7f7f7' },
  header:    { fontSize:24, fontWeight:'bold', marginBottom:20, color:'#2b2a33' },
  button:    { marginTop:30 },
});
