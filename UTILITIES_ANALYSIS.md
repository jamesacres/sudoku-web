# Utilities Analysis Report: apps/sudoku/src/utils and apps/sudoku/src/helpers

## Executive Summary

This report analyzes utilities in **apps/sudoku/src/utils/** and **apps/sudoku/src/helpers/** to identify which could be moved to **packages/sudoku** for better code organization and reusability.

**Key Finding**: Most utilities are in the correct location. Some app-specific helpers in `apps/sudoku/src/helpers/` are already properly scoped. **None of the utilities should be moved to packages/sudoku** as they are either:
- Already duplicated in packages/sudoku (dailyPuzzleCounter)
- Better suited to packages/template (formatSeconds, calculateSeconds, capacitor, electron, pkce)
- Platform/app-specific (buildPuzzleUrl, cheatDetection, sha256)

---

## 1. FILES IN apps/sudoku/src/utils/

### 1.1 dailyPuzzleCounter.ts (ALREADY DUPLICATED)

**Location**: `/home/node/sudoku-web/apps/sudoku/src/utils/dailyPuzzleCounter.ts`

**Purpose**: Tracks daily puzzle IDs completed by the user

**Functions**:
- `getTodayDateString()` - Returns today's date in YYYY-MM-DD format
- `getDailyPuzzleIds()` - Get Set of puzzle IDs completed today
- `addDailyPuzzleId(puzzleId: string)` - Add puzzle to today's tracking, returns count
- `getDailyPuzzleCount()` - Get total count of unique puzzles completed today

**Code Analysis**:
```typescript
// localStorage-based tracking with daily reset
// Uses window check for SSR safety
// Has comprehensive error handling
```

**Dependencies**:
- `localStorage` (browser API)
- No external package dependencies

**Is Sudoku-Specific**: YES (tracks puzzle completion)

**Equivalent Code Location**: 
- **EXACT DUPLICATE exists at**: `/home/node/sudoku-web/packages/sudoku/src/utils/dailyPuzzleCounter.ts`
- **EXPORTED from**: `@sudoku-web/sudoku` package
- **Status**: DUPLICATED - apps/sudoku should import from `@sudoku-web/sudoku` instead

**Recommendation**: 
- **REMOVE** from apps/sudoku/src/utils/
- **IMPORT** from `@sudoku-web/sudoku` package instead
- Update import in `/home/node/sudoku-web/apps/sudoku/src/components/Sudoku/Sudoku.tsx` (line 33-35)
- Current: `import { addDailyPuzzleId, getDailyPuzzleCount } from '@/utils/dailyPuzzleCounter';`
- Change to: `import { addDailyPuzzleId, getDailyPuzzleCount } from '@sudoku-web/sudoku';`

**Status**: CONSOLIDATION OPPORTUNITY

---

### 1.2 playerColors.test.ts (TEST ONLY - No Implementation)

**Location**: `/home/node/sudoku-web/apps/sudoku/src/utils/playerColors.test.ts`

**Purpose**: Tests for player color assignment (only test file, no implementation)

**Functions Tested**:
- `getPlayerColor(userId, allUserIds, isCurrentUser)` - Get tailwind color for player
- `getAllUserIds(parties)` - Extract unique user IDs from parties
- `PLAYER_COLORS` - Array of 5 player colors
- `CURRENT_USER_COLOR` - Special color for current user

**Code Location**: Implementation exists at `/home/node/sudoku-web/packages/template/src/utils/playerColors.ts`

**Status**: Already properly organized - tests reference `@sudoku-web/template` imports

**Recommendation**: NO ACTION - Already in correct package

---

### 1.3 dailyActionCounter.test.ts (TEST ONLY - No Implementation)

**Location**: `/home/node/sudoku-web/apps/sudoku/src/utils/dailyActionCounter.test.ts`

**Purpose**: Tests for daily action limits (Undo and CheckGrid counters)

**Functions Tested**:
- `getTodayDateString()` - Date tracking
- `getDailyActionData()` - Get current day's action data
- `incrementUndoCount()` / `incrementCheckGridCount()` - Increment counters
- `getUndoCount()` / `getCheckGridCount()` - Get current counts
- `canUseUndo()` / `canUseCheckGrid()` - Check if action allowed
- `getRemainingUndos()` / `getRemainingCheckGrids()` - Calculate remaining uses

**Code Location**: Implementation exists at `/home/node/sudoku-web/packages/template/src/utils/dailyActionCounter.ts`

**Status**: Already properly organized - tests reference `@sudoku-web/template` imports

**Recommendation**: NO ACTION - Already in correct package

---

## 2. FILES IN apps/sudoku/src/helpers/

### 2.1 buildPuzzleUrl.ts

**Location**: `/home/node/sudoku-web/apps/sudoku/src/helpers/buildPuzzleUrl.ts`

**Purpose**: Creates puzzle redirect URLs with puzzle state encoded as query parameters

**Function**:
```typescript
buildPuzzleUrl(
  initial: string,          // Initial puzzle state
  final: string,            // Completed puzzle state
  metadata?: Partial<GameStateMetadata>,  // Optional metadata
  alreadyCompleted?: boolean
): string
```

**Returns**: URL string like `/puzzle?initial=...&final=...&key=value`

**Code Analysis**:
```typescript
const redirectQuery = new URLSearchParams();
// Builds a query string with puzzle data for linking between pages
// Metadata is spread into individual query parameters
```

**Dependencies**:
- `GameStateMetadata` from `@sudoku-web/sudoku` (type only)
- Standard JavaScript URLSearchParams

**Is Sudoku-Specific**: YES (encodes sudoku puzzle state)

**Usage in apps/sudoku**:
- `/app/page.tsx` - Links to puzzle page
- `/app/import/page.tsx` - Handles imported puzzles
- `/app/puzzle/page.tsx` - Puzzle completion flow
- `/components/IntegratedSessionRow.tsx` - Session links in multiplayer

**Recommendation**: 
- **KEEP in apps/sudoku** - App-specific puzzle routing
- Not generic enough for packages/sudoku (sudoku-specific but not logic)
- Better suited as app utility than library export

**Status**: CORRECTLY SCOPED

---

### 2.2 cheatDetection.ts

**Location**: `/home/node/sudoku-web/apps/sudoku/src/helpers/cheatDetection.ts`

**Purpose**: Detects if a player cheated by checking if >1 cell changed between consecutive puzzle states

**Function**:
```typescript
isPuzzleCheated(
  gameStateOrAnswerStack: ServerState | Puzzle[]
): boolean
```

**Algorithm**:
- Compares last two states in answerStack
- Counts cell changes
- Returns true if >1 cell changed (indicates auto-fill or cheating)
- Handles both ServerState and direct Puzzle array input

**Code Analysis**:
- Nested 4 loops (boxes × cells) for grid comparison
- Uses JSON.stringify for deep cell comparison
- Handles both Note and number values

**Dependencies**:
- `Puzzle` type from `@sudoku-web/sudoku`
- `ServerState` type from `@sudoku-web/sudoku`

**Is Sudoku-Specific**: YES (sudoku grid structure, cell comparison)

**Usage in apps/sudoku**:
- `/components/RaceTrack/RaceTrack.tsx` - Marks cheated scores
- `/components/Sudoku/Sudoku.tsx` - Prevents reward on cheat
- `/components/leaderboard/scoringUtils.ts` - Filters cheated scores
- `/components/IntegratedSessionRow.tsx` - UI indication of cheating

**Recommendation**:
- **CONSIDER MOVING to packages/sudoku** 
- This is core sudoku game logic (cheat detection)
- Generic sudoku algorithm, not app-specific
- Would benefit other sudoku apps using the package
- Should be exported from `@sudoku-web/sudoku`

**Status**: CANDIDATE FOR MOVEMENT (lower priority)

---

### 2.3 sha256.ts

**Location**: `/home/node/sudoku-web/apps/sudoku/src/helpers/sha256.ts`

**Purpose**: Generates SHA-256 hash of a message using Web Crypto API

**Function**:
```typescript
async sha256(message: string): Promise<string>
```

**Returns**: Hex-encoded SHA-256 hash

**Code Analysis**:
```typescript
const msgBuffer = new TextEncoder().encode(message);
const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
// Converts to hex string
```

**Dependencies**:
- Browser Web Crypto API (`crypto.subtle`)
- TextEncoder (standard browser API)

**Is Sudoku-Specific**: NO (generic crypto utility)

**Usage in apps/sudoku**:
- `/app/book/page.tsx` - Generates session ID from puzzle initial state
- `/app/puzzle/page.tsx` - Creates puzzle ID: `sudoku-${await sha256(initial)}`

**Recommendation**:
- **MOVE to packages/shared or packages/template**
- Generic cryptography utility, not sudoku-specific
- Useful for other apps and packages
- Consider: Is there a better standard library alternative?
- Could potentially use `crypto-js` or similar for broader compatibility

**Status**: CANDIDATE FOR MOVEMENT (generic, not sudoku-specific)

---

### 2.4 formatSeconds.test.ts (TEST ONLY)

**Location**: `/home/node/sudoku-web/apps/sudoku/src/helpers/formatSeconds.test.ts`

**Purpose**: Tests for time formatting (HH:MM:SS)

**Implementation Location**: `/home/node/sudoku-web/packages/template/src/helpers/formatSeconds.ts`

**Status**: Already properly organized - Tests `@sudoku-web/template` import

**Recommendation**: NO ACTION

---

### 2.5 calculateSeconds.test.ts (TEST ONLY)

**Location**: `/home/node/sudoku-web/apps/sudoku/src/helpers/calculateSeconds.test.ts`

**Purpose**: Tests for elapsed time calculation from Timer object

**Implementation Location**: `/home/node/sudoku-web/packages/template/src/helpers/calculateSeconds.ts`

**Status**: Already properly organized - Tests `@sudoku-web/template` import

**Recommendation**: NO ACTION

---

### 2.6 capacitor.test.ts (TEST ONLY)

**Location**: `/home/node/sudoku-web/apps/sudoku/src/helpers/capacitor.test.ts`

**Purpose**: Tests for Capacitor platform detection and storage

**Implementation Location**: `/home/node/sudoku-web/packages/template/src/helpers/capacitor.ts`

**Status**: Already properly organized - Tests `@sudoku-web/template` import

**Recommendation**: NO ACTION

---

### 2.7 electron.test.ts (TEST ONLY)

**Location**: `/home/node/sudoku-web/apps/sudoku/src/helpers/electron.test.ts`

**Purpose**: Tests for Electron platform detection and IPC

**Implementation Location**: `/home/node/sudoku-web/packages/template/src/helpers/electron.ts`

**Status**: Already properly organized - Tests `@sudoku-web/template` import

**Recommendation**: NO ACTION

---

### 2.8 pkce.test.ts (TEST ONLY)

**Location**: `/home/node/sudoku-web/apps/sudoku/src/helpers/pkce.test.ts`

**Purpose**: Tests for OAuth PKCE (Proof Key for Code Exchange)

**Implementation Location**: `/home/node/sudoku-web/packages/template/src/helpers/pkce.ts`

**Status**: Already properly organized - Tests `@sudoku-web/template` import

**Recommendation**: NO ACTION

---

## 3. ARCHITECTURE SUMMARY

### Current Organization (Correct)

```
packages/sudoku/          (Sudoku game logic)
├── src/utils/
│   └── dailyPuzzleCounter.ts      (Game-specific puzzle tracking)
├── src/helpers/
│   ├── checkAnswer.ts              (Game logic)
│   ├── calculateCompletionPercentage.ts  (Game logic)
│   ├── calculateId.ts              (Game logic)
│   └── puzzleTextToPuzzle.ts       (Game logic)

packages/template/        (Generic app infrastructure)
├── src/utils/
│   ├── dailyActionCounter.ts       (Generic daily limits)
│   └── playerColors.ts             (Generic color assignment)
├── src/helpers/
│   ├── calculateSeconds.ts         (Time calculations)
│   ├── formatSeconds.ts            (Time formatting)
│   ├── capacitor.ts                (Platform detection)
│   ├── electron.ts                 (Platform detection)
│   └── pkce.ts                     (OAuth utilities)

apps/sudoku/              (App-specific)
├── src/utils/
│   ├── dailyPuzzleCounter.ts       (DUPLICATE - should remove)
│   ├── playerColors.test.ts        (Tests only - OK)
│   └── dailyActionCounter.test.ts  (Tests only - OK)
├── src/helpers/
│   ├── buildPuzzleUrl.ts           (App-specific routing)
│   ├── cheatDetection.ts           (Game logic - move?)
│   ├── sha256.ts                   (Generic crypto - move?)
│   └── Test files                  (Correctly reference packages)
```

---

## 4. RECOMMENDATIONS (PRIORITY ORDER)

### Priority 1: Remove Duplication (HIGH IMPACT)

**Action**: Remove `dailyPuzzleCounter.ts` from apps/sudoku
- **File**: `/home/node/sudoku-web/apps/sudoku/src/utils/dailyPuzzleCounter.ts`
- **File**: `/home/node/sudoku-web/apps/sudoku/src/utils/dailyPuzzleCounter.test.ts`
- **File**: `/home/node/sudoku-web/apps/sudoku/src/utils/playerColors.test.ts` (not a duplicate, just verify it imports correctly)
- **Update Import**: In `apps/sudoku/src/components/Sudoku/Sudoku.tsx`:
  ```typescript
  // OLD:
  import { addDailyPuzzleId, getDailyPuzzleCount } from '@/utils/dailyPuzzleCounter';
  
  // NEW:
  import { addDailyPuzzleId, getDailyPuzzleCount } from '@sudoku-web/sudoku';
  ```
- **Impact**: Eliminates code duplication, single source of truth
- **Risk**: LOW (imports from same package, no logic changes)

---

### Priority 2: Consider Moving Sudoku Logic (MEDIUM IMPACT)

**Action**: Evaluate moving `cheatDetection.ts` to packages/sudoku
- **File**: `/home/node/sudoku-web/apps/sudoku/src/helpers/cheatDetection.ts`
- **Rationale**: 
  - Core sudoku game logic, not app-specific
  - Algorithm works with Puzzle and ServerState types
  - Would benefit other sudoku apps
  - Should be library export
- **Before Moving**:
  - Check if other apps need this
  - Consider if logic needs refinement
  - Add to `packages/sudoku/src/index.ts` exports
- **Risk**: MEDIUM (refactor required, but well-tested)

---

### Priority 3: Move Generic Utilities (MEDIUM IMPACT)

**Action**: Consider moving `sha256.ts` to packages/shared
- **File**: `/home/node/sudoku-web/apps/sudoku/src/helpers/sha256.ts`
- **Rationale**:
  - Generic cryptography, not sudoku-specific
  - Useful for other apps/packages
  - Currently used for puzzle ID generation
- **Before Moving**:
  - Consider if standard library like `crypto-js` is better
  - Check Node.js vs browser compatibility needs
  - Evaluate where @sudoku-web/shared utilities live
- **Risk**: MEDIUM (if no shared package exists, LOW if moving to existing shared package)

---

### Priority 4: Review App-Specific Helpers (LOW IMPACT)

**Action**: Confirm `buildPuzzleUrl.ts` stays in apps/sudoku
- **File**: `/home/node/sudoku-web/apps/sudoku/src/helpers/buildPuzzleUrl.ts`
- **Status**: CORRECTLY SCOPED
- **Rationale**: 
  - Encodes app-specific routing and state
  - Not useful for other apps (hardcoded `/puzzle` path)
  - Better as app utility
- **Action**: NO CHANGE NEEDED

---

## 5. DEPENDENCY MATRIX

### What imports what:

```
apps/sudoku/components/Sudoku/Sudoku.tsx
  ├── @sudoku-web/sudoku
  ├── @sudoku-web/template
  └── @/utils/dailyPuzzleCounter (DUPLICATE - should be @sudoku-web/sudoku)

apps/sudoku/components/RaceTrack/RaceTrack.tsx
  ├── @/helpers/cheatDetection

apps/sudoku/app/book/page.tsx
  ├── @/helpers/sha256

apps/sudoku/app/puzzle/page.tsx
  ├── @/helpers/buildPuzzleUrl
  ├── @/helpers/sha256

apps/sudoku/components/IntegratedSessionRow.tsx
  ├── @/helpers/buildPuzzleUrl
  ├── @/helpers/cheatDetection
```

---

## 6. FILES NOT IN UTILS/HELPERS (For Completeness)

The following app-specific logic files are in correct locations:
- `/src/app/**` - Page components (correctly scoped)
- `/src/components/**` - React components (correctly scoped)
- `/src/hooks/**` - App-specific hooks (correctly scoped)
- `/src/types/**` - App-specific types (correctly scoped)
- `/src/providers/**` - App-specific providers (correctly scoped)

---

## 7. CONCLUSION

**Overall Assessment**: Most utilities are correctly organized.

**Action Items**:
1. **MUST DO**: Remove `dailyPuzzleCounter` duplication
2. **SHOULD DO**: Evaluate moving cheat detection logic
3. **COULD DO**: Move sha256 to shared utilities
4. **NO ACTION**: Keep buildPuzzleUrl in apps/sudoku
5. **NO ACTION**: Test files already reference correct packages

**Estimated Effort**: 
- Removing duplication: 10 minutes
- Moving cheat detection: 30-60 minutes (with testing)
- Moving sha256: 20-30 minutes (if shared package exists)

