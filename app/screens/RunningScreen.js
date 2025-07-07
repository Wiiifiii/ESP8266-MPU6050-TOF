// app/screens/RunningScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import StepperHeader from '../components/StepperHeader';
import api from '../api'; // <-- axios instance

export default function RunningScreen({ navigation }) {
  const [wifiOK,  setWifiOK]  = useState(false);
  const [elapsed, setElapsed] = useState(0);

  // Watch Wi-Fi connectivity
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setWifiOK(state.isConnected && state.type === 'wifi');
    });
    return () => unsubscribe();
  }, []);

  // 1) Elapsed timer
  useEffect(() => {
    if (!wifiOK) return;
    const timer = setInterval(() => {
      setElapsed(e => parseFloat((e + 0.1).toFixed(1)));
    }, 100);
    return () => clearInterval(timer);
  }, [wifiOK]);

  // 2) Poll FinishUnit every 500ms
  useEffect(() => {
    if (!wifiOK) return;
    const iv = setInterval(async () => {
      try {
        const res = await api.get('/finish');
        console.log('[Running] finish status:', res.status);
        if (res.data.finished) {
          navigation.replace('Finished', { time: elapsed });
        }
      } catch (err) {
        console.log('[Running] error:', err.message);
      }
    }, 500);
    return () => clearInterval(iv);
  }, [wifiOK, elapsed, navigation]);

  return (
    <View style={styles.screen}>
      <StepperHeader currentStep={5} totalSteps={6} />
      <Text style={styles.header}>Running</Text>
      <Text style={styles.timer}>{elapsed.toFixed(1)} s</Text>
      <Text style={styles.footerNote}>
        {wifiOK ? '🏃 Run in progress' : '⭘ Wi-Fi lost'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen:     { flex:1, backgroundColor:'#f7f7f7', padding:20 },
  header:     { fontSize:24, fontWeight:'bold', marginBottom:16, color:'#2b2a33' },
  timer:      { fontSize:48, fontWeight:'bold', textAlign:'center', color:'#7055e1' },
  footerNote: { fontSize:14, marginTop:20, textAlign:'center', color:'#999' },
});
