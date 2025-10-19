import { renderHook, act } from '@testing-library/react';
import { useLocalStorage, StateResult } from './localStorage';
import { StateType } from '@/types/StateType';

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('should save and retrieve a value', () => {
    const { result } = renderHook(() =>
      useLocalStorage({ type: StateType.PUZZLE, id: 'puzzle1' })
    );
    const testData = { a: 1, b: 'test' };

    act(() => {
      result.current.saveValue(testData);
    });

    const retrieved = result.current.getValue();
    expect(retrieved?.state).toEqual(testData);
    expect(retrieved?.lastUpdated).toBeCloseTo(Date.now(), -2);
  });

  it('should return undefined for a non-existent key', () => {
    const { result } = renderHook(() =>
      useLocalStorage({ type: StateType.PUZZLE, id: 'nonexistent' })
    );
    const retrieved = result.current.getValue();
    expect(retrieved).toBeUndefined();
  });

  it('should list all values of a given type', () => {
    const { result: puzzleHook } = renderHook(() =>
      useLocalStorage({ type: StateType.PUZZLE })
    );

    act(() => {
      puzzleHook.current.saveValue({ puzzle: 1 }, { overrideId: 'p1' });
      puzzleHook.current.saveValue({ puzzle: 2 }, { overrideId: 'p2' });
    });

    const puzzleValues = puzzleHook.current.listValues();
    expect(puzzleValues.length).toBeGreaterThanOrEqual(2);
    // Find the values we just saved
    const savedValues = puzzleValues.filter(
      (v) => v.state && ((v.state as any).puzzle === 1 || (v.state as any).puzzle === 2)
    );
    expect(savedValues).toHaveLength(2);
  });

  it.skip('should handle quota exceeded error by cleaning up old data', () => {
    const { result } = renderHook(() =>
      useLocalStorage({ type: StateType.PUZZLE, id: 'p-new' })
    );

    // Add an old item
    const oldState = {
      lastUpdated: Date.now() - 40 * 24 * 60 * 60 * 1000,
      state: { old: true },
    };
    localStorage.setItem('sudoku-p-old', JSON.stringify(oldState));

    // Mock setItem to throw error once
    const originalSetItem = Storage.prototype.setItem;
    let thrown = false;
    Storage.prototype.setItem = jest.fn((key, value) => {
      if (!thrown) {
        thrown = true;
        throw new DOMException('QuotaExceededError');
      }
      originalSetItem.call(localStorage, key, value);
    });

    act(() => {
      result.current.saveValue({ new: true });
    });

    expect(localStorage.getItem('sudoku-p-old')).toBeNull();
    expect(JSON.parse(localStorage.getItem('sudoku-p-new')!).state).toEqual({
      new: true,
    });

    Storage.prototype.setItem = originalSetItem;
  });
});
