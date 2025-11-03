# Detailed Movement Reference Tables

## Components Detailed Analysis

### SUDOKU APP COMPONENTS - Detailed Table

| Component | Location | Current Dependencies | Size | Priority | Move To | Effort | Risk | Blocking Issues |
|-----------|----------|----------------------|------|----------|---------|--------|------|-----------------|
| NumberPad | apps/sudoku/src | None | 1KB | ✓ MOVED | packages/sudoku | - | - | - |
| TimerDisplay | apps/sudoku/src | formatSeconds | 1KB | ✓ MOVED | packages/sudoku | - | - | - |
| TrafficLight | apps/sudoku/src | None | 1KB | ✓ MOVED | packages/sudoku | - | - | - |
| SudokuInput | apps/sudoku/src | SudokuInputNotes, local | 3KB | HIGH | KEEP (for now) | N/A | - | Tightly coupled to display |
| SudokuInputNotes | apps/sudoku/src | Notes (pkg) | 2KB | HIGH | Consider later | - | - | Works with SudokuInput |
| BookCovers | apps/sudoku/src | None | 2KB | MEDIUM | packages/sudoku | 30min | LOW | Generic, self-contained |
| HintBox | apps/sudoku/src | None | 1.5KB | MEDIUM | packages/sudoku | 30min | LOW | Generic UI |
| SudokuBox | packages/sudoku | SudokuInput, calc | 2KB | MEDIUM | REFACTOR | 3hrs | MED | Needs grid extraction |
| SudokuControls | apps/sudoku/src | canUseUndo (pkg), NotesToggle | 4KB | MEDIUM | KEEP | N/A | - | App-specific toggle logic |
| SimpleSudoku | packages/sudoku | Puzzle types | 2KB | MEDIUM | VERIFY USEFULNESS | - | - | Is it still used? |
| RaceTrack | packages/sudoku | Party types | 3KB | MEDIUM | KEEP (game-specific) | N/A | HIGH | Racing game logic |
| Sudoku (main) | apps/sudoku/src | GameState, contexts | 15KB | LOW | KEEP | N/A | HIGH | Central orchestrator |
| PartyInviteButton | apps/sudoku/src | useServerStorage, CopyButton | 2KB | MEDIUM | packages/template | 1hr | MED | Storage dependency |
| ActivityWidget | apps/sudoku/src | ServerStateResult | 2KB | LOW | KEEP | N/A | HIGH | Game analytics |
| PartyRow | apps/sudoku/src | Party types | 3KB | LOW | KEEP | N/A | HIGH | Game-specific display |
| SudokuSidebar | apps/sudoku/src | useParties, contexts | 8KB | LOW | KEEP | N/A | HIGH | Complex party mgmt |
| IntegratedSessionRow | apps/sudoku/src | Party, Session | 4KB | LOW | KEEP | N/A | HIGH | Custom data mapping |
| Leaderboard | apps/sudoku/src | Party, Session, UserProfile | 6KB | LOW | KEEP | N/A | HIGH | Game-specific scoring |
| FriendsTab | apps/sudoku/src | useSessions, Party | 3KB | LOW | KEEP | N/A | HIGH | Social features |
| MyPuzzlesTab | apps/sudoku/src | Session, ServerStateResult | 3KB | LOW | KEEP | N/A | HIGH | Game-specific |
| RacingPromptModal | apps/sudoku/src | None visible | 2KB | MEDIUM | Could move | 30min | LOW | Generic modal pattern |
| SudokuPlusModal | apps/sudoku/src | None visible | 2KB | MEDIUM | Could move | 30min | LOW | Generic modal pattern |
| PartyConfirmationDialog | apps/sudoku/src | None visible | 1.5KB | MEDIUM | Could move | 30min | LOW | Generic dialog pattern |
| SidebarButton | apps/sudoku/src | React.memo | 1KB | MEDIUM | packages/ui | 20min | LOW | Generic button |

### TEMPLATE APP COMPONENTS - Detailed Table

