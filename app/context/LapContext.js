/**
 * Project: ESP8266-MPU6050-TOF
 * Module/File: app/context/LapContext.js
 * Purpose: Module
 * Notes: Auto-generated header; behavior unchanged.
 */

// context/LapContext.js
import React, { createContext, useContext, useMemo, useState } from 'react';

const LapContext = createContext(null);

export function LapProvider({ children }) {
  // Track configuration
  const [trackDistance, setTrackDistance] = useState(60); // meters

  // One-lap runtime state
  const [startTime, setStartTime] = useState(null); // ms epoch
  const [endTime, setEndTime] = useState(null); // ms epoch
  const [readings, setReadings] = useState([]); // [{t,speed,ax,ay,az,distance}]

  // Computed/summary + history
  const [lastSummary, setLastSummary] = useState(null);
  const [lapHistory, setLapHistory] = useState([]); // newest first, keep 10

  function resetLap() {
    setStartTime(null);
    setEndTime(null);
    setReadings([]);
    setLastSummary(null);
  }

  const value = useMemo(
    () => ({
      // config
      trackDistance,
      setTrackDistance,

      // runtime
      startTime,
      setStartTime,
      endTime,
      setEndTime,
      readings,
      setReadings,

      // summaries
      lastSummary,
      setLastSummary,
      lapHistory,
      setLapHistory,

      // helpers
      resetLap,
    }),
    [trackDistance, startTime, endTime, readings, lastSummary, lapHistory]
  );

  return <LapContext.Provider value={value}>{children}</LapContext.Provider>;
}

export function useLap() {
  const ctx = useContext(LapContext);
  if (!ctx) throw new Error('useLap must be used inside LapProvider');
  return ctx;
}
