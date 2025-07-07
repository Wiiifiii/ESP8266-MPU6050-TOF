// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import DriveToStartScreen from './screens/DriveToStartScreen';
import DistanceScreen     from './screens/DistanceScreen';
import ReadyScreen        from './screens/ReadyScreen';
import RunningScreen      from './screens/RunningScreen';
import FinishedScreen     from './screens/FinishedScreen';

import { LapProvider } from './context/LapContext';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <LapProvider>
      <NavigationContainer>
        <Stack.Navigator 
          initialRouteName="Distance" 
          screenOptions={{ headerShown: false }}
        >
          {/* Temporarily skipped:
          <Stack.Screen name="Connect" component={ConnectScreen} />
          */}
          <Stack.Screen name="DriveToStart" component={DriveToStartScreen} />
          <Stack.Screen name="Distance"     component={DistanceScreen} />
          <Stack.Screen name="Ready"        component={ReadyScreen} />
          <Stack.Screen name="Running"      component={RunningScreen} />
          <Stack.Screen name="Finished"     component={FinishedScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </LapProvider>
  );
}
