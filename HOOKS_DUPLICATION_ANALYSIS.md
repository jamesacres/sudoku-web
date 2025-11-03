# Hooks Duplication Analysis Report

Date: 2025-11-03
Branch: 003-modular-turborepo-architecture

## Executive Summary

This report analyzes the duplicate hooks situation between `apps/template` and `packages/template` in the sudoku-web monorepo. Analysis reveals **7 hooks with 6 completely identical duplicates** and **1 partial duplicate with app-specific extensions**. 

**Key Finding:** 100% of hooks in apps/template exist in packages/template, suggesting complete migration is feasible.

---

## Hook Inventory Comparison

### apps/template/src/hooks/ (8 hooks)
1. documentVisibility.ts
2. fetch.ts
3. index.ts
4. localStorage.ts
5. online.ts
6. serverStorage.ts
7. useDrag.ts
8. useWakeLock.ts

### packages/template/src/hooks/ (11 hooks)
1. documentVisibility.ts ✓ (in apps)
2. fetch.ts ✓ (in apps)
3. index.ts ✓ (in apps)
4. localStorage.ts ✓ (in apps)
5. online.ts ✓ (in apps)
6. serverStorage.ts ✓ (in apps - with differences)
7. useDrag.ts ✓ (in apps)
8. useWakeLock.ts ✓ (in apps)
9. useMembership.ts (STUB - packages only)
10. useParty.ts (STUB - packages only)
11. useSession.ts (STUB - packages only)

---

## Detailed Hook Analysis

### 1. useDocumentVisibility
**Duplication Status:** IDENTICAL DUPLICATE
**File Sizes:** apps=607B, packages=607B

**Purpose:** Tracks document visibility state using visibilitychange event

**Code Sample:**
```typescript
function useDocumentVisibility() {
  const [isDocumentVisible, setIsDocumentVisible] = useState(
    typeof window !== 'undefined' ? !window.document.hidden : false
  );
  // ... visibility change listener ...
  return isDocumentVisible;
}
```

**Current Usage:**
- apps/template: Not used anywhere outside hooks directory
- packages/template: Not used anywhere

**Analysis:**
- 100% identical code
- Zero active usage in apps
- Safe to consolidate

**Recommendation:** CONSOLIDATE TO PACKAGES
- Action: Remove from apps/template
- Implementation: Add re-export in apps/template/src/hooks/index.ts

---

### 2. useWakeLock
**Duplication Status:** IDENTICAL DUPLICATE
**File Sizes:** apps=2634B, packages=2634B

**Purpose:** Manages Wake Lock API to prevent screen from sleeping

**Functionality:**
- requestWakeLock(): Request wake lock
- releaseWakeLock(): Release wake lock
- isActive: Current lock state
- Auto-restore on document visibility change

**Code Characteristics:**
- Handles browser API support detection
- Includes error handling and logging
- Proper cleanup on unmount

**Current Usage:**
- apps/template: Not used anywhere outside hooks
- packages/template: Not used anywhere

**Analysis:**
- 100% identical code
- Zero active usage in apps
- Safe to consolidate

**Recommendation:** CONSOLIDATE TO PACKAGES
- Action: Remove from apps/template
- Implementation: Add re-export in apps/template/src/hooks/index.ts

---

### 3. useLocalStorage
**Duplication Status:** IDENTICAL DUPLICATE
**File Sizes:** apps=5728B, packages=5728B

**Purpose:** Manages local storage with automatic expiration and cleanup

**Functionality:**
- getStateKey(): Generate namespaced storage key
- listValues(): List all stored values of a type (with expiration filtering)
- getValue(): Retrieve single value
- saveValue(): Save with automatic cleanup when quota exceeded
- Handles quota exceeded errors gracefully
- Removes items older than 32 days automatically
- Falls back to removing oldest 50% if cleanup insufficient

**Code Characteristics:**
- Complex quota management logic
- Time-based expiration (32 days)
- Supports namespacing by StateType
- Robust error recovery

**Current Usage:**
- apps/template: ACTIVELY USED
  - SessionsProvider/SessionsProvider.tsx (state management)
- packages/template: Not directly used

**Analysis:**
- 100% identical code
- Active usage requires careful consolidation
- Dependencies: StateType from types/StateType

**Recommendation:** CONSOLIDATE TO PACKAGES (Already there)
- Action: Update apps imports to use packages version
- Files to modify: SessionsProvider/SessionsProvider.tsx
- Change from: `import { useLocalStorage } from '../../hooks/localStorage'`
- Change to: `import { useLocalStorage } from '@sudoku-web/template'`
- Risk: LOW (implementations identical)

