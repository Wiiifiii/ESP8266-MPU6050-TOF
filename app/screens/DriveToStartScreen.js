// screens/DriveToStartScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import StepperHeader from '../components/StepperHeader';
import api from '../api'; // <-- use centralized axios instance

export default function DriveToStartScreen({ navigation }) {
  const [wifiOK, setWifiOK]     = useState(false);
  const [distance, setDistance] = useState(null);

  // 1) Track Wi-Fi connectivity
  useEffect(() => {
    const unsub = NetInfo.addEventListener(state => {
      setWifiOK(state.isConnected && state.type === 'wifi');
    });
    return () => unsub();
  }, []);

  // 2) Poll CarUnit for distance every 2s
  useEffect(() => {
    if (!wifiOK) {
      setDistance(null);
      return;
    }
    const iv = setInterval(async () => {
      try {
        const res = await api.get('/data');
        console.log('[DriveToStart] status:', res.status);
        setDistance(res.data.distance);
      } catch (e) {
        console.log('[DriveToStart] error:', e.message);
        setDistance(null);
      }
    }, 2000);
    return () => clearInterval(iv);
  }, [wifiOK]);

  // At-start threshold: within 1 meter
  const atStart = distance !== null && distance <= 1;

  return (
    <View style={styles.screen}>
      <StepperHeader currentStep={2} totalSteps={6} />
      <Text style={styles.header}>Drive to Start Line</Text>
      <Text style={styles.instruction}>
        Drive until your CarUnit is within 1 m of the start sensor.
      </Text>

      <Text style={styles.statusLine}>
        {wifiOK ? '✔️ Wi‑Fi Connected' : '⭘ Wi‑Fi lost'}
      </Text>
      <Text style={styles.statusLine}>
        {distance != null ? `${distance.toFixed(1)} m to start` : '–'}
      </Text>

      <View style={styles.footer}>
        <Button
          title="Next"
          disabled={!atStart}
          onPress={() => navigation.navigate('Distance')}
          color={atStart ? '#7055e1' : '#999'}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen:      { flex:1, backgroundColor:'#f7f7f7', padding:20 },
  header:      { fontSize:24, fontWeight:'bold', marginBottom:16, color:'#2b2a33' },
  instruction: { fontSize:16, marginBottom:20, color:'#2b2a33' },
  statusLine:  { fontSize:18, marginBottom:10, color:'#2b2a33' },
  footer:      { marginTop:20 },
});
