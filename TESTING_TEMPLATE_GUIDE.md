# Component Testing Template Guide

This guide shows how to use the generated tests as templates for testing additional components in sudoku-web.

## Quick Start Template

```typescript
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import YourComponent from './YourComponent';

// Mock external dependencies
jest.mock('@/hooks/someHook', () => ({
  useSomeHook: jest.fn(() => ({ /* mock return */ })),
}));

describe('YourComponent', () => {
  // Setup mock functions
  const mockCallback = jest.fn();
  const defaultProps = {
    prop1: 'value1',
    onEvent: mockCallback,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render without errors', () => {
      render(<YourComponent {...defaultProps} />);
      expect(screen.getByText('Expected Text')).toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    it('should handle click events', () => {
      render(<YourComponent {...defaultProps} />);
      fireEvent.click(screen.getByRole('button'));
      expect(mockCallback).toHaveBeenCalled();
    });
  });
});
```

## Component Test Organization

### Test Structure
```
describe('ComponentName', () => {
  // 1. Setup & Helpers (before describe)
  // 2. beforeEach hooks
  // 3. describe blocks organized by feature
  // 4. Tests within each describe block
})
```

### Recommended Describe Blocks

```typescript
describe('ComponentName', () => {
  // Basic functionality
  describe('rendering', () => {
    it('should render without errors');
    it('should display props correctly');
    it('should have correct HTML structure');
  });

  // User interactions
  describe('user interactions', () => {
    it('should respond to clicks');
    it('should call callbacks on user action');
    it('should handle keyboard events');
  });

  // State management
  describe('state management', () => {
    it('should update state on prop change');
    it('should toggle states correctly');
  });

  // Conditional rendering
  describe('conditional rendering', () => {
    it('should show when condition is true');
    it('should hide when condition is false');
  });

  // Props validation
  describe('props handling', () => {
    it('should accept required props');
    it('should use default props');
    it('should validate prop types through behavior');
  });

  // Edge cases
  describe('edge cases', () => {
    it('should handle undefined props');
    it('should handle null values');
    it('should handle rapid prop changes');
  });

  // Accessibility
  describe('accessibility', () => {
    it('should have semantic HTML');
    it('should have proper ARIA attributes');
    it('should be keyboard navigable');
  });
});
```

## Mocking Patterns from Generated Tests

### 1. Mocking Child Components
**File:** SudokuBox.test.tsx (lines 6-46)

```typescript
jest.mock('../ChildComponent', () => {
  return function MockComponent({ prop1, callback, ...props }: any) {
    return (
      <div data-testid="mock-component" onClick={() => callback()}>
        {prop1}
      </div>
    );
  };
});
```

### 2. Mocking Utility Functions
**File:** TimerDisplay.test.tsx (top)

```typescript
jest.mock('@/helpers/formatSeconds', () => ({
  formatSeconds: (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  },
}));
```

### 3. Mocking Hooks
**File:** SudokuControls.test.tsx

```typescript
jest.mock('@/utils/dailyActionCounter', () => ({
  canUseUndo: jest.fn(() => true),
  canUseCheckGrid: jest.fn(() => true),
}));

// Later in tests:
(canUseUndo as jest.Mock).mockReturnValue(false);
```

## Common Test Patterns

### Testing Props
```typescript
it('should apply props to element', () => {
  const { container } = render(
    <YourComponent customClass="test-class" />
  );

  expect(container.querySelector('.test-class')).toBeInTheDocument();
});
```

### Testing Callbacks
```typescript
it('should call callback when event occurs', () => {
  const mockCallback = jest.fn();
  render(<YourComponent onEvent={mockCallback} />);

  fireEvent.click(screen.getByRole('button'));

  expect(mockCallback).toHaveBeenCalledWith(expectedArg);
});
```

### Testing Conditional Rendering
```typescript
it('should show element when prop is true', () => {
  const { rerender } = render(<YourComponent isVisible={true} />);
  expect(screen.getByText('Visible')).toBeInTheDocument();

  rerender(<YourComponent isVisible={false} />);
  expect(screen.queryByText('Visible')).not.toBeInTheDocument();
});
```

### Testing State Changes
```typescript
it('should update when props change', () => {
  const { rerender } = render(
    <YourComponent count={0} />
  );
  expect(screen.getByText('0')).toBeInTheDocument();

  rerender(<YourComponent count={5} />);
  expect(screen.getByText('5')).toBeInTheDocument();
});
```

## Testing Library Best Practices

### Query Priority (prefer in order)
```typescript
// 1. Queries accessible to everyone
screen.getByRole('button', { name: /submit/i })
screen.getByLabelText('Username')
screen.getByPlaceholderText('Enter value')
screen.getByText('Content')

// 2. Semantic queries
screen.getByDisplayValue('value')

// 3. Test IDs (last resort)
screen.getByTestId('unique-id')
```

### Assertions
```typescript
// Presence
expect(element).toBeInTheDocument()

// Visibility
expect(element).toBeVisible()

// Disabled state
expect(button).toBeDisabled()

// Classes
expect(element).toHaveClass('active')

// Attributes
expect(element).toHaveAttribute('aria-label', 'Close')

// Content
expect(element).toHaveTextContent('Welcome')
```

