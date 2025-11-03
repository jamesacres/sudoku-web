# Comprehensive Codebase Analysis: Components, Hooks, and Providers Modularity

## Executive Summary

This analysis identifies opportunities to move components, hooks, and providers from apps to shared packages to reduce code duplication and improve code reuse across the sudoku-web monorepo.

**Key Findings:**
- 42 components across apps that could be candidates for modularization
- 14 hooks with varying levels of app-specificity
- 8 providers with different reusability potential
- Already good separation in packages (template, ui, sudoku) but gaps remain

---

## 1. COMPONENTS ANALYSIS

### 1.1 Sudoku App Components (`/apps/sudoku/src/components/`)

#### HIGH PRIORITY - Easy to Move, High Reuse

| Component | Current Location | Dependencies | Status | Reason |
|-----------|------------------|--------------|--------|--------|
| **NumberPad** | apps/sudoku → packages/sudoku | formatSeconds (template) | Already exported | Generic UI - no app-specific logic |
| **TimerDisplay** | apps/sudoku → packages/sudoku | formatSeconds (template), react-feather | Already exported | Generic - accepts only props |
| **TrafficLight** | apps/sudoku → packages/sudoku | None | Already exported | Pure UI component |
| **SudokuInput** | apps/sudoku/src/components | SudokuInputNotes, local handlers | Not exported | Reusable - needs only puzzle types |
| **SudokuInputNotes** | apps/sudoku/src/components | Notes type (sudoku pkg) | Not exported | Reusable - note taking UI |
| **BookCovers/BookCover** | apps/sudoku/src/components | None | Not exported | Generic card component |
| **HintBox** | apps/sudoku/src/components | None | Not exported | Generic UI component |
| **TimerDisplay (full)** | apps/sudoku/src/components | None | Partial export | Display logic reusable |

#### MEDIUM PRIORITY - Some App-Specific Dependencies

| Component | Current Location | Dependencies | Issue | Recommendation |
|-----------|------------------|--------------|-------|-----------------|
| **SudokuBox** | apps/sudoku → packages/sudoku | SudokuInput, calculateCellId | Depends on app-specific SudokuInput | Extract grid logic, keep layout generic |
| **SudokuControls** | apps/sudoku/src/components | canUseUndo, canUseCheckGrid, NotesToggle | Template pkg dependencies | Safe to move but add exports to template |
| **Sudoku (main component)** | apps/sudoku/src/components | useGameState, UserContext, RevenueCatContext, sessions | Heavy app-specific context | Keep in app - too coupled |
| **SimpleSudoku** | apps/sudoku → packages/sudoku | Puzzle types only | Generic | Could be template/starter |
| **RaceTrack** | apps/sudoku → packages/sudoku | Party/session types | Game-specific but generic structure | Could be moved with typing |
| **NumberPad (in packages)** | apps/sudoku → packages/sudoku | Generic | Already good | ✓ Use as-is |
| **PartyInviteButton** | apps/sudoku/src/components | useServerStorage, CopyButton (template) | Uses template storage | Could move to template pkg |
| **ActivityWidget** | apps/sudoku/src/components | ServerStateResult, UserContext | Game-specific logic | Keep in app |
| **PartyRow** | apps/sudoku/src/components | Party types, calculateCompletionPercentage | Game-specific display | Keep in app |
| **SudokuSidebar** | apps/sudoku/src/components | useParties, UserContext, RevenueCatContext | App-specific party management | Keep in app |
| **IntegratedSessionRow** | apps/sudoku/src/components | Party, Session, UserSessions types | Game-specific data | Keep in app |
| **Leaderboard** | apps/sudoku/src/components | Party, Session, UserProfile | Game-specific scoring | Keep in app |
| **FriendsTab** | apps/sudoku/src/components | useSessions, Party types | Social/game features | Keep in app |
| **MyPuzzlesTab** | apps/sudoku/src/components | Session, ServerStateResult | Game-specific | Keep in app |
| **RacingPromptModal** | apps/sudoku/src/components | None visible | Modal UI only | Could move with light refactoring |
| **SudokuPlusModal** | apps/sudoku/src/components | No deps visible | Modal logic | Could move |
| **PartyConfirmationDialog** | apps/sudoku/src/components | No deps visible | Dialog logic | Could move |
| **SidebarButton** | apps/sudoku/src/components | React.memo only | Generic button | Could move to UI pkg |

