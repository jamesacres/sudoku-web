# Hooks & Providers Test Quick Reference

## File Locations

### Hook Tests
| Hook | Test File | Tests |
|------|-----------|-------|
| useLocalStorage | `/src/hooks/useLocalStorage.test.ts` | 40+ |
| useTimer | `/src/hooks/timer.test.ts` | 50+ |
| useDrag | `/src/hooks/useDrag.test.ts` | 45+ |
| useOnline | `/src/hooks/online.test.ts` | 30+ |

### Provider Tests
| Provider | Test File | Tests |
|----------|-----------|-------|
| GlobalStateProvider | `/src/providers/GlobalStateProvider/GlobalStateProvider.test.tsx` | 40+ |
| ThemeColorProvider | `/src/providers/ThemeColorProvider.test.tsx` | 50+ |
| UserProvider | `/src/providers/UserProvider/UserProvider.test.tsx` | 35+ |
| SessionsProvider | `/src/providers/SessionsProvider/SessionsProvider.test.tsx` | 50+ |

---

## Hook Testing Quick Guide

### useLocalStorage
```typescript
// Test example
const { result } = renderHook(() =>
  useLocalStorage({
    type: StateType.PUZZLE,
    id: 'puzzle-1',
  })
);

// Usage
result.current.saveValue(data);
result.current.getValue();
result.current.listValues();
```

**What's tested:**
- localStorage read/write operations
- JSON serialization/deserialization
- Quota exceeded handling
- Old entry cleanup
- Multiple state types

### useTimer
```typescript
// Test example
const { result } = renderHook(() =>
  useTimer({ puzzleId: 'test-puzzle' })
);

// Usage
result.current.setTimerNewSession();
result.current.stopTimer();
result.current.setPauseTimer(true/false);
```

**What's tested:**
- Timer initialization with countdown
- Session restoration
- Pause/resume functionality
- Interval updates
- Document visibility

### useDrag
```typescript
// Test example
const { result } = renderHook(() =>
  useDrag({
    isZoomMode: true,
    selectedCell: 'box-0-0-cell-0-0',
    gridRef: gridRef,
  })
);

// Usage
result.current.handleDragStart(event);
// Returns: isDragging, dragOffset, dragStarted, zoomOrigin
```

**What's tested:**
- Drag start/end detection
- Pointer movement tracking
- 5-pixel threshold
- Boundary constraints
- Zoom origin calculation

### useOnline
```typescript
// Test example
const { result } = renderHook(() => useOnline(), { wrapper });

// Usage
result.current.isOnline;           // boolean
result.current.forceOffline(true); // override
```

**What's tested:**
- Online/offline detection
- Event listeners
- Force offline override
- State persistence

---

## Provider Testing Quick Guide

### GlobalStateProvider
```typescript
// Test example
const TestComponent = () => {
  const [state, setState] = useContext(GlobalStateContext);
  return <div>{state.isForceOffline ? 'Offline' : 'Online'}</div>;
};

render(
  <GlobalStateProvider>
    <TestComponent />
  </GlobalStateProvider>
);
```

**What's tested:**
- State initialization
- setState functionality
- Multiple consumers
- State propagation

### ThemeColorProvider
```typescript
// Test example
const TestComponent = () => {
  const { themeColor, setThemeColor } = useThemeColor();
  return <button onClick={() => setThemeColor('red')}>{themeColor}</button>;
};

render(
  <ThemeColorProvider>
    <TestComponent />
  </ThemeColorProvider>
);
```

**What's tested:**
- Theme initialization
- Color persistence
- 20 valid colors
- localStorage integration
- Document class management

**Valid Colors:**
blue, red, green, purple, amber, cyan, pink, indigo, orange, teal, slate, rose, emerald, sky, violet, lime, fuchsia, yellow, stone, zinc

### UserProvider
```typescript
// Test example
const TestComponent = () => {
  const context = useContext(UserContext);
  return (
    <div>
      User: {context?.user?.name}
      <button onClick={context?.logout}>Logout</button>
      <button onClick={() => context?.loginRedirect({ userInitiated: true })}>
        Login
      </button>
    </div>
  );
};
```

**What's tested:**
- User authentication flow
- Login/logout
- State management
- localStorage integration

### SessionsProvider
```typescript
// Test example
const TestComponent = () => {
  const {
    sessions,
    isLoading,
    fetchSessions,
    friendSessions,
  } = useSessions();

  return <div>Sessions: {sessions?.length}</div>;
};

render(
  <UserContext.Provider value={mockUser}>
    <SessionsProvider>
      <TestComponent />
    </SessionsProvider>
  </UserContext.Provider>
);
```

