// app/screens/RunningScreen.js
import React, { useContext, useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import StepperHeader from '../components/StepperHeader';
import { LapContext } from '../context/LapContext';

export default function RunningScreen({ navigation }) {
  const {
    startTime,
    trackDistance,
    traveledDistance, setTraveledDistance,
    speed,           setSpeed,
    accel,           setAccel,
    readings,        setReadings,
    setFinishTime
  } = useContext(LapContext);

  const MIN_DISPLAY_MS   = 2000;
  const runStartRef      = useRef(Date.now());
  const INTERVAL         = 100;

  useEffect(() => {
    const id = setInterval(async () => {
      try {
        // fetch from your CarUnit
        const res = await fetch('http://192.168.4.1/data');
        const { speed: s, ax } = await res.json();
        const now = Date.now();
        const dt  = (now - (readings.lastT || startTime)) * 1e-3;

        // accumulate
        setTraveledDistance(d => Math.min(trackDistance, d + s * dt));
        setSpeed(s);
        setAccel(ax * 9.81);
        setReadings(r => {
          r.lastT = now;
          return [...r, { t:now, speed:s, accel:ax*9.81 }];
        });

        // check finish
        if (traveledDistance + s*dt >= trackDistance) {
          clearInterval(id);
          const elapsedRun = now - runStartRef.current;
          const waitMs     = Math.max(0, MIN_DISPLAY_MS - elapsedRun);
          setTimeout(() => {
            setFinishTime(now);
            navigation.replace('Finished');
          }, waitMs);
        }
      } catch {
        // optionally show “no signal”
      }
    }, INTERVAL);

    return () => clearInterval(id);
  }, [navigation, startTime, trackDistance, readings, traveledDistance]);

  const elapsed  = ((Date.now() - startTime)/1000).toFixed(2);
  const percent  = Math.min(100, (traveledDistance/trackDistance)*100).toFixed(0);

  return (
    <View style={styles.screen}>
      <StepperHeader stepIndex={4} />
      <View style={styles.body}>
        <Text style={styles.timer}>⏱ {elapsed}s</Text>

        <View style={styles.barBackground}>
          <View style={[styles.barFill, { width:`${percent}%` }]} />
        </View>
        <Text style={styles.sub}>{traveledDistance.toFixed(2)} / {trackDistance} m</Text>

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
  screen:        { flex:1, backgroundColor:'#f7f7f7' },
  body:          { flex:1, padding:20 },
  timer:         { fontSize:32, color:'#2b2a33', textAlign:'center', marginVertical:10 },
  barBackground: { height:8, width:'100%', backgroundColor:'#ddd', borderRadius:4, overflow:'hidden', marginVertical:10 },
  barFill:       { height:'100%', backgroundColor:'#7055e1' },
  sub:           { textAlign:'center', color:'#7055e1', marginBottom:30 },
  row:           { flexDirection:'row', justifyContent:'space-around' },
  stat:          { alignItems:'center' },
  statLabel:     { color:'#2b2a33' },
  statValue:     { fontSize:24, fontWeight:'bold', color:'#7055e1' },
});
