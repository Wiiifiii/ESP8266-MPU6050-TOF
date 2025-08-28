/**
 * Module: app/screens/DistanceScreen.js
 * Purpose: Capture track distance (m) for metrics and UI context.
 */
import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useLap } from '../context/LapContext';
import StepperHeader from '../components/StepperHeader';

export default function DistanceScreen({ navigation }) {
  const { trackDistance, setTrackDistance, resetLap } = useLap();
  const [val, setVal] = useState(String(trackDistance ?? 60));

  const parsed = Number(val.replace(',', '.'));
  const isValid = Number.isFinite(parsed) && parsed > 0 && parsed <= 1000; // 1m..1000m

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <StepperHeader stepIndex={0} />
      <View style={{ padding: 20, gap: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: '700' }}>Track Distance</Text>
        <Text style={{ color: '#666' }}>Enter the distance between Start and Finish (meters).</Text>

        <View
          style={{
            borderWidth: 1,
            borderColor: '#ddd',
            borderRadius: 12,
            padding: 14,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <TextInput
            value={val}
            onChangeText={setVal}
            keyboardType="decimal-pad"
            placeholder="60"
            style={{ fontSize: 22, flex: 1 }}
            returnKeyType="done"
          />
          <Text style={{ fontSize: 18, color: '#999', marginLeft: 8 }}>m</Text>
        </View>

        {!isValid && (
          <Text style={{ color: '#c00' }}>Enter a value between 1 and 1000 meters.</Text>
        )}

        <Pressable
          onPress={() => {
            setTrackDistance(parsed);
            resetLap(); // fresh start
            navigation.navigate('Connect');
          }}
          disabled={!isValid}
          style={({ pressed }) => ({
            backgroundColor: isValid ? '#6c47ff' : '#ccc',
            opacity: pressed ? 0.8 : 1,
            paddingVertical: 14,
            borderRadius: 12,
            alignItems: 'center',
          })}
        >
          <Text style={{ color: 'white', fontSize: 18, fontWeight: '700' }}>Next</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
