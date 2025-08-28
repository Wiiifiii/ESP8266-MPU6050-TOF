/**
 * add-headers.js
 * Walks the repo, prepends standardized headers to source files.
 * No external deps; Node core only.
 */

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const SKIP_DIRS = new Set([
  '.git',
  'node_modules',
  '.expo',
  '.expo-shared',
  'dist',
  'build',
  '.pio',
  '.pioenvs',
  '.piolibdeps',
]);

const TARGET_EXTS = new Set(['.cpp', '.h', '.hpp', '.ino', '.c', '.js', '.jsx', '.ts', '.tsx']);
const C_LIKE_EXTS = new Set(['.cpp', '.h', '.hpp', '.ino', '.c']);

const HEADER_MARK = 'Project: ESP8266-MPU6050-TOF';

/** Normalize a path to posix style (forward slashes) relative to repo root */
function relPosix(filePath) {
  const rel = path.relative(REPO_ROOT, filePath);
  return rel.split(path.sep).join('/');
}

/** Infer purpose string based on relative posix path */
function inferPurpose(rel) {
  const base = path.posix.basename(rel).toLowerCase();
  if (rel.startsWith('firmware/src/CarUnit/')) {
    return 'CAR unit firmware (IMU → accel/speed, /data)';
  }
  if (rel.startsWith('firmware/src/StartUnit/')) {
    return 'START unit firmware (ToF distance/ready, /status)';
  }
  if (rel.startsWith('firmware/src/FinishUnit/')) {
    return 'FINISH unit firmware (ToF + hysteresis, /status)';
  }
  if (base.startsWith('imu_fusion')) {
    return 'IMU fusion (gravity removal, LPF, ZUPT, forward axis)';
  }
  if (rel.startsWith('app/screens/')) {
    return 'App screen (React Native)';
  }
  if (rel.startsWith('app/hooks/')) {
    return 'App hook (polling/stopwatch/telemetry)';
  }
  if (rel.startsWith('app/api')) {
    return 'HTTP API client (real/demo, discovery)';
  }
  if (rel.startsWith('app/components/')) {
    return 'UI component';
  }
  if (rel.startsWith('app/providers/')) {
    return 'Context/provider';
  }
  if (rel.startsWith('app/state/')) {
    return 'App state (history/best lap)';
  }
  return 'Module';
}

/** Build header text based on extension */
function buildHeader(rel, ext) {
  const purpose = inferPurpose(rel);
  const lines = [
    `Project: ESP8266-MPU6050-TOF`,
    `Module/File: ${rel}`,
    `Purpose: ${purpose}`,
    `Notes: Auto-generated header; behavior unchanged.`,
  ];
  if (C_LIKE_EXTS.has(ext)) {
    // C-style block
    const body = lines.map(l => ` * ${l}`).join('\n');
    return `/*\n${body}\n */`;
  }
  // JS/TS JSDoc-style block
  const body = lines.map(l => ` * ${l}`).join('\n');
  return `/**\n${body}\n */`;
}

/** Check if header marker exists in first 30 lines */
function hasHeaderMarker(content) {
  const lines = content.split(/\r?\n/).slice(0, 30).join('\n');
  return lines.includes(HEADER_MARK);
}

function walk(dir, outFiles) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      walk(full, outFiles);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      if (!TARGET_EXTS.has(ext)) continue;
      outFiles.push(full);
    }
  }
}

function main() {
  const all = [];
  walk(REPO_ROOT, all);

  const updated = [];
  for (const abs of all) {
    try {
      const rel = relPosix(abs);
      const ext = path.extname(abs);
      const content = fs.readFileSync(abs, 'utf8');
      if (hasHeaderMarker(content)) {
        continue; // Skip already headered
      }
      const header = buildHeader(rel, ext);
      const newContent = `${header}\n\n${content}`;
      fs.writeFileSync(abs, newContent, 'utf8');
      updated.push(rel);
    } catch (err) {
      // Don't crash the run; just report to console
      console.warn('[add-headers] Skipped due to error:', abs, err.message);
    }
  }

  // Ensure tools dir exists
  const toolsDir = path.join(REPO_ROOT, 'tools');
  if (!fs.existsSync(toolsDir)) fs.mkdirSync(toolsDir, { recursive: true });

  // Write report
  const reportPath = path.join(toolsDir, 'header-report.txt');
  const report = [
    `Updated files: ${updated.length}`,
    ...updated.map(f => `- ${f}`),
    '',
  ].join('\n');
  fs.writeFileSync(reportPath, report, 'utf8');

  console.log(`[add-headers] Done. Updated ${updated.length} file(s). Report at tools/header-report.txt`);
}

main();