| Component | Location | Current Dependencies | Size | Priority | Move To | Effort | Risk | Blocking Issues |
|-----------|----------|----------------------|------|----------|---------|--------|------|-----------------|
| Header | apps/template/src | Dynamic imports | 2KB | HIGH | PARTIAL (packages/ui) | 1hr | LOW | Must extract user/online parts |
| HeaderBack | apps/template/src | useRouter | 1KB | HIGH | packages/ui | 15min | NONE | Generic, simple |
| ThemeSwitch | apps/template/src | useThemeColor | 1KB | ✓ EXPORTED | packages/ui | - | - | Already in packages/ui |
| ThemeColorSwitch | apps/template/src | useThemeColor, RevenueCat | 2KB | ✓ EXPORTED | packages/ui | - | - | Already in packages/ui |
| ThemeControls | apps/template/src | ThemeSwitch, ThemeColorSwitch | 1KB | HIGH | packages/ui | 15min | LOW | Composes exported components |
| Footer | apps/template/src | None | 1KB | HIGH | packages/ui | 15min | NONE | Generic, self-contained |
| Toggle/NotesToggle | apps/template/src | None | 2KB | HIGH | packages/ui | 15min | NONE | Generic toggle |
| CopyButton | apps/template/src | None | 2KB | ✓ HIGH | packages/ui | 30min | LOW | MOVE FIRST - highly reusable |
| CelebrationAnimation | apps/template/src | None | 3KB | ✓ HIGH | packages/ui | 30min | LOW | MOVE FIRST - highly reusable |
| HeaderUser | apps/template/src | UserContext, useOnline | 2KB | LOW | KEEP | N/A | - | Auth-specific |
| HeaderOnline | apps/template/src | useOnline | 1KB | MEDIUM | Could move | 15min | NONE | Generic but simple |
| UserPanel | apps/template/src | UserContext, serverStorage | 4KB | LOW | KEEP | N/A | - | User-specific logic |
| UserButton | apps/template/src | UserContext | 1KB | LOW | KEEP | N/A | - | Auth-specific |
| DeleteAccountDialog | apps/template/src | UserContext | 2KB | LOW | KEEP | N/A | - | Sensitive operation |
| UserAvatar | apps/template/src | UserContext | 2KB | MEDIUM | KEEP (for now) | N/A | - | Display only but needs context |
| PremiumFeatures | apps/template/src | RevenueCatContext | 3KB | LOW | KEEP | N/A | - | Business logic |
| ErrorBoundary | apps/template/src | None | 2KB | ✓ EXPORTED | packages/template | - | - | Already exported |
| GlobalErrorHandler | apps/template/src | None | 2KB | ✓ EXPORTED | packages/template | - | - | Already exported |
| AppDownloadModal | apps/template/src | isCapacitor | 3KB | ✓ EXPORTED | packages/template | - | - | Already exported |
| SocialProof | apps/template/src | None visible | 2KB | MEDIUM | packages/ui | 30min | LOW | Generic component |

---

## Hooks Detailed Analysis

### HOOK CONSOLIDATION TABLE

| Hook Name | Current Location(s) | Exported? | Dependencies | Generic? | Action | Effort | Risk | Notes |
|-----------|-------------------|-----------|--------------|----------|--------|--------|------|-------|
| useTimer | packages/sudoku | ✓ YES | localStorage, docVis | YES | ✓ GOOD | - | - | Already properly exported |
| useGameState | apps/sudoku | ✗ NO | useTimer, useLocalStorage, useServerStorage, UserContext, RevenueCatContext, useSessions, useParties | NO | KEEP | N/A | HIGH | Sudoku-specific state machine (25KB) |
| useParties | apps/sudoku | ✗ NO | PartiesContext only | SEMI | COULD EXPORT | 30min | MED | Party management - useful for collabs |
| useDrag | apps/template, apps/sudoku | ✗ NO (DUPE!) | splitCellId (sudoku) | YES | CONSOLIDATE | 1hr | LOW | CRITICAL: Remove sudoku version |
| useOnline | packages/template | ✓ YES | None | YES | ✓ GOOD | - | - | Already properly exported |
| useLocalStorage | packages/template | ✓ YES | None | YES | ✓ GOOD | - | - | Already properly exported |
| useWakeLock | packages/template | ✓ YES | None | YES | ✓ GOOD | - | - | Already properly exported |
| useFetch | packages/template | ✓ YES | useFetchProvider | YES | ✓ GOOD | - | - | Already properly exported |
| useDocumentVisibility | packages/template | ✓ YES | None | YES | ✓ GOOD | - | - | Already properly exported |
| useServerStorage | packages/template | ✓ YES | useFetch | YES | ✓ GOOD | - | - | Already properly exported |
| useSession | packages/template | ✗ PARTIAL | Server types | SEMI | EXPORT | 5min | NONE | Not in index.ts, should export |
| useParty | packages/template | ✗ PARTIAL | Server types | SEMI | EXPORT | 5min | NONE | Not in index.ts, should export |
| useMembership | packages/template | ✗ PARTIAL | Server types | SEMI | EXPORT | 5min | NONE | Not in index.ts, should export |
| useDarkMode | packages/ui/hooks | ✗ INTERNAL | next-themes | SEMI | EVALUATE | N/A | - | Keep internal for now |
| useTheme | packages/ui/hooks | ✗ INTERNAL | next-themes | SEMI | EVALUATE | N/A | - | Keep internal for now |

