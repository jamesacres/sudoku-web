'use client';

import { useCallback } from 'react';

export enum StateType {
  PUZZLE = 'PUZZLE',
  TIMER = 'TIMER',
}

function useLocalStorage() {
  const getStateKey = (type: StateType, puzzleId: string) => {
    let key = `sudoku-${puzzleId}`;
    if (type !== StateType.PUZZLE) {
      key = `${key}-${type}`;
    }
    return key;
  };

  const getSavedState = useCallback(
    <T>(type: StateType, puzzleId: string): T | undefined => {
      try {
        const savedState = localStorage.getItem(getStateKey(type, puzzleId));
        if (savedState) {
          return JSON.parse(savedState);
        }
      } catch (e) {
        console.error(e);
      }
      return undefined;
    },
    []
  );

  const saveState = useCallback(
    <T>(type: StateType, puzzleId: string, state: T) => {
      localStorage.setItem(getStateKey(type, puzzleId), JSON.stringify(state));
    },
    []
  );

  return { getSavedState, saveState };
}

export { useLocalStorage };
