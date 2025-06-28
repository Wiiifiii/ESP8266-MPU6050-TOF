// app/screens/RunningScreen.js
import React, { useContext, useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import StepperHeader from '../components/StepperHeader';
import { LapContext } from '../context/LapContext';

export default function RunningScreen({ navigation }) {
  const {
    startTime,
    trackDistance,
    traveledDistance,    setTraveledDistance,
    speed,               setSpeed,
    accel,               setAccel,
    readings,            setReadings,
    setFinishTime
  } = useContext(LapContext);

  const lastTimestamp = useRef(startTime);

  // Poll interval (ms)
  const INTERVAL = 100;

  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const res = await fetch('http://192.168.4.1/data');
        const { speed: s, ax } = await res.json();

        const now = Date.now();
        const dt  = (now - lastTimestamp.current) * 1e-3; // → seconds
        lastTimestamp.current = now;

        // accumulate distance
        setTraveledDistance(d => {
          const next = d + s * dt;
          return next > trackDistance ? trackDistance : next;
        });

        setSpeed(s);
        setAccel(ax * 9.81);  // if ax in g, convert to m/s²

        setReadings(r => [
          ...r,
          { t: now, speed: s, accel: ax * 9.81 }
        ]);

        // end‐of‐lap?
        if (traveledDistance + s * dt >= trackDistance) {
          clearInterval(id);
          setFinishTime(now);
          navigation.replace('Finished');
        }
      } catch (err) {
        // optionally show “No signal” state
        console.warn('RunningScreen fetch error', err);
      }
    }, INTERVAL);

    return () => clearInterval(id);
  }, [navigation, trackDistance, setFinishTime, setTraveledDistance, setSpeed, setAccel, setReadings, traveledDistance, startTime]);

  // live elapsed & percent
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  const pct     = Math.min(1, traveledDistance / trackDistance);
  const pctText = Math.round(pct * 100);

  return (
    <View style={styles.screen}>
      <StepperHeader stepIndex={4} />

      <View style={styles.body}>
        <Text style={styles.timer}>⏱ {elapsed} s</Text>

        <View style={styles.barBackground}>
          <View style={[styles.barFill, { width: `${pctText}%` }]} />
        </View>
        <Text style={styles.sub}>
          {traveledDistance.toFixed(2)} / {trackDistance} m
        </Text>

        <View style={styles.row}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Speed</Text>
            <Text style={styles.statValue}>{speed.toFixed(2)} m/s</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Accel</Text>
            <Text style={styles.statValue}>{accel.toFixed(2)} m/s²</Text>
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