---

### 4. useOnline
**Duplication Status:** IDENTICAL DUPLICATE
**File Sizes:** apps=1124B, packages=1124B

**Purpose:** Tracks online/offline status with manual override capability

**Functionality:**
- Listens to online/offline window events
- Provides forceOffline() to manually override
- Returns combined state: navigator.onLine && !forceOffline
- Integrates with GlobalStateContext

**Code Sample:**
```typescript
function useOnline() {
  const [globalState, setGlobalState] = useContext(GlobalStateContext)!;
  const [isOnline, setIsOnline] = useState(window.navigator.onLine);
  // ... event listeners ...
  return { forceOffline, isOnline: isOnlineResult };
}
```

**Current Usage:**
- apps/template: ACTIVELY USED in:
  - components/HeaderOnline/HeaderOnline.tsx (line 3)
  - components/HeaderUser/HeaderUser.tsx (line 3)
- packages/template: ACTIVELY USED in:
  - hooks/serverStorage.ts (line 7)

**Analysis:**
- 100% identical code
- Active usage in BOTH apps and packages
- Core cross-module hook
- Dependencies: GlobalStateContext provider

**Recommendation:** CONSOLIDATE TO PACKAGES (Already there)
- Action: Update all apps imports to use packages version
- Files to modify:
  - components/HeaderOnline/HeaderOnline.tsx
  - components/HeaderUser/HeaderUser.tsx
- Change from: `import { useOnline } from '../../hooks/online'`
- Change to: `import { useOnline } from '@sudoku-web/template'`
- Risk: LOW (implementations identical)

---

### 5. useFetch
**Duplication Status:** IDENTICAL DUPLICATE
**File Sizes:** apps=8054B, packages=8054B

**Purpose:** Manages JWT token lifecycle, refresh, and API request authentication

**Functionality:**
- JWT token decoding (inline implementation)
- Token refresh logic (15-min buffer)
- Automatic auth header injection for API calls
- Token refresh on 401 responses
- Handles token refresh in progress (prevents race conditions)
- User validation with expiry checking
- State persistence to storage (electron/capacitor aware)

**Configuration:**
- issuer: https://auth.bubblyclouds.com
- clientId: 'bubbly-sudoku-native' (electron/capacitor) or 'bubbly-sudoku' (web)
- API URLs: https://api.bubblyclouds.com
- Public endpoints: /invites/[id]

**Code Characteristics:**
- Global state flag for refresh prevention
- Complex expiry calculation logic
- Platform-aware (electron/capacitor)
- Extensive console logging

**Current Usage:**
- apps/template: ACTIVELY USED in:
  - providers/UserProvider/UserProvider.tsx
- packages/template: ACTIVELY USED in:
  - hooks/serverStorage.ts

**Analysis:**
- 100% identical code
- Active usage in BOTH apps and packages
- Core authentication hook
- Dependencies: FetchContext, FetchProvider

**Recommendation:** CONSOLIDATE TO PACKAGES (Already there)
- Action: Update apps imports to use packages version
- Files to modify: providers/UserProvider/UserProvider.tsx
- Change from: `import { useFetch } from '../../hooks/fetch'`
- Change to: `import { useFetch } from '@sudoku-web/template'`
- Risk: LOW (implementations identical)

---

### 6. useServerStorage
**Duplication Status:** PARTIAL DUPLICATE (apps has additional functionality)
**File Sizes:** apps=16839B, packages=14929B
**Difference:** 60 lines (Sudoku-specific methods)

**Purpose:** Server-side state management via REST API with party/session/member concepts

**Base Functionality (Both versions):**
- listValues(): Fetch sessions
- getValue(): Fetch single session
- saveValue(): Persist session
- listParties(): Fetch parties
- createParty(): Create new party
- updateParty(): Update party settings
- createInvite(): Generate shareable invites
- getPublicInvite(): Fetch public invite details
- createMember(): Add user to party
- removeMember(): Remove user from party
- leaveParty(): User leaves party
- deleteParty(): Owner deletes party
- deleteAccount(): Delete user account
- isLoggedIn(): Validate session
- setIdAndType(): Configure state key

**Apps-Specific Extensions (NOT in packages):**
```typescript
getSudokuOfTheDay(difficulty: Difficulty): Promise<SudokuOfTheDay | undefined>
getSudokuBookOfTheMonth(): Promise<SudokuBookOfTheMonth | undefined>
```

**Import Differences:**

Apps version additional imports:
```typescript
import {
  SudokuOfTheDay,
  SudokuOfTheDayResponse,
  Difficulty,
  SudokuBookOfTheMonth,
  SudokuBookOfTheMonthResponse,
} from '@sudoku-web/sudoku';
```

