# Detailed Code Reference for File Migration

## File 1: scoringConfig.ts

### Current Location
`/home/node/sudoku-web/apps/sudoku/src/components/leaderboard/scoringConfig.ts`

### Current Content
```typescript
import { Difficulty } from '@sudoku-web/template';
import { BookPuzzleDifficulty } from '@sudoku-web/sudoku';

export const SCORING_CONFIG = {
  DAILY_PUZZLE_BASE: 100,
  BOOK_PUZZLE_BASE: 150,
  SCANNED_PUZZLE_BASE: 75,
  VOLUME_MULTIPLIER: 10,

  DIFFICULTY_MULTIPLIERS: {
    // Daily puzzle difficulties
    [Difficulty.SIMPLE]: 1.0,
    [Difficulty.EASY]: 1.2,
    [Difficulty.INTERMEDIATE]: 1.5,
    [Difficulty.EXPERT]: 2.0,
    // Book puzzle difficulties
    [BookPuzzleDifficulty.VERY_EASY]: 1.0,
    [BookPuzzleDifficulty.EASY]: 1.2,
    [BookPuzzleDifficulty.MODERATELY_EASY]: 1.3,
    [BookPuzzleDifficulty.MODERATE]: 1.4,
    [BookPuzzleDifficulty.MODERATELY_HARD]: 1.6,
    [BookPuzzleDifficulty.HARD]: 1.8,
    [BookPuzzleDifficulty.VICIOUS]: 2.5,
    [BookPuzzleDifficulty.FIENDISH]: 2.8,
    [BookPuzzleDifficulty.DEVILISH]: 3.2,
    [BookPuzzleDifficulty.HELL]: 3.6,
    [BookPuzzleDifficulty.BEYOND_HELL]: 4.0,
  } as Record<string, number>,

  SPEED_THRESHOLDS: {
    LIGHTNING: 180,
    FAST: 300,
    QUICK: 600,
    STEADY: 1200,
  },

  SPEED_BONUSES: {
    LIGHTNING: 500,
    FAST: 300,
    QUICK: 150,
    STEADY: 50,
  },

  RACING_BONUS_PER_PERSON: 100,
};
```

### New Location After Migration
`packages/sudoku/src/helpers/scoringConfig.ts`

### Required Changes
- **None** - File content remains identical

### Import Update Needed In
1. `apps/sudoku/src/components/leaderboard/scoringUtils.ts`
   - Current: `import { SCORING_CONFIG } from './scoringConfig';`
   - After Move: `import { SCORING_CONFIG } from '@sudoku-web/sudoku';` (via package exports)

---

## File 2: cheatDetection.ts

### Current Location
`/home/node/sudoku-web/apps/sudoku/src/helpers/cheatDetection.ts`

### Current Content
```typescript
import { Puzzle } from '@sudoku-web/sudoku';
import { ServerState } from '@sudoku-web/sudoku';

// Cheat detection: Check if more than one cell changed between two puzzle states
export const isPuzzleCheated = (
  gameStateOrAnswerStack: ServerState | Puzzle[]
): boolean => {
  let answerStack: Puzzle[];
  let completed: boolean;

  // Handle both ServerState and direct answerStack input
  if (Array.isArray(gameStateOrAnswerStack)) {
    answerStack = gameStateOrAnswerStack;
    completed = true; // Assume completed if we're just checking answer stack
  } else {
    const gameState = gameStateOrAnswerStack as ServerState;
    if (
      !gameState.completed ||
      !gameState.answerStack ||
      gameState.answerStack.length < 2
    ) {
      return false;
    }
    answerStack = gameState.answerStack;
    completed = gameState.completed !== undefined;
  }

  if (!completed || !answerStack || answerStack.length < 2) {
    return false;
  }

  const lastAnswer = answerStack[answerStack.length - 1];
  const previousAnswer = answerStack[answerStack.length - 2];

  let changedCells = 0;

  // Compare each cell between the last two states
  for (let boxX = 0; boxX < 3; boxX++) {
    for (let boxY = 0; boxY < 3; boxY++) {
      for (let cellX = 0; cellX < 3; cellX++) {
        for (let cellY = 0; cellY < 3; cellY++) {
          const lastCell =
            lastAnswer[boxX as 0 | 1 | 2][boxY as 0 | 1 | 2][
              cellX as 0 | 1 | 2
            ][cellY as 0 | 1 | 2];
          const prevCell =
            previousAnswer[boxX as 0 | 1 | 2][boxY as 0 | 1 | 2][
              cellX as 0 | 1 | 2
            ][cellY as 0 | 1 | 2];

          // Compare the cell values (handle both numbers and Notes)
          if (JSON.stringify(lastCell) !== JSON.stringify(prevCell)) {
            changedCells++;

            // If more than one cell changed, it's likely cheating
            if (changedCells > 1) {
              return true;
            }
          }
        }
      }
    }
  }

  return false;
};
```