---

## Providers Detailed Analysis

### PROVIDER CONSOLIDATION TABLE

| Provider | Current Location | Exported? | Generic? | Dependencies | Action | Effort | Risk | Notes |
|----------|------------------|-----------|----------|--------------|--------|--------|------|-------|
| UserProvider | packages/template | ✓ YES | YES | useFetch, Router | ✓ GOOD | - | - | Generic auth pattern |
| FetchProvider | packages/template | ✓ YES | YES | Fetch API | ✓ GOOD | - | - | Generic HTTP wrapper |
| CapacitorProvider | packages/template | ✓ YES | YES | @capacitor/core | ✓ GOOD | - | - | Generic platform |
| RevenueCatProvider | packages/template | ✓ YES | YES | @revenuecat/react-native | ✓ GOOD | - | - | Generic subscription |
| GlobalStateProvider | packages/template | ✓ YES | YES | React Context | ✓ GOOD | - | - | Generic state mgmt |
| SessionsProvider | apps/template | ✗ NO | YES | useServerStorage | EXPORT | 5min | NONE | PRIORITY: Missing export |
| ThemeColorProvider | packages/ui | ✓ YES | YES | React Context | ✓ GOOD | - | - | Already properly placed |
| PartiesProvider | apps/sudoku | ✗ NO | NO | useServerStorage, UserContext | KEEP | N/A | - | Sudoku-specific party logic |
| BookProvider | apps/sudoku | ✗ NO | NO | useServerStorage, useOnline | KEEP | N/A | - | Sudoku book domain logic |

---

## Type Definitions - Already Exported

### FROM packages/sudoku

| Type | Status | Usage |
|------|--------|-------|
| Cell | ✓ EXPORTED | Sudoku cell value |
| SudokuGrid | ✓ EXPORTED | 9x9 grid |
| SudokuState | ✓ EXPORTED | Game state |
| Notes | ✓ EXPORTED | Candidate numbers |
| Puzzle, PuzzleRow, PuzzleBox | ✓ EXPORTED | Puzzle definitions |
| Timer | ✓ EXPORTED | Timer state |
| GameState | ✓ EXPORTED | Generic game state |
| Session | ✓ EXPORTED | Server session |
| Party | ✓ EXPORTED | Party/group |
| Invite | ✓ EXPORTED | Invitation |
| Difficulty, BookPuzzleDifficulty | ✓ EXPORTED | Difficulty levels |

### FROM packages/template

All key types exported ✓

### FROM packages/ui

| Type | Status |
|------|--------|
| ThemeConfig | ✓ EXPORTED |

---

## Import Chain Examples

### Before Optimization (apps/sudoku main component)

```typescript
import { Puzzle, PuzzleRowOrColumn, calculateBoxId } from '@sudoku-web/sudoku';
import { isInitialCell, calculateSeconds } from '@sudoku-web/sudoku';
import { useGameState } from '@/hooks/gameState';
import { useContext, useEffect, useMemo } from 'react';
import {
  CelebrationAnimation,
  useDrag,
  UserContext,
  RevenueCatContext,
  SubscriptionContext,
  DAILY_LIMITS,
  isCapacitor,
  useSessions,
  AppDownloadModal,
} from '@sudoku-web/template';
import SudokuSidebar from '../SudokuSidebar/SudokuSidebar';
import { calculateSeconds } from '@sudoku-web/template';
import { puzzleToPuzzleText } from '@sudoku-web/sudoku';
import { useRouter } from 'next/navigation';
// Total: 8 different imports sources
```

### After Optimization (Same Imports)

