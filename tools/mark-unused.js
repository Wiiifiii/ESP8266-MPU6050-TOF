/**
 * Project: ESP8266-MPU6050-TOF
 * Module/File: tools/mark-unused.js
 * Purpose: Module
 * Notes: Auto-generated header; behavior unchanged.
 */

/**
 * mark-unused.js
 * Prepends a banner to known/unused files to flag them as demo/test-only.
 * No external deps; Node core only.
 */

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const UNUSED_JSON = path.join(REPO_ROOT, 'UNUSED_FILES.json');

const KNOWN_UNUSED = [
  'app/api.demo.js',
  'app/screens/ConnectScreen.demo.js',
  'app/screens/DiagnosticsScreen.js',
  'app/components/HistoryPanel.js',
  'app/utils/scratch.js',
];

const CPP_STYLE_EXTS = new Set(['.c', '.cpp', '.h', '.hpp', '.ino']);
const JS_STYLE_EXTS = new Set(['.js', '.jsx', '.ts', '.tsx']);

const JS_BANNER = '// NOTE: Not used in the current demo build; kept for reference/testing.';
const CPP_BANNER = '// NOTE: Not used in the current demo firmware; kept for reference/testing.';

function relPosix(filePath) {
  const rel = path.relative(REPO_ROOT, filePath);
  return rel.split(path.sep).join('/');
}

function existingListFromJson() {
  if (!fs.existsSync(UNUSED_JSON)) return [];
  try {
    const raw = fs.readFileSync(UNUSED_JSON, 'utf8');
    const data = JSON.parse(raw);
    const arr = Array.isArray(data?.unusedFiles) ? data.unusedFiles : [];
    return arr.filter(x => typeof x === 'string');
  } catch (e) {
    console.warn('[mark-unused] Failed to parse UNUSED_FILES.json:', e.message);
    return [];
  }
}

function bannerFor(ext) {
  if (CPP_STYLE_EXTS.has(ext)) return CPP_BANNER;
  return JS_BANNER; // default to JS-style
}

function ensureBanner(absPath) {
  const ext = path.extname(absPath);
  const banner = bannerFor(ext);
  const content = fs.readFileSync(absPath, 'utf8');
  // If already contains exact line anywhere, skip
  if (content.split(/\r?\n/).includes(banner)) return false;
  const updated = `${banner}\n${content}`;
  fs.writeFileSync(absPath, updated, 'utf8');
  return true;
}

function main() {
  const candidates = new Set();
  // built-in list
  for (const rel of KNOWN_UNUSED) candidates.add(rel);
  // from json
  for (const rel of existingListFromJson()) candidates.add(rel);

  const bannered = [];
  for (const rel of candidates) {
    const abs = path.join(REPO_ROOT, rel);
    if (!fs.existsSync(abs)) continue;
    try {
      if (ensureBanner(abs)) bannered.push(rel);
    } catch (e) {
      console.warn('[mark-unused] Failed to banner:', rel, e.message);
    }
  }

  // report
  const toolsDir = path.join(REPO_ROOT, 'tools');
  if (!fs.existsSync(toolsDir)) fs.mkdirSync(toolsDir, { recursive: true });
  const reportPath = path.join(toolsDir, 'unused-report.txt');
  const report = [
    `Bannered files: ${bannered.length}`,
    ...bannered.map(f => `- ${f}`),
    '',
  ].join('\n');
  fs.writeFileSync(reportPath, report, 'utf8');

  console.log(`[mark-unused] Done. Bannered ${bannered.length} file(s). Report at tools/unused-report.txt`);
}

main();