**What's tested:**
- Session loading
- Friend sessions
- State updates
- User context integration

---

## Common Test Patterns

### Testing Hook State
```typescript
let state: any;
const { result } = renderHook(() => useMyHook());

act(() => {
  // Update state
});

expect(result.current.state).toBe(expectedValue);
```

### Testing Provider Context
```typescript
let contextValue: any;
const TestComponent = () => {
  contextValue = useContext(MyContext);
  return <div>Test</div>;
};

render(<MyProvider><TestComponent /></MyProvider>);
expect(contextValue).toBeDefined();
```

### Testing Async Operations
```typescript
await waitFor(() => {
  expect(result.current.isLoading).toBe(false);
});
```

### Testing localStorage
```typescript
localStorage.setItem('key', JSON.stringify(value));
const retrieved = localStorage.getItem('key');
expect(retrieved).toBeDefined();
```

---

## Running Tests

### All Hook & Provider Tests
```bash
npm test -- --testPathPattern="(useLocalStorage|timer|useDrag|online|GlobalStateProvider|ThemeColorProvider|UserProvider|SessionsProvider)"
```

### Single Test File
```bash
npm test -- useLocalStorage.test
npm test -- ThemeColorProvider.test
```

### Watch Mode
```bash
npm test -- --watch --testPathPattern="useLocalStorage"
```

### With Coverage
```bash
npm test -- --coverage --testPathPattern="useLocalStorage"
```

### Debugging
```bash
npm test -- --inspect-brk useLocalStorage.test
```

---

## Common Issues & Solutions

### Issue: "Expected X to be defined"
**Solution:** Ensure hook is initialized with required params:
```typescript
const { result } = renderHook(() => useMyHook({ requiredParam }));
```

### Issue: "Cannot read property of undefined"
**Solution:** Wrap state updates in `act()`:
```typescript
act(() => {
  setState(newValue);
});
```

### Issue: "localStorage is null"
**Solution:** Check jest.setup.js is configured and localStorage mock exists:
```bash
npm test -- --setupFilesAfterEnv ./jest.setup.js
```

### Issue: "Test timeout"
**Solution:** Increase test timeout or check for infinite loops:
```typescript
jest.setTimeout(10000);
```

### Issue: "Act warning"
**Solution:** Wrap all state-changing operations:
```typescript
act(() => {
  fireEvent.click(button);
  // or
  result.current.setState(newValue);
});
```

---

## Adding New Tests

### Template for Hook Test
```typescript
describe('useMyHook', () => {
  describe('initialization', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => useMyHook());
      expect(result.current.value).toBeDefined();
    });
  });

  describe('state updates', () => {
    it('should update state', () => {
      const { result } = renderHook(() => useMyHook());

      act(() => {
        result.current.setValue(newValue);
      });

      expect(result.current.value).toBe(newValue);
    });
  });

  describe('cleanup', () => {
    it('should cleanup on unmount', () => {
      const { unmount } = renderHook(() => useMyHook());
      unmount();
      // assertions
    });
  });
});
```

### Template for Provider Test
```typescript
describe('MyProvider', () => {
  describe('provider setup', () => {
    it('should render children', () => {
      render(
        <MyProvider>
          <div>Test</div>
        </MyProvider>
      );
      expect(screen.getByText('Test')).toBeInTheDocument();
    });
  });

  describe('context value', () => {
    it('should provide context', () => {
      let context: any;
      const TestComponent = () => {
        context = useContext(MyContext);
        return null;
      };

      render(
        <MyProvider>
          <TestComponent />
        </MyProvider>
      );

      expect(context).toBeDefined();
    });
  });
});
```

---

## Best Practices Checklist

- [ ] Test initialization and defaults
- [ ] Test state updates and transitions
- [ ] Test cleanup and unmount
- [ ] Test error scenarios
- [ ] Test edge cases
- [ ] Test multiple instances/consumers
- [ ] Mock external dependencies
- [ ] Use act() for state changes
- [ ] Clear setup/teardown
- [ ] Meaningful test names

---

## Performance Tips

1. **Minimize Re-renders:** Only assert necessary state changes
2. **Use beforeEach:** Setup mocks once per test suite
3. **Avoid Unnecessary Waits:** Use waitFor only when needed
4. **Clear Mocks:** Call jest.clearAllMocks() between tests
5. **Optimize Selectors:** Use getByTestId when possible

---

## Documentation References

- [React Testing Library](https://testing-library.com/react)
- [Jest Documentation](https://jestjs.io/)
- [React Hooks Testing](https://react-hooks-testing-library.com/)
- [Common Testing Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

Last Updated: 2025-10-16
