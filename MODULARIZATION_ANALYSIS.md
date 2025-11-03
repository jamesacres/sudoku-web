# Sudoku-Web Codebase Modularization Analysis

## Executive Summary

This comprehensive analysis identifies **ALL** components, hooks, providers, utilities, and helpers that can be moved from apps (apps/sudoku and apps/template) into packages. The codebase contains significant duplication and opportunity for better modularization.

---

## HIGH PRIORITY ITEMS
### Move First - Generic, No App Dependencies

These items are completely reusable, have minimal or no app-specific logic, and dependencies are already in packages.

### UTILITIES

#### 1. **dailyActionCounter** (Template-based, can be generalized)
- **Current Location:** `/apps/template/src/utils/dailyActionCounter.ts`
- **Type:** Utility - Daily action tracking
- **Reusability:** GENERIC (used by both apps, fully reusable)
- **Dependencies:** 
  - `../config/dailyLimits` (also generic)
  - localStorage (built-in)
- **Target Package:** `packages/shared`
- **Reasoning:** Generic daily counter utility, not app-specific
- **Status:** Should be moved, applies to both sudoku and template apps

#### 2. **dailyPuzzleCounter** (Sudoku-specific variant)
- **Current Location:** `/apps/sudoku/src/utils/dailyPuzzleCounter.ts`
- **Type:** Utility - Daily puzzle tracking
- **Reusability:** GENERIC (self-contained, no dependencies)
- **Dependencies:** 
  - localStorage (built-in)
- **Target Package:** `packages/shared`
- **Reasoning:** Generic date-based puzzle tracking, reusable across any puzzle app
- **Status:** Should be moved

#### 3. **playerColors**
- **Current Location:** `/apps/template/src/utils/playerColors.ts`
- **Type:** Utility - Player color assignment
- **Reusability:** GENERIC (fully self-contained, uses pure functions)
- **Dependencies:** None (pure utility)
- **Target Package:** `packages/shared`
- **Reasoning:** Generic color assignment algorithm, no app-specific logic
- **Status:** Should be moved immediately

#### 4. **calculateSeconds**
- **Current Location:** `/apps/template/src/helpers/calculateSeconds.ts`
- **Type:** Helper - Time calculation
- **Reusability:** GENERIC (pure function)
- **Dependencies:** None (pure utility)
- **Target Package:** `packages/shared`
- **Reasoning:** Pure time conversion function, no dependencies
- **Status:** Should be moved

#### 5. **formatSeconds**
- **Current Location:** `/apps/template/src/helpers/formatSeconds.ts`
- **Type:** Helper - Time formatting
- **Reusability:** GENERIC (pure function)
- **Dependencies:** None (pure utility)
- **Target Package:** `packages/shared`
- **Reasoning:** Pure formatting function, no dependencies
- **Status:** Should be moved

#### 6. **sha256**
- **Current Location:** `/apps/sudoku/src/helpers/sha256.ts`
- **Type:** Helper - Cryptographic hash
- **Reusability:** GENERIC (pure function)
- **Dependencies:** None (pure utility)
- **Target Package:** `packages/shared`
- **Reasoning:** Generic cryptographic utility, no app-specific logic
- **Status:** Should be moved

#### 7. **pkce**
- **Current Location:** `/apps/template/src/helpers/pkce.ts` & `/apps/sudoku/src/helpers/pkce.ts` (DUPLICATE!)
- **Type:** Helper - PKCE authentication
- **Reusability:** GENERIC (pure functions)
- **Dependencies:** None (pure utility)
- **Target Package:** `packages/auth` or `packages/shared`
- **Reasoning:** Generic PKCE helper, duplicated across apps
- **Status:** Should be deduplicated and moved to packages/auth

#### 8. **capacitor** helper
- **Current Location:** `/apps/template/src/helpers/capacitor.ts` & `/apps/sudoku/src/helpers/capacitor.ts` (DUPLICATE!)
- **Type:** Helper - Platform detection
- **Reusability:** GENERIC (pure functions)
- **Dependencies:** `@capacitor/core` (platform detection)
- **Target Package:** `packages/shared`
- **Reasoning:** Generic platform detection, duplicated across apps
- **Status:** Should be deduplicated and moved

