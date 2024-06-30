'use client';

import { useCallback } from 'react';

export enum StateType {
  PUZZLE = 'PUZZLE',
  TIMER = 'TIMER',
}

function useLocalStorage({ type, id }: { type: StateType; id: string }) {
  const getStateKey = useCallback(() => {
    let key = `sudoku-${id}`;
    if (type !== StateType.PUZZLE) {
      key = `${key}-${type}`;
    }
    return key;
  }, [id, type]);

  const getValue = useCallback(<T>():
    | { lastUpdated: number; state: T }
    | undefined => {
    try {
      const savedState = localStorage.getItem(getStateKey());
      if (savedState) {
        return JSON.parse(savedState);
      }
    } catch (e) {
      console.error(e);
    }
    return undefined;
  }, [getStateKey]);

  const saveValue = useCallback(
    <T>(state: T) => {
      const lastUpdated = new Date().getTime();
      localStorage.setItem(
        getStateKey(),
        JSON.stringify({ lastUpdated, state })
      );
    },
    [getStateKey]
  );

  return { getValue, saveValue };
}

export { useLocalStorage };
