/**
 * Module: app/api.real.js
 * Purpose: Direct axios clients for Car, Start, and Finish hardware endpoints.
 */
import axios from 'axios';

export const carApi = axios.create({ baseURL: 'http://192.168.4.1', timeout: 3000 });
export const startApi = axios.create({ baseURL: 'http://192.168.4.2', timeout: 3000 });
export const finishApi = axios.create({ baseURL: 'http://192.168.4.3', timeout: 3000 });

/** @returns {Promise<{data:any}>} */
export const getCar = () => carApi.get('/data'); // { ax, ay, az, speed, distance }
/** @returns {Promise<{data:any}>} */
export const getStart = () => startApi.get('/status'); // { distanceMm, ready, triggered, ... }
/** @returns {Promise<{data:any}>} */
export const getFinish = () => finishApi.get('/status'); // { distance, finished }

export default { getCar, getStart, getFinish };
