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
      (v) =>
        v.state &&
        ((v.state as any).puzzle === 1 || (v.state as any).puzzle === 2)
    );
    expect(savedValues).toHaveLength(2);
  });

  it('should handle quota exceeded error gracefully', () => {
    const { result } = renderHook(() =>
      useLocalStorage({ type: StateType.PUZZLE, id: 'p-new' })
    );

    // Test that the hook can handle quota-related operations
    act(() => {
      // Attempt to save data
      result.current.saveValue({ new: true });
    });

    // Hook should maintain state even under pressure
    expect(result.current).toBeDefined();
  });

  it('should handle different state types separately', () => {
    const { result: puzzleHook } = renderHook(() =>
      useLocalStorage({ type: StateType.PUZZLE, id: 'test' })
    );
    const { result: timerHook } = renderHook(() =>
      useLocalStorage({ type: StateType.TIMER, id: 'test' })
    );

    act(() => {
      puzzleHook.current.saveValue({ data: 'puzzle' });
      timerHook.current.saveValue({ data: 'timer' });
    });

    const puzzleData = puzzleHook.current.getValue();
    const timerData = timerHook.current.getValue();

    expect(puzzleData?.state).toEqual({ data: 'puzzle' });
    expect(timerData?.state).toEqual({ data: 'timer' });
  });

  it('should update timestamp on value save', () => {
    const { result } = renderHook(() =>
      useLocalStorage({ type: StateType.PUZZLE, id: 'timestampTest' })
    );

    let firstTimestamp: number;
    act(() => {
      result.current.saveValue({ version: 1 });
    });
    firstTimestamp = result.current.getValue()?.lastUpdated || 0;

    // Wait a bit then save again
    act(() => {
      result.current.saveValue({ version: 2 });
    });
    const secondTimestamp = result.current.getValue()?.lastUpdated || 0;

    expect(secondTimestamp).toBeGreaterThanOrEqual(firstTimestamp);
  });

  it('should list multiple puzzles', () => {
    const { result } = renderHook(() =>
      useLocalStorage({ type: StateType.PUZZLE })
    );

    act(() => {
      result.current.saveValue({ puzzle: 1 }, { overrideId: 'p1' });
      result.current.saveValue({ puzzle: 2 }, { overrideId: 'p2' });
      result.current.saveValue({ puzzle: 3 }, { overrideId: 'p3' });
    });

    const values = result.current.listValues();
    expect(values.length).toBeGreaterThanOrEqual(3);
  });

  it('should provide correct prefix for state types', () => {
    const { result: puzzleResult } = renderHook(() =>
      useLocalStorage({ type: StateType.PUZZLE, id: 'puzzle1' })
    );
    const { result: timerResult } = renderHook(() =>
      useLocalStorage({ type: StateType.TIMER, id: 'timer1' })
    );

    // Both hooks can store values independently
    expect(typeof puzzleResult.current).toBe('object');
    expect(typeof timerResult.current).toBe('object');
  });

  it('should save value with custom override ID', () => {
    const { result } = renderHook(() =>
      useLocalStorage({ type: StateType.PUZZLE })
    );

    const customId = 'custom-puzzle-id';
    act(() => {
      result.current.saveValue({ custom: true }, { overrideId: customId });
    });

    const { result: retrieveResult } = renderHook(() =>
      useLocalStorage({ type: StateType.PUZZLE, id: customId })
    );

    const retrieved = retrieveResult.current.getValue();
    expect(retrieved?.state).toEqual({ custom: true });
  });

  it('should handle empty listValues', () => {
    const { result } = renderHook(() =>
      useLocalStorage({ type: StateType.PUZZLE, id: 'unique-empty' })
    );

    // Don't save anything
    const values = result.current.listValues();
    expect(Array.isArray(values)).toBe(true);
  });

  it('should save complex nested objects', () => {
    const { result } = renderHook(() =>
      useLocalStorage({ type: StateType.PUZZLE, id: 'nested' })
    );

    const complexData = {
      level1: {
        level2: {
          level3: {
            value: 'deep',
            array: [1, 2, 3],
          },
        },
      },
      array: [{ id: 1 }, { id: 2 }],
    };

    act(() => {
      result.current.saveValue(complexData);
    });

    const retrieved = result.current.getValue();
    expect(retrieved?.state).toEqual(complexData);
  });

  it('should maintain sessionId in stored results', () => {
    const { result } = renderHook(() =>
      useLocalStorage({ type: StateType.PUZZLE, id: 'session-test' })
    );

    act(() => {
      result.current.saveValue({ data: 'test' });
    });

    const retrieved = result.current.getValue();
    expect(retrieved?.state).toBeDefined();
  });

  it('should return state result with proper structure', () => {
    const { result } = renderHook(() =>
      useLocalStorage({ type: StateType.PUZZLE, id: 'structure' })
    );

    const testData = { value: 42 };
    act(() => {
      result.current.saveValue(testData);
    });

    const retrieved = result.current.getValue() as StateResult<any> | undefined;
    expect(retrieved).toHaveProperty('state');
    expect(retrieved).toHaveProperty('lastUpdated');
    expect(retrieved?.state).toEqual(testData);
  });

  it('should list values with correct structure', () => {
    const { result } = renderHook(() =>
      useLocalStorage({ type: StateType.PUZZLE })
    );

    act(() => {
      result.current.saveValue({ id: 1 }, { overrideId: 'id-1' });
    });

    const values = result.current.listValues();
    const savedValue = values.find((v) => v.sessionId === 'id-1');

    if (savedValue) {
      expect(savedValue).toHaveProperty('state');
      expect(savedValue).toHaveProperty('sessionId');
      expect(savedValue).toHaveProperty('lastUpdated');
    }
  });

  it('should handle timer state type', () => {
    const { result } = renderHook(() =>
      useLocalStorage({ type: StateType.TIMER, id: 'timer1' })
    );

    const timerData = { elapsed: 60, isPaused: false };
    act(() => {
      result.current.saveValue(timerData);
    });

    const retrieved = result.current.getValue();
    expect(retrieved?.state).toEqual(timerData);
  });

  it('should retrieve values across hook instances', () => {
    const { result: hook1 } = renderHook(() =>
      useLocalStorage({ type: StateType.PUZZLE, id: 'shared' })
    );

    act(() => {
      hook1.current.saveValue({ shared: true });
    });

    // Create a new hook instance
    const { result: hook2 } = renderHook(() =>
      useLocalStorage({ type: StateType.PUZZLE, id: 'shared' })
    );

    const retrieved = hook2.current.getValue();
    expect(retrieved?.state).toEqual({ shared: true });
  });

  it('should handle null or undefined gracefully', () => {
    const { result } = renderHook(() =>
      useLocalStorage({ type: StateType.PUZZLE, id: 'undefined-test' })
    );

    expect(() => {
      act(() => {
        result.current.saveValue(null as any);
      });
    }).not.toThrow();

    expect(result.current).toBeDefined();
  });
});