### New Location After Migration
`packages/sudoku/src/helpers/cheatDetection.ts`

### Required Changes
- **None** - File content remains identical

### Import Updates Needed In
1. `apps/sudoku/src/components/leaderboard/scoringUtils.ts`
   - Current: `import { isPuzzleCheated } from '@/helpers/cheatDetection';`
   - After Move: `import { isPuzzleCheated } from '@sudoku-web/sudoku';` (via package exports)

2. Any other files importing this (search with: `grep -r "from.*cheatDetection"`)

---

## File 3: scoringUtils.ts

### Current Location
`/home/node/sudoku-web/apps/sudoku/src/components/leaderboard/scoringUtils.ts`

### Current Imports (7 imports from 5 sources)
```typescript
import { ServerStateResult, Party } from '@sudoku-web/sudoku';
import { ServerState } from '@sudoku-web/sudoku';
import { isPuzzleCheated } from '@/helpers/cheatDetection';
import { SCORING_CONFIG } from './scoringConfig';
import { PuzzleType, ScoringResult, AllFriendsSessionsMap } from './types';
```

### New Location After Migration
`packages/sudoku/src/helpers/scoringUtils.ts`

### New Imports (After Migration)
```typescript
import { ServerStateResult, Party, ServerState } from '@sudoku-web/sudoku';
import { isPuzzleCheated } from './cheatDetection';  // Changed from @/helpers/cheatDetection
import { SCORING_CONFIG } from './scoringConfig';    // Unchanged (local)
import { PuzzleType, ScoringResult, AllFriendsSessionsMap } from './types';  // Unchanged (local)
```

### Exported Functions and Types
```typescript
export const getPuzzleType = (
  session: ServerStateResult<ServerState>
): PuzzleType

export const getPuzzleIdentifier = (
  session: ServerStateResult<ServerState>
): string

export const calculateSpeedBonus = (completionTimeSeconds: number): number

export const calculateRacingBonus = (
  userSession: ServerStateResult<ServerState>,
  allFriendsSessions: AllFriendsSessionsMap,
  currentUserId: string
): { bonus: number; wins: number }

export const calculateUserScore = (
  userSessions: ServerStateResult<ServerState>[],
  allFriendsSessions: AllFriendsSessionsMap,
  currentUserId: string
): ScoringResult

export const formatTime = (seconds: number): string

export const getUsernameFromParties = (
  userId: string,
  parties: Party[]
): string
```

