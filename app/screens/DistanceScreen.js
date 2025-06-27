import React, { useContext, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { LapContext } from '../context/LapContext';

export default function DistanceScreen({ navigation }) {
  const { setTrackDistance, resetSession } = useContext(LapContext);
  const [input, setInput] = useState('');

  const onNext = () => {
    const dist = parseFloat(input);
    if (isNaN(dist) || dist <= 0) {
      alert('Please enter a valid distance in meters.');
      return;
    }
    resetSession();
    setTrackDistance(dist);
    navigation.navigate('Connect');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Enter track length (meters):</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        placeholder="e.g. 100"
        value={input}
        onChangeText={setInput}
      />
      <Button title="Next" onPress={onNext}/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, padding:20, justifyContent:'center' },
  label:     { fontSize:18, marginBottom:10 },
  input:     { borderWidth:1, borderColor:'#ccc', marginBottom:20, padding:10, fontSize:16 },
});
