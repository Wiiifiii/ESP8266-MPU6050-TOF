// App.js
import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ConnectionProvider } from './providers/ConnectionProvider';
import ConnectionFooter from './components/ConnectionFooter';

import RootNavigator from './navigation/RootNavigator'; // <-- or './RootNavigator'
import { LapProvider } from './context/LapContext';
import { SHOW_CONNECTION_FOOTER, DISCOVER_UNITS_ON_BOOT } from './config';
import { discoverUnits, ensureDistinctRoles } from './api';

export default function App() {
  useEffect(() => {
    (async () => {
      if (DISCOVER_UNITS_ON_BOOT) {
        try {
          await discoverUnits();
          await ensureDistinctRoles();
        } catch (e) {
        }
      }
    })();
  }, []);
  return (
    <LapProvider>
      <ConnectionProvider>
        <NavigationContainer>
          <RootNavigator />
          {SHOW_CONNECTION_FOOTER ? <ConnectionFooter /> : null}
        </NavigationContainer>
      </ConnectionProvider>
    </LapProvider>
  );
}
