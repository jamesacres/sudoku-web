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

  const getSavedState = useCallback(<T>(): T | undefined => {
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

  const saveState = useCallback(
    <T>(state: T) => {
      localStorage.setItem(getStateKey(), JSON.stringify(state));
    },
    [getStateKey]
  );

  return { getSavedState, saveState };
}

export { useLocalStorage };