### Full Updated Code After Migration
```typescript
import { ServerStateResult, Party, ServerState } from '@sudoku-web/sudoku';
import { isPuzzleCheated } from './cheatDetection';
import { SCORING_CONFIG } from './scoringConfig';
import { PuzzleType, ScoringResult, AllFriendsSessionsMap } from './types';

export const getPuzzleType = (
  session: ServerStateResult<ServerState>
): PuzzleType => {
  if (session.state.metadata?.sudokuId?.includes('oftheday')) return 'daily';
  if (session.state.metadata?.sudokuBookPuzzleId) return 'book';
  if (session.state.metadata?.scannedAt) return 'scanned';
  return 'unknown';
};

export const getPuzzleIdentifier = (
  session: ServerStateResult<ServerState>
): string => {
  if (session.state.metadata?.sudokuId) return session.state.metadata.sudokuId;
  if (session.state.metadata?.sudokuBookPuzzleId)
    return session.state.metadata.sudokuBookPuzzleId;
  return session.sessionId;
};

export const calculateSpeedBonus = (completionTimeSeconds: number): number => {
  if (completionTimeSeconds <= SCORING_CONFIG.SPEED_THRESHOLDS.LIGHTNING) {
    return SCORING_CONFIG.SPEED_BONUSES.LIGHTNING;
  }
  if (completionTimeSeconds <= SCORING_CONFIG.SPEED_THRESHOLDS.FAST) {
    return SCORING_CONFIG.SPEED_BONUSES.FAST;
  }
  if (completionTimeSeconds <= SCORING_CONFIG.SPEED_THRESHOLDS.QUICK) {
    return SCORING_CONFIG.SPEED_BONUSES.QUICK;
  }
  if (completionTimeSeconds <= SCORING_CONFIG.SPEED_THRESHOLDS.STEADY) {
    return SCORING_CONFIG.SPEED_BONUSES.STEADY;
  }
  return 0;
};

export const calculateRacingBonus = (
  userSession: ServerStateResult<ServerState>,
  allFriendsSessions: AllFriendsSessionsMap,
  currentUserId: string
): { bonus: number; wins: number } => {
  const puzzleId = getPuzzleIdentifier(userSession);
  const userTime = userSession.state.completed?.seconds || Infinity;

  let friendsBeaten = 0;

  Object.entries(allFriendsSessions).forEach(([userId, friendSessions]) => {
    if (userId === currentUserId) return;

    const friendAttempt = friendSessions?.find(
      (session) =>
        getPuzzleIdentifier(session) === puzzleId && session.state.completed
    );

    if (
      friendAttempt &&
      friendAttempt.state.completed &&
      userSession.state.completed
    ) {
      const friendTime = friendAttempt.state.completed.seconds;
      if (userTime < friendTime) {
        friendsBeaten++;
      }
    }
  });

  return {
    bonus: friendsBeaten * SCORING_CONFIG.RACING_BONUS_PER_PERSON,
    wins: friendsBeaten,
  };
};

export const calculateUserScore = (
  userSessions: ServerStateResult<ServerState>[],
  allFriendsSessions: AllFriendsSessionsMap,
  currentUserId: string
): ScoringResult => {
  const recent30DaySessions = userSessions.filter(
    (session) => session.state.completed && !isPuzzleCheated(session.state)
  );

  let volumeScore = 0;
  let dailyPuzzleScore = 0;
  let bookPuzzleScore = 0;
  let scannedPuzzleScore = 0;
  let difficultyBonus = 0;
  let speedBonus = 0;
  let racingBonus = 0;

  const stats = {
    totalPuzzles: recent30DaySessions.length,
    dailyPuzzles: 0,
    bookPuzzles: 0,
    scannedPuzzles: 0,
    averageTime: 0,
    fastestTime: Infinity,
    racingWins: 0,
  };

  let totalTime = 0;

  for (const session of recent30DaySessions) {
    const completionTime = session.state.completed?.seconds || 0;
    totalTime += completionTime;
    stats.fastestTime = Math.min(stats.fastestTime, completionTime);

    volumeScore += SCORING_CONFIG.VOLUME_MULTIPLIER;

    const puzzleType = getPuzzleType(session);
    let baseScore = 0;
    let difficultyMultiplier = 1;

    switch (puzzleType) {
      case 'daily':
        baseScore = SCORING_CONFIG.DAILY_PUZZLE_BASE;
        stats.dailyPuzzles++;
        dailyPuzzleScore += baseScore;
        difficultyMultiplier =
          SCORING_CONFIG.DIFFICULTY_MULTIPLIERS[
            session.state.metadata?.difficulty || ''
          ] || 1;
        break;

      case 'book':
        baseScore = SCORING_CONFIG.BOOK_PUZZLE_BASE;
        stats.bookPuzzles++;
        bookPuzzleScore += baseScore;
        difficultyMultiplier =
          SCORING_CONFIG.DIFFICULTY_MULTIPLIERS[
            session.state.metadata?.difficulty || ''
          ] || 1;
        break;

      case 'scanned':
        baseScore = SCORING_CONFIG.SCANNED_PUZZLE_BASE;
        stats.scannedPuzzles++;
        scannedPuzzleScore += baseScore;
        break;
    }

    const difficultyBonusForPuzzle = baseScore * (difficultyMultiplier - 1);
    difficultyBonus += difficultyBonusForPuzzle;

    const speedBonusForPuzzle = calculateSpeedBonus(completionTime);
    speedBonus += speedBonusForPuzzle;

    const racingResult = calculateRacingBonus(
      session,
      allFriendsSessions,
      currentUserId
    );
    racingBonus += racingResult.bonus;
    stats.racingWins += racingResult.wins;
  }

  stats.averageTime =
    stats.totalPuzzles > 0 ? totalTime / stats.totalPuzzles : 0;
  stats.fastestTime = stats.fastestTime === Infinity ? 0 : stats.fastestTime;

  return {
    volumeScore,
    dailyPuzzleScore,
    bookPuzzleScore,
    scannedPuzzleScore,
    difficultyBonus,
    speedBonus,
    racingBonus,
    stats,
  };
};

export const formatTime = (seconds: number): string => {
  if (seconds === 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const getUsernameFromParties = (
  userId: string,
  parties: Party[]
): string => {
  for (const party of parties) {
    const member = party.members.find((m) => m.userId === userId);
    if (member) return member.memberNickname;
  }
  return 'Unknown User';
};
```