**Current Usage:**
- apps/template: ACTIVELY USED in:
  - providers/SessionsProvider/SessionsProvider.tsx
  - (TODO comment indicates incomplete migration)
- packages/template: Provides base functionality

**Analysis:**
- Base implementations are identical (546 lines overlap)
- Apps version extends with Sudoku-specific features (60 lines)
- Sudoku features are app-specific, not general shared functionality
- Risk of merge conflicts if both evolve

**Recommendation:** CONSOLIDATE WITH SEPARATION OF CONCERNS
- Option A (Recommended):
  1. Keep base useServerStorage in packages
  2. Create useServerStorageWithSudoku() wrapper in apps
  3. Wrapper imports useServerStorage and adds sudoku methods
  4. Update imports in apps to use wrapper
  
- Option B (Alternative):
  1. Keep both versions as-is
  2. Clearly document in CLAUDE.md
  3. Plan future consolidation
  4. Add comments why they diverge

**Recommended Approach:** Option A
```typescript
// packages/template/src/hooks/serverStorage.ts
// Base implementation WITHOUT sudoku methods

// apps/template/src/hooks/serverStorage.ts
import { useServerStorage as useBaseServerStorage } from '@sudoku-web/template';

export function useServerStorage(config) {
  const base = useBaseServerStorage(config);
  
  // Add sudoku-specific methods
  const getSudokuOfTheDay = async (difficulty) => { ... }
  const getSudokuBookOfTheMonth = async () => { ... }
  
  return {
    ...base,
    getSudokuOfTheDay,
    getSudokuBookOfTheMonth,
  };
}
```

**Risk Level:** MEDIUM
- Requires wrapper implementation
- Must maintain compatibility with SessionsProvider expectations
- Needs testing to ensure functionality preserved

---

### 7. useDrag
**Duplication Status:** IDENTICAL DUPLICATE
**File Sizes:** apps=5249B, packages=5249B

**Purpose:** Manages pointer drag events for zoomed puzzle panning

**Functionality:**
- isDragging: Current drag state
- dragOffset: X/Y offset from dragging
- dragStarted: Whether actual drag has started (>5px threshold)
- zoomOrigin: CSS transform-origin for smooth zoom
- handleDragStart: Initiate drag
- Dynamic boundary calculation for zoom mode panning
- Smooth sensitivity adjustment (0.5x movement)

**Code Characteristics:**
- Pointer event handling (modern API)
- Boundary clamping logic
- Cell-based positioning (uses splitCellId)
- Prevents unwanted clicks during drag

**Current Usage:**
- apps/template: Not used anywhere outside hooks
- packages/template: Not used anywhere

**Analysis:**
- 100% identical code
- Zero active usage in apps
- Safe to consolidate

**Recommendation:** CONSOLIDATE TO PACKAGES
- Action: Remove from apps/template
- Implementation: Add re-export in apps/template/src/hooks/index.ts

---

### 8. Placeholder Hooks (packages/template only)

#### useMembership.ts
**Status:** STUB
**Content:**
```typescript
// useMembership hook - will be implemented in User Story 1
export {};
```
**Location:** packages/template only
**Action:** LEAVE AS-IS (planned future implementation)

#### useParty.ts
**Status:** STUB
**Content:**
```typescript
// useParty hook - will be implemented in User Story 1
export {};
```
**Location:** packages/template only
**Action:** LEAVE AS-IS (planned future implementation)

#### useSession.ts
**Status:** STUB
**Content:**
```typescript
// useSession hook - will be implemented in User Story 1
export {};
```
**Location:** packages/template only
**Action:** LEAVE AS-IS (planned future implementation)

---

## Consolidation Strategy

### Summary Table

| Hook | Status | Duplication | Usage | Risk | Consolidation |
|------|--------|-------------|-------|------|---|
| useDocumentVisibility | Identical | 100% | None | LOW | Remove from apps, re-export |
| useWakeLock | Identical | 100% | None | LOW | Remove from apps, re-export |
| useLocalStorage | Identical | 100% | SessionsProvider | LOW | Keep in packages, update imports |
| useOnline | Identical | 100% | Multiple | LOW | Keep in packages, update imports |
| useFetch | Identical | 100% | Multiple | LOW | Keep in packages, update imports |
| useServerStorage | Partial | 90% | SessionsProvider | MEDIUM | Consolidate with wrapper pattern |
| useDrag | Identical | 100% | None | LOW | Remove from apps, re-export |
| useMembership | Stub | N/A | None | N/A | Keep in packages |
| useParty | Stub | N/A | None | N/A | Keep in packages |
| useSession | Stub | N/A | None | N/A | Keep in packages |

