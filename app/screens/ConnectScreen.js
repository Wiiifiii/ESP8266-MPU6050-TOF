// app/screens/ConnectScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';
import StepperHeader from '../components/StepperHeader';
import { getCar, getStart, getFinish } from '../api';

export default function ConnectScreen({ navigation }) {
  const [apOK,     setApOK]     = useState(false);
  const [carOK,    setCarOK]    = useState(false);
  const [startOK,  setStartOK]  = useState(false);
  const [finishOK, setFinishOK] = useState(false);

  useEffect(() => {
    const interval = setInterval(async () => {
      // Car/AP
      try { await getCar(); setApOK(true); setCarOK(true); } catch { setApOK(false); setCarOK(false); }
      // Start
      try { await getStart(); setStartOK(true); } catch { setStartOK(false); }
      // Finish
      try { await getFinish(); setFinishOK(true); } catch { setFinishOK(false); }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const allOK = apOK && carOK && startOK && finishOK;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.body}>
      <StepperHeader stepIndex={1} />
      <Text style={styles.header}>Connect</Text>

      <Text style={styles.stepLabel}>1. Join “RaceTimerNet” Wi-Fi:</Text>
      <Text style={styles.instruction}>• Open Settings → Wi-Fi</Text>
      <Text style={styles.instruction}>• Select “RaceTimerNet”</Text>

      <View style={styles.divider}/>

      <Text style={styles.stepLabel}>2. Devices status:</Text>
  <Text style={styles.deviceLine}>{apOK     ? '✔️' : '⛔'} AP Wi-Fi</Text>
  <Text style={styles.deviceLine}>{carOK    ? '✔️' : '⛔'} CarUnit</Text>
  <Text style={styles.deviceLine}>{startOK  ? '✔️' : '⛔'} StartUnit</Text>
  <Text style={styles.deviceLine}>{finishOK ? '✔️' : '⛔'} FinishUnit</Text>

      <View style={styles.footer}>
        <Button
          title="Retry"
          onPress={() => { setApOK(false); setCarOK(false); setStartOK(false); setFinishOK(false); }}
        />
        <View style={{ height: 12 }} />
        <Button
          title="Next"
          disabled={!allOK}
          onPress={() => navigation.navigate('DriveToStart')}
          color={allOK ? '#7055e1' : '#999'}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen:      { flex:1, backgroundColor:'#f7f7f7' },
  body:        { padding:20 },
  header:      { fontSize:24, fontWeight:'bold', marginBottom:16, color:'#2b2a33' },
  stepLabel:   { fontSize:18, color:'#2b2a33', marginBottom:6 },
  instruction: { fontSize:16, marginLeft:12, color:'#2b2a33', marginBottom:4 },
  divider:     { height:1, backgroundColor:'#ddd', marginVertical:20 },
  deviceLine:  { fontSize:16, marginBottom:10, color:'#2b2a33' },
  stub:        { fontSize:12, color:'#999', marginLeft:4 },
  footer:      { marginTop:20 }
});