#### 9. **electron** helper
- **Current Location:** `/apps/template/src/helpers/electron.ts` & `/apps/sudoku/src/helpers/electron.ts` (DUPLICATE!)
- **Type:** Helper - Platform detection
- **Reusability:** GENERIC (pure functions)
- **Dependencies:** None (pure utility)
- **Target Package:** `packages/shared`
- **Reasoning:** Generic platform detection, duplicated across apps
- **Status:** Should be deduplicated and moved

---

## MEDIUM PRIORITY ITEMS
### Move Second - Mostly Generic, Some Dependencies, Minimal Cross-App Logic

These items are mostly reusable but have some cross-cutting concerns or need slight refactoring.

### COMPONENTS

#### 1. **TimerDisplay**
- **Current Location:** `/apps/sudoku/src/components/TimerDisplay/TimerDisplay.tsx`
- **Type:** Component - Timer visualization
- **Reusability:** GENERIC (pure UI component)
- **Dependencies:**
  - React (core)
  - `calculateSeconds` (from template helpers - will be in packages/shared)
- **Target Package:** `packages/ui`
- **Reasoning:** Pure UI component for timer display, no app-specific logic
- **Status:** Can move after `calculateSeconds` is extracted

#### 2. **TrafficLight**
- **Current Location:** `/apps/sudoku/src/components/TrafficLight/TrafficLight.tsx`
- **Type:** Component - Status indicator
- **Reusability:** GENERIC (pure UI component)
- **Dependencies:**
  - React (core)
- **Target Package:** `packages/ui`
- **Reasoning:** Pure status indicator UI, highly reusable
- **Status:** Can move immediately

#### 3. **SocialProof**
- **Current Location:** `/apps/template/src/components/SocialProof/SocialProof.tsx`
- **Type:** Component - Marketing/UX
- **Reusability:** GENERIC (pure UI component)
- **Dependencies:**
  - React (core)
  - Hardcoded content (can be parameterized)
- **Target Package:** `packages/ui`
- **Reasoning:** Pure UI component for social proof display
- **Status:** Can move with content parameterization

#### 4. **ThemeColorProvider** 
- **Current Location:** `/apps/template/src/providers/ThemeColorProvider.tsx`
- **Type:** Provider - Theme color management
- **Reusability:** GENERIC (pure React context)
- **Dependencies:**
  - React (core)
  - `next-themes` (platform)
  - localStorage (built-in)
- **Target Package:** `packages/template` (already shared)
- **Reasoning:** Already exported and used by both apps, can stay
- **Status:** Already properly modularized (shared dependency)

#### 5. **Toggle/NotesToggle**
- **Current Location:** `/apps/template/src/components/Toggle/NotesToggle.tsx`
- **Type:** Component - UI Toggle
- **Reusability:** GENERIC (pure UI component)
- **Dependencies:**
  - React (core)
- **Target Package:** `packages/ui`
- **Reasoning:** Generic toggle UI component
- **Status:** Can move immediately

#### 6. **AppDownloadModal**
- **Current Location:** `/apps/template/src/components/AppDownloadModal/AppDownloadModal.tsx`
- **Type:** Component - Modal
- **Reusability:** GENERIC (pure UI component)
- **Dependencies:**
  - React (core)
  - `isCapacitor` helper (will be in packages/shared)
- **Target Package:** `packages/ui` or `packages/template`
- **Reasoning:** Reusable modal component, generic UI
- **Status:** Can move after helper extraction

#### 7. **Footer**
- **Current Location:** `/apps/template/src/components/Footer/Footer.tsx`
- **Type:** Component - Layout
- **Reusability:** GENERIC (pure UI component)
- **Dependencies:**
  - React (core)
- **Target Package:** `packages/ui`
- **Reasoning:** Pure UI component for footer
- **Status:** Can move immediately

