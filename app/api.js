// app/api.js
import axios from 'axios';
import { USE_DEMO } from './config';
import * as demo from './api.demo';
import * as realNS from './api.real'; // keep if you have a separate real module (optional)

// Single axios for Car
const carApi = axios.create({ baseURL: 'http://192.168.4.1', timeout: 1500 });

let START_BASE  = 'http://192.168.4.2';
let FINISH_BASE = 'http://192.168.4.3';

function setStartBase(v)  { START_BASE = v; }
function setFinishBase(v) { FINISH_BASE = v; }
function getStartBase()   { return START_BASE; }
function getFinishBase()  { return FINISH_BASE; }

// Real implementations gathered in one object
const real = {
	getCar:    () => carApi.get('/data'),
	getStart:  () => axios.get(`${START_BASE}/status`,  { timeout: 1200 }),
	getFinish: () => axios.get(`${FINISH_BASE}/status`, { timeout: 1200 }),
	setStartBase, setFinishBase, getStartBase, getFinishBase,
	// real mode has no-op for demo-only helpers:
	startDemoRun: () => {}
};

// Choose API by flag
const api = USE_DEMO ? demo : real;

// ✅ Make named exports respect the mode
export const {
	getCar,
	getStart,
	getFinish,
	setStartBase: setStartBaseExport,
	setFinishBase: setFinishBaseExport,
	getStartBase: getStartBaseExport,
	getFinishBase: getFinishBaseExport,
	startDemoRun = () => {}
} = api;

// Keep original names for callers that imported them already
export {
	setStartBaseExport as setStartBase,
	setFinishBaseExport as setFinishBase,
	getStartBaseExport as getStartBase,
	getFinishBaseExport as getFinishBase,
};

export default api;

// Optional: quick runtime breadcrumb
// console.info('[API MODE]', USE_DEMO ? 'DEMO' : 'REAL', { START_BASE, FINISH_BASE });
