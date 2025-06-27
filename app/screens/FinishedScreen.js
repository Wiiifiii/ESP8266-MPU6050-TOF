import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useContext } from 'react';
import { LapContext } from '../context/LapContext';

export default function FinishedScreen({ navigation }) {
  const { trackDistance, startTime, finishTime } = useContext(LapContext);
  const duration = startTime && finishTime ? ((finishTime - startTime)/1000).toFixed(2) : '—';

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Lap Complete!</Text>
      <Text>Distance: {trackDistance} m</Text>
      <Text>Duration: {duration} s</Text>
      <Button title="New Lap" onPress={() => navigation.navigate('Distance')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, justifyContent:'center', alignItems:'center', padding:20 },
  text:      { fontSize:22, marginBottom:20, fontWeight:'bold' },
});