#### 8. **ErrorBoundary**
- **Current Location:** `/apps/template/src/components/ErrorBoundary/ErrorBoundary.tsx`
- **Type:** Component - Error handling
- **Reusability:** GENERIC (pure React component)
- **Dependencies:**
  - React (core)
- **Target Package:** `packages/ui`
- **Reasoning:** Generic error boundary component
- **Status:** Can move immediately

#### 9. **GlobalErrorHandler**
- **Current Location:** `/apps/template/src/components/GlobalErrorHandler/GlobalErrorHandler.tsx`
- **Type:** Component - Error UI
- **Reusability:** GENERIC (pure UI component)
- **Dependencies:**
  - React (core)
- **Target Package:** `packages/ui`
- **Reasoning:** Generic error display component
- **Status:** Can move immediately

### HOOKS

#### 1. **useWakeLock**
- **Current Location:** `/apps/template/src/hooks/useWakeLock.ts`
- **Type:** Hook - Device wake lock
- **Reusability:** GENERIC (pure hook)
- **Dependencies:**
  - React hooks (core)
  - Web APIs (built-in)
- **Target Package:** `packages/shared`
- **Reasoning:** Generic device capability hook
- **Status:** Can move immediately

#### 2. **useOnline**
- **Current Location:** `/apps/template/src/hooks/online.ts`
- **Type:** Hook - Network status
- **Reusability:** GENERIC (pure hook)
- **Dependencies:**
  - React hooks (core)
  - Web APIs (built-in)
- **Target Package:** `packages/shared`
- **Reasoning:** Generic online/offline detection hook
- **Status:** Can move immediately

#### 3. **useDocumentVisibility**
- **Current Location:** `/apps/template/src/hooks/documentVisibility.ts`
- **Type:** Hook - Document visibility
- **Reusability:** GENERIC (pure hook)
- **Dependencies:**
  - React hooks (core)
  - Web APIs (built-in)
- **Target Package:** `packages/shared`
- **Reasoning:** Generic document visibility hook
- **Status:** Can move immediately

#### 4. **useLocalStorage**
- **Current Location:** `/apps/template/src/hooks/localStorage.ts`
- **Type:** Hook - Storage management
- **Reusability:** GENERIC (pure hook)
- **Dependencies:**
  - React hooks (core)
  - localStorage (built-in)
- **Target Package:** `packages/shared`
- **Reasoning:** Generic localStorage hook
- **Status:** Can move immediately

---

## LOW PRIORITY ITEMS
### Keep or Refactor - App-Specific or Complex Dependencies

These items have significant app-specific logic, complex dependencies, or need substantial refactoring before moving.

### COMPONENTS - SUDOKU APP

#### 1. **Sudoku** (Main component)
- **Current Location:** `/apps/sudoku/src/components/Sudoku/Sudoku.tsx`
- **Type:** Component - Core game
- **Reusability:** SUDOKU-SPECIFIC
- **Dependencies:**
  - Many sudoku logic imports from `@sudoku-web/sudoku`
  - Game-specific hooks
  - App-specific providers
- **Target Package:** N/A (keep in app, too specific)
- **Reasoning:** Core sudoku game logic, heavily customized
- **Status:** Keep in app

#### 2. **SudokuBox**
- **Current Location:** `/apps/sudoku/src/components/SudokuBox/SudokuBox.tsx`
- **Type:** Component - Grid cell
- **Reusability:** SUDOKU-SPECIFIC
- **Dependencies:**
  - Sudoku logic types and functions
- **Target Package:** `packages/sudoku` (already puzzle-specific package)
- **Reasoning:** Puzzle-specific component
- **Status:** Consider moving to `packages/sudoku` if it's a reusable sudoku UI component

#### 3. **SudokuControls**
- **Current Location:** `/apps/sudoku/src/components/SudokuControls/SudokuControls.tsx`
- **Type:** Component - Control panel
- **Reusability:** SUDOKU-SPECIFIC
- **Dependencies:**
  - Sudoku logic
  - Game state
- **Target Package:** `packages/sudoku`
- **Reasoning:** Puzzle-specific controls
- **Status:** Consider moving to `packages/sudoku`

