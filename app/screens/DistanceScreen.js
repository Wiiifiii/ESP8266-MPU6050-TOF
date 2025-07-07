// screens/DistanceScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import StepperHeader from '../components/StepperHeader';
import api from '../api';

export default function DistanceScreen() {
  const [wifiOK,    setWifiOK]    = useState(false);
  const [distance,  setDistance]  = useState(0);

  // 1) Watch for Wi-Fi connectivity
  useEffect(() => {
    const unsub = NetInfo.addEventListener(state => {
      setWifiOK(state.isConnected && state.type === 'wifi');
    });
    return () => unsub();
  }, []);

  // 2) Poll every second for distance
  useEffect(() => {
    if (!wifiOK) return;
    const iv = setInterval(async () => {
      try {
        const res = await api.get('/data');
        setDistance(res.data.distance);
      } catch (e) {
        console.log('[Distance] network error:', e.message);
      }
    }, 1000);
    return () => clearInterval(iv);
  }, [wifiOK]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <StepperHeader stepIndex={0} totalSteps={6} />

        <Text style={styles.header}>Distance to Start</Text>
        <Text style={styles.distance}>
          {distance.toFixed(1)} m
        </Text>
        <Text style={styles.footerNote}>
          {wifiOK ? '✔️ Connected' : '⭘ Wi-Fi lost'}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    paddingTop:
      Platform.OS === 'android'
        ? StatusBar.currentHeight
        : 0,
  },
  screen: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#2b2a33',
  },
  distance: {
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#7055e1',
  },
  footerNote: {
    fontSize: 14,
    marginTop: 20,
    textAlign: 'center',
    color: '#999',
  },
});