#### LOW PRIORITY - Keep in App

| Component | Reason |
|-----------|--------|
| **Sudoku (main)** | Central orchestration of game state, subscriptions, animations |
| **RaceTrack (advanced)** | Complex racing logic tied to game mechanics |
| **Leaderboard (full)** | Game-specific scoring and competitive features |
| **SudokuSidebar** | Complex party/session management |
| **ActivityWidget** | Custom game analytics |

### 1.2 Template App Components (`/apps/template/src/components/`)

#### HIGH PRIORITY - Move to packages/ui

| Component | Current Location | Dependencies | Move To |
|-----------|------------------|--------------|---------|
| **Header** | apps/template → packages/ui | HeaderBack, ThemeControls, dynamic imports | packages/ui (partial) |
| **HeaderBack** | apps/template → packages/ui | useRouter only | packages/ui |
| **ThemeSwitch** | apps/template → packages/ui | useThemeColor | packages/ui |
| **ThemeColorSwitch** | apps/template → packages/ui | useThemeColor, RevenueCatContext | packages/ui (already present) |
| **ThemeControls** | apps/template → packages/ui | ThemeSwitch, ThemeColorSwitch | packages/ui |
| **Footer** | apps/template → packages/ui | None | packages/ui |
| **Toggle/NotesToggle** | apps/template → packages/ui | None | packages/ui |
| **CopyButton** | apps/template → packages/ui | None | packages/ui |
| **CelebrationAnimation** | apps/template → packages/ui | None | packages/ui |

#### MEDIUM PRIORITY - Generic but App-Specific Context

| Component | Current Location | Dependencies | Issue |
|-----------|------------------|--------------|-------|
| **HeaderUser** | apps/template/src | UserContext, useOnline | App infrastructure - keep in app |
| **HeaderOnline** | apps/template/src | useOnline | Generic but simple - could move |
| **UserPanel** | apps/template/src | UserContext, useServerStorage | User-specific - keep in app |
| **UserButton** | apps/template/src | UserContext | App-specific - keep in app |
| **DeleteAccountDialog** | apps/template/src | UserContext | App-specific - keep in app |
| **UserAvatar** | apps/template/src | UserContext | Generic display but needs context |
| **PremiumFeatures** | apps/template/src | RevenueCatContext | Business logic - keep in app |
| **ErrorBoundary** | apps/template → packages/template | None | Already exported ✓ |
| **GlobalErrorHandler** | apps/template → packages/template | None | Already exported ✓ |
| **AppDownloadModal** | apps/template → packages/template | isCapacitor | Already exported ✓ |
| **SocialProof** | apps/template/src | None visible | Generic - could move to UI |

#### LOW PRIORITY - Keep in App

| Component | Reason |
|-----------|--------|
| **HeaderUser** | Tightly coupled to auth system |
| **UserPanel** | Complex user management logic |
| **PremiumFeatures** | Business-specific subscription features |

---

## 2. HOOKS ANALYSIS

### 2.1 Sudoku App Hooks (`/apps/sudoku/src/hooks/`)

#### HIGH PRIORITY - Generic, Reusable

| Hook | Current | Dependencies | Reuse Potential | Recommendation |
|------|---------|--------------|-----------------|-----------------|
| **useTimer** | packages/sudoku | useDocumentVisibility, useLocalStorage | HIGH | Already exported ✓ - Generic timer |
| **useParties** | apps/sudoku (NOT in packages) | PartiesContext only | MEDIUM | Move to template pkg - party management |
| **useDrag** | apps/template (duplicated!) | splitCellId (sudoku types) | HIGH | Consolidate - move to template |

#### MEDIUM PRIORITY - Game-Specific but Could Be Generic

