import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function RunningScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Lap in progress…</Text>
      <Button title="Finish Lap" onPress={() => navigation.navigate('Finished')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, justifyContent:'center', alignItems:'center', padding:20 },
  text:      { fontSize:18, marginBottom:20, textAlign:'center' },
});
