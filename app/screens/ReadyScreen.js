// app/screens/ReadyScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import StepperHeader from '../components/StepperHeader';
import api from '../api'; // <-- axios instance

export default function ReadyScreen({ navigation }) {
  const [wifiOK, setWifiOK] = useState(false);
  const [ready,  setReady]  = useState(false);

  // Wi-Fi watcher
  useEffect(() => {
    const unsub = NetInfo.addEventListener(state => {
      setWifiOK(state.isConnected && state.type === 'wifi');
    });
    return () => unsub();
  }, []);

  // Poll start signal (~500 ms)
  useEffect(() => {
    if (!wifiOK) return;
    const iv = setInterval(async () => {
      try {
        const res = await api.get('/status');
        console.log('[Ready] status:', res.status);
        setReady(res.data.ready);
      } catch (e) {
        console.log('[Ready] error:', e.message);
      }
    }, 500);
    return () => clearInterval(iv);
  }, [wifiOK]);

  return (
    <View style={styles.screen}>
      <StepperHeader currentStep={4} totalSteps={6} />
      <Text style={styles.header}>Ready to Start</Text>
      <Text style={styles.instruction}>Waiting for GO signal…</Text>
      <Text style={styles.statusLine}>
        {ready ? '🟢 GO!' : '⏳ Waiting'}
      </Text>
      <View style={styles.footer}>
        <Button
          title="Start Run"
          disabled={!ready}
          onPress={() => navigation.navigate('Running')}
          color={ready ? '#7055e1' : '#999'}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen:      { flex:1, backgroundColor:'#f7f7f7', padding:20 },
  header:      { fontSize:24, fontWeight:'bold', marginBottom:16, color:'#2b2a33' },
  instruction: { fontSize:16, marginBottom:20, color:'#2b2a33' },
  statusLine:  { fontSize:32, textAlign:'center', marginVertical:20 },
  footer:      { alignItems:'center', marginTop:40 },
});