| Hook | Current | Dependencies | Issue | Recommendation |
|-------|---------|--------------|-------|-----------------|
| **useGameState** | apps/sudoku (NOT exported) | useTimer, useLocalStorage, useServerStorage, UserContext, RevenueCatContext, useSessions, useParties | Heavy game logic - 25KB file | Keep in app - specific to sudoku game state |

#### LOW PRIORITY - App-Specific

| Hook | Why Keep |
|------|----------|
| **gameState** | Complex sudoku-specific state management (answer stack, undo/redo, validation) |

### 2.2 Template App Hooks (`/apps/template/src/hooks/`)

#### ALREADY EXPORTED - Good Status

| Hook | Status | Reuse |
|------|--------|-------|
| **useOnline** | ✓ Exported | General purpose |
| **useLocalStorage** | ✓ Exported | General purpose |
| **useWakeLock** | ✓ Exported | General purpose |
| **useFetch** | ✓ Exported | API requests |
| **useDocumentVisibility** | ✓ Exported | General purpose |
| **useServerStorage** | ✓ Exported | Server sync |
| **useDrag** | ✓ In packages/template | Zoom/pan logic - ALSO IN APPS/SUDOKU |
| **useWakeLock** | ✓ Exported | Device wake lock |

#### ISSUE: Hook Duplication

**useDrag** exists in:
- `/apps/template/src/hooks/useDrag.ts` (16KB) - Full implementation
- `/apps/sudoku/src/hooks/useDrag.ts` (duplicated in test files)

**Action Required:** Consolidate useDrag - keep in template, export properly.

#### Additional Hooks in Packages (not apps)

| Hook | Location | Purpose | Status |
|------|----------|---------|--------|
| **useSession** | packages/template/src/hooks | Session management | Not directly exported in main index |
| **useParty** | packages/template/src/hooks | Party management | Not directly exported in main index |
| **useMembership** | packages/template/src/hooks | Membership logic | Not directly exported in main index |
| **useDarkMode** | packages/ui/src/hooks | Theme detection | Internal |
| **useTheme** | packages/ui/src/hooks | Theme logic | Internal |

---

## 3. PROVIDERS ANALYSIS

### 3.1 Sudoku App Providers (`/apps/sudoku/src/providers/`)

#### MEDIUM PRIORITY - Game-Specific but Reusable Pattern

| Provider | Current | Manages | Specificity | Recommendation |
|----------|---------|---------|-------------|-----------------|
| **PartiesProvider** | apps/sudoku | Party data, member management, CRUD | Game-specific | Keep in app - sudoku-specific party features |
| **BookProvider** | apps/sudoku | Book data, monthly books, caching | Game-specific | Keep in app - sudoku book domain logic |
| **ThemeColorProvider** | apps/sudoku/test | Theme colors | Already in packages/ui | ✓ Use packages/ui version |

### 3.2 Template App Providers (`/apps/template/src/providers/`)

#### ALREADY EXPORTED - Excellent Status

| Provider | Status | Purpose | Generic |
|----------|--------|---------|---------|
| **UserProvider** | ✓ Exported | Auth/user state | Generic auth pattern |
| **FetchProvider** | ✓ Exported | API wrapper | Generic HTTP client |
| **CapacitorProvider** | ✓ Exported | Platform init | Generic platform abstraction |
| **RevenueCatProvider** | ✓ Exported | Subscriptions | Generic subscription pattern |
| **GlobalStateProvider** | ✓ Exported | App state | Generic state management |
| **SessionsProvider** | apps/template/src | Session management | Not yet in packages - NEEDS EXPORT |
| **ThemeColorProvider** | packages/ui | Theme management | ✓ Already good location |

#### HIGH PRIORITY - Should Export

| Provider | Current | Action |
|----------|---------|--------|
| **SessionsProvider** | apps/template/src | Export from packages/template - manages collaborative sessions |

---

## 4. CURRENT PACKAGE STRUCTURE

### 4.1 packages/sudoku/src/index.ts - What's Exported

