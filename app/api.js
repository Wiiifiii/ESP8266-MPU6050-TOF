// api.js
import axios from 'axios';

// Defaults (match firmware)
// Car/AP serves /data at 192.168.4.1
const CAR_BASE = 'http://192.168.4.1';

// Start/Finish can be overridden by discovery
let START_BASE  = 'http://192.168.4.2';
let FINISH_BASE = 'http://192.168.4.3';

// Setters + getters so screens can adjust/debug
export function setStartBase(v)  { START_BASE = v; }
export function setFinishBase(v) { FINISH_BASE = v; }
export function getStartBase()   { return START_BASE; }
export function getFinishBase()  { return FINISH_BASE; }

export async function getCar()    { return axios.get(`${CAR_BASE}/data`,      { timeout: 1500 }); }
export async function getStart()  { return axios.get(`${START_BASE}/status`,  { timeout: 1200 }); }
export async function getFinish() { return axios.get(`${FINISH_BASE}/status`, { timeout: 1200 }); }

// keep compatibility with ReadyScreen import in real mode/demo-less builds
export const startDemoRun = () => {};

export default { getCar, getStart, getFinish, setStartBase, setFinishBase, getStartBase, getFinishBase };
