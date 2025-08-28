/**
 * Project: ESP8266-MPU6050-TOF
 * Module/File: app/screens/ConnectScreen.js
 * Purpose: App screen (React Native)
 * Notes: Auto-generated header; behavior unchanged.
 */

/**
 * Module: app/screens/ConnectScreen.js
 * Purpose: First connectivity gate; checks Car/AP, Start, and Finish reachability; discovers bases.
 */
// screens/ConnectScreen.js
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, Linking } from 'react-native';
import StepperHeader from '../components/StepperHeader';
import axios from 'axios';
import {
  getCar,
  getStart,
  getFinish,
  setStartBase,
  setFinishBase,
  getStartBase,
  getFinishBase,
  discoverFinish,
} from '../api';

function openWifiSettings() {
  Linking.openSettings().catch(() => {});
}

async function discover(baseCandidates, path, sanity) {
  for (const base of baseCandidates) {
    try {
      const { data } = await axios.get(`${base}${path}`, { timeout: 600 });
      if (sanity(data)) return base;
    } catch {}
  }
  return null;
}

function Row({ label, ok }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: '600' }}>{label}</Text>
      <Text style={{ fontSize: 18, fontWeight: '700', color: ok ? '#1a7f37' : '#c00' }}>
        {ok ? '✓' : '—'}
      </Text>
    </View>
  );
}

export default function ConnectScreen({ navigation }) {
  const [apOK, setApOK] = useState(false);
  const [startOK, setStartOK] = useState(false);
  const [finishOK, setFinishOK] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const loopRef = useRef(null);
  const finishFailCountRef = useRef(0);

  const allOK = apOK && startOK; // proceed with Car+Start; Finish can be hot-plugged later

  useEffect(() => {
    let mounted = true;

    // Ensure default FINISH_BASE is correct at app start if stale
    try {
      if (getFinishBase() !== 'http://192.168.4.3') setFinishBase('http://192.168.4.3');
    } catch {}

    async function tick() {
      try {
        try {
          await getCar();
          mounted && setApOK(true);
        } catch {
          mounted && setApOK(false);
        }

        try {
          await getStart();
          mounted && setStartOK(true);
        } catch {
          const found = await discover(
            [
              'http://192.168.4.2',
              'http://192.168.4.10',
              'http://192.168.4.20',
              'http://192.168.4.30',
              'http://192.168.4.40',
              'http://192.168.4.50',
              'http://192.168.4.60',
            ],
            '/status',
            (d) =>
              d &&
              (typeof d.ready !== 'undefined' ||
                typeof d.distanceMm !== 'undefined' ||
                typeof d.distance !== 'undefined')
          );
          if (found) {
            setStartBase(found);
            try {
              await getStart();
              mounted && setStartOK(true);
            } catch {
              mounted && setStartOK(false);
            }
          } else mounted && setStartOK(false);
        }

        try {
          await getFinish();
          mounted && setFinishOK(true);
          finishFailCountRef.current = 0;
        } catch {
          const found = await discover(
            [
              'http://192.168.4.3',
              'http://192.168.4.10',
              'http://192.168.4.20',
              'http://192.168.4.30',
              'http://192.168.4.40',
              'http://192.168.4.50',
              'http://192.168.4.60',
            ],
            '/status',
            (d) => d && typeof d.finished !== 'undefined'
          );
          if (found) {
            setFinishBase(found);
            try {
              await getFinish();
              mounted && setFinishOK(true);
            } catch {
              mounted && setFinishOK(false);
            }
            finishFailCountRef.current = 0;
          } else {
            finishFailCountRef.current++;
            // After 3 failures in a row, try quick auto-discovery helper
            if (finishFailCountRef.current >= 3) {
              const autoFound = await discoverFinish();
              if (autoFound) {
                console.log('Finish auto-discovered at', autoFound);
                try {
                  await getFinish();
                  mounted && setFinishOK(true);
                } catch {
                  mounted && setFinishOK(false);
                }
                finishFailCountRef.current = 0;
              } else {
                mounted && setFinishOK(false);
              }
            } else {
              mounted && setFinishOK(false);
            }
          }
        }
      } finally {
        if (mounted) loopRef.current = setTimeout(tick, 900);
      }
    }

    setIsChecking(true);
    tick();
    const settle = setTimeout(() => mounted && setIsChecking(false), 900);
    return () => {
      mounted = false;
      clearTimeout(loopRef.current);
      clearTimeout(settle);
    };
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <StepperHeader stepIndex={1} />
      <View style={{ padding: 20, gap: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: '800' }}>Connect devices</Text>

        <View
          style={{ borderWidth: 1, borderColor: '#eee', borderRadius: 16, padding: 16, gap: 10 }}
        >
          <Text style={{ color: '#666' }}>
            Join <Text style={{ fontWeight: '800' }}>RaceTimerNet</Text>. On a phone, disable mobile
            data.
          </Text>
          <Pressable
            onPress={openWifiSettings}
            style={({ pressed }) => ({
              alignSelf: 'flex-start',
              backgroundColor: '#f2f2f2',
              paddingVertical: 10,
              paddingHorizontal: 12,
              borderRadius: 10,
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <Text style={{ fontWeight: '700' }}>Open Settings</Text>
          </Pressable>
          <Text style={{ color: '#999', fontSize: 12 }}>
            Start: {getStartBase()} · Finish: {getFinishBase()}
          </Text>
        </View>

        <View
          style={{ borderWidth: 1, borderColor: '#eee', borderRadius: 16, paddingHorizontal: 16 }}
        >
          <Row label="Car/AP (192.168.4.1 /data)" ok={apOK} />
          <Row label="Start unit (/status)" ok={startOK} />
          <Row label="Finish unit (/status)" ok={finishOK} />
        </View>

        {isChecking && (
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            <ActivityIndicator />
            <Text style={{ color: '#666' }}>Checking…</Text>
          </View>
        )}

        <View style={{ marginTop: 8, flexDirection: 'row', gap: 12 }}>
          <Pressable
            onPress={() => navigation.navigate('DriveToStart')}
            disabled={!allOK}
            style={({ pressed }) => ({
              flex: 1,
              backgroundColor: allOK ? '#6c47ff' : '#ccc',
              paddingVertical: 14,
              borderRadius: 12,
              alignItems: 'center',
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <Text style={{ color: 'white', fontWeight: '700' }}>Next</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              setIsChecking(true);
              setTimeout(() => setIsChecking(false), 900);
            }}
            style={({ pressed }) => ({
              paddingVertical: 14,
              paddingHorizontal: 16,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '#ddd',
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <Text style={{ fontWeight: '700' }}>Retry</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
