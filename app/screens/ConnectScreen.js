// app/screens/ConnectScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import StepperHeader from '../components/StepperHeader';
import api from '../services/api';

export default function ConnectScreen({ navigation }) {
  // Car ping = network flag
  const [carConnected, setCarConnected] = useState(false);

  // Stub start/finish until hardware arrives
  const startConnected  = true;
  const finishConnected = true;

  // Poll the CarUnit endpoint on mount
  useEffect(() => {
    const timer = setInterval(async () => {
      try {
        await api.get('/data');
        setCarConnected(true);
        clearInterval(timer);
      } catch {
        setCarConnected(false);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // All OK when AP (via car) + Car + Start + Finish are connected
  const allOk = carConnected && startConnected && finishConnected;

  return (
    <View style={styles.screen}>
      <StepperHeader stepIndex={1} />

      <View style={styles.body}>
        {/* Wi-Fi instructions (always shown) */}
        <Text style={styles.stepLabel}>1. Join “RaceTimerNet” Wi-Fi:</Text>
        <Text style={styles.instruction}>• Open Settings → Wi-Fi</Text>
        <Text style={styles.instruction}>• Select “RaceTimerNet”</Text>
        <Text style={styles.instruction}>
          • Return to this app and wait…
        </Text>

        <View style={styles.divider} />

        {/* Status bullets */}
        <Text style={styles.stepLabel}>2. Devices status:</Text>
        <Text style={styles.deviceLine}>
          {carConnected ? '✔️' : '⭘'} RaceTimerNet AP
        </Text>
        <Text style={styles.deviceLine}>
          {carConnected ? '✔️' : '⭘'} Car Unit
        </Text>
        <Text style={styles.deviceLine}>
          {startConnected ? '✔️' : '⭘'} Start Unit <Text style={styles.stub}>(stub)</Text>
        </Text>
        <Text style={styles.deviceLine}>
          {finishConnected ? '✔️' : '⭘'} Finish Unit <Text style={styles.stub}>(stub)</Text>
        </Text>
      </View>

      <View style={styles.footer}>
        <Button
          title="Retry"
          onPress={() => setCarConnected(false)}
        />
        <View style={{ height: 12 }} />
        <Button
          title="Next"
          disabled={!allOk}
          onPress={() => navigation.replace('DriveToStart')}
          color={allOk ? '#7055e1' : '#999'}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen:      { flex:1, backgroundColor:'#f7f7f7' },
  body:        { flex:1, padding:20 },
  stepLabel:   { fontSize:18, color:'#2b2a33', marginBottom:6 },
  instruction: { fontSize:16, marginLeft:12, color:'#2b2a33', marginVertical:2 },
  divider:     { height:1, backgroundColor:'#ddd', marginVertical:20 },
  deviceLine:  { fontSize:16, marginBottom:10, color:'#2b2a33' },
  stub:        { fontSize:12, color:'#999', marginLeft:4 },
  footer:      { padding:20 },
});