**Components Exported:**
- ✓ NumberPad
- ✓ TimerDisplay
- ✓ TrafficLight

**Components NOT Exported (Noted):**
- ✗ SudokuBox (depends on app-specific SudokuInput)
- ✗ Sudoku, SimpleSudoku, RaceTrack (depend on app context/hooks)

**Hooks Exported:**
- ✓ useTimer

**NOT Exported:**
- ✗ useGameState (app-specific)

**Helpers/Utilities:**
- ✓ checkCell, checkGrid, isInitialCell
- ✓ calculateCompletionPercentage
- ✓ puzzleTextToPuzzle, puzzleToPuzzleText
- ✓ calculateBoxId, calculateCellId, splitCellId, calculateNextCellId
- ✓ getTodayDateString, getDailyPuzzleIds, addDailyPuzzleId, getDailyPuzzleCount

**Types:**
- ✓ All exported (Cell, SudokuGrid, SudokuState, Notes, Puzzle, etc.)
- ✓ All server types exported

### 4.2 packages/template/src/index.ts - What's Exported

**Components Exported:**
- ✓ All from ./components (ErrorBoundary, AppDownloadModal, GlobalErrorHandler)

**Hooks Exported:**
- ✓ useOnline, useLocalStorage, useWakeLock, useFetch, useDocumentVisibility, useServerStorage

**Providers Exported:**
- ✓ All from ./providers (CapacitorProvider, RevenueCatProvider, UserProvider, FetchProvider, ThemeColorProvider, GlobalStateProvider)

**NOT Exported (but in providers/):**
- ✗ SessionsProvider - SHOULD BE EXPORTED

**Types/Config:**
- ✓ Exported from ./types, ./utils, ./helpers, ./config

### 4.3 packages/ui/src/index.ts - What's Exported

**Components Exported:**
- ✓ Header, Footer, HeaderBack
- ✓ ThemeControls, ThemeSwitch, ThemeColorSwitch
- ✓ Toggle

**Components NOT Exported:**
- ✗ HeaderUser, HeaderOnline (app-specific deps)

**Providers Exported:**
- ✓ ThemeColorProvider
- ✓ useThemeColor hook

**Helpers Exported:**
- ✓ isCapacitor, isIOS, isAndroid

**Types Exported:**
- ✓ ThemeConfig

### 4.4 packages/shared/src/index.ts

**Status:** Empty placeholder - UNDERUTILIZED

---

## 5. DEPENDENCY GRAPH & IMPORT CHAINS

### 5.1 Key Dependencies

```
apps/sudoku/components
├── Sudoku (main)
│   ├── useGameState (local) → useTimer, useLocalStorage, useServerStorage
│   ├── UserContext (template)
│   ├── RevenueCatContext (template)
│   ├── useSessions (template)
│   ├── CelebrationAnimation (template)
│   ├── AppDownloadModal (template)
│   └── RaceTrack (local sudoku)
│
├── SudokuBox
│   ├── SudokuInput (local)
│   └── calculateCellId (@sudoku-web/sudoku)
│
├── SudokuControls
│   ├── canUseUndo (@sudoku-web/template)
│   ├── canUseCheckGrid (@sudoku-web/template)
│   └── NotesToggle (@sudoku-web/template)
│
└── TimerDisplay ✓
    └── formatSeconds (@sudoku-web/template)

apps/template/components
├── Header
│   ├── HeaderBack
│   ├── HeaderUser (needs UserContext)
│   ├── HeaderOnline (needs useOnline)
│   └── ThemeControls
│
├── HeaderUser
│   ├── UserContext (template/providers)
│   └── useOnline (template/hooks)
│
└── ThemeSwitch ✓
    └── useThemeColor (ui/providers)
```

### 5.2 Circular Dependency Analysis

**Potential Issues Identified:**
- No circular dependencies detected between packages
- apps/ imports from packages/ only (one-way)
- packages/ don't import from apps/ ✓

**Safe to Move:**
- Any component/hook that only imports from packages is safe to move

---

