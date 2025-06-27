import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function DriveToStartScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Drive to the start line…</Text>
      <Button title="I’m at the line" onPress={() => navigation.navigate('Ready')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, justifyContent:'center', alignItems:'center', padding:20 },
  text:      { fontSize:18, marginBottom:20, textAlign:'center' },
});