---

## Implementation Phases

### Phase 1: Quick Wins (Low Risk - 2 hours)
**Objective:** Remove unused duplicate hooks from apps

**Actions:**
1. Delete these files from apps/template/src/hooks/:
   - documentVisibility.ts
   - useWakeLock.ts
   - useDrag.ts

2. Update apps/template/src/hooks/index.ts:
```typescript
// Hook exports
export { useOnline } from './online';
export { useLocalStorage, type StateResult } from './localStorage';
export { useWakeLock } from '@sudoku-web/template';
export { useDrag } from '@sudoku-web/template';
export { useFetch } from './fetch';
export { useDocumentVisibility } from '@sudoku-web/template';
export { useServerStorage } from './serverStorage';
```

3. No import changes needed (re-exports maintain API)
4. Run tests to verify no breakage

**Files Affected:** 4
**Files Modified:** 1
**Risk Level:** VERY LOW

---

### Phase 2: Import Migration (Medium Risk - 4 hours)
**Objective:** Move actively-used hooks to packages imports

**Actions:**

1. Update apps/template/src/providers/SessionsProvider/SessionsProvider.tsx:
```typescript
// Change from:
import { useLocalStorage } from '../../hooks/localStorage';
// Change to:
import { useLocalStorage } from '@sudoku-web/template';
```

2. Update apps/template/src/providers/UserProvider/UserProvider.tsx:
```typescript
// Change from:
import { useFetch } from '../../hooks/fetch';
// Change to:
import { useFetch } from '@sudoku-web/template';
```

3. Update apps/template/src/components/HeaderOnline/HeaderOnline.tsx:
```typescript
// Change from:
import { useOnline } from '../../hooks/online';
// Change to:
import { useOnline } from '@sudoku-web/template';
```

4. Update apps/template/src/components/HeaderUser/HeaderUser.tsx:
```typescript
// Change from:
import { useOnline } from '../../hooks/online';
// Change to:
import { useOnline } from '@sudoku-web/template';
```

5. Delete these files from apps/template/src/hooks/:
   - online.ts
   - localStorage.ts
   - fetch.ts

6. Update apps/template/src/hooks/index.ts to remove local exports:
```typescript
// Hook exports - re-exports from @sudoku-web/template
export { useOnline } from '@sudoku-web/template';
export { useLocalStorage, type StateResult } from '@sudoku-web/template';
export { useFetch } from '@sudoku-web/template';
export { useWakeLock } from '@sudoku-web/template';
export { useDrag } from '@sudoku-web/template';
export { useDocumentVisibility } from '@sudoku-web/template';
export { useServerStorage } from './serverStorage';
```

7. Run full test suite

**Files Affected:** 5
**Files Modified:** 5
**Files Deleted:** 3
**Risk Level:** LOW-MEDIUM
**Testing Required:** YES - verify all imports work

---

### Phase 3: useServerStorage Consolidation (High Risk - 6 hours)
**Objective:** Consolidate base server storage, keep sudoku extensions in apps

**Option A: Wrapper Pattern (Recommended)**

1. Remove sudoku methods from packages/template/src/hooks/serverStorage.ts:
   - Remove imports from @sudoku-web/sudoku
   - Remove getSudokuOfTheDay()
   - Remove getSudokuBookOfTheMonth()
   - Remove from return object

2. Create apps/template/src/hooks/useServerStorageWithSudoku.ts:
```typescript
import { useServerStorage as useBaseServerStorage } from '@sudoku-web/template';
import { useCallback } from 'react';
import { 
  SudokuOfTheDay,
  SudokuOfTheDayResponse,
  Difficulty,
  SudokuBookOfTheMonth,
  SudokuBookOfTheMonthResponse,
} from '@sudoku-web/sudoku';

export function useServerStorage(config) {
  const base = useBaseServerStorage(config);
  const apiUrl = 'https://api.bubblyclouds.com';
  
  const getSudokuOfTheDay = useCallback(
    async (difficulty: Difficulty): Promise<SudokuOfTheDay | undefined> => {
      // Implementation...
    },
    [base.fetch, base.isLoggedIn, base.isOnline]
  );
  
  const getSudokuBookOfTheMonth = useCallback(
    async (): Promise<SudokuBookOfTheMonth | undefined> => {
      // Implementation...
    },
    [base.fetch, base.isLoggedIn, base.isOnline]
  );
  
  return {
    ...base,
    getSudokuOfTheDay,
    getSudokuBookOfTheMonth,
  };
}
```