#### 4. **NumberPad**
- **Current Location:** `/apps/sudoku/src/components/NumberPad/NumberPad.tsx`
- **Type:** Component - Input UI
- **Reusability:** GENERIC-ish (could be reused for other puzzles)
- **Dependencies:**
  - React (core)
- **Target Package:** `packages/ui`
- **Reasoning:** Generic number input UI, reusable
- **Status:** Can move to packages/ui

#### 5. **RaceTrack**
- **Current Location:** `/apps/sudoku/src/components/RaceTrack/RaceTrack.tsx`
- **Type:** Component - Multiplayer UI
- **Reusability:** GENERIC-ish (racing/multiplayer concept)
- **Dependencies:**
  - Sudoku types
  - Party data
  - User context
- **Target Package:** `packages/ui` (with parameterized content)
- **Reasoning:** Could be abstracted as generic racing/leaderboard UI
- **Status:** Requires refactoring to move

#### 6. **RacingPromptModal**
- **Current Location:** `/apps/sudoku/src/components/RacingPromptModal/RacingPromptModal.tsx`
- **Type:** Component - Modal
- **Reusability:** GENERIC-ish
- **Dependencies:**
  - React (core)
- **Target Package:** `packages/ui`
- **Reasoning:** Generic modal UI
- **Status:** Can move, content is app-specific but UI is generic

#### 7. **BookCover**
- **Current Location:** `/apps/sudoku/src/components/BookCovers/BookCover.tsx`
- **Type:** Component - Card UI
- **Reusability:** GENERIC-ish
- **Dependencies:**
  - React (core)
  - Sudoku types (can be made generic)
- **Target Package:** `packages/ui`
- **Reasoning:** Generic card component
- **Status:** Can move with type parameterization

#### 8. **PartyRow** / **PartyConfirmationDialog** / **PartyInviteButton**
- **Current Location:** `/apps/sudoku/src/components/Party*`
- **Type:** Components - Party/Multiplayer UI
- **Reusability:** GENERIC-ish (party concept)
- **Dependencies:**
  - Party context/types
  - Template providers
- **Target Package:** `packages/ui`
- **Reasoning:** Could be abstracted as generic party/team UI components
- **Status:** Requires refactoring

#### 9. **Leaderboard** components (FriendLeaderboardEntry, Leaderboard, ScoreBreakdown, ScoringLegend)
- **Current Location:** `/apps/sudoku/src/components/leaderboard/`
- **Type:** Components - Leaderboard UI
- **Reusability:** GENERIC-ish (scoreboard concept)
- **Dependencies:**
  - Sudoku types (can be parameterized)
  - Scoring utilities
- **Target Package:** `packages/ui`
- **Reasoning:** Could be abstracted as generic leaderboard UI
- **Status:** Requires refactoring for generic use

#### 10. **SudokuSidebar**
- **Current Location:** `/apps/sudoku/src/components/SudokuSidebar/SudokuSidebar.tsx`
- **Type:** Component - Sidebar
- **Reusability:** SUDOKU-SPECIFIC
- **Dependencies:**
  - Game state
  - Party data
  - Multiple providers
- **Target Package:** Keep in app
- **Reasoning:** Complex, app-specific sidebar
- **Status:** Keep in app

#### 11. **SidebarButton**
- **Current Location:** `/apps/sudoku/src/components/SidebarButton/SidebarButton.tsx`
- **Type:** Component - Button
- **Reusability:** GENERIC
- **Dependencies:**
  - React (core)
- **Target Package:** `packages/ui`
- **Reasoning:** Generic button UI
- **Status:** Can move immediately

### COMPONENTS - TEMPLATE APP

#### 1. **Header** / **HeaderBack** / **HeaderOnline** / **HeaderUser**
- **Current Location:** `/apps/template/src/components/Header*/`
- **Type:** Components - Layout
- **Reusability:** TEMPLATE-SPECIFIC or GENERIC-ish
- **Dependencies:**
  - User context
  - Online status hook
  - Multiple providers
