// app/screens/ConnectScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';
import StepperHeader from '../components/StepperHeader';
import api from '../api';               // <-- axios instance

const FINISH_OK = true; // stub until FinishUnit arrives

export default function ConnectScreen({ navigation }) {
  const [apOK,    setApOK]    = useState(false);
  const [carOK,   setCarOK]   = useState(false);
  const [startOK, setStartOK] = useState(false);

  useEffect(() => {
    const interval = setInterval(async () => {
      // CarUnit & AP Wi-Fi status from same endpoint
      try {
        const res = await api.get('/data');
        const ok  = res.status >= 200 && res.status < 300;
        setApOK(ok);
        setCarOK(ok);
      } catch (err) {
        setApOK(false);
        setCarOK(false);
      }

      // StartUnit status
      try {
        const res = await api.get('/status');
        setStartOK(res.status >= 200 && res.status < 300);
      } catch (err) {
        setStartOK(false);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const allOK = apOK && carOK && startOK && FINISH_OK;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.body}>
      <StepperHeader currentStep={1} totalSteps={6} />
      <Text style={styles.header}>Connect</Text>

      <Text style={styles.stepLabel}>1. Join “RaceTimerNet” Wi-Fi:</Text>
      <Text style={styles.instruction}>• Open Settings → Wi-Fi</Text>
      <Text style={styles.instruction}>• Select “RaceTimerNet”</Text>

      <View style={styles.divider}/>

      <Text style={styles.stepLabel}>2. Devices status:</Text>
      <Text style={styles.deviceLine}>{apOK    ? '✔️' : '⭘'} AP Wi-Fi</Text>
      <Text style={styles.deviceLine}>{carOK   ? '✔️' : '⭘'} CarUnit</Text>
      <Text style={styles.deviceLine}>{startOK ? '✔️' : '⭘'} StartUnit</Text>
      <Text style={styles.deviceLine}>
        {FINISH_OK ? '✔️' : '⭘'} FinishUnit <Text style={styles.stub}>(stub)</Text>
      </Text>

      <View style={styles.footer}>
        <Button
          title="Retry"
          onPress={() => { setApOK(false); setCarOK(false); setStartOK(false); }}
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
