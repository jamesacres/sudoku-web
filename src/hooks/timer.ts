'use client';
import { useCallback, useEffect, useState } from 'react';
import { useDocumentVisibility } from './documentVisibility';
import { StateType, useLocalStorage } from './localStorage';

export interface Timer {
  seconds: number;
  inProgress: {
    start: string;
    lastInteraction: string;
  };
}

function useTimer({ puzzleId }: { puzzleId: string }) {
  const isDocumentVisible = useDocumentVisibility();
  const { getSavedState, saveState } = useLocalStorage({
    id: puzzleId,
    type: StateType.TIMER,
  });
  const [timer, setTimer] = useState<null | Timer>(null);

  // Timer - calculates time spent on page
  const calculateSeconds = useCallback((timer: Timer | null) => {
    let nextSeconds = 0;
    if (timer) {
      nextSeconds =
        timer.seconds +
        Math.floor(
          (new Date(timer.inProgress.lastInteraction).getTime() -
            new Date(timer.inProgress.start).getTime()) /
            1000
        );
    }
    return nextSeconds;
  }, []);

  const setTimerNewSession = useCallback(
    (restoreTimer?: Timer) => {
      const now = new Date().toISOString();
      setTimer((currentTimer) => {
        const timer = restoreTimer || currentTimer;
        return {
          ...timer,
          seconds: calculateSeconds(timer),
          inProgress: { start: now, lastInteraction: now },
        };
      });
    },
    [calculateSeconds]
  );

  const setTimerLastInteraction = useCallback(() => {
    const now = new Date().toISOString();
    setTimer((timer) => {
      if (timer) {
        return {
          ...timer,
          inProgress: {
            ...timer.inProgress,
            lastInteraction: now,
          },
        };
      }
      return null;
    });
  }, []);

  // Force timer to re-render
  useEffect(() => {
    const interval = setInterval(() => {
      if (isDocumentVisible) {
        setTimerLastInteraction();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isDocumentVisible, setTimerLastInteraction]);

  useEffect(() => {
    console.info('isDocumentVisible', isDocumentVisible);
    if (isDocumentVisible) {
      // Document now visible, start a new session
      setTimerNewSession();
    } else {
      // Document now invisible, set lastInteraction to now
      setTimerLastInteraction();
    }
  }, [isDocumentVisible, setTimerNewSession, setTimerLastInteraction]);

  // Save and Restore state
  useEffect(() => {
    const savedTimer = getSavedState<Timer>();
    if (savedTimer) {
      setTimerNewSession(savedTimer);
    }
  }, [puzzleId, getSavedState, setTimerNewSession]);
  useEffect(() => {
    if (timer) {
      saveState(timer);
    }
  }, [puzzleId, timer, saveState]);

  return {
    calculateSeconds,
    setTimerNewSession,
    timer,
  };
}

export { useTimer };
