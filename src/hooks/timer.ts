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
    const COUNTDOWN = 4;
    const nowDate = new Date();
    nowDate.setSeconds(nowDate.getSeconds() + COUNTDOWN);
    const now = nowDate.toISOString();

    setTimer((currentTimer) => {
      const timer = restoreTimer || currentTimer;
      return {
        ...timer,
        seconds: calculateSeconds(timer),
        inProgress: { start: now, lastInteraction: now },
        countdown: COUNTDOWN,
      };
    });
  }, []);

  const updateTimer = useCallback(() => {
    const now = new Date().toISOString();
    setTimer((timer) => {
      if (timer) {
        if (timer.countdown && timer.countdown > 0) {
          return {
            ...timer,
            countdown: timer.countdown - 1,
          };
        } else {
          return {
            ...timer,
            inProgress: {
              ...timer.inProgress,
              lastInteraction: now,
            },
          };
        }
      }
      return null;
    });
  }, []);

  // Force timer to re-render
  useEffect(() => {
    const interval = setInterval(() => {
      if (isDocumentVisible) {
        updateTimer();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isDocumentVisible, updateTimer]);

  useEffect(() => {
    console.info('isDocumentVisible', isDocumentVisible);
    if (isDocumentVisible) {
      // Document now visible, start a new session
      setTimerNewSession();
    } else {
      // Document now invisible, set lastInteraction to now
      updateTimer();
    }
  }, [isDocumentVisible, setTimerNewSession, updateTimer]);

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