### Import Updates Needed In
Any files currently importing from `./leaderboard/scoringUtils`:
- Search: `grep -r "from.*scoringUtils"`
- Update to import from: `@sudoku-web/sudoku`

---

## Additional File: types.ts

### Current Location
`/home/node/sudoku-web/apps/sudoku/src/components/leaderboard/types.ts`

### Current Content
```typescript
import { ServerStateResult } from '@sudoku-web/sudoku';
import { ServerState } from '@sudoku-web/sudoku';

export interface FriendsLeaderboardScore {
  userId: string;
  username: string;
  totalScore: number;
  breakdown: {
    volumeScore: number;
    dailyPuzzleScore: number;
    bookPuzzleScore: number;
    scannedPuzzleScore: number;
    difficultyBonus: number;
    speedBonus: number;
    racingBonus: number;
  };
  stats: {
    totalPuzzles: number;
    dailyPuzzles: number;
    bookPuzzles: number;
    scannedPuzzles: number;
    averageTime: number;
    fastestTime: number;
    racingWins: number;
  };
}

export type PuzzleType = 'daily' | 'book' | 'scanned' | 'unknown';

export interface ScoringResult {
  volumeScore: number;
  dailyPuzzleScore: number;
  bookPuzzleScore: number;
  scannedPuzzleScore: number;
  difficultyBonus: number;
  speedBonus: number;
  racingBonus: number;
  stats: FriendsLeaderboardScore['stats'];
}

export type AllFriendsSessionsMap = Record<
  string,
  ServerStateResult<ServerState>[]
>;
```

### New Location After Migration
`packages/sudoku/src/helpers/types.ts`

### Required Changes
- **None** - File content remains identical

---

## Test Files

### Test File 1: cheatDetection.test.ts