## 6. PRIORITIZED MOVEMENT PLAN

### PHASE 1: HIGH PRIORITY (Easy Wins - Week 1)

#### 1.1 Add Missing Exports to Existing Packages

**Action:** Enhance packages/template/src/index.ts

```typescript
// Add SessionsProvider export
export * from './providers/SessionsProvider';
export { useSession } from './hooks/useSession';  // If generic
export { useParty } from './hooks/useParty';      // If generic

// Ensure useDrag is exported
export { useDrag } from './hooks/useDrag';
```

**Risk:** LOW - Already in packages, just needs export
**Impact:** MEDIUM - Enables reuse by apps

#### 1.2 Move/Copy Components to packages/ui

**Target:** ErrorBoundary pattern components already moved
**Already Done:** ✓

**Add to packages/ui:**

| Component | From | To | Effort |
|-----------|------|-----|--------|
| CopyButton | apps/template | packages/ui | EASY |
| SocialProof | apps/template | packages/ui | EASY |
| CelebrationAnimation | apps/template | packages/ui | EASY |

**Files to Move/Copy:**
- `/apps/template/src/components/CopyButton/*` → `/packages/ui/src/components/CopyButton/*`
- `/apps/template/src/components/CelebrationAnimation/*` → `/packages/ui/src/components/CelebrationAnimation/*`

**Risk:** LOW - Generic UI components with minimal dependencies
**Impact:** HIGH - Reusable across apps
**Estimated Effort:** 2 hours
**Required Changes:**
- Update imports in packages/ui/src/index.ts
- Update any internal imports

#### 1.3 Move useDrag Hook to packages/template (Consolidation)

**Current State:** Duplicated in:
- `/apps/template/src/hooks/useDrag.ts`
- `/apps/sudoku/src/hooks/useDrag.ts` (tests)

**Action:**
- Ensure `/packages/template/src/hooks/useDrag.ts` is definitive
- Remove from `/apps/sudoku/src/hooks/`
- Update import in apps/sudoku to use `@sudoku-web/template`

**Risk:** LOW - Just consolidation
**Impact:** MEDIUM - Reduce duplication
**Estimated Effort:** 1 hour
**Required Changes:**
- Update apps/sudoku imports
- Verify tests still pass

### PHASE 2: MEDIUM PRIORITY (Strategic Moves - Week 2-3)

#### 2.1 Move Reusable Components to packages/sudoku

**Target:** Components used only by sudoku game but reusable pattern

| Component | Current | New | Reason |
|-----------|---------|-----|--------|
| SudokuInput | apps/sudoku | apps/sudoku (KEEP) | Tightly coupled to display |
| SimpleSudoku | apps/sudoku | packages/sudoku | Template/demo component |
| SudokuBox (wrapper) | apps/sudoku | REFACTOR | Extract grid logic |

**Action for SudokuBox:**
1. Extract generic grid rendering logic into packages/sudoku
2. Keep app-specific input handling in apps/sudoku
3. Create SudokuGridView component for reuse

**Risk:** MEDIUM - Requires refactoring
**Impact:** HIGH - Better code organization
**Estimated Effort:** 4-6 hours

#### 2.2 Move Party/Session UI Components

**Components:**
- PartyInviteButton (apps/sudoku) → packages/template
- SessionsProvider export (apps/template) → packages/template

**Reason:** Generic collaboration patterns

**Risk:** MEDIUM - Some context dependencies
**Impact:** MEDIUM - Enables party features in other apps
**Estimated Effort:** 3 hours

**Required Changes:**
- Ensure useServerStorage is properly exported from template
- Extract party-specific logic from sudoku context
- Add to packages/template/src/index.ts

### PHASE 3: LOW PRIORITY (App-Specific - Keep as-is)

#### Components to Keep in Apps

