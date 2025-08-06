// app/screens/RunningScreen.js
import React, { useContext, useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import StepperHeader from '../components/StepperHeader';
import { LapContext } from '../context/LapContext';

export default function RunningScreen({ navigation }) {
  const {
    startTime,
    trackDistance,
    setTraveledDistance,
    traveledDistance,
    setSpeed,
    setAccel,
    setReadings,
    setFinishTime,
  } = useContext(LapContext);

  // keep the last timestamp across renders
  const lastTimestamp = useRef(startTime);

  useEffect(() => {
    const INTERVAL = 100; // ms

    const id = setInterval(async () => {
      try {
        const res = await fetch('http://192.168.4.1/data');
        const { speed: rawSpeed = 0, ax = 0 } = await res.json();
        const now = Date.now();

        // compute dt in seconds
        const dt = (now - lastTimestamp.current) / 1000;
        lastTimestamp.current = now;

        // clamp out any negative noise
        const speed = Math.max(0, rawSpeed);

        // update distance, and if we've hit the end, finish
        setTraveledDistance(prev => {
          const next = Math.min(trackDistance, prev + speed * dt);

          // if crossing the finish
          if (next >= trackDistance) {
            clearInterval(id);
            setFinishTime(now);
            navigation.replace('Finished');
          }

          return next;
        });

        // update live stats
        setSpeed(rawSpeed);
        setAccel(ax * 9.81); // if `ax` is in g

        // record history
        setReadings(r => [...r, { t: now, speed: rawSpeed, accel: ax * 9.81 }]);

      } catch (err) {
        console.warn('RunningScreen fetch error', err);
      }
    }, INTERVAL);

    return () => clearInterval(id);
  }, [navigation, trackDistance, setFinishTime, setTraveledDistance, setSpeed, setAccel, setReadings]);

  // live UI
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  const pct     = Math.min(100, (traveledDistance / trackDistance) * 100).toFixed(0);

  return (
    <View style={styles.screen}>
      <StepperHeader stepIndex={4} />

      <View style={styles.body}>
        <Text style={styles.timer}>⏱ {elapsed} s</Text>

        <View style={styles.barBackground}>
          <View style={[styles.barFill, { width: `${pct}%` }]} />
        </View>
        <Text style={styles.sub}>
          {traveledDistance.toFixed(2)} / {trackDistance} m
        </Text>

        <View style={styles.row}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Speed</Text>
            <Text style={styles.statValue}>{(traveledDistance>0 ? traveledDistance : 0).toFixed(2)} m/s</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Accel</Text>
            <Text style={styles.statValue}>{(traveledDistance>0 ? traveledDistance : 0).toFixed(2)} m/s²</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen:       { flex:1, backgroundColor:'#f7f7f7' },
  body:         { flex:1, padding:20 },
  timer:        { fontSize:32, color:'#2b2a33', textAlign:'center', marginVertical:10 },
  barBackground:{ 
    height:8,
    width:'100%',
    backgroundColor:'#ddd',
    borderRadius:4,
    overflow:'hidden',
    marginVertical:10
  },
  barFill:      { height:'100%', backgroundColor:'#7055e1' },
  sub:          { textAlign:'center', color:'#7055e1', marginBottom:30 },
  row:          { flexDirection:'row', justifyContent:'space-around' },
  stat:         { alignItems:'center' },
  statLabel:    { color:'#2b2a33', fontSize:14 },
  statValue:    { fontSize:24, fontWeight:'bold', color:'#7055e1' },
});
