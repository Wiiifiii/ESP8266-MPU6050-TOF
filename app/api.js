// app/api.js
import axios from 'axios';

export const carApi    = axios.create({ baseURL: 'http://192.168.4.1', timeout: 3000 });
export const startApi  = axios.create({ baseURL: 'http://192.168.4.2', timeout: 3000 });
export const finishApi = axios.create({ baseURL: 'http://192.168.4.3', timeout: 3000 });

export const getCar    = () => carApi.get('/data');     // { ax, ay, az, speed, distance }
export const getStart  = () => startApi.get('/status'); // { distanceMm, ready, triggered, ... }
export const getFinish = () => finishApi.get('/status'); // { distance, finished }

// keep compatibility with ReadyScreen import in real mode
export const startDemoRun = () => {};

export default { getCar, getStart, getFinish, carApi, startApi, finishApi };
