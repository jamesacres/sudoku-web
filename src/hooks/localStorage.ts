'use client';

import { StateType } from '@/types/StateType';
import { useCallback } from 'react';

export interface StateResult<T> {
  lastUpdated: number;
  state: T;
}

function useLocalStorage({ type, id }: { type: StateType; id?: string }) {
  const getStateKey = useCallback(() => {
    let key = `sudoku-${id}`;
    if (type !== StateType.PUZZLE) {
      key = `${key}-${type}`;
    }
    return key;
  }, [id, type]);

  const listValues = useCallback(
    <T>(): (StateResult<T> & {
      sessionId: string;
    })[] =>
      Object.entries(localStorage)
        .filter(([key]) => {
          if (type !== StateType.PUZZLE) {
            return key.endsWith(`-${type}`);
          }
          return /^sudoku-[^-]+$/.test(key);
        })
        .map(([key, value]) => {
          try {
            const parsedValue = JSON.parse(value);
            const matches = key.match(/^(sudoku-[^-]+)/);
            if (matches?.length) {
              console.info(matches[1]);
              return { ...parsedValue, sessionId: matches[1] };
            }
          } catch (e) {
            console.error(e);
          }
          return undefined;
        })
        .filter((value) => !!value),
    [type]
  );

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

  return { listValues, getValue, saveValue };
}

export { useLocalStorage };
