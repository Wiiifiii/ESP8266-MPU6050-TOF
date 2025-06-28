// app/screens/ReadyScreen.js
import React, { useContext } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import StepperHeader from '../components/StepperHeader';
import { LapContext } from '../context/LapContext';

export default function ReadyScreen({ navigation }) {
  const {
    trackDistance,
    lapHistory,
    setStartTime,
    resetSession
  } = useContext(LapContext);

  // Next lap number = how many you've done so far + 1
  const lapNumber = lapHistory.length + 1;

  const handleStart = () => {
    setStartTime(Date.now());
    navigation.replace('Running');
  };

  const handleCancel = () => {
    resetSession();
    navigation.replace('Distance');
  };

  return (
    <View style={styles.screen}>
      <StepperHeader stepIndex={3} />

      <View style={styles.body}>
        <Text style={styles.lapText}>Lap {lapNumber}</Text>
        <Text style={styles.distanceText}>Distance: {trackDistance} m</Text>
        <Text style={styles.promptText}>Ready to go?</Text>

        <View style={styles.buttons}>
          <Button
            title="Start"
            onPress={handleStart}
            color="#7055e1"        // primary purple
          />
          <View style={{ height: 12 }} />
          <Button
            title="Cancel"
            onPress={handleCancel}
            color="#fe4040"        // red cancel
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen:      { flex:1, backgroundColor:'#f7f7f7' },
  body:        { flex:1, padding:20, justifyContent:'center', alignItems:'center' },
  lapText:     { fontSize:20, color:'#2b2a33', marginBottom:8 },
  distanceText:{ fontSize:24, fontWeight:'bold', color:'#7055e1', marginBottom:20 },
  promptText:  { fontSize:18, color:'#2b2a33', marginBottom:30 },
  buttons:     { width:'60%' },
});
