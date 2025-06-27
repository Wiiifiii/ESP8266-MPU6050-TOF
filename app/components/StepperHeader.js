import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import StepIndicator from 'react-native-step-indicator';

const labels = [
  'Distance',
  'Connect',
  'Drive',
  'Ready',
  'Running',
  'Finished'
];

const customStyles = {
  stepIndicatorSize: 30,
  currentStepIndicatorSize: 36,
  separatorStrokeWidth: 2,
  currentStepStrokeWidth: 3,
  stepStrokeCurrentColor: '#fe4040',
  stepStrokeWidth: 2,
  stepStrokeFinishedColor: '#7055e1',
  stepStrokeUnFinishedColor: '#2b2a33',
  separatorFinishedColor: '#7055e1',
  separatorUnFinishedColor: '#2b2a33',
  stepIndicatorFinishedColor: '#7055e1',
  stepIndicatorUnFinishedColor: '#2b2a33',
  stepIndicatorCurrentColor: '#fe4040',
  stepIndicatorLabelFontSize: 0,      // hide numbers
  currentStepIndicatorLabelFontSize: 0,
  labelColor: '#2b2a33',
  labelSize: 12,
  currentStepLabelColor: '#fe4040'
};

export default function StepperHeader({ stepIndex }) {
  return (
    <View style={styles.container}>
      <StepIndicator
        customStyles={customStyles}
        currentPosition={stepIndex}
        labels={labels}
        stepCount={labels.length}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
});
