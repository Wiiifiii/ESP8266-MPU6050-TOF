// screens/ConnectScreen.js
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, Linking } from 'react-native';
import StepperHeader from '../components/StepperHeader';
import { getCar, getStart, getFinish } from '../api';

function openWifiSettings() {
  // OSs don't allow apps to switch Wi-Fi automatically; this opens Settings
  Linking.openSettings().catch(() => {});
}

function StatusRow({ label, ok }) {
  return (
    <View style={{
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee'
    }}>
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

  // Two-cable flow: allow Next when Car + Start are OK; Finish can be hot-plugged later
  const allOK = apOK && startOK;

  useEffect(() => {
    let mounted = true;

    async function tick() {
      try {
        // Car/AP
        try { await getCar();    mounted && setApOK(true);    } catch { mounted && setApOK(false); }
        // Start
        try { await getStart();  mounted && setStartOK(true); } catch { mounted && setStartOK(false); }
        // Finish
        try { await getFinish(); mounted && setFinishOK(true);} catch { mounted && setFinishOK(false); }
      } finally {
        if (mounted) loopRef.current = setTimeout(tick, 900);
      }
    }

    setIsChecking(true);
    tick();
    const settle = setTimeout(() => setIsChecking(false), 900);

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

        {/* Wi-Fi helper */}
        <View style={{
          borderWidth: 1, borderColor: '#eee', borderRadius: 16, padding: 16, gap: 10
        }}>
          <Text style={{ color: '#666' }}>
            Join Wi-Fi network <Text style={{ fontWeight: '800' }}>RaceTimerNet</Text> first.
            On a phone, disable mobile data so 192.168.4.x routes correctly.
          </Text>
          <Pressable
            onPress={openWifiSettings}
            style={({ pressed }) => ({
              alignSelf: 'flex-start',
              backgroundColor: '#f2f2f2',
              paddingVertical: 10, paddingHorizontal: 12,
              borderRadius: 10, opacity: pressed ? 0.85 : 1
            })}
          >
            <Text style={{ fontWeight: '700' }}>Open Settings</Text>
          </Pressable>
        </View>

        {/* Status list */}
        <View style={{ borderWidth: 1, borderColor: '#eee', borderRadius: 16, paddingHorizontal: 16 }}>
          <StatusRow label="Car/AP (192.168.4.1 /data)" ok={apOK} />
          <StatusRow label="Start unit (192.168.4.2 /status)" ok={startOK} />
          <StatusRow label="Finish unit (192.168.4.3 /status)" ok={finishOK} />
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
              opacity: pressed ? 0.85 : 1
            })}
          >
            <Text style={{ color: 'white', fontWeight: '700' }}>Next</Text>
          </Pressable>

          <Pressable
            onPress={() => { setIsChecking(true); setTimeout(() => setIsChecking(false), 900); }}
            style={({ pressed }) => ({
              paddingVertical: 14, paddingHorizontal: 16,
              borderRadius: 12, borderWidth: 1, borderColor: '#ddd',
              opacity: pressed ? 0.85 : 1
            })}
          >
            <Text style={{ fontWeight: '700' }}>Retry</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
