// app/screens/DriveToStartScreen.js
import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import StepperHeader from '../components/StepperHeader';
import { LapContext } from '../context/LapContext';

const USE_DUMMY_START = true;  // ← flip to false when your real StartUnit is online

export default function DriveToStartScreen({ navigation }) {
  const { setStartTime } = useContext(LapContext);

  // --- CONFIG ---
  const maxDist   = 2.0;    // dummy start‐line is 2 m away
  const threshold = 0.05;   // 5 cm trigger

  // --- STATE ---
  const [dist,     setDist]     = useState(maxDist);
  const [loading,  setLoading]  = useState(true);
  const [failures, setFailures] = useState(0);

  useEffect(() => {
    if (USE_DUMMY_START) {
      // Skip fetch loop—go straight into a fake countdown
      startDummyCountdown();
      return;
    }

    const id = setInterval(async () => {
      try {
        const res = await fetch('http://192.168.4.2/status');
        const { distance, triggered } = await res.json();
        console.log('DriveToStart status →', distance, triggered);

        setDist(distance);
        setLoading(false);

        if (triggered) {
          // **1️⃣** user is within 5 cm: mark startTime, go to RunningScreen
          setStartTime(Date.now());
          navigation.replace('Ready');
          clearInterval(id);
        }
      } catch (err) {
        console.warn('DriveToStart fetch failed', failures + 1);
        setFailures(f => f + 1);

        // after 10 failed tries, fall back to dummy countdown
        if (failures > 10) {
          setLoading(false);
          clearInterval(id);
          startDummyCountdown();
        }
      }
    }, 200);

    return () => clearInterval(id);
  }, [navigation, setStartTime, failures]);

  // Dummy fallback: animate from maxDist → 0 at 2 cm/tick
  function startDummyCountdown() {
    let d = maxDist;
    const id2 = setInterval(() => {
      d = Math.max(0, d - 0.02);
      setDist(d);

      if (d <= threshold) {
        // **1️⃣** dummy trigger
        clearInterval(id2);
       setStartTime(Date.now());
       navigation.replace('Ready');
      }
    }, 100);
  }

  // percent of bar to fill
  const fillPercent = ((maxDist - dist) / maxDist) * 100;

  return (
    <View style={styles.screen}>
      <StepperHeader stepIndex={2} />

      <View style={styles.body}>
        <Text style={styles.title}>Drive to Start Line</Text>

        {/* always render these so you never get “stuck” blank */}
        <Text style={styles.distance}>{dist.toFixed(2)} m</Text>
        <View style={styles.barBackground}>
          <View style={[styles.barFill, { width: `${fillPercent}%` }]} />
        </View>

        {/* overlay spinner until we see our first real value */}
 {loading && (
   <View style={styles.loadingContainer}>
     <ActivityIndicator size="large" color="#7055e1" />
     <Text style={styles.loadingText}>Waiting for StartUnit…</Text>
   </View>
 )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen:       { flex:1, backgroundColor:'#f7f7f7' },
  body:         { flex:1, padding:20, justifyContent:'center', alignItems:'center' },
  title:        { fontSize:24, fontWeight:'bold', color:'#2b2a33', marginBottom:20 },
  distance:     { fontSize:48, color:'#7055e1', marginBottom:20 },
  barBackground:{ 
    height:20, width:'100%', backgroundColor:'#ddd', borderRadius:10,
    overflow:'hidden', marginBottom:40 
  },
  barFill:      { height:'100%', backgroundColor:'#7055e1' },
  spinnerContainer: {
    position:'absolute', top:'50%', alignItems:'center'
  },
  // replace spinnerContainer in your StyleSheet…
loadingContainer: {
  marginTop: 20,
  alignItems: 'center',
},
loadingText: {
  marginTop: 8,
  color: '#7055e1',
  fontSize: 16,
},

});
