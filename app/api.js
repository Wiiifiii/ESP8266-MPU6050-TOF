// app/api.js
// app/api.js - switcher between demo and real implementations
import * as demo from './api.demo';
import * as real from './api.real';
import { USE_DEMO } from './config';

const api = USE_DEMO ? demo : real;

export const { getCar, getStart, getFinish, startDemoRun = () => {} } = api;
export default api;
