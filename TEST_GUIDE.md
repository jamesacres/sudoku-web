# Unit Test Guide for Sudoku Race

## Overview

This document provides comprehensive guidance on the newly implemented unit test suite for the Sudoku Race application. The test suite uses Jest with TypeScript and includes extensive coverage for business logic, utilities, and core functions.

## Test Suite Architecture

### Test Organization

Tests are organized alongside source code in `__tests__` directories:

```
src/
├── helpers/
│   ├── calculateId.ts
│   ├── checkAnswer.ts
│   ├── cheatDetection.ts
│   ├── puzzleTextToPuzzle.ts
│   ├── formatSeconds.ts
│   ├── calculateCompletionPercentage.ts
│   └── __tests__/
│       ├── calculateId.test.ts
│       ├── checkAnswer.test.ts
│       ├── cheatDetection.test.ts
│       ├── puzzleTextToPuzzle.test.ts
│       ├── formatSeconds.test.ts
│       └── calculateCompletionPercentage.test.ts
│
├── components/leaderboard/
│   ├── scoringUtils.ts
│   └── __tests__/
│       └── scoringUtils.test.ts
│
└── utils/
    ├── dailyPuzzleCounter.ts
    ├── playerColors.ts
    └── __tests__/
        ├── dailyPuzzleCounter.test.ts
        └── playerColors.test.ts
```

### Test Files Included

#### Priority 1: Business Logic (90+ test cases)

1. **calculateId.test.ts** - Cell/box ID generation and navigation
   - Box ID generation
   - Cell ID parsing
   - Cell ID splitting
   - Directional navigation (up, down, left, right)
   - Corner cases and boundaries

2. **checkAnswer.test.ts** - Puzzle answer validation
   - Grid validation
   - Individual cell validation
   - Pre-filled cell detection
   - Multiple cell validation

3. **cheatDetection.test.ts** - Cheat detection algorithm
   - Single vs. multiple cell changes
   - Puzzle state comparison
   - ServerState input handling
   - Edge cases (notes, complex values)

4. **puzzleTextToPuzzle.test.ts** - Puzzle parsing and conversion
   - String to puzzle structure conversion
   - Dot notation for empty cells
   - Roundtrip conversion (puzzle ↔ string)
   - All 81 cells validation

5. **scoringUtils.test.ts** - Game scoring and leaderboard
   - Puzzle type identification
   - Speed bonuses
   - Racing bonuses
   - User score calculation
   - Time formatting
   - User lookup from parties

#### Priority 2: Utility Functions (60+ test cases)

6. **formatSeconds.test.ts** - Time formatting
   - Seconds, minutes, and hours formatting
   - Padding with zeros
   - Complex time calculations
   - Real-world game timing

7. **calculateCompletionPercentage.test.ts** - Progress tracking
   - Completion percentage calculation
   - Pre-filled cell handling
   - Correct/incorrect answer differentiation
   - Rounding behavior

8. **dailyPuzzleCounter.test.ts** - Daily puzzle tracking
   - Daily puzzle ID tracking
   - Date rollover handling
   - Duplicate prevention
   - Storage persistence

9. **playerColors.test.ts** - Player color assignment
   - Color assignment based on index
   - Current user color prioritization
   - Color cycling
   - Party data integration

## Running Tests

### Installation

First, install testing dependencies:

```bash
npm install
```

### Test Commands

#### Run all tests
```bash
npm test
```

#### Watch mode (re-run on file changes)
```bash
npm run test:watch
```

#### Generate coverage report
```bash
npm run test:coverage
```

This generates:
- Terminal output with coverage summary
- HTML coverage report in `coverage/index.html`
- JSON coverage data for CI/CD integration

#### CI/CD mode (used in pipelines)
```bash
npm run test:ci
```

## Test Coverage

### Current Coverage Goals

The test suite aims for:
- **Lines**: 70%+
- **Functions**: 70%+
- **Branches**: 70%+
- **Statements**: 70%+

### Coverage Report

After running `npm run test:coverage`, open the HTML report:

```bash
open coverage/index.html
```

This provides:
- Line-by-line coverage visualization
- Coverage summary by file
- Identified coverage gaps
- Recommendations for additional tests

## Test Examples

### Example 1: Testing Cell Navigation

```typescript
describe('calculateNextCellId', () => {
  it('should move down within same box', () => {
    const result = calculateNextCellId('box:0,0,cell:0,0', 'down');
    expect(result).toBe('box:0,0,cell:0,1');
  });

  it('should move to next box when at boundary', () => {
    const result = calculateNextCellId('box:0,0,cell:0,2', 'down');
    expect(result).toBe('box:0,1,cell:0,0');
  });
});
```

### Example 2: Testing Cheat Detection

