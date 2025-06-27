import React, { useContext, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Keyboard            // ← import Keyboard
} from 'react-native';
import { LapContext } from '../context/LapContext';
import StepperHeader  from '../components/StepperHeader';

export default function DistanceScreen({ navigation }) {
  const { setTrackDistance, resetSession } = useContext(LapContext);
  const [input, setInput] = useState('');
  const inputRef = useRef(null);            // ← create a ref

  const onNext = () => {
    const dist = parseFloat(input);
    if (!dist || dist <= 0) {
      return alert('Enter a valid distance');
    }
    // hide keyboard and blur the field
    Keyboard.dismiss();
    inputRef.current?.blur();

    resetSession();
    setTrackDistance(dist);
    navigation.replace('Connect');
  };

  return (
    <View style={styles.screen}>
      <StepperHeader stepIndex={0} />

      <View style={styles.body}>
        <Text style={styles.label}>Track length (m):</Text>
        <TextInput
          ref={inputRef}                    // ← assign ref here
          style={styles.input}
          keyboardType="numeric"
          placeholder="e.g. 100"
          value={input}
          onChangeText={setInput}

          returnKeyType="done"             // ← show “Done” on keyboard
          blurOnSubmit                   // ← auto-blur on submit
          onSubmitEditing={onNext}        // ← call onNext when “Done” pressed
        />
      </View>

      <View style={styles.footer}>
        <Button title="Next" color="#7055e1" onPress={onNext} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f7f7f7' },
  body:   { flex:1, justifyContent:'center', alignItems:'center', padding:20 },
  label:  { fontSize:18, color:'#2b2a33', marginBottom:12 },
  input:  {
    fontSize:24,
    width:120,
    textAlign:'center',
    borderBottomWidth:2,
    borderColor:'#7055e1'
  },
  footer: { padding:20 },
});
