// App.js
import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';

import RootNavigator from './navigation/RootNavigator'; // <-- or './RootNavigator'
import { LapProvider } from './context/LapContext';

export default function App() {
  return (
    <LapProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </LapProvider>
  );
}