## Example: Testing Display Components

Based on TimerDisplay.test.tsx pattern:

```typescript
describe('DisplayComponent', () => {
  describe('rendering', () => {
    it('should render the display value', () => {
      render(<DisplayComponent value="Hello" />);
      expect(screen.getByText('Hello')).toBeInTheDocument();
    });

    it('should apply styling', () => {
      const { container } = render(
        <DisplayComponent value="Test" />
      );
      expect(container.querySelector('.display')).toHaveClass('font-bold');
    });
  });

  describe('mode variations', () => {
    it('should show mode A when prop is A', () => {
      render(<DisplayComponent mode="A" />);
      expect(screen.getByText('Mode A')).toBeInTheDocument();
    });

    it('should show mode B when prop is B', () => {
      render(<DisplayComponent mode="B" />);
      expect(screen.getByText('Mode B')).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle undefined values', () => {
      render(<DisplayComponent value={undefined} />);
      expect(screen.getByText('N/A')).toBeInTheDocument();
    });

    it('should handle empty strings', () => {
      render(<DisplayComponent value="" />);
      expect(screen.getByTestId('display')).toBeEmptyDOMElement();
    });
  });
});
```

## Example: Testing Interactive Components

Based on NumberPad.test.tsx pattern:

```typescript
describe('InteractiveComponent', () => {
  const mockHandler = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('interactions', () => {
    it('should call handler on click', () => {
      render(
        <InteractiveComponent onSelect={mockHandler} />
      );

      fireEvent.click(screen.getByRole('button', { name: /item/i }));

      expect(mockHandler).toHaveBeenCalledWith('item');
    });

    it('should handle multiple rapid clicks', () => {
      render(
        <InteractiveComponent onSelect={mockHandler} />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      expect(mockHandler).toHaveBeenCalledTimes(3);
    });
  });

  describe('disabled state', () => {
    it('should not call handler when disabled', () => {
      render(
        <InteractiveComponent
          onSelect={mockHandler}
          disabled={true}
        />
      );

      fireEvent.click(screen.getByRole('button'));

      expect(mockHandler).not.toHaveBeenCalled();
    });

    it('should show disabled styling', () => {
      render(<InteractiveComponent disabled={true} />);
      expect(screen.getByRole('button')).toBeDisabled();
    });
  });
});
```

## Testing Hooks (Custom Hooks)

```typescript
import { renderHook, act } from '@testing-library/react';
import { useMyHook } from './useMyHook';

describe('useMyHook', () => {
  it('should return initial state', () => {
    const { result } = renderHook(() => useMyHook());
    expect(result.current.value).toBe('initial');
  });

  it('should update state', () => {
    const { result } = renderHook(() => useMyHook());

    act(() => {
      result.current.setValue('updated');
    });

    expect(result.current.value).toBe('updated');
  });
});
```

## Coverage Recommendations

### For Each Component Test:
- **Rendering:** 2-3 tests (basic render, with props, with children)
- **Props:** 2-3 tests (default props, custom props, prop combinations)
- **Interactions:** 3-5 tests (clicks, input changes, submissions)
- **State:** 2-3 tests (state updates, re-renders)
- **Edge Cases:** 2-4 tests (empty values, null, undefined, errors)
- **Accessibility:** 1-2 tests (semantic HTML, ARIA attributes)
- **Total:** 15-25 tests per component

## Running Tests in Development

```bash
# Run specific test file
npm test -- ComponentName.test.tsx

# Run with watch mode
npm test -- --watch

# Run with coverage
npm test -- --coverage

# Run only failing tests
npm test -- --onlyChanged

# Update snapshots
npm test -- -u
```

## CI/CD Integration

For GitHub Actions workflow:
```yaml
- name: Run Tests
  run: npm test -- --coverage --testPathPattern="test.tsx$"

- name: Upload Coverage
  uses: codecov/codecov-action@v3
```

## Troubleshooting Common Issues

### "Cannot find module" Error
```typescript
// Add moduleNameMapper to jest.config.js
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/src/$1',
  '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
}
```

### "React is not defined" Error
```javascript
// jest.config.js - use react-jsx transform
tsconfig: {
  jsx: 'react-jsx',
}
```

### "document is not defined" Error
```javascript
// jest.config.js
testEnvironment: 'jsdom',  // not 'node'
```

### Mock not working
```typescript
// Place mock BEFORE component import
jest.mock('../path/to/module');
import Component from './Component';
```

## Next Steps

1. Pick a component from the untested list
2. Copy the template structure from a similar generated test
3. Adapt mocks and test cases for your component
4. Run tests: `npm test -- YourComponent.test.tsx`
5. Iterate until all tests pass
6. Submit PR with new tests

For questions, refer to the generated test files:
- SudokuBox.test.tsx (mocking patterns)
- NumberPad.test.tsx (interaction testing)
- TimerDisplay.test.tsx (mode-based testing)
- SudokuControls.test.tsx (complex component patterns)
