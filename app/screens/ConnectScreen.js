import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function ConnectScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Connect to RaceTimerNet Wi-Fi</Text>
      <Button
        title="I’m connected, Next"
        onPress={() => navigation.navigate('DriveToStart')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, justifyContent:'center', alignItems:'center', padding:20 },
  text:      { fontSize:18, marginBottom:20, textAlign:'center' },
});
