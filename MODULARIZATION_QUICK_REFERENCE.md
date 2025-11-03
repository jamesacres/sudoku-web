# Modularization Quick Reference Guide

## At-a-Glance Summary

**Total Items to Move:** 80+ components, hooks, providers, utilities, and helpers

**Quick Stats:**
- **22 High Priority Items** - Move immediately (no dependencies, generic)
- **35 Medium Priority Items** - Move after refactoring (mostly generic)
- **23+ Low Priority Items** - Keep in apps or move to specific packages (app-specific)
- **7 Duplication Areas** - Code duplicated across apps that should be deduplicated

**Estimated Code Reduction:** 35-40% through deduplication and modularization

---

## HIGH PRIORITY (Move IMMEDIATELY)

Move these first - they're generic, self-contained, and have no app-specific logic.

### Pure Helpers (Move to `packages/shared`)
1. ✓ **calculateSeconds** - Time conversion (DUPLICATE in both apps)
2. ✓ **formatSeconds** - Time formatting (DUPLICATE in both apps)
3. ✓ **sha256** - Cryptographic hash
4. ✓ **pkce** - PKCE authentication (DUPLICATE in both apps)
5. ✓ **capacitor** - Platform detection (DUPLICATE in both apps)
6. ✓ **electron** - Platform detection (DUPLICATE in both apps)

### Pure Utilities (Move to `packages/shared`)
7. ✓ **dailyActionCounter** - Daily action tracking
8. ✓ **dailyPuzzleCounter** - Daily puzzle tracking
9. ✓ **playerColors** - Player color assignment

### Generic Hooks (Move to `packages/shared`)
10. ✓ **useOnline** - Network status
11. ✓ **useDocumentVisibility** - Document visibility
12. ✓ **useLocalStorage** - localStorage hook
13. ✓ **useWakeLock** - Wake lock management

### Generic UI Components (Move to `packages/ui`)
14. ✓ **TrafficLight** - Status indicator
15. ✓ **Toggle/NotesToggle** - Toggle UI
16. ✓ **Footer** - Layout footer
17. ✓ **ErrorBoundary** - Error handling
18. ✓ **GlobalErrorHandler** - Error display
19. ✓ **SidebarButton** - Button UI

---

## MEDIUM PRIORITY (Move AFTER High Priority)

These need slight refactoring or have minimal dependencies.

### Components Needing Refactoring (Move to `packages/ui`)
- TimerDisplay (after extracting calculateSeconds)
- SocialProof (parameterize content)
- AppDownloadModal
- ThemeSwitch / ThemeControls / ThemeColorSwitch
- PremiumFeatures
- NumberPad (generic number input)
- RacingPromptModal (generic modal UI)
- BookCover (generic card)
- Header/HeaderBack/HeaderOnline (generic parts)

### Providers (Move to `packages/shared` or `packages/template`)
- CapacitorProvider
- FetchProvider
- GlobalStateProvider

### More Hooks (Move to `packages/shared`)
- useFetch
- useTimer
- useDrag

### Configuration (Move to appropriate packages)
- dailyLimits → `packages/template`
- subscriptionMessages → `packages/template`
- premiumFeatures → `packages/template`

---

## LOW PRIORITY (Keep or Selective Move)

These are app-specific or require significant refactoring.

### Keep in App
- **Sudoku component** - Core game logic
- **SudokuSidebar** - Complex, app-specific
- **useGameState** - Core game state management

### Move to `packages/sudoku` (if creating puzzle-specific library)
- SudokuBox
- SudokuControls
- BookProvider
- useGameState

### Move to `packages/ui` (with refactoring)
- RaceTrack (abstract to generic scoreboard)
- PartyRow / PartyConfirmationDialog / PartyInviteButton
- Leaderboard components (FriendLeaderboardEntry, ScoreBreakdown, ScoringLegend)
- UserPanel / UserButton / UserAvatar (UserAvatar is generic)

### Move to `packages/template` (with refactoring)
- PartiesProvider (generic party management)
- SessionsProvider (generic session management)
- RevenueCatProvider (already shared)
- UserProvider (already shared)
- ThemeColorProvider (already shared)

---

## DUPLICATION HOTSPOTS

These files are DUPLICATED across `/apps/sudoku` and `/apps/template`:

| File | Sudoku Location | Template Location | Action |
|------|-----------------|-------------------|--------|
| **pkce.ts** | ✓ | ✓ | Move to `packages/auth` |
| **capacitor.ts** | ✓ | ✓ | Move to `packages/shared` |
| **electron.ts** | ✓ | ✓ | Move to `packages/shared` |
| **calculateSeconds.ts** | ✓ | ✓ | Move to `packages/shared` |
| **formatSeconds.ts** | ✓ | ✓ | Move to `packages/shared` |
| **playerColors.ts** | ✓ | ✓ | Move to `packages/shared` |
| **dailyActionCounter.ts** | Similar | ✓ | Consolidate in `packages/shared` |

**Impact:** Removing duplication = immediate 20-25% code reduction

---

## EXECUTION ROADMAP

### Phase 1: Deduplication (2-3 days) - HIGH IMPACT
**Deliverable:** All duplicated helpers moved and deduplicated
1. Move 6 duplicate helpers to packages
2. Update imports in both apps
3. Run tests
4. Commit

