import React, { useContext } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { LapContext } from '../context/LapContext';

export default function ReadyScreen({ navigation }) {
  const { setStartTime, resetSession } = useContext(LapContext);

  const onStart = () => {
    resetSession();                    // clear any old data
    setStartTime(Date.now());         // arms the poll in RunningScreen
    navigation.replace('Running');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Ready? Press to start your lap.</Text>
      <Button title="Start Lap" onPress={onStart} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
});
