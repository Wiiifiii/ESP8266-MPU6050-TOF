// index.js
import 'react-native-gesture-handler';          // required for React Navigation
import { registerRootComponent } from 'expo';  // ensures your App is the entry point

import App from './App';

registerRootComponent(App);