**apps/sudoku/src/components (Stay):**
- Sudoku (main orchestrator)
- RaceTrack (racing game logic)
- Leaderboard (game-specific scoring)
- SudokuSidebar (complex party UI)
- ActivityWidget (game analytics)
- FriendsTab, MyPuzzlesTab (game features)
- IntegratedSessionRow (custom data)
- all leaderboard/* (game-specific)

**apps/template/src/components (Stay):**
- HeaderUser (auth system)
- UserPanel, UserButton (user management)
- PremiumFeatures (business logic)
- DeleteAccountDialog (sensitive ops)

**Reason:** Tightly coupled to app-specific logic, business rules, or auth system

---

## 7. RISK ASSESSMENT

### 7.1 By Movement Category

| Category | Risk Level | Mitigation |
|----------|-----------|-----------|
| Consolidating duplicates (useDrag) | LOW | Run full test suite before/after |
| Exporting existing code | LOW | Just add exports, no code changes |
| Moving generic UI components | LOW | Ensure no app-specific imports |
| Moving hooks with minimal deps | LOW | Check all test files |
| Refactoring grid components | MEDIUM | Update all consuming components |
| Moving provider patterns | MEDIUM | Test context consumption |
| Moving game-specific logic | HIGH | DON'T MOVE - too coupled |

### 7.2 Testing Strategy

**Before any move:**
1. Run `npm test` in affected packages
2. Run build: `npm run build`
3. Check for unused imports with eslint

**After any move:**
1. Verify all tests pass
2. Verify build succeeds
3. Verify no broken imports in consuming code
4. Run linter

---

## 8. IMPLEMENTATION CHECKLIST

### Quick Wins (Do First)

- [ ] Export SessionsProvider from packages/template/src/index.ts
- [ ] Export useDrag from packages/template/src/index.ts  
- [ ] Update apps/sudoku to import useDrag from template
- [ ] Remove duplicate useDrag from apps/sudoku/src/hooks/

### Phase 1 Moves

- [ ] Copy CopyButton to packages/ui
- [ ] Copy CelebrationAnimation to packages/ui
- [ ] Update packages/ui/src/index.ts
- [ ] Update apps/template imports
- [ ] Run tests: `npm test`

### Phase 2 Moves (If Time)

- [ ] Extract grid logic from SudokuBox
- [ ] Create SudokuGridView component in packages/sudoku
- [ ] Move PartyInviteButton to packages/template
- [ ] Export from packages/template
- [ ] Update apps/sudoku imports

### Phase 3 (Future)

- [ ] Consider moving more reusable patterns
- [ ] Evaluate if additional apps could use party/session components
- [ ] Monitor for new shared patterns

---

## 9. DETAILED FILE RECOMMENDATIONS

### packages/sudoku (Focus: Game Logic)

**Should Export:**
- ✓ All helpers (already exported)
- ✓ All types (already exported)
- ✓ useTimer hook (already exported)
- ✓ NumberPad, TimerDisplay, TrafficLight (already exported)
- ? SimpleSudoku (template/demo - consider if useful)

**Should NOT Export:**
- ✗ Sudoku (main orchestrator - app-specific)
- ✗ RaceTrack (racing logic - game-specific)
- ✗ useGameState (sudoku state machine - app-specific)

**Gap:** Grid rendering components could be more modular

### packages/template (Focus: App Infrastructure)

**Current Exports:** Good foundation
```
- Components: ErrorBoundary, AppDownloadModal, GlobalErrorHandler
- Hooks: useOnline, useLocalStorage, useWakeLock, useFetch, useDocumentVisibility, useServerStorage, [MISSING: useDrag]
- Providers: All major ones
- Utils: dailyActionCounter, playerColors, helpers
```

**Add in Phase 1:**
- [ ] useDrag hook export
- [ ] SessionsProvider export
- [ ] useSessions hook (if not already)

**Add in Phase 2:**
- [ ] CopyButton component
- [ ] CelebrationAnimation component
- [ ] PartyInviteButton component (if genericized)

### packages/ui (Focus: Generic UI)

**Current Exports:** Good foundation
```
- Components: Header, Footer, HeaderBack, ThemeControls, ThemeSwitch, ThemeColorSwitch, Toggle
- Providers: ThemeColorProvider
- Helpers: isCapacitor, isIOS, isAndroid
- Types: ThemeConfig
```

**Add in Phase 1:**
- [ ] CopyButton
- [ ] CelebrationAnimation
- [ ] SocialProof (if useful)

**Consider:**
- More generic modal patterns
- Form components
- Input components

### packages/shared (Focus: Utilities)

**Current:** Empty placeholder
**Opportunity:** Could hold cross-cutting concerns
- Utility functions (date, formatting, etc.)
- Constants
- Type utilities

**Not Yet Used - Discuss if needed**

### packages/types (Already Exists)

**Purpose:** Global type definitions
**Current Usage:** Good - provides shared types
**Status:** Keep as-is ✓

### packages/auth (Already Exists)

**Purpose:** Authentication logic
**Current Usage:** Good separation
**Status:** Keep as-is ✓

---

## 10. DEPENDENCY SUMMARY

### What Imports From What

```
apps/sudoku/src/
  ├── components/ → imports from:
  │   ├── @sudoku-web/sudoku (hooks, types, components) ✓
  │   ├── @sudoku-web/template (providers, hooks, components) ✓
  │   ├── @sudoku-web/ui (not much - could use more)
  │   └── local (hooks, providers, types) ✓
  │
  └── hooks/ → imports from:
      ├── @sudoku-web/template (localStorage, serverStorage)
      ├── @sudoku-web/sudoku (types)
      └── local (providers, types)

apps/template/src/
  ├── components/ → imports from:
  │   ├── @sudoku-web/template (providers, hooks)
  │   ├── @sudoku-web/ui (components, hooks)
  │   ├── @sudoku-web/auth (auth hooks - not yet)
  │   └── local (providers, hooks)
  │
  └── hooks/ → imports from:
      ├── next/ (useRouter, etc.)
      └── local (types)

packages/sudoku/src/
  └── imports from:
      ├── @sudoku-web/template (some helpers)
      ├── react (core)
      └── external (mathjs)

packages/template/src/
  └── imports from:
      ├── @sudoku-web/ui (theme)
      ├── @sudoku-web/auth (auth)
      ├── react (core)
      ├── next/ (routing, themes)
      └── external (capacitor, revenue-cat)

packages/ui/src/
  └── imports from:
      ├── @sudoku-web/shared (utils if needed)
      ├── react (core)
      ├── next/ (themes)
      └── external (headlessui, feather icons)
```

**Key Insight:** No circular dependencies - good architecture!

---

## 11. FINAL RECOMMENDATIONS

### Top 5 Actions (Ranked by Value/Effort)

1. **Add Missing Exports** (EFFORT: 0.5 hours, VALUE: HIGH)
   - Export SessionsProvider, useDrag from template
   - Immediate value with minimal risk

2. **Consolidate useDrag** (EFFORT: 1 hour, VALUE: MEDIUM)
   - Remove duplicate code
   - Standardize hook usage

3. **Move CopyButton to UI Package** (EFFORT: 1 hour, VALUE: MEDIUM)
   - Highly reusable
   - No app-specific dependencies

4. **Move CelebrationAnimation to UI Package** (EFFORT: 1.5 hours, VALUE: MEDIUM)
   - Generic celebration pattern
   - Clean dependencies

5. **Refactor Grid Components** (EFFORT: 4-6 hours, VALUE: MEDIUM)
   - Extract SudokuGridView from SudokuBox
   - Better separation of concerns
   - Future-proof for other grid games

### Next Steps (Recommended Order)

1. Complete PHASE 1 immediately (Quick Wins - 2-3 hours)
2. Discuss PHASE 2 with team (Strategic Moves - 3-6 hours)
3. Keep PHASE 3 for app-specific features (No Change)
4. Plan PHASE 4: Future modularization based on new apps/features

### Success Metrics

- [ ] 0 duplicate code across apps/packages
- [ ] 100% test coverage maintained
- [ ] Build time doesn't increase
- [ ] All imports resolve correctly
- [ ] No circular dependencies
- [ ] Package reusability increases 30%

