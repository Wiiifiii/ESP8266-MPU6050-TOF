// app/screens/ConnectScreen.js
import React, { useState, useEffect, useContext } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import StepperHeader from '../components/StepperHeader';
import api           from '../services/api';
import { LapContext } from '../context/LapContext';

export default function ConnectScreen({ navigation }) {
  const [carOk, setCarOk] = useState(false);
  const { trackDistance } = useContext(LapContext);

  useEffect(() => {
    const timer = setInterval(async () => {
      try {
        await api.get('/data');
        setCarOk(true);
        clearInterval(timer);
        // once car responds, auto-advance
        navigation.replace('DriveToStart');
      } catch {
        setCarOk(false);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <View style={styles.screen}>
      <StepperHeader stepIndex={1} />
      <View style={styles.body}>
        <Text style={styles.msg}>
          {carOk
            ? 'Car unit connected! 🚗'
            : 'Connecting to CarUnit...'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex:1, backgroundColor:'#f7f7f7' },
  body:   { flex:1, justifyContent:'center', alignItems:'center', padding:20 },
  msg:    { fontSize:18, textAlign:'center', color:'#2b2a33' },
});