**Current Location:** `/home/node/sudoku-web/apps/sudoku/src/helpers/cheatDetection.test.ts`  
**New Location:** `packages/sudoku/src/helpers/cheatDetection.test.ts`  
**Size:** 7.2 KB  
**Test Count:** 24 tests  
**Required Changes:** None - file content remains identical

### Test File 2: scoringUtils.test.ts

**Current Location:** `/home/node/sudoku-web/apps/sudoku/src/components/leaderboard/scoringUtils.test.ts`  
**New Location:** `packages/sudoku/src/helpers/scoringUtils.test.ts`  
**Size:** 9.1 KB  
**Test Count:** 30 tests

**Current Imports in Test File:**
```typescript
import {
  getPuzzleType,
  calculateSpeedBonus,
  calculateRacingBonus,
  calculateUserScore,
  formatTime,
  getUsernameFromParties,
} from './scoringUtils';
import { SCORING_CONFIG } from './scoringConfig';
import { ServerStateResult, Party } from '@sudoku-web/sudoku';
import { ServerState } from '@sudoku-web/sudoku';
import { Puzzle } from '@sudoku-web/sudoku';
```

**Updated Imports After Migration:**
```typescript
import {
  getPuzzleType,
  calculateSpeedBonus,
  calculateRacingBonus,
  calculateUserScore,
  formatTime,
  getUsernameFromParties,
} from './scoringUtils';  // Unchanged (local)
import { SCORING_CONFIG } from './scoringConfig';  // Unchanged (local)
import { ServerStateResult, Party, ServerState, Puzzle } from '@sudoku-web/sudoku';  // Consolidated
```

---

## Package Export Updates

### File: packages/sudoku/src/index.ts

**Add these exports:**

```typescript
// Scoring utilities
export { isPuzzleCheated } from './helpers/cheatDetection';
export { SCORING_CONFIG } from './helpers/scoringConfig';
export { 
  calculateUserScore, 
  calculateSpeedBonus, 
  calculateRacingBonus, 
  getPuzzleType,
  getPuzzleIdentifier,
  formatTime, 
  getUsernameFromParties 
} from './helpers/scoringUtils';
export type { 
  ScoringResult, 
  PuzzleType, 
  AllFriendsSessionsMap,
  FriendsLeaderboardScore 
} from './helpers/types';
```

---

## Summary of Changes by Location

### Source Files to Copy
| From | To | Changes |
|------|----|---------| 
| `apps/sudoku/src/helpers/cheatDetection.ts` | `packages/sudoku/src/helpers/cheatDetection.ts` | None |
| `apps/sudoku/src/components/leaderboard/scoringConfig.ts` | `packages/sudoku/src/helpers/scoringConfig.ts` | None |
| `apps/sudoku/src/components/leaderboard/types.ts` | `packages/sudoku/src/helpers/types.ts` | None |
| `apps/sudoku/src/components/leaderboard/scoringUtils.ts` | `packages/sudoku/src/helpers/scoringUtils.ts` | Import: `@/helpers/cheatDetection` → `./cheatDetection` |

### Test Files to Copy
| From | To | Changes |
|------|----|---------| 
| `apps/sudoku/src/helpers/cheatDetection.test.ts` | `packages/sudoku/src/helpers/cheatDetection.test.ts` | None |
| `apps/sudoku/src/components/leaderboard/scoringUtils.test.ts` | `packages/sudoku/src/helpers/scoringUtils.test.ts` | Minor import consolidation |

### App Imports to Update
| File | Current Import | New Import |
|------|-----------------|------------|
| Any using scoringUtils | `from './leaderboard/scoringUtils'` or `from '@/components/leaderboard/scoringUtils'` | `from '@sudoku-web/sudoku'` |
| Any using cheatDetection | `from '@/helpers/cheatDetection'` | `from '@sudoku-web/sudoku'` |
| Any using SCORING_CONFIG | `from './scoringConfig'` or `from '@/components/leaderboard/scoringConfig'` | `from '@sudoku-web/sudoku'` |