```typescript
describe('isPuzzleCheated', () => {
  it('should return false when only one cell changed', () => {
    const prev = createEmptyPuzzle();
    const current = setCellValue(createEmptyPuzzle(), 0, 0, 0, 0, 5);

    const answerStack = [prev, current];
    expect(isPuzzleCheated(answerStack)).toBe(false);
  });

  it('should return true when two cells changed', () => {
    const prev = createEmptyPuzzle();
    let current = createEmptyPuzzle();
    current = setCellValue(current, 0, 0, 0, 0, 5);
    current = setCellValue(current, 0, 0, 0, 1, 7);

    const answerStack = [prev, current];
    expect(isPuzzleCheated(answerStack)).toBe(true);
  });
});
```

### Example 3: Testing Scoring

```typescript
describe('calculateUserScore', () => {
  it('should calculate volume score correctly', () => {
    const sessions = [
      createSession({}, 100),
      createSession({}, 150),
    ];
    const result = calculateUserScore(sessions, {}, 'user-1');

    expect(result.volumeScore).toBe(
      sessions.length * SCORING_CONFIG.VOLUME_MULTIPLIER
    );
  });
});
```

## Best Practices

### Writing New Tests

1. **Test Structure**
   ```typescript
   describe('Feature or Function Name', () => {
     describe('Specific Behavior', () => {
       it('should do something specific', () => {
         // Arrange
         const input = setupData();

         // Act
         const result = functionUnderTest(input);

         // Assert
         expect(result).toBe(expectedValue);
       });
     });
   });
   ```

2. **Test Naming**
   - Use descriptive names starting with "should"
   - Example: `should return true when exactly one cell changed`

3. **Assertions**
   - Use specific matchers: `toBe`, `toEqual`, `toHaveLength`
   - Avoid generic `toBeTruthy()` when possible
   - Test both positive and negative cases

4. **Test Data**
   - Create helper functions for common test data
   - Use meaningful variable names
   - Keep tests focused and isolated

### Avoiding Common Pitfalls

1. **Avoid test interdependence**
   - Each test should be runnable independently
   - Use `beforeEach()` for setup, `afterEach()` for cleanup

2. **Don't test implementation details**
   - Test behavior, not internal logic
   - Focus on inputs and outputs

3. **Keep tests readable**
   - One assertion concept per test (though multiple related assertions OK)
   - Use constants for magic numbers
   - Add comments for complex logic

4. **Mock external dependencies**
   - Mock localStorage, API calls, etc.
   - Keep tests fast and deterministic
   - See `dailyPuzzleCounter.test.ts` for examples

## Debugging Tests

### Run specific test file
```bash
npm test -- calculateId.test.ts
```

### Run tests matching pattern
```bash
npm test -- --testNamePattern="should move down"
```

### Verbose output
```bash
npm test -- --verbose
```

### Debug mode (Node inspector)
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2

      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run tests with coverage
        run: npm run test:ci

      - name: Upload coverage
        uses: codecov/codecov-action@v2
        with:
          files: ./coverage/coverage-final.json
```

### Pre-commit Hook Example

```bash
#!/bin/bash
# .git/hooks/pre-commit

npm test
if [ $? -ne 0 ]; then
  echo "Tests failed. Commit aborted."
  exit 1
fi
```

## Adding More Tests

### Priority 3 (Security & Platform) - To Add

- `sha256.test.ts` - Hash algorithm tests
- `pkce.test.ts` - PKCE authentication flow
- `buildPuzzleUrl.test.ts` - URL generation

### Priority 4 (Image Processing) - To Add

- Image processing pipeline tests
- Filter tests (blur, threshold, invert)
- Box extraction tests

### Component Tests - Future

- React component rendering tests
- User interaction tests
- Snapshot tests for UI components

## Troubleshooting

### Issue: Tests fail with "Cannot find module"

**Solution**: Ensure `moduleNameMapper` in `jest.config.js` correctly maps path aliases:
```javascript
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/src/$1',
}
```

### Issue: localStorage not defined

**Solution**: Tests use mocked localStorage. See `dailyPuzzleCounter.test.ts` for implementation.

### Issue: TypeScript errors in tests

**Solution**: Ensure `@types/jest` is installed and `tsconfig.json` includes test files:
```json
{
  "include": ["src/**/*", "src/**/*.test.ts"]
}
```

## Performance

- **Average test suite runtime**: <5 seconds
- **Coverage generation**: <10 seconds
- **CI/CD runtime**: <30 seconds (with parallelization)

## Resources

- [Jest Documentation](https://jestjs.io/)
- [TypeScript Jest](https://kulshekhar.github.io/ts-jest/)
- [Testing Best Practices](https://testingjavascript.com/)
- [Jest Matchers](https://jestjs.io/docs/expect)

## Summary

The test suite provides:
- **150+ test cases** across 9 test files
- **Comprehensive coverage** of business logic and utilities
- **Clear patterns** for adding new tests
- **CI/CD ready** configuration
- **Foundation** for future component and integration tests

Run `npm test` to get started!
