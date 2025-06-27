import React from 'react';
import { NavigationContainer } from '@react-navigation/native';

import { LapProvider }   from './context/LapContext';
import RootNavigator     from './navigation/RootNavigator';

export default function App() {
  return (
    <LapProvider>
      <NavigationContainer>
        <RootNavigator/>
      </NavigationContainer>
    </LapProvider>
  );
}
