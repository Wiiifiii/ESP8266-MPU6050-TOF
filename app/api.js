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

// Forward-axis learning endpoints (always use Car IP)
export const startLearnForward = () => axios.get('http://192.168.4.1/learn_forward/start', { timeout: 1500 });
export const stopLearnForward  = () => axios.get('http://192.168.4.1/learn_forward/stop',  { timeout: 3000 });

// Try simple discovery for Finish unit and set base when found
// ---------- Role-safe discovery helpers ----------
const CANDIDATES = ['http://192.168.4.2', 'http://192.168.4.3'];

async function whoAmI(base) {
	try {
		const r = await axios.get(`${base}/whoami`, { timeout: 800 });
		const role = r?.data?.role;
		if (role === 'START' || role === 'FINISH') return role;
	} catch {}
	try {
		const s = await axios.get(`${base}/status`, { timeout: 800 });
		const d = s?.data || {};
		if ('finished' in d) return 'FINISH';
		if ('ready' in d)    return 'START';
	} catch {}
	return null;
}

export async function discoverUnits() {
	const roles = {};
	for (const base of CANDIDATES) {
		const role = await whoAmI(base);
		if (role) roles[role] = base;
	}
	if (roles.START)  setStartBaseExport(roles.START);
	if (roles.FINISH) setFinishBaseExport(roles.FINISH);

	// Guard against duplicates: if still equal, prefer canonical defaults
	if (getStartBaseExport() === getFinishBaseExport()) {
		setStartBaseExport('http://192.168.4.2');
		setFinishBaseExport('http://192.168.4.3');
	}
	return {
		start:  getStartBaseExport(),
		finish: getFinishBaseExport(),
	};
}

export async function ensureDistinctRoles() {
	if (getStartBaseExport() === getFinishBaseExport()) {
		await discoverUnits();
	}
	return {
		start:  getStartBaseExport(),
		finish: getFinishBaseExport(),
	};
}
