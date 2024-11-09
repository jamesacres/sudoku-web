'use client';

import { StateType } from '@/types/StateType';
import { useCallback } from 'react';

export interface StateResult<T> {
  lastUpdated: number;
  state: T;
}

function useLocalStorage({
  type,
  id,
  prefix = 'sudoku-',
}: {
  type: StateType;
  id?: string;
  prefix?: string;
}) {
  const getStateKey = useCallback(
    (overrideId?: string) => {
      const thisId = overrideId || id;
      if (!thisId) {
        throw Error('id required');
      }
      let key = `${prefix}${thisId}`;
      if (type !== StateType.PUZZLE) {
        key = `${key}-${type}`;
      }
      return key;
    },
    [id, type, prefix]
  );

  const listValues = useCallback(
    <T>(): (StateResult<T> & {
      sessionId: string;
    })[] =>
      Object.entries(localStorage)
        .filter(([key]) => {
          if (type !== StateType.PUZZLE) {
            return key.endsWith(`-${type}`);
          }
          return RegExp(`^${prefix}[^-]+$`).test(key);
        })
        .map(([key, value]) => {
          try {
            const parsedValue = JSON.parse(value);
            const matches = key.match(RegExp(`^(${prefix}[^-]+)`));
            if (matches?.length) {
              return { ...parsedValue, sessionId: matches[1] };
            }
          } catch (e) {
            console.error(e);
          }
          return undefined;
        })
        .filter((value) => !!value),
    [type, prefix]
  );

  const getValue = useCallback(
    <T>({
      overrideId,
    }: {
      overrideId?: string;
    } = {}): StateResult<T> | undefined => {
      try {
        const savedState = localStorage.getItem(getStateKey(overrideId));
        if (savedState) {
          return JSON.parse(savedState);
        }
      } catch (e) {
        console.error(e);
      }
      return undefined;
    },
    [getStateKey]
  );

  const saveValue = useCallback(
    <T>(
      state: T,
      { overrideId }: { overrideId?: string } = {}
    ): StateResult<T> => {
      const lastUpdated = new Date().getTime();
      const result = { lastUpdated, state };
      localStorage.setItem(getStateKey(overrideId), JSON.stringify(result));
      return result;
    },
    [getStateKey]
  );

  return { prefix, listValues, getValue, saveValue };
}

export { useLocalStorage };
