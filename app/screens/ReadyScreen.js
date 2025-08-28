/**
 * Module: app/screens/ReadyScreen.js
 * Purpose: Wait until Start sensor is within READY threshold; optional auto-start and Auto-set Forward.
 * Notes: Blocks when Finish is too close to avoid false start.
 */
// screens/ReadyScreen.js
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import StepperHeader from '../components/StepperHeader';
import {
  getStart,
  getFinish,
  startDemoRun,
  startLearnForward,
  stopLearnForward,
  discoverUnits,
  ensureDistinctRoles,
} from '../api';
import { useLap } from '../context/LapContext';
import {
  READY_THRESHOLD_MM,
  SHOW_DEBUG,
  AUTO_START_ON_READY,
  BLOCK_WHEN_FINISH_TOO_CLOSE,
  FINISH_TOO_CLOSE_UI_MM,
} from '../config';

export default function ReadyScreen({ navigation }) {
  const { setStartTime } = useLap();
  const [distanceMm, setDistanceMm] = useState(null);
  const [ready, setReady] = useState(false);
  const pollRef = useRef(null);
  const [finishTooClose, setFinishTooClose] = useState(false);
  const [finishDistanceMm, setFinishDistanceMm] = useState(null);
  const [learningMsg, setLearningMsg] = useState('');
  const readySinceRef = useRef(null);
  const failStartRef = useRef(0);
  const failFinishRef = useRef(0);

  useEffect(() => {
    let mounted = true;
    // Ensure endpoints are set before polling
    (async () => {
      try {
        await discoverUnits();
        await ensureDistinctRoles();
      } catch {}
    })();
    async function tick() {
      try {
        const [{ data: s }, { data: f }] = await Promise.all([
          getStart().catch(() => ({ data: {} })),
          getFinish().catch(() => ({ data: {} })),
        ]);
        if (!mounted) return;
        const mm = Number(s?.distanceMm ?? s?.distance ?? NaN);
        setDistanceMm(Number.isFinite(mm) ? mm : null);
        const reportedReady = s?.ready === true || s?.ready === 'true' || s?.ready === 1;
        const isReady = Number.isFinite(mm) && mm >= 0 ? mm <= READY_THRESHOLD_MM : reportedReady;
        setReady(!!isReady);
        const dist = typeof f?.distanceMm === 'number' ? f.distanceMm : Infinity;
        setFinishDistanceMm(Number.isFinite(dist) ? dist : null);
        const tooClose = BLOCK_WHEN_FINISH_TOO_CLOSE
          ? Number.isFinite(dist)
            ? dist <= FINISH_TOO_CLOSE_UI_MM
            : f?.finished === true || f?.finished === 'true' || f?.finished === 1
          : false;
        setFinishTooClose(!!tooClose);

        // Track failures and auto-recover by rediscovering endpoints
        const startOk = Number.isFinite(mm) || typeof s?.ready !== 'undefined';
        const finishOk = Number.isFinite(dist) || typeof f?.finished !== 'undefined';
        failStartRef.current = startOk ? 0 : Math.min(50, failStartRef.current + 1);
        failFinishRef.current = finishOk ? 0 : Math.min(50, failFinishRef.current + 1);
        if (failStartRef.current >= 8 || failFinishRef.current >= 8) {
          try {
            await discoverUnits();
            await ensureDistinctRoles();
          } catch {}
          failStartRef.current = 0;
          failFinishRef.current = 0;
        }

        if (AUTO_START_ON_READY) {
          const now = Date.now();
          if (isReady) {
            if (!readySinceRef.current) readySinceRef.current = now;
            if (now - readySinceRef.current >= 600) return beginRun();
          } else readySinceRef.current = null;
        }
      } finally {
        pollRef.current = setTimeout(tick, 250);
      }
    }
    tick();
    return () => {
      mounted = false;
      clearTimeout(pollRef.current);
    };
  }, []);

  function beginRun() {
    clearTimeout(pollRef.current);
    setStartTime(Date.now());
    if (typeof startDemoRun === 'function') startDemoRun();
    navigation.replace('Running');
  }

  async function autoSetForward() {
    try {
      setLearningMsg('Drive straight ~1–2 s…');
      await startLearnForward();
      const delayMs = 1800;
      await new Promise((res) => setTimeout(res, delayMs));
      const { data } = await stopLearnForward().catch(() => ({ data: { ok: false } }));
      if (data && data.ok) {
        setLearningMsg('Forward set');
        setTimeout(() => setLearningMsg(''), 1200);
      } else {
        setLearningMsg("Couldn't detect—try again accelerating straight.");
      }
    } catch (e) {
      setLearningMsg("Couldn't detect—try again accelerating straight.");
    }
  }

  const canStart = ready && !finishTooClose;
  return (
    <View style={{ flex: 1 }}>
      <StepperHeader stepIndex={3} />
      <View style={{ padding: 20, gap: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: '800' }}>Get ready</Text>
        <Text style={{ color: '#666' }}>
          Move car within ≤ {READY_THRESHOLD_MM} mm. Wait as long as you like, then press Start lap.
        </Text>

        <View
          style={{
            borderWidth: 1,
            borderColor: ready ? '#1a7f37' : '#eee',
            borderRadius: 16,
            padding: 16,
            gap: 8,
          }}
        >
          <Row label="Distance to start" value={distanceMm == null ? '—' : `${distanceMm} mm`} />
          <Row
            label="Ready"
            value={ready ? 'YES' : 'NO'}
            valueStyle={{ color: ready ? '#1a7f37' : '#c00', fontWeight: '800' }}
          />
          {SHOW_DEBUG && (
            <Text style={{ color: '#999', fontSize: 12 }}>
              Raw: {distanceMm == null ? '—' : `${distanceMm} mm`}
            </Text>
          )}
        </View>

        <Pressable
          onPress={beginRun}
          disabled={!canStart}
          style={({ pressed }) => ({
            backgroundColor: canStart ? '#6c47ff' : '#ccc',
            paddingVertical: 14,
            borderRadius: 12,
            alignItems: 'center',
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <Text style={{ color: 'white', fontWeight: '700' }}>
            {finishTooClose
              ? `Move away from Finish sensor (<${FINISH_TOO_CLOSE_UI_MM} mm)`
              : 'Start lap'}
          </Text>
        </Pressable>
        <Pressable
          onPress={autoSetForward}
          style={({ pressed }) => ({
            marginTop: 10,
            backgroundColor: '#eee',
            paddingVertical: 12,
            borderRadius: 10,
            alignItems: 'center',
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <Text style={{ fontWeight: '700' }}>Auto-set Forward</Text>
        </Pressable>
        {!!learningMsg && <Text style={{ marginTop: 6, color: '#666' }}>{learningMsg}</Text>}
        {finishTooClose && (
          <Text style={{ color: '#c00', marginTop: 8 }}>
            Finish distance: {finishDistanceMm == null ? '—' : `${finishDistanceMm} mm`}
          </Text>
        )}
      </View>
    </View>
  );
}

function Row({ label, value, valueStyle }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <Text style={{ color: '#666' }}>{label}</Text>
      <Text style={[{ fontWeight: '800' }, valueStyle]}>{value}</Text>
    </View>
  );
}
// screens/ReadyScreen.js