### Phase 2: Extract Pure Utilities (1-2 days)
**Deliverable:** All pure utilities in packages/shared
1. Move dailyActionCounter, dailyPuzzleCounter, playerColors
2. Move all pure hooks
3. Run tests
4. Commit

### Phase 3: Extract UI Components (2-3 days)
**Deliverable:** Generic UI components in packages/ui
1. Move 19 generic components
2. Update imports
3. Run tests
4. Commit

### Phase 4: Extract Providers (3-5 days)
**Deliverable:** Generic providers in appropriate packages
1. Move CapacitorProvider, FetchProvider, GlobalStateProvider
2. Move configuration constants
3. Run tests
4. Commit

### Phase 5: Refactor & Move Medium Items (5-7 days)
**Deliverable:** All medium-priority items modularized
1. Refactor components that need parameterization
2. Move party/leaderboard components
3. Abstract generic patterns
4. Run tests
5. Commit

### Phase 6: Organize App-Specific Code (2-3 days)
**Deliverable:** App structure clarified
1. Move sudoku-specific logic to packages/sudoku
2. Move template-specific logic to packages/template
3. Run tests
4. Commit

**Total Estimated Time:** 15-23 days

---

## PACKAGE ORGANIZATION

```
packages/
├── shared/           (Core utilities, no app logic)
│   ├── utils/
│   │   ├── dailyActionCounter.ts
│   │   ├── dailyPuzzleCounter.ts
│   │   └── playerColors.ts
│   ├── helpers/
│   │   ├── calculateSeconds.ts
│   │   ├── formatSeconds.ts
│   │   ├── sha256.ts
│   │   ├── pkce.ts
│   │   ├── capacitor.ts
│   │   └── electron.ts
│   └── hooks/
│       ├── useOnline.ts
│       ├── useDocumentVisibility.ts
│       ├── useLocalStorage.ts
│       ├── useWakeLock.ts
│       ├── useFetch.ts
│       ├── useTimer.ts
│       └── useDrag.ts
│
├── ui/               (Reusable UI components)
│   ├── components/
│   │   ├── buttons/
│   │   ├── toggles/
│   │   ├── modals/
│   │   ├── headers/
│   │   └── ...
│   └── index.ts
│
├── template/         (Template app specific, already shared)
│   ├── providers/
│   ├── config/
│   ├── utils/
│   └── types/
│
├── sudoku/           (Puzzle logic, optional)
├── auth/             (Authentication)
├── types/            (Shared types)
└── ...existing...
```

---

## MIGRATION CHECKLIST

### Before Starting
- [ ] Create feature branch: `feature/modularization`
- [ ] Set up comprehensive test suite
- [ ] Document current imports/exports
- [ ] Backup current state

### For Each Phase
- [ ] Identify files to move
- [ ] Create destination in packages
- [ ] Move files
- [ ] Update all imports (both apps)
- [ ] Update package.json exports
- [ ] Run TypeScript check
- [ ] Run tests
- [ ] Update documentation
- [ ] Create pull request
- [ ] Code review
- [ ] Merge

### After Completion
- [ ] Verify both apps build and run
- [ ] Run full test suite
- [ ] Update CLAUDE.md documentation
- [ ] Create migration guide for team
- [ ] Tag release

---

## QUICK WINS (First 1-2 Days)

Start with the easiest, highest-impact moves:

1. **Move all duplicate helpers to packages/shared** (30 min)
   - pkce, capacitor, electron, calculateSeconds, formatSeconds
   
2. **Update imports in both apps** (1 hour)
   
3. **Move pure utilities to packages/shared** (1 hour)
   - dailyActionCounter, dailyPuzzleCounter, playerColors
   
4. **Move generic hooks to packages/shared** (2 hours)
   - useOnline, useDocumentVisibility, useLocalStorage, useWakeLock
   
5. **Move simple UI components to packages/ui** (3 hours)
   - TrafficLight, Toggle, Footer, ErrorBoundary, GlobalErrorHandler, SidebarButton

**First-Pass Result:** 25-30% code deduplication, cleaner imports

---

## TESTING STRATEGY

For each moved item:

1. **Type Checking:** `tsc --noEmit`
2. **Unit Tests:** Ensure existing tests pass
3. **Import Tests:** Both apps can import successfully
4. **Build Tests:** `npm run build` succeeds in both apps
5. **Runtime Tests:** Manual testing in both apps
6. **Integration Tests:** Verify functionality unchanged

---

## DOCUMENTATION TO UPDATE

- [ ] `/CLAUDE.md` - Add modularization notes
- [ ] `/packages/shared/README.md` - New package docs
- [ ] `/packages/ui/README.md` - Enhanced component docs
- [ ] Root `README.md` - Architecture overview
- [ ] Migration guide for developers

---

## SUCCESS CRITERIA

- [ ] All 80+ items categorized and moved
- [ ] 0 code duplication between apps
- [ ] All tests passing
- [ ] Both apps build successfully
- [ ] Type checking passes
- [ ] Import paths optimized
- [ ] No circular dependencies
- [ ] Package exports clearly defined
- [ ] Developer documentation complete

