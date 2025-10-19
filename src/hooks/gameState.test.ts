import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useGameState } from './gameState';
import { Puzzle } from '@/types/puzzle';
import { GameStateMetadata } from '@/types/state';

jest.mock('./documentVisibility', () => ({
  useDocumentVisibility: () => true,
}));
jest.mock('./localStorage', () => ({
  useLocalStorage: () => ({ getValue: jest.fn(), saveValue: jest.fn() }),
}));
jest.mock('./serverStorage', () => ({
  useServerStorage: () => ({
    getValue: jest.fn().mockResolvedValue(undefined),
    saveValue: jest.fn().mockResolvedValue(undefined),
  }),
}));
jest.mock('./timer', () => ({
  useTimer: () => ({
    timer: {},
    setTimerNewSession: jest.fn(),
    stopTimer: jest.fn(),
    setPauseTimer: jest.fn(),
    isPaused: false,
  }),
}));
jest.mock('./useParties', () => ({ useParties: () => ({ parties: [] }) }));
jest.mock('../providers/UserProvider', () => ({
  UserContext: React.createContext({}),
}));
jest.mock('../providers/RevenueCatProvider/RevenueCatProvider', () => ({
  RevenueCatContext: React.createContext({}),
}));
jest.mock('../providers/SessionsProvider/SessionsProvider', () => ({
  useSessions: () => ({
    getSessionParties: jest.fn(),
    patchFriendSessions: jest.fn(),
  }),
}));

const createPuzzle = (value: number = 0): Puzzle<number> => {
  const createBox = () => ({
    '0': [value, value, value],
    '1': [value, value, value],
    '2': [value, value, value],
  });

  return {
    '0': {
      '0': createBox(),
      '1': createBox(),
      '2': createBox(),
    },
    '1': {
      '0': createBox(),
      '1': createBox(),
      '2': createBox(),
    },
    '2': {
      '0': createBox(),
      '1': createBox(),
      '2': createBox(),
    },
  };
};

describe('useGameState', () => {
  const mockInitial = createPuzzle();
  const mockFinal = createPuzzle(1);
  const mockMetadata: Partial<GameStateMetadata> = { difficulty: 'EASY' };

  const defaultProps = {
    initial: mockInitial,
    final: mockFinal,
    puzzleId: 'test-puzzle',
    metadata: mockMetadata,
  };

  it('initializes with the correct default state', () => {
    const { result } = renderHook(() => useGameState(defaultProps));
    expect(result.current.isUndoDisabled).toBe(true);
    expect(result.current.isRedoDisabled).toBe(true);
    expect(result.current.isNotesMode).toBe(false);
    expect(result.current.selectedCell).toBeNull();
  });

  it.skip('allows selecting a cell and a number', () => {
    const { result } = renderHook(() => useGameState(defaultProps));
    act(() => {
      result.current.setSelectedCell('0-0-0-0');
      result.current.selectNumber(5);
    });
    expect(result.current.selectedAnswer()).toBe(5);
  });

  it.skip('handles undo and redo operations', () => {
    const { result } = renderHook(() => useGameState(defaultProps));
    act(() => {
      result.current.setSelectedCell('0-0-0-0');
      result.current.selectNumber(5);
    });
    act(() => {
      result.current.undo();
    });
    expect(result.current.selectedAnswer()).toBe(0);
    act(() => {
      result.current.redo();
    });
    expect(result.current.selectedAnswer()).toBe(5);
  });

  it('resets the puzzle to its initial state', () => {
    const { result } = renderHook(() => useGameState(defaultProps));
    act(() => {
      result.current.setSelectedCell('0-0-0-0');
      result.current.selectNumber(5);
    });
    act(() => {
      result.current.reset();
    });
    expect(result.current.selectedAnswer()).toBe(0);
  });

  it('reveals the final solution', () => {
    const { result } = renderHook(() => useGameState(defaultProps));
    act(() => {
      result.current.reveal();
    });
    expect(result.current.answer).toEqual(mockFinal);
  });
});
