import React, { useContext, useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import api from '../services/api';
import { LapContext } from '../context/LapContext';

export default function RunningScreen({ navigation }) {
  const {
    trackDistance,
    startTime,  // epoch ms when lap started
    setFinishTime,
    readings,   setReadings,
    setSpeed,   setAccel,
    traveledDistance, setTraveledDistance
  } = useContext(LapContext);

  // useRef so we don't re-create lastTs on every render
  const lastTsRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (startTime === null) return;    // do nothing until startTime set

    // seed the “last timestamp” so our first dt is small
    lastTsRef.current = startTime;

    const tick = async () => {
      const now = Date.now();
      const dt = (now - lastTsRef.current) / 1000;  // seconds since last tick
      lastTsRef.current = now;

      let data;
      try {
        ({ data } = await api.get('/data'));
      } catch (e) {
        console.warn('ESP poll error', e);
        return;
      }

      // record speed & accel
      setSpeed(data.speed);
      setAccel(data.ax);

      // accumulate traveled distance **and** check for finish in one go
      setTraveledDistance(prev => {
        const newDist = prev + data.speed * dt;

        // finish condition
        if (newDist >= trackDistance) {
          setFinishTime(now);
          clearInterval(intervalRef.current);
          navigation.replace('Finished');
        }

        return newDist;
      });

      // log raw reading
      setReadings(r => [...r, { t: now, speed: data.speed, accel: data.ax }]);
    };

    intervalRef.current = setInterval(tick, 200);
    return () => clearInterval(intervalRef.current);

  }, [startTime, trackDistance]);

  // show remaining distance, not traveled (never go negative)
  const remaining = Math.max(trackDistance - traveledDistance, 0).toFixed(2);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lap in progress…</Text>
      <Text>Remaining: {remaining} / {trackDistance.toFixed(2)} m</Text>
      <Text>Speed: {readings.length ? readings[readings.length-1].speed.toFixed(2) : '—'} m/s</Text>
      <Text>Accel: {readings.length ? readings[readings.length-1].accel.toFixed(2) : '—'} m/s²</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, padding:20, backgroundColor:'#f7f7f7' },
  title:     { fontSize:20, fontWeight:'bold', marginBottom:10 },
});
