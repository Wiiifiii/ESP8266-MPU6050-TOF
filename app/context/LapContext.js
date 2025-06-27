import React, { createContext, useState } from 'react';

export const LapContext = createContext();

export const LapProvider = ({ children }) => {
  const [trackDistance, setTrackDistance] = useState(0);
  const [startTime, setStartTime]         = useState(null);
  const [finishTime, setFinishTime]       = useState(null);
  const [readings, setReadings]           = useState([]);   // { t, speed, ax }
  const [lapHistory, setLapHistory]       = useState([]);   // array of summaries

  const resetSession = () => {
    setStartTime(null);
    setFinishTime(null);
    setReadings([]);
  };

  return (
    <LapContext.Provider value={{
      trackDistance, setTrackDistance,
      startTime,     setStartTime,
      finishTime,    setFinishTime,
      readings,      setReadings,
      lapHistory,    setLapHistory,
      resetSession,
    }}>
      {children}
    </LapContext.Provider>
  );
};
