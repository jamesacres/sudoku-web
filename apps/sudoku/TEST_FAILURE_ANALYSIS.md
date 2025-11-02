# Test Failure Analysis: Detailed Root Causes and Fixes

## Summary
- **Total failing tests**: 40
- **Failing test suites**: 3
- **Root cause**: Mock configuration issues with React Context providers

---

## 1. serverStorage.test.ts (18 failures)

### Root Cause
**Error**: `TypeError: undefined is not iterable (cannot read property Symbol(Symbol.iterator))`
**Location**: `/Users/jamesacres/Documents/git/sudoku-web/apps/template/src/hooks/fetch.ts:35:32`

**What's happening**:
```typescript
// In useFetch (fetch.ts:35)
const [stateRef, setState] = useContext(FetchContext)!;
```

The test mocks `@sudoku-web/template` with a partial mock:
```typescript
jest.mock('@sudoku-web/template', () => {
  const actual = jest.requireActual('@sudoku-web/template');
  return {
    ...actual,  // ← Spreads actual exports
    useFetch: jest.fn(),
    useOnline: jest.fn(),
  };
});
```

**Problem**: When spreading `actual`, the `FetchContext` export is included, but it's a React context created during module load. When `useServerStorage` (which is NOT mocked) calls the actual template code, it tries to use `useFetch` internally, which attempts to destructure the `FetchContext` value. However, no `FetchContext.Provider` is wrapping the test, so the context value is `undefined`.

**Why destructuring fails**:
```typescript
const [stateRef, setState] = undefined!; // Cannot destructure undefined
```

### Fix

**File**: `/Users/jamesacres/Documents/git/sudoku-web/apps/sudoku/src/hooks/serverStorage.test.ts`

Replace the entire mock setup (lines 11-18) with:

```typescript
jest.mock('@sudoku-web/template', () => {
  const actual = jest.requireActual('@sudoku-web/template');
  const React = require('react');

  // Create a mock FetchContext with proper React context structure
  const mockStateRef = { current: {
    accessToken: null,
    accessExpiry: null,
    refreshToken: null,
    refreshExpiry: null,
    user: null,
    userExpiry: null,
  }};
  const mockSetState = jest.fn();

  const MockFetchContext = React.createContext([mockStateRef, mockSetState]);

  return {
    ...actual,
    useFetch: jest.fn(),
    useOnline: jest.fn(),
    FetchContext: MockFetchContext, // Override FetchContext with mock
  };
});
```

**Reasoning**: This creates a proper React context that provides a valid tuple `[MutableRefObject<State>, (state: State) => void]` that matches the expected type, preventing the destructuring error.

---

## 2. online.test.ts (21 failures)

### Root Cause
**Error**: `TypeError: undefined is not iterable (cannot read property Symbol(Symbol.iterator))`
**Location**: `/Users/jamesacres/Documents/git/sudoku-web/apps/template/src/hooks/online.ts:6:41`

**What's happening**:
```typescript
// In useOnline (online.ts:6)
const [globalState, setGlobalState] = useContext(GlobalStateContext)!;
```

The test creates a mock context:
```typescript
jest.mock('@sudoku-web/template', () => {
  const actual = jest.requireActual('@sudoku-web/template');
  return {
    ...actual,
    GlobalStateContext: React.createContext([{ isForceOffline: false }, jest.fn()]),
  };
});
```

**Problem**: The test creates a `GlobalStateContext` with a default value, but then the `createContextWrapper` function tries to `require('@sudoku-web/template')` to get the mocked context:

```typescript
const createContextWrapper = () => {
  const { GlobalStateContext } = require('@sudoku-web/template'); // ← Gets the mock
  // ... creates provider with real useState
};
```

However, there's a timing issue. When the actual `useOnline` hook from template runs, it's trying to access the context value, and somewhere in the chain the context is returning `undefined`.

**The real issue**: The mock is creating a context with a static default value `[{ isForceOffline: false }, jest.fn()]`, but this is not a React state tuple - it's just a plain array. When `useOnline` tries to destructure it during actual execution, it fails.

### Fix

**File**: `/Users/jamesacres/Documents/git/sudoku-web/apps/sudoku/src/hooks/online.test.ts`

The test is already trying to create a proper wrapper but the mock is interfering. The issue is that the actual `useOnline` hook is being used (not mocked), and it's trying to consume the mocked `GlobalStateContext`.

Replace lines 8-14 with a simpler approach that doesn't create a mock context in jest.mock:

```typescript
jest.mock('@sudoku-web/template', () => {
  const actual = jest.requireActual('@sudoku-web/template');
  // Don't override GlobalStateContext - let the actual one be used
  return {
    ...actual,
  };
});
```

