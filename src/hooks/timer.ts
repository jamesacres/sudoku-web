'use client';
import { useCallback, useEffect, useState } from 'react';
import { useDocumentVisibility } from './documentVisibility';
import { useLocalStorage } from './localStorage';
import { StateType } from '../types/StateType';
import { Timer } from '../types/timer';
import { calculateSeconds } from '@/helpers/calculateSeconds';

function useTimer({ puzzleId }: { puzzleId: string }) {
  const isDocumentVisible = useDocumentVisibility();
  const { getValue, saveValue } = useLocalStorage({
    id: puzzleId,
    type: StateType.TIMER,
  });
  const [timer, setTimer] = useState<null | Timer>(null);

  // Timer - calculates time spent on page

  const setTimerNewSession = useCallback((restoreTimer?: Timer) => {
    const now = new Date().toISOString();
    setTimer((currentTimer) => {
      const timer = restoreTimer || currentTimer;
      return {
        ...timer,
        seconds: calculateSeconds(timer),
        inProgress: { start: now, lastInteraction: now },
      };
    });
  }, []);

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
    const { state: savedTimer } = getValue<Timer>() || {};
    if (savedTimer) {
      setTimerNewSession(savedTimer);
    }
  }, [puzzleId, getValue, setTimerNewSession]);
  useEffect(() => {
    if (timer) {
      saveValue(timer);
    }
  }, [puzzleId, timer, saveValue]);

  return {
    setTimerNewSession,
    timer,
  };
}

export { useTimer };
