// app/api.js
import axios from 'axios';
import { USE_DEMO } from './config';
import * as demo from './api.demo';
import * as real from './api.real';

export const carApi    = axios.create({ baseURL: 'http://192.168.4.1', timeout: 3000 });

let START_BASE  = 'http://192.168.4.2';
let FINISH_BASE = 'http://192.168.4.3';

export function setStartBase(v)  { START_BASE = v; }
export function setFinishBase(v) { FINISH_BASE = v; }
export function getStartBase()   { return START_BASE; }
export function getFinishBase()  { return FINISH_BASE; }

export const getCar    = () => axios.get('http://192.168.4.1/data', { timeout: 1500 });
export const getStart  = () => axios.get(`${START_BASE}/status`,    { timeout: 1200 });
export const getFinish = () => axios.get(`${FINISH_BASE}/status`,   { timeout: 1200 });

const api = USE_DEMO ? demo : { getCar, getStart, getFinish, setStartBase, setFinishBase, getStartBase, getFinishBase };
export const { startDemoRun = () => {} } = api;
export default api;