Then update the `createContextWrapper` function (lines 17-34) to use the actual GlobalStateContext:

```typescript
const createContextWrapper = () => {
  const { GlobalStateContext } = require('@sudoku-web/template');

  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    const [state, setState] = React.useState({ isForceOffline: false });
    const value: [typeof state, typeof setState] = [state, setState];
    return React.createElement(
      GlobalStateContext.Provider,
      { value },
      children
    );
  };

  return Wrapper;
};
```

**Reasoning**: Since we're testing the actual `useOnline` hook behavior and want to test it with a real provider, we should use the actual `GlobalStateContext` and just provide it with proper state in the wrapper. The mock was causing confusion by creating a separate context.

---

## 3. timer.test.ts (1 failure)

### Root Cause
**Test**: "should restore timer from previous session"
**Expected**: `seconds = 100`
**Received**: `seconds = 0`

**What's happening**:

1. Test passes a `previousTimer` with `seconds: 100`:
```typescript
const previousTimer = {
  seconds: 100,
  inProgress: {
    start: new Date().toISOString(),
    lastInteraction: new Date().toISOString(),
  },
  stopped: false,
};

act(() => {
  result.current.setTimerNewSession(previousTimer);
});

expect(result.current.timer?.seconds).toBe(100); // FAILS - gets 0
```

2. In the actual implementation (`timer.ts:25-40`), `setTimerNewSession` calls:
```typescript
const setTimerNewSession = useCallback((restoreTimer?: Timer | null) => {
  const COUNTDOWN = 4;
  const nowDate = new Date();
  nowDate.setSeconds(nowDate.getSeconds() + COUNTDOWN);
  const now = nowDate.toISOString();

  setTimer((currentTimer) => {
    const timer = restoreTimer !== undefined ? restoreTimer : currentTimer;
    return {
      ...timer,
      seconds: calculateSeconds(timer), // ← This is the problem
      inProgress: { start: now, lastInteraction: now },
      ...(timer?.stopped ? undefined : { countdown: COUNTDOWN }),
    };
  });
}, []);
```

3. The test mocks `calculateSeconds`:
```typescript
jest.mock('@sudoku-web/template', () => ({
  useDocumentVisibility: jest.fn(() => false),
  useLocalStorage: jest.fn(() => ({
    getValue: jest.fn(() => undefined),
    saveValue: jest.fn(),
  })),
  StateType: { TIMER: 'timer' },
  calculateSeconds: jest.fn(() => 0), // ← Always returns 0!
}));
```

**Problem**: The mock for `calculateSeconds` always returns `0`, overriding the `previousTimer.seconds = 100`. When `setTimerNewSession` is called with a restore timer, it recalculates seconds using the mocked `calculateSeconds(timer)` which returns `0`.

### Fix

**File**: `/Users/jamesacres/Documents/git/sudoku-web/apps/sudoku/src/hooks/timer.test.ts`

Replace the mock setup (lines 7-15) with:

```typescript
jest.mock('@sudoku-web/template', () => {
  const actual = jest.requireActual('@sudoku-web/template');

  return {
    useDocumentVisibility: jest.fn(() => false),
    useLocalStorage: jest.fn(() => ({
      getValue: jest.fn(() => undefined),
      saveValue: jest.fn(),
    })),
    StateType: { TIMER: 'timer' },
    calculateSeconds: jest.fn((timer) => {
      // Use actual implementation from template
      if (!timer) return 0;
      return timer.seconds + Math.floor(
        (new Date(timer.inProgress.lastInteraction).getTime() -
         new Date(timer.inProgress.start).getTime()) / 1000
      );
    }),
  };
});
```

**Alternative Fix** (simpler): Mock it to return the timer's seconds if present:

```typescript
calculateSeconds: jest.fn((timer) => timer?.seconds || 0),
```

**Reasoning**: The `calculateSeconds` function should preserve the existing `timer.seconds` value and add any elapsed time. Since the test creates a timer with `start` and `lastInteraction` at the same time, the elapsed time is 0, so it should just return `timer.seconds` (100). The mock was incorrectly returning 0 regardless of input.

---

## Implementation Priority

1. **Fix serverStorage.test.ts** (highest impact - 18 failures)
2. **Fix online.test.ts** (21 failures)
3. **Fix timer.test.ts** (1 failure - lowest impact)

## Verification Steps

After implementing fixes:

```bash
# Test each file individually
npm test -- src/hooks/serverStorage.test.ts
npm test -- src/hooks/online.test.ts
npm test -- src/hooks/timer.test.ts

# Run all tests
npm test
```

Expected result: All 40 failing tests should pass, bringing total to 1711 passing tests (100% pass rate).
