import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function ReadyScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Ready? Waiting for Start event…</Text>
      <Button title="Start Lap" onPress={() => navigation.navigate('Running')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, justifyContent:'center', alignItems:'center', padding:20 },
  text:      { fontSize:18, marginBottom:20, textAlign:'center' },
});