3. Update apps/template/src/hooks/index.ts:
```typescript
export { useServerStorage } from './useServerStorageWithSudoku';
```

4. Update apps/template/src/hooks/serverStorage.ts to:
```typescript
export { useServerStorage } from '@sudoku-web/template';
```

5. Run full test suite

**Files Affected:** 3
**Files Modified:** 3
**Files Created:** 1
**Risk Level:** MEDIUM
**Testing Required:** YES - verify sudoku methods still work

---

## Expected Outcomes

### After Phase 1:
- apps/template/src/hooks/: 5 files (down from 8)
- Cleaner code, no unused duplicates
- No functional changes

### After Phase 2:
- apps/template/src/hooks/: 2 files (down from 5)
- Centralized hook maintenance in packages
- All core hooks imported from @sudoku-web/template

### After Phase 3:
- apps/template/src/hooks/: 2 files
  - index.ts (re-exports)
  - useServerStorageWithSudoku.ts (sudoku-specific wrapper)
- packages/template/src/hooks/: 11 files
- Clear separation: shared in packages, app-specific in apps

---

## Testing Checklist

### Phase 1 Testing:
- [ ] Build completes without errors
- [ ] No TypeScript errors
- [ ] Hook imports still resolve correctly
- [ ] Existing tests pass

### Phase 2 Testing:
- [ ] SessionsProvider tests pass
- [ ] UserProvider tests pass
- [ ] HeaderOnline component tests pass
- [ ] HeaderUser component tests pass
- [ ] Integration tests pass
- [ ] Type checking passes

### Phase 3 Testing:
- [ ] useServerStorage still provides all methods
- [ ] getSudokuOfTheDay() works correctly
- [ ] getSudokuBookOfTheMonth() works correctly
- [ ] SessionsProvider tests still pass
- [ ] API calls work correctly

---

## Dependencies & Imports Analysis

### Current Import Locations:
- GlobalStateContext: providers/GlobalStateProvider
- FetchContext: providers/FetchProvider
- UserContext: providers/UserProvider
- StateType: types/StateType
- UserProfile: types/userProfile
- Server types: types/serverTypes
- @sudoku-web/sudoku: external package

### Cross-Module Dependencies:
- useOnline depends on GlobalStateContext
- useFetch depends on FetchContext
- useServerStorage depends on useFetch, useOnline, UserContext
- useLocalStorage depends on StateType

**Risk Assessment:** Dependencies are well-isolated, consolidation should not break imports.

---

## File Structure After Full Consolidation

### apps/template/src/hooks/ (Final State)
```
index.ts
├── Re-exports from @sudoku-web/template:
│   ├── useOnline
│   ├── useLocalStorage
│   ├── useFetch
│   ├── useWakeLock
│   ├── useDrag
│   └── useDocumentVisibility
└── Re-exports from local:
    └── useServerStorage (from useServerStorageWithSudoku)

useServerStorageWithSudoku.ts
└── Extended version with:
    ├── Base functionality (from @sudoku-web/template)
    └── Sudoku-specific methods:
        ├── getSudokuOfTheDay
        └── getSudokuBookOfTheMonth
```

### packages/template/src/hooks/ (Final State)
```
index.ts
├── useOnline
├── useLocalStorage
├── useFetch
├── useWakeLock
├── useDrag
├── useDocumentVisibility
├── useServerStorage (base implementation)
├── useMembership (stub)
├── useParty (stub)
└── useSession (stub)
```

---

## Recommendations Summary

1. **Execute Phase 1 immediately** (2 hours)
   - Very low risk, immediate code quality improvement
   - Removes unused duplicates

2. **Execute Phase 2 next sprint** (4 hours)
   - Low-medium risk with good test coverage
   - Centralizes hook maintenance

3. **Plan Phase 3 for future** (6 hours)
   - Medium risk, requires refactoring
   - Design decision needed on sudoku methods

4. **Update CLAUDE.md** after consolidation
   - Document new import paths
   - Update module structure documentation

5. **Add import linting** (future)
   - Prevent apps-to-apps imports (should use @sudoku-web/template)
   - Prevent circular dependencies

---

## Questions for Architecture Review

1. Should sudoku-specific methods in useServerStorage be in packages or apps?
2. Should apps ever import directly from packages/template/src, or always via @sudoku-web/template?
3. Should useServerStorage be split into base + sudoku hooks, or stay combined?
4. What's the intended public API for @sudoku-web/template package?

---

## Document History
- Created: 2025-11-03
- Branch: 003-modular-turborepo-architecture
- Status: For Review

