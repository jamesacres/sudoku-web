'use client';

import { useCallback } from 'react';

export enum StateType {
  PUZZLE = 'PUZZLE',
  TIMER = 'TIMER',
}

export interface StateResult<T> {
  lastUpdated: number;
  state: T;
}

function useLocalStorage({ type, id }: { type: StateType; id: string }) {
  const getStateKey = useCallback(() => {
    let key = `sudoku-${id}`;
    if (type !== StateType.PUZZLE) {
      key = `${key}-${type}`;
    }
    return key;
  }, [id, type]);

  const getValue = useCallback(<T>(): StateResult<T> | undefined => {
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
    <T>(state: T): StateResult<T> => {
      const lastUpdated = new Date().getTime();
      const result = { lastUpdated, state };
      localStorage.setItem(getStateKey(), JSON.stringify(result));
      return result;
    },
    [getStateKey]
  );

  return { getValue, saveValue };
}

export { useLocalStorage };
