# Code Deduplication Guide

## Objective
Ensure that apps only import from packages, with zero code duplication between apps and their corresponding packages.

## Current Status

The application currently has some duplicated code between packages and apps:

### Duplications Found

#### 1. Type Definitions
- **Duplicate types in apps/sudoku/src/types/**: puzzle.ts, notes.ts, state.ts (already exist in packages/sudoku/src/types/)
- **Duplicate types in apps/template/src/types/**: puzzle.ts, notes.ts, state.ts, timer.ts, serverTypes.ts (already exist in packages)

#### 2. Helper Functions
- **Duplicate helpers in apps/sudoku/src/helpers/**: calculateCompletionPercentage.ts, calculateId.ts, checkAnswer.ts, puzzleTextToPuzzle.ts (already exist in packages/sudoku/src/helpers/)
- **App-specific helpers**: buildPuzzleUrl.ts, sha256.ts, calculateSeconds.ts, formatSeconds.ts, cheatDetection.ts, pkce.ts (these are app-specific and should stay)

#### 3. Components
- Some components exist in both places with identical or near-identical implementations

## Deduplication Steps

### Phase 1: Export Missing Helpers from Packages

**File:** `packages/sudoku/src/index.ts`

Add missing exports:
```typescript
export { puzzleToPuzzleText } from './helpers/puzzleTextToPuzzle';
```

**File:** `packages/template/src/types/index.ts`

Ensure EntitlementDuration is exported:
```typescript
export { EntitlementDuration } from './serverTypes';
export { Difficulty, BookPuzzleDifficulty } from './serverTypes';
```

### Phase 2: Remove Duplicate Type Files from Apps

#### apps/sudoku/src/types/
- DELETE: `puzzle.ts`
- DELETE: `notes.ts`
- DELETE: `state.ts`
- DELETE: `userSessions.ts`
- DELETE: `serverTypes.ts` (keep only app-specific types)
- KEEP: `tabs.ts`, `userProfile.ts`, `subscriptionContext.ts`

#### apps/template/src/types/
- DELETE: `puzzle.ts`
- DELETE: `notes.ts`
- DELETE: `state.ts`
- DELETE: `timer.ts`
- MODIFY: `serverTypes.ts` - remove sudoku-specific types (lines 98-227):
  - Enum `Difficulty`
  - Interface `SudokuOfTheDayResponse`
  - Interface `SudokuOfTheDay`
  - Enum `BookPuzzleDifficulty`
  - Interface `SudokuBookPuzzle`
  - Interface `SudokuBookOfTheMonthResponse`
  - Interface `SudokuBookOfTheMonth`

### Phase 3: Remove Duplicate Helper Files from Apps

#### apps/sudoku/src/helpers/
- DELETE: `calculateCompletionPercentage.ts` & `.test.ts`
- DELETE: `calculateId.test.ts` (keep calculateId.ts as it's used by Sudoku component)
- DELETE: `checkAnswer.ts` & `.test.ts`
- DELETE: `puzzleTextToPuzzle.ts` & `.test.ts`
- KEEP: App-specific helpers

#### apps/template/src/helpers/
- DELETE: `calculateId.ts` (if not app-specific) or update to import types from @sudoku-web/sudoku

### Phase 4: Update Imports in Apps

#### For sudoku app (apps/sudoku/src):
Search and replace all type imports:
```
FROM: import { ... } from '@/types/puzzle'
TO:   import { ... } from '@sudoku-web/sudoku'

FROM: import { ... } from '@/types/notes'
TO:   import { ... } from '@sudoku-web/sudoku'

FROM: import { ... } from '@/types/state'
TO:   import { ... } from '@sudoku-web/sudoku'

FROM: import { ... } from '@/types/serverTypes'
TO:   import { ... } from '@sudoku-web/sudoku'
```

Search and replace helper imports:
```
FROM: import { calculateCompletionPercentage } from '@/helpers/calculateCompletionPercentage'
TO:   import { calculateCompletionPercentage } from '@sudoku-web/sudoku'

FROM: import { checkCell, checkGrid } from '@/helpers/checkAnswer'
TO:   import { checkCell, checkGrid } from '@sudoku-web/sudoku'

FROM: import { puzzleTextToPuzzle, puzzleToPuzzleText } from '@/helpers/puzzleTextToPuzzle'
TO:   import { puzzleTextToPuzzle, puzzleToPuzzleText } from '@sudoku-web/sudoku'

FROM: import { calculateBoxId, calculateCellId, splitCellId } from '@/helpers/calculateId'
TO:   import { calculateBoxId, calculateCellId, splitCellId } from '@sudoku-web/sudoku'
```

#### For template app (apps/template/src):
```
FROM: import { ... } from '@/types/state'
TO:   import { ... } from '@sudoku-web/sudoku'

FROM: import { ... } from '@/types/puzzle'
TO:   import { ... } from '@sudoku-web/sudoku'

FROM: import { ... } from '@/types/notes'
TO:   import { ... } from '@sudoku-web/sudoku'

FROM: import { ... } from '@/types/timer'
TO:   import { ... } from '@sudoku-web/sudoku'

FROM: import { Difficulty, BookPuzzleDifficulty, SudokuOfTheDay, ... } from '@/types/serverTypes'
TO:   import { Difficulty, BookPuzzleDifficulty, SudokuOfTheDay, ... } from '@sudoku-web/sudoku'
```

### Phase 5: Update Re-exports

**File:** `apps/sudoku/src/types/index.ts`

Update to re-export sudoku types from package:
```typescript
export type {
  Puzzle,
  Notes,
  SudokuState,
  GameState,
  ServerState,
  Timer,
} from '@sudoku-web/sudoku';
```

**File:** `apps/template/src/types/index.ts`

Update to re-export sudoku types from package:
```typescript
export type {
  Puzzle,
  Notes,
  GameState,
  ServerState,
  Timer,
  SudokuOfTheDay,
  SudokuOfTheDayResponse,
  SudokuBookPuzzle,
  SudokuBookOfTheMonth,
  SudokuBookOfTheMonthResponse,
} from '@sudoku-web/sudoku';
export { Difficulty, BookPuzzleDifficulty } from '@sudoku-web/sudoku';
```

### Phase 6: Verification

Run these checks:

```bash
# 1. Verify build succeeds
npm run build

# 2. Verify tests pass
npm test

# 3. Verify no @/types imports remain for duplicated types
grep -r "from '@/types/puzzle\|from '@/types/notes\|from '@/types/state\|from '@/types/timer" apps/

# 4. Verify no local helper imports for duplicated code
grep -r "from '@/helpers/calculateCompletionPercentage\|from '@/helpers/checkAnswer\|from '@/helpers/puzzleTextToPuzzle" apps/sudoku/

# 5. Verify lint passes
npm run lint
```

## Key Principles

1. **Single Source of Truth**: If code exists in a package, it should NOT be duplicated in the app
2. **Package Imports**: Apps should import from @sudoku-web/* packages, never create duplicates
3. **App-Specific Code**: Only keep code in apps that is truly app-specific (UI, styles, app routing, etc.)
4. **Clean Re-exports**: Apps can re-export types for convenience, but shouldn't duplicate implementations

## Benefits of Deduplication

- **Reduced Bundle Size**: No duplicated code shipped to clients
- **Easier Maintenance**: Bug fixes happen in one place
- **Better Reusability**: Package code is truly reusable across applications
- **Cleaner Architecture**: Clear separation between package (reusable) and app (specific) code

## Testing Strategy

After each phase:
1. Run `npm run build` to catch TypeScript errors
2. Run `npm test` to ensure functionality
3. Run `npm run lint` to check code quality
4. Visually verify imports in changed files

## Notes

- The calculateId helper in apps/template/src/helpers may be app-specific (used by drag/drop). Verify before moving.
- Some app-specific helpers (pkce.ts, capacitor.ts, etc.) should remain in apps and NOT be in packages.
- Make sure re-exports are properly typed to maintain TypeScript safety.
