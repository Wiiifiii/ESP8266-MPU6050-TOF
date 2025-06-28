// app/screens/DriveToStartScreen.js
import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import StepperHeader from '../components/StepperHeader';
import { LapContext } from '../context/LapContext';

export default function DriveToStartScreen({ navigation }) {
  const { setStartTime } = useContext(LapContext);

  // --- CONFIG ---
  const maxDist   = 2.0;    // dummy start-line is 2 m away
  const threshold = 0.05;   //  5 cm threshold

  // --- STATE ---
  const [dist, setDist] = useState(maxDist);

  // --- EFFECT: poll ESP status ---
  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const res = await fetch('http://192.168.4.2/status');
        const { distance, triggered } = await res.json();
        setDist(distance);
        if (triggered) {
          setStartTime(Date.now());
          navigation.replace('Running');
          clearInterval(id);
        }
      } catch {
        // ignore errors or show offline state
      }
    }, 100);
    return () => clearInterval(id);
  }, [navigation, setStartTime]);

  return (
    <View style={styles.screen}>
      <StepperHeader stepIndex={2} />

      <View style={styles.body}>
        <Text style={styles.title}>Drive to Start Line</Text>
        <Text style={styles.distance}>{dist.toFixed(2)} m</Text>
        <View style={styles.barBackground}>
          <View
            style={[styles.barFill, { flex: maxDist - dist }]} />
          <View style={{ flex: dist }} />
        </View>
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
    flexDirection:'row', 
    height:20, 
    width:'100%', 
    backgroundColor:'#ddd', 
    borderRadius:10, 
    overflow:'hidden', 
    marginBottom:40 
  },
  barFill:      { backgroundColor:'#7055e1' },
  readyText:    { fontSize:52, color:'#7fba00', fontWeight:'bold', marginBottom:30 },
  goButton:     { width:'60%' },
});