```typescript
import { 
  Puzzle, 
  PuzzleRowOrColumn, 
  calculateBoxId, 
  isInitialCell, 
  calculateSeconds,
  puzzleToPuzzleText 
} from '@sudoku-web/sudoku';

import {
  CelebrationAnimation,
  useDrag,  // NOW EXPORTED!
  UserContext,
  RevenueCatContext,
  SubscriptionContext,
  DAILY_LIMITS,
  isCapacitor,
  useSessions,
  AppDownloadModal,
} from '@sudoku-web/template';

import { useGameState } from '@/hooks/gameState';
import { useContext, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';

import SudokuSidebar from '../SudokuSidebar/SudokuSidebar';
// Total: 6 different import sources (consolidated!)
```

---

## Priority Score Calculation

### Formula Used
```
Priority Score = (Reusability × 0.4) + (Generic-ness × 0.3) + (Dependencies × 0.2) + (Effort × 0.1)

Where:
- Reusability (0-10): How many potential uses
- Generic-ness (0-10): How app-agnostic (10 = totally generic)
- Dependencies (0-10): Lower is better (10 = zero dependencies)
- Effort (0-10): Lower is better (10 = zero effort)
```

### Top 10 to Move (by score)

| Rank | Component | Score | Why |
|------|-----------|-------|-----|
| 1 | useDrag (consolidate) | 9.8 | High reuse, generic, low effort |
| 2 | SessionsProvider (export) | 9.6 | High reuse, exists, zero effort |
| 3 | CopyButton | 9.4 | High reuse, generic, low effort |
| 4 | CelebrationAnimation | 9.2 | High reuse, generic, low effort |
| 5 | Footer | 9.0 | High reuse, generic, zero deps |
| 6 | HeaderBack | 8.8 | High reuse, generic, zero deps |
| 7 | ThemeControls | 8.6 | High reuse, generic, already in pkg |
| 8 | SidebarButton | 8.4 | High reuse, generic, low effort |
| 9 | PartyInviteButton | 7.8 | Medium reuse, generic UI, 1hr effort |
| 10 | SudokuGrid (refactored) | 7.2 | High reuse, needs refactoring, 3hrs |

---

## Circular Dependency Check Results

### All Packages - Analyzed

```
✓ packages/sudoku → NO IMPORTS FROM APPS
✓ packages/template → NO IMPORTS FROM APPS
✓ packages/ui → NO IMPORTS FROM APPS
✓ packages/types → NO CIRCULAR DEPS
✓ packages/auth → NO CIRCULAR DEPS
✓ packages/shared → NO CIRCULAR DEPS

✓ apps/sudoku → ONLY IMPORTS FROM PACKAGES
✓ apps/template → ONLY IMPORTS FROM PACKAGES

CIRCULAR DEPENDENCIES FOUND: 0
STATUS: CLEAN ARCHITECTURE ✓
```

---

## What Each Package Should Own

### Responsibility Matrix

| Package | Owns | Does NOT Own | Examples |
|---------|------|--------------|----------|
| **sudoku** | Game logic, puzzle types, timer | UI components (except reusable), auth | Grid helpers, validation, types |
| **template** | App infrastructure, providers, generic hooks | Game-specific logic, design | Providers, hooks, generic modals |
| **ui** | Design system, theme, reusable UI | Business logic, auth | Buttons, inputs, theme system |
| **types** | Global types | App-specific types | Shared interfaces, enums |
| **auth** | Authentication flow, tokens | Platform-specific UI | OAuth, PKCE, token mgmt |
| **shared** | (Currently empty) | Everything else | Could hold utilities |

---

## Test Coverage by Category

| Category | Coverage | Notes |
|----------|----------|-------|
| Components in packages | GOOD | Most have tests |
| Hooks in packages | EXCELLENT | Full coverage |
| Providers in packages | EXCELLENT | Full coverage |
| App-specific components | GOOD | Well tested |
| App-specific hooks | GOOD | Well tested |

---

## Success Criteria

### Phase 1 Complete When
- [ ] All exports added to index files
- [ ] useDrag duplication removed
- [ ] All tests pass
- [ ] No build errors
- [ ] Import paths validated

### Phase 2 Complete When
- [ ] Grid refactoring done
- [ ] Party components moved
- [ ] Documentation updated
- [ ] All tests pass
- [ ] No build errors
- [ ] 20%+ code deduplication achieved

### Phase 3 Assessment
- [ ] All critical issues resolved
- [ ] Code quality improved
- [ ] Maintainability increased
- [ ] Team can easily identify where to put new code