- **Target Package:** `packages/ui` (generic headers) or keep in template (app-specific)
- **Reasoning:** Some are generic (HeaderBack), some are app-specific (HeaderUser with user context)
- **Status:** Refactor and move generic parts

#### 2. **ThemeSwitch** / **ThemeControls** / **ThemeColorSwitch**
- **Current Location:** `/apps/template/src/components/Theme*/`
- **Type:** Components - Theme UI
- **Reusability:** GENERIC
- **Dependencies:**
  - React (core)
  - `next-themes`
  - Capacitor (optional, can be parameterized)
- **Target Package:** `packages/ui`
- **Reasoning:** Generic theme switching UI
- **Status:** Can move (some parts already in packages/template provider)

#### 3. **PremiumFeatures**
- **Current Location:** `/apps/template/src/components/PremiumFeatures/PremiumFeatures.tsx`
- **Type:** Component - Subscription UI
- **Reusability:** GENERIC-ish
- **Dependencies:**
  - Subscription context
  - RevenueCat
- **Target Package:** `packages/ui`
- **Reasoning:** Generic premium features display
- **Status:** Can move with context parameterization

#### 4. **UserPanel** / **UserButton** / **UserAvatar** / **DeleteAccountDialog**
- **Current Location:** `/apps/template/src/components/HeaderUser/`
- **Type:** Components - User UI
- **Reusability:** TEMPLATE-SPECIFIC or GENERIC-ish
- **Dependencies:**
  - User context
  - Auth hooks
- **Target Package:** `packages/ui` (generic) or keep (specific)
- **Reasoning:** UserAvatar could be generic, others are app-specific
- **Status:** Refactor to extract generic parts

### PROVIDERS - SUDOKU APP

#### 1. **BookProvider**
- **Current Location:** `/apps/sudoku/src/providers/BookProvider/BookProvider.tsx`
- **Type:** Provider - Book data
- **Reusability:** SUDOKU-SPECIFIC
- **Dependencies:**
  - Sudoku book types
  - Server storage
  - Online hook
