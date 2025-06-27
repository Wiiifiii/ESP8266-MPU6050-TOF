import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import DistanceScreen      from '../screens/DistanceScreen';
import ConnectScreen       from '../screens/ConnectScreen';
import DriveToStartScreen  from '../screens/DriveToStartScreen';
import ReadyScreen         from '../screens/ReadyScreen';
import RunningScreen       from '../screens/RunningScreen';
import FinishedScreen      from '../screens/FinishedScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <Stack.Navigator initialRouteName="Distance">
      <Stack.Screen name="Distance"     component={DistanceScreen}    options={{ title: 'Track Distance'   }}/>
      <Stack.Screen name="Connect"      component={ConnectScreen}     options={{ title: 'Connect Devices'  }}/>
      <Stack.Screen name="DriveToStart" component={DriveToStartScreen}options={{ title: 'Drive to Start'   }}/>
      <Stack.Screen name="Ready"        component={ReadyScreen}        options={{ title: 'Ready'            }}/>
      <Stack.Screen name="Running"      component={RunningScreen}      options={{ title: 'Running'          }}/>
      <Stack.Screen name="Finished"     component={FinishedScreen}     options={{ title: 'Lap Complete'     }}/>
    </Stack.Navigator>
  );
}
