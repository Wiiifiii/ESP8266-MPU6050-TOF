import React, { createContext, useState } from 'react';

export const LapContext = createContext();

export function LapProvider({ children }) {
  const [trackDistance,    setTrackDistance]    = useState(0);
  const [startTime,        setStartTime]        = useState(null);
  const [finishTime,       setFinishTime]       = useState(null);
  const [readings,         setReadings]         = useState([]);
  const [traveledDistance, setTraveledDistance] = useState(0);
  const [speed,            setSpeed]            = useState(0);
  const [accel,            setAccel]            = useState(0);
  const [lapHistory,       setLapHistory]       = useState([]);

  const resetSession = () => {
    setStartTime(null);
    setFinishTime(null);
    setTraveledDistance(0);
    setReadings([]);
  };

  return (
    <LapContext.Provider value={{
      trackDistance, setTrackDistance,
      startTime,     setStartTime,
      finishTime,    setFinishTime,
      readings,      setReadings,
      traveledDistance, setTraveledDistance,
      speed,         setSpeed,
      accel,         setAccel,
      lapHistory,    setLapHistory,
      resetSession,
    }}>
      {children}
    </LapContext.Provider>
  );
}
