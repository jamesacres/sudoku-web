# Testing Quick Reference Card

## Essential Commands

```bash
npm install              # Install test dependencies
npm test                 # Run all tests once
npm run test:watch      # Watch mode - re-run on changes
npm run test:coverage   # Generate coverage report
npm run test:ci         # CI mode (GitHub Actions)
```

## Test Files Overview

| File | Location | Test Cases | Focus |
|------|----------|-----------|-------|
| calculateId.test.ts | src/helpers/__tests__/ | 30 | Cell navigation & ID parsing |
| checkAnswer.test.ts | src/helpers/__tests__/ | 20 | Answer validation |
| cheatDetection.test.ts | src/helpers/__tests__/ | 25 | Fair play enforcement |
| puzzleTextToPuzzle.test.ts | src/helpers/__tests__/ | 25 | Puzzle parsing/serialization |
| scoringUtils.test.ts | src/components/leaderboard/__tests__/ | 40 | Leaderboard scoring |
| formatSeconds.test.ts | src/helpers/__tests__/ | 20 | Time formatting |
| calculateCompletionPercentage.test.ts | src/helpers/__tests__/ | 20 | Progress tracking |
| dailyPuzzleCounter.test.ts | src/utils/__tests__/ | 20 | Daily tracking |
| playerColors.test.ts | src/utils/__tests__/ | 25 | Multi-player colors |

**Total**: 245+ test cases across 9 files

## Run Specific Tests

```bash
# Single file
npm test -- calculateId.test.ts

# Pattern matching
npm test -- --testNamePattern="should move down"

# Watch specific file
npm test -- --watch calculateId

# Verbose output
npm test -- --verbose

# Show which tests run
npm test -- --listTests
```

## Test Structure Template

```typescript
describe('Feature Name', () => {
  describe('Specific Behavior', () => {
    it('should do something', () => {
      // Arrange - setup test data
      const input = createData();

      // Act - execute the function
      const result = functionUnderTest(input);

      // Assert - verify the result
      expect(result).toBe(expectedValue);
    });
  });
});
```

## Common Jest Matchers

```typescript
// Equality
expect(value).toBe(expected)           // strict equality (===)
expect(value).toEqual(expected)        // deep equality
expect(value).toStrictEqual(expected)  // deep + type checking

// Truthiness
expect(value).toBeTruthy()
expect(value).toBeFalsy()
expect(value).toBeNull()
expect(value).toBeUndefined()
expect(value).toBeDefined()

// Numbers
expect(value).toBeGreaterThan(5)
expect(value).toBeLessThan(10)
expect(value).toBeCloseTo(3.14159, 2)

// Strings
expect(text).toMatch(/regex/)
expect(text).toContain('substring')

// Collections
expect(array).toHaveLength(3)
expect(array).toContain(item)
expect(obj).toHaveProperty('key', value)
expect(set).toHaveSize(5)

// Exceptions
expect(() => fn()).toThrow()
expect(() => fn()).toThrow(Error)
expect(() => fn()).toThrow('message')
```

## Debugging

```bash
# Run in Node inspector
node --inspect-brk node_modules/.bin/jest --runInBand

# Run single test
npm test -- calculateId.test.ts -t "should move down"

# Show test names without running
npm test -- --listTests

# Update snapshots (if used)
npm test -- --updateSnapshot
```

## Coverage Report

```bash
npm run test:coverage
open coverage/index.html
```

**Coverage Goals**: 70% minimum
- Lines: 70%+
- Functions: 70%+
- Branches: 70%+
- Statements: 70%+

## Writing Tests: 5-Minute Checklist

- [ ] Test name starts with "should"
- [ ] Arrange-Act-Assert structure
- [ ] One main concept per test
- [ ] Test both success and failure cases
- [ ] No test interdependencies
- [ ] Use descriptive variable names
- [ ] Mock external dependencies
- [ ] Include edge cases

## Code Coverage

After running tests, check:

```bash
# Terminal summary
npm run test:coverage

# Detailed HTML report
open coverage/index.html

# Identify gaps
npm run test:coverage -- --verbose
```

## Mock Example

```typescript
// Mock localStorage
const localStorageMock = {
  getItem: (key) => data[key] || null,
  setItem: (key, value) => { data[key] = value; },
  removeItem: (key) => { delete data[key]; },
  clear: () => { data = {}; }
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});
```

## Helper Pattern

```typescript
// Create test data helpers
const createEmptyPuzzle = (): Puzzle<number> => {
  const emptyRow = { 0: [0,0,0], 1: [0,0,0], 2: [0,0,0] };
  const emptyBox = { 0: emptyRow, 1: emptyRow, 2: emptyRow };
  return { 0: emptyBox, 1: emptyBox, 2: emptyBox };
};

const setCellValue = (
  puzzle, boxX, boxY, cellX, cellY, value
) => {
  const result = JSON.parse(JSON.stringify(puzzle));
  result[boxX][boxY][cellX][cellY] = value;
  return result;
};

// Use in tests
it('should validate answer', () => {
  let puzzle = createEmptyPuzzle();
  puzzle = setCellValue(puzzle, 0, 0, 0, 0, 5);
  // ...
});
```

## Test File Organization

```
src/
├── helpers/
│   ├── function.ts
│   └── __tests__/
│       └── function.test.ts          ← Same name + .test
├── components/
│   └── Component/
│       ├── Component.tsx
│       └── __tests__/
│           └── Component.test.tsx
└── utils/
    ├── utility.ts
    └── __tests__/
        └── utility.test.ts
```

## Setup for New Feature

1. **Write test file**: `src/feature/__tests__/feature.test.ts`

```typescript
describe('newFeature', () => {
  it('should work correctly', () => {
    expect(newFeature()).toBe(expected);
  });
});
```

2. **Run tests**:
```bash
npm test -- feature.test.ts
```

3. **Watch for changes**:
```bash
npm run test:watch
```

4. **Implement feature** to pass tests

## CI/CD Integration

- **GitHub Actions**: `.github/workflows/tests.yml`
- **Runs on**: push to main/develop, all PRs
- **Tests Node**: 18.x and 20.x
- **Coverage**: Uploaded to Codecov
- **Reports**: Archived for 30 days

## Performance Tips

- Use `describe.skip()` to skip test groups temporarily
- Use `it.skip()` to skip individual tests
- Use `it.only()` to run single test (remove before commit!)
- Avoid `setTimeout` in tests (use `jest.useFakeTimers()`)
- Keep test data minimal and focused

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Module not found | Check `moduleNameMapper` in jest.config.js |
| localStorage error | See dailyPuzzleCounter.test.ts for mock |
| Timeout error | Increase testTimeout in jest.config.js |
| TypeScript errors | Run `npm install` for @types/jest |
| Tests won't run | Check test file naming: `*.test.ts` |

## Documentation

- **Detailed Guide**: See `TEST_GUIDE.md`
- **Implementation Details**: See `TEST_IMPLEMENTATION_SUMMARY.md`
- **Jest Docs**: https://jestjs.io/
- **TypeScript Jest**: https://kulshekhar.github.io/ts-jest/

## Quick Start (TL;DR)

```bash
# 1. Install
npm install

# 2. Run all tests
npm test

# 3. Watch mode
npm run test:watch

# 4. Coverage report
npm run test:coverage

# 5. View coverage
open coverage/index.html
```

That's it! Happy testing! 🧪