- **Target Package:** `packages/sudoku` (if it's meant to be reusable)
- **Reasoning:** Sudoku book-specific provider
- **Status:** Keep in app (sudoku-specific) OR move to `packages/sudoku`

#### 2. **PartiesProvider**
- **Current Location:** `/apps/sudoku/src/providers/PartiesProvider/PartiesProvider.tsx`
- **Type:** Provider - Party management
- **Reusability:** GENERIC-ish (party concept)
- **Dependencies:**
  - User context
  - Server storage
  - Party types
- **Target Package:** `packages/template` (already shared resource)
- **Reasoning:** Could be abstracted as generic party provider
- **Status:** Consider moving to packages/template or packages/shared

#### 3. **ThemeColorProvider**
- **Current Location:** `/apps/sudoku/src/providers/ThemeColorProvider.test.tsx` (test only)
- **Type:** Test - Already in template
- **Reusability:** N/A
- **Dependencies:** N/A
- **Target Package:** N/A (already modularized)
- **Status:** Already in packages/template

### PROVIDERS - TEMPLATE APP

#### 1. **CapacitorProvider**
- **Current Location:** `/apps/template/src/providers/CapacitorProvider/CapacitorProvider.tsx`
- **Type:** Provider - Platform initialization
- **Reusability:** GENERIC
- **Dependencies:**
  - Capacitor (platform)
  - React (core)
- **Target Package:** `packages/shared` or `packages/ui`
- **Reasoning:** Generic platform initialization
- **Status:** Can move

#### 2. **FetchProvider**
- **Current Location:** `/apps/template/src/providers/FetchProvider/FetchProvider.tsx`
- **Type:** Provider - Fetch interceptor
- **Reusability:** GENERIC
- **Dependencies:**
  - React (core)
  - Fetch API (built-in)
- **Target Package:** `packages/shared`
- **Reasoning:** Generic fetch provider
- **Status:** Can move

#### 3. **GlobalStateProvider**
- **Current Location:** `/apps/template/src/providers/GlobalStateProvider/GlobalStateProvider.tsx`
- **Type:** Provider - Global state
- **Reusability:** TEMPLATE-SPECIFIC or GENERIC-ish
- **Dependencies:**
  - React (core)
- **Target Package:** `packages/shared` (if generic) or keep (if specific)
- **Reasoning:** Simple state container, could be generic
- **Status:** Can move (very simple)

#### 4. **RevenueCatProvider**
- **Current Location:** `/apps/template/src/providers/RevenueCatProvider/RevenueCatProvider.tsx`
- **Type:** Provider - Subscription management
- **Reusability:** GENERIC (for any subscriptionapp)
- **Dependencies:**
  - RevenueCat SDKs
  - React (core)
- **Target Package:** `packages/template` (subscription module)
- **Reasoning:** Generic subscription provider
- **Status:** Can move to packages/template (already shared)

#### 5. **SessionsProvider**
- **Current Location:** `/apps/template/src/providers/SessionsProvider/SessionsProvider.tsx`
- **Type:** Provider - Session management
- **Reusability:** GENERIC-ish
- **Dependencies:**
  - User context
  - Server storage
  - Party data
- **Target Package:** `packages/template`
- **Reasoning:** Could be abstracted as generic session provider
- **Status:** Consider moving to packages/template

#### 6. **UserProvider**
- **Current Location:** `/apps/template/src/providers/UserProvider/UserProvider.tsx`
- **Type:** Provider - User management
- **Reusability:** GENERIC
- **Dependencies:**
  - Auth (from packages/auth)
  - React (core)
- **Target Package:** `packages/template` or `packages/auth`
- **Reasoning:** Generic user provider
- **Status:** Already modularized in packages/template exports

#### 7. **ThemeColorProvider**
- **Current Location:** `/apps/template/src/providers/ThemeColorProvider.tsx`
- **Type:** Provider - Theme
- **Reusability:** GENERIC
- **Dependencies:**
  - React (core)
  - `next-themes`
- **Target Package:** `packages/template` (already shared)
- **Reasoning:** Already shared between apps
- **Status:** Already properly modularized

### HOOKS - SUDOKU APP

#### 1. **useParties**
- **Current Location:** `/apps/sudoku/src/hooks/useParties.ts`
- **Type:** Hook - Party management
- **Reusability:** GENERIC-ish (party concept)
- **Dependencies:**
  - PartiesProvider/Context
- **Target Package:** `packages/template` (if moving provider)
- **Reasoning:** Hook for party management
- **Status:** Move with PartiesProvider

#### 2. **useGameState**
- **Current Location:** `/apps/sudoku/src/hooks/gameState.ts`
- **Type:** Hook - Core game logic
- **Reusability:** SUDOKU-SPECIFIC
- **Dependencies:**
  - Sudoku logic and types
  - Storage hooks
  - Timer hook
  - Multiple providers
- **Target Package:** `packages/sudoku` (if creating puzzle-specific package)
- **Reasoning:** Core sudoku game logic
- **Status:** Keep in app OR move to packages/sudoku

#### 3. **useTimer** (referenced in gameState)
- **Current Location:** `/apps/sudoku/src/hooks/timer.ts`
- **Type:** Hook - Timer management
- **Reusability:** GENERIC-ish (timer concept)
- **Dependencies:**
  - React hooks (core)
  - Storage
- **Target Package:** `packages/shared`
- **Reasoning:** Generic timer hook
- **Status:** Can move

#### 4. **useDrag**
- **Current Location:** `/apps/sudoku/src/hooks/useDrag.ts`
- **Type:** Hook - Drag interactions
- **Reusability:** GENERIC (UI interaction)
- **Dependencies:**
  - React hooks (core)
  - Web APIs (built-in)
- **Target Package:** `packages/shared` or `packages/ui`
- **Reasoning:** Generic drag interaction hook
- **Status:** Can move

### HOOKS - TEMPLATE APP

#### 1. **useFetch**
- **Current Location:** `/apps/template/src/hooks/fetch.ts`
- **Type:** Hook - Fetch wrapper
- **Reusability:** GENERIC
- **Dependencies:**
  - React hooks (core)
  - Fetch API (built-in)
- **Target Package:** `packages/shared`
- **Reasoning:** Generic fetch hook
- **Status:** Can move

#### 2. **useSessions**
- **Current Location:** Exported from `packages/template` (via providers)
- **Type:** Hook - Session management
- **Reusability:** GENERIC-ish
- **Dependencies:**
  - Session types
  - User context
- **Target Package:** Already in `packages/template`
- **Status:** Already modularized

---

## CONFIGURATION & CONSTANTS

#### 1. **dailyLimits**
- **Current Location:** `/apps/template/src/config/dailyLimits.ts`
- **Type:** Configuration
- **Reusability:** GENERIC-ish (can be parameterized)
- **Dependencies:** None
- **Target Package:** `packages/shared` or `packages/template`
- **Reasoning:** App configuration, could be generic
- **Status:** Can move

#### 2. **subscriptionMessages**
- **Current Location:** `/apps/sudoku/src/config/subscriptionMessages.tsx`
- **Type:** Configuration - UI messages
- **Reusability:** GENERIC-ish
- **Dependencies:** None (JSX constants)
- **Target Package:** `packages/template` (subscription module)
- **Reasoning:** Subscription-related configuration
- **Status:** Can move

#### 3. **premiumFeatures**
- **Current Location:** `/apps/template/src/config/premiumFeatures.tsx`
- **Type:** Configuration - Feature definitions
- **Reusability:** GENERIC-ish
- **Dependencies:** None (JSX constants)
- **Target Package:** `packages/template` (subscription module)
- **Reasoning:** Premium feature configuration
- **Status:** Can move

---

## TYPES & INTERFACES

#### 1. **Leaderboard types**
- **Current Location:** `/apps/sudoku/src/components/leaderboard/types.ts`
- **Type:** Types - Leaderboard definitions
- **Reusability:** GENERIC-ish
- **Dependencies:** None
- **Target Package:** `packages/types` or `packages/shared`
- **Reasoning:** Generic type definitions
- **Status:** Can move

#### 2. **Sudoku types**
- **Current Location:** `/apps/sudoku/src/types/index.ts`
- **Type:** Types - App-specific
- **Reusability:** SUDOKU-SPECIFIC
- **Dependencies:** None
- **Target Package:** Already exists in `packages/sudoku` probably
- **Status:** Verify if duplicated with packages/sudoku

#### 3. **Template types**
- **Current Location:** `/apps/template/src/types/`
- **Type:** Types - Multiple files
- **Reusability:** GENERIC or SPECIFIC
- **Dependencies:** None (type definitions)
- **Target Package:** `packages/types` or `packages/template`
- **Reasoning:** Various type definitions
- **Status:** Should be in packages already

---

## DEDUPLICATION OPPORTUNITIES

The following files are DUPLICATED across apps and should be unified:

1. **pkce.ts** - `/apps/sudoku/src/helpers/pkce.ts` vs `/apps/template/src/helpers/pkce.ts`
   - Move to: `packages/auth` or `packages/shared`
   
2. **capacitor.ts** - `/apps/sudoku/src/helpers/capacitor.ts` vs `/apps/template/src/helpers/capacitor.ts`
   - Move to: `packages/shared`
   
3. **electron.ts** - `/apps/sudoku/src/helpers/electron.ts` vs `/apps/template/src/helpers/electron.ts`
   - Move to: `packages/shared`
   
4. **calculateSeconds.ts** - `/apps/sudoku/src/helpers/calculateSeconds.ts` vs `/apps/template/src/helpers/calculateSeconds.ts`
   - Move to: `packages/shared`
   
5. **formatSeconds.ts** - `/apps/sudoku/src/helpers/formatSeconds.ts` vs `/apps/template/src/helpers/formatSeconds.ts`
   - Move to: `packages/shared`

6. **playerColors.ts** - `/apps/sudoku/src/utils/playerColors.ts` vs `/apps/template/src/utils/playerColors.ts` (likely duplicate)
   - Move to: `packages/shared`

7. **dailyActionCounter.ts** - Similar utilities in both apps
   - Consolidate in: `packages/shared`

---

## RECOMMENDED EXECUTION PHASES

### Phase 1: Eliminate Duplication (2-3 days)
**Focus:** Remove duplicated code across apps
- Extract `pkce`, `capacitor`, `electron` to packages
- Consolidate time helpers (`calculateSeconds`, `formatSeconds`)
- Deduplicate player colors and daily counters
- Update imports in both apps

### Phase 2: Extract Pure Utilities (1-2 days)
**Focus:** Move self-contained utilities with no dependencies
- Move all pure helper functions to `packages/shared`
- Move all pure custom hooks to `packages/shared`
- Move configuration constants to appropriate packages

### Phase 3: Extract Reusable Components (2-3 days)
**Focus:** Move generic UI components to `packages/ui`
- Move simple UI components (buttons, toggles, footers, etc.)
- Move error boundaries and error handlers
- Move theme-related components
- Move generic modals and dialogs

### Phase 4: Extract Providers & Complex Hooks (3-5 days)
**Focus:** Move providers and complex logic hooks
- Extract platform-specific providers
- Extract fetch provider
- Extract global state provider
- Extract timer hook and usage patterns

### Phase 5: Refactor Medium-Complexity Items (5-7 days)
**Focus:** Refactor components/hooks that need abstraction
- Abstract leaderboard components
- Abstract party components
- Parameterize content-specific components
- Extract reusable patterns

### Phase 6: Move App-Specific Content (2-3 days)
**Focus:** Relocate app-specific items to appropriate packages
- Move sudoku-specific logic to `packages/sudoku`
- Move subscription logic to `packages/template`
- Move book provider if reusable

---

## PACKAGE RECOMMENDATIONS

Based on the analysis, the package structure should be:

```
packages/
├── shared/           (Pure utilities, helpers, hooks, types)
│   ├── utils/        (daily counters, player colors, platform detection)
│   ├── helpers/      (time formatting, cryptography, PKCE)
│   ├── hooks/        (useOnline, useDocumentVisibility, useLocalStorage, useWakeLock, useFetch, useTimer, useDrag)
│   └── types/        (generic types)
│
├── ui/               (Reusable UI components)
│   ├── components/   (buttons, toggles, footers, headers, cards, modals, error boundaries)
│   └── hooks/        (UI-specific hooks if any)
│
├── template/         (App-specific template resources)
│   ├── providers/    (FetchProvider, CapacitorProvider, GlobalStateProvider, RevenueCatProvider, SessionsProvider, UserProvider, ThemeColorProvider)
│   ├── config/       (dailyLimits, premiumFeatures, subscriptionMessages)
│   ├── utils/        (any template-specific utilities)
│   └── types/        (template-specific types)
│
├── sudoku/           (Puzzle logic package)
│   ├── components/   (if extracting SudokuBox, SudokuControls, NumberPad)
│   └── logic/        (core sudoku game logic, hooks)
│
├── auth/             (Authentication & auth-related utilities)
├── types/            (Shared type definitions)
└── shared/           (Other shared resources)
```

---

## SUMMARY STATISTICS

**Total Items Analyzed:** 80+

**By Priority:**
- HIGH PRIORITY: 22 items (move immediately)
- MEDIUM PRIORITY: 35 items (move after refactoring)
- LOW PRIORITY: 25+ items (keep in apps or move to specific packages)

**By Category:**
- Utilities: 15 items
- Helpers: 9 items (including 3 duplicates)
- Components: 35 items
- Hooks: 12 items
- Providers: 10 items
- Configuration/Constants: 5 items

**Duplication Found:** 7 major areas (pkce, capacitor, electron, calculateSeconds, formatSeconds, playerColors, dailyActionCounter)

**Potential Code Reduction:** ~35-40% by removing duplication and moving shared code

---

## NEXT STEPS

1. Prioritize Phase 1 to eliminate duplication immediately
2. Create detailed migration guide for each phase
3. Set up proper exports in package.json files
4. Update import paths across both apps
5. Add integration tests for moved components
6. Document the new modular structure

