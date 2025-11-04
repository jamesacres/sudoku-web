# Codebase Analysis: Duplicates, Empty Files, and Consolidation Opportunities

**Analysis Date:** 2025-11-04  
**Branch:** 003-modular-turborepo-architecture  
**Scope:** TypeScript/TSX files in src/ excluding node_modules, dist, build, out directories

---

## EXECUTIVE SUMMARY

This analysis identifies **30+ duplicate and stub files** across the monorepo that should be consolidated:

- **9 stub files** (2-3 lines, empty implementations) - Ready for immediate deletion
- **14 component sets** with identical duplicates across locations
- **8 utility duplicates** across apps and packages
- **3 platform detection helpers** duplicated 4 times
- **~1500+ lines** of duplicate code to eliminate

---

## SECTION 1: STUB/EMPTY FILES - IMMEDIATE DELETION (Priority 1)

These files only contain placeholder comments and empty exports. They serve no functional purpose and should be deleted:

### Auth Package Stubs
1. **useAuth.ts** - `/home/node/sudoku-web/packages/auth/src/hooks/useAuth.ts` (2 lines)
2. **useSession.ts** - `/home/node/sudoku-web/packages/auth/src/hooks/useSession.ts` (2 lines)
3. **useUser.ts** - `/home/node/sudoku-web/packages/auth/src/hooks/useUser.ts` (2 lines)

### Template Package Stubs
4. **useMembership.ts** - `/home/node/sudoku-web/packages/template/src/hooks/useMembership.ts` (2 lines)
5. **useParty.ts** - `/home/node/sudoku-web/packages/template/src/hooks/useParty.ts` (2 lines)
6. **useSession.ts** - `/home/node/sudoku-web/packages/template/src/hooks/useSession.ts` (2 lines)

### UI Package Stubs
7. **useDarkMode.ts** - `/home/node/sudoku-web/packages/ui/src/hooks/useDarkMode.ts` (2 lines)
8. **useTheme.ts** - `/home/node/sudoku-web/packages/ui/src/hooks/useTheme.ts` (2 lines)

### Shared Package
9. **index.ts** - `/home/node/sudoku-web/packages/shared/src/index.ts` (2 lines)

---

## SECTION 2: TRUE DUPLICATES - CONSOLIDATION REQUIRED

### Category A: Apps to Packages (DELETE app versions)

#### 2.A.1: AppDownloadModal
**Status:** TRUE DUPLICATE (MD5 verified identical)
```
/home/node/sudoku-web/apps/template/src/components/AppDownloadModal/AppDownloadModal.tsx (DELETE)
/home/node/sudoku-web/apps/template/src/components/AppDownloadModal/AppDownloadModal.test.tsx (DELETE)
  └─> KEEP in: /home/node/sudoku-web/packages/template/src/components/AppDownloadModal/
```
**Lines:** 185 lines
**Action:** DELETE from apps/template, import from @sudoku-web/template

#### 2.A.2: Header User Components
**Status:** LIKELY DUPLICATES (auth functionality)
```
App Version (DELETE):
  /home/node/sudoku-web/apps/template/src/components/HeaderUser/DeleteAccountDialog.tsx
  /home/node/sudoku-web/apps/template/src/components/HeaderUser/HeaderUser.tsx
  /home/node/sudoku-web/apps/template/src/components/HeaderUser/UserAvatar.tsx (52 lines)
  /home/node/sudoku-web/apps/template/src/components/HeaderUser/UserButton.tsx (104 lines)
  /home/node/sudoku-web/apps/template/src/components/HeaderUser/UserPanel.tsx (243 lines)

Package Version (KEEP):
  /home/node/sudoku-web/packages/auth/src/components/DeleteAccountDialog.tsx
  /home/node/sudoku-web/packages/auth/src/components/HeaderUser.tsx
  /home/node/sudoku-web/packages/auth/src/components/UserAvatar.tsx
  /home/node/sudoku-web/packages/auth/src/components/UserButton.tsx
  /home/node/sudoku-web/packages/auth/src/components/UserPanel.tsx
```
**Action:** DELETE all from apps/template, import from @sudoku-web/auth
**Reasoning:** Auth UI components should be in auth package, not duplicated in apps

#### 2.A.3: Template Utilities (Apps to Packages)
**Status:** DUPLICATES
```
File                    Lines   App Location                                    Package Location
calculateSeconds.ts     20      apps/template/src/helpers/                      packages/template/src/helpers/ (DELETE app)
dailyActionCounter.ts   104     apps/template/src/utils/                        packages/template/src/utils/ (DELETE app)
dailyLimits.ts          14      apps/template/src/config/                       packages/template/src/config/ (DELETE app)
formatSeconds.ts        9       apps/template/src/helpers/                      packages/template/src/helpers/ (DELETE app)
playerColors.ts         55      apps/template/src/utils/                        packages/template/src/utils/ (DELETE app)
premiumFeatures.tsx     30      apps/template/src/config/                       packages/template/src/config/ (DELETE app)
```
**Action:** Delete all from apps/template, import from packages/template

#### 2.A.4: Sudoku Game Logic (Apps to Packages)
**Status:** DUPLICATES
```
File                Lines   App Location                        Package Location
gameState.ts        825     apps/sudoku/src/hooks/             packages/sudoku/src/hooks/ (DELETE app)
useParties.ts       68      apps/sudoku/src/hooks/             packages/sudoku/src/hooks/ (DELETE app)
TimerDisplay.tsx    31      apps/sudoku/src/components/        packages/sudoku/src/components/ (DELETE app)
scoringConfig.ts    45      apps/sudoku/src/components/leaderboard/  packages/sudoku/src/helpers/ (DELETE app)
scoringUtils.ts     192     apps/sudoku/src/components/leaderboard/  packages/sudoku/src/helpers/ (DELETE app)
```
**Action:** Delete from apps/sudoku, import from @sudoku-web/sudoku
**Reasoning:** Game state and hooks should be in package per index.ts exports

### Category B: Between Packages (CONSOLIDATE to correct package)

#### 2.B.1: UI Components (Duplicate in template and ui packages)
**Status:** TRUE DUPLICATES (files identical)
```
Package/template/src/components/ErrorBoundary/ErrorBoundary.tsx (DELETE)
Package/template/src/components/ErrorBoundary/ErrorBoundary.test.tsx (DELETE)
  └─> KEEP in: packages/ui/src/components/ErrorBoundary/

packages/template/src/components/GlobalErrorHandler/GlobalErrorHandler.tsx (DELETE)
packages/template/src/components/GlobalErrorHandler/GlobalErrorHandler.test.tsx (DELETE)
  └─> KEEP in: packages/ui/src/components/GlobalErrorHandler/
```
**Action:** Delete from packages/template, import from @sudoku-web/ui
**Reasoning:** UI components belong in UI package

#### 2.B.2: ThemeColorProvider
**Status:** LIKELY DUPLICATE
```
packages/template/src/providers/ThemeColorProvider.tsx (DELETE)
  └─> KEEP in: packages/ui/src/providers/ThemeColorProvider.tsx
```
**Lines:** 165
**Action:** Delete from packages/template, import from @sudoku-web/ui

#### 2.B.3: Type Definitions (Move to @sudoku-web/types)
**Status:** DUPLICATES
```
File                    Locations
subscriptionContext.ts  packages/template/src/types/ (DELETE)
                        packages/types/src/ (KEEP - canonical)

userProfile.ts          packages/template/src/types/ (DELETE)
                        packages/types/src/ (KEEP - canonical)
```
**Action:** Delete from packages/template, import from @sudoku-web/types

#### 2.B.4: Platform Detection Utilities (3-4 locations)
**Status:** SIGNIFICANT DUPLICATION
```
capacitor.ts (26 lines each)
  ├─ apps/template/src/helpers/ (DELETE)
  ├─ packages/template/src/helpers/ (DELETE)
  ├─ packages/auth/src/services/ (KEEP)
  └─ packages/ui/src/helpers/ (short variant - DELETE)

electron.ts (14 lines each)
  ├─ apps/template/src/helpers/ (DELETE)
  ├─ packages/template/src/helpers/ (DELETE)
  └─ packages/auth/src/services/ (KEEP)

pkce.ts (34 lines each)
  ├─ apps/template/src/helpers/ (DELETE)
  ├─ packages/template/src/helpers/ (DELETE)
  └─ packages/auth/src/services/ (KEEP)
```
**Action:** Consolidate to single source in @sudoku-web/auth/services
**Reasoning:** Platform detection is auth concern, should not be duplicated

#### 2.B.5: Server Types (PARTIAL DUPLICATE)
**Status:** COMPLEX - Versions differ in content
```
apps/template/src/types/serverTypes.ts (96 lines)
packages/template/src/types/serverTypes.ts (96 lines) - likely identical
packages/sudoku/src/types/serverTypes.ts (227 lines) - superset/extended version
```
**Action:** VERIFY - Compare all three versions and determine canonical location
**Reasoning:** Should have single source of truth for type definitions

---

## SECTION 3: POTENTIAL VARIATIONS (VERIFY)

These files have same name and similar purpose but may have intentional differences:

#### 3.1: RaceTrack.tsx
```
apps/sudoku/src/components/RaceTrack/RaceTrack.tsx
packages/sudoku/src/components/RaceTrack/RaceTrack.tsx
```
**Status:** NOT identical - imports differ
- Package version: uses internal imports (`../../types/serverTypes`)
- App version: uses package imports (`@sudoku-web/sudoku`)
**Action:** KEEP BOTH - Package version is template, app version is integrated
**Verified:** Import differences indicate intentional divergence

#### 3.2: Sudoku.tsx
```
apps/sudoku/src/components/Sudoku/Sudoku.tsx (467 lines)
packages/sudoku/src/components/Sudoku/Sudoku.tsx (466 lines)
```
**Status:** LIKELY similar but may have app-specific dependencies
**Action:** VERIFY imports and dependencies before consolidating

#### 3.3: SudokuBox.tsx
```
apps/sudoku/src/components/SudokuBox/SudokuBox.tsx (72 lines)
packages/sudoku/src/components/SudokuBox/SudokuBox.tsx (68 lines)
```
**Status:** Similar but possibly different implementations
**Action:** VERIFY if differences are intentional or accidental

---

## SECTION 4: INDEX FILES (Not counted as duplicates)

The following files are normal re-exports (index.ts files) across multiple directories:
- 60+ index.ts files across different packages/components
- These are NOT duplicates, they're standard monorepo pattern
- No action needed

---

## SECTION 5: TEST FILES

Test file patterns (page.test.tsx, etc.) appear in appropriate locations:
- App tests in apps/sudoku/src/app/
- Package tests in packages/*/src/
- No consolidation needed

---

## CONSOLIDATION ROADMAP

### Phase 1: Quick Wins (Safety: High Risk: Low)
1. Delete 9 stub files (Section 1)
2. Delete duplicate utilities from apps/template
3. Delete duplicate utilities from apps/sudoku
4. **Time estimate:** 1 sprint

### Phase 2: Component Consolidation (Safety: Medium Risk: Medium)
1. Consolidate ErrorBoundary and GlobalErrorHandler to @sudoku-web/ui
2. Consolidate ThemeColorProvider to @sudoku-web/ui
3. Consolidate user/auth components to @sudoku-web/auth
4. Update all imports across codebase
5. **Time estimate:** 2 sprints

### Phase 3: Type Centralization (Safety: High Risk: Low)
1. Consolidate subscriptionContext and userProfile to @sudoku-web/types
2. Verify serverTypes.ts consolidation (may need merge logic)
3. **Time estimate:** 1 sprint

### Phase 4: Platform Utilities (Safety: Medium Risk: Medium)
1. Create single source for capacitor.ts in @sudoku-web/auth/services
2. Create single source for electron.ts in @sudoku-web/auth/services
3. Create single source for pkce.ts in @sudoku-web/auth/services
4. Update all imports
5. **Time estimate:** 1 sprint

### Phase 5: Game Logic (Safety: Medium Risk: High)
1. Verify Sudoku.tsx and SudokuBox.tsx implementations
2. Consolidate gameState.ts and useParties.ts from apps/sudoku
3. Verify RaceTrack.tsx differences are intentional
4. Update imports and run full test suite
5. **Time estimate:** 2-3 sprints (high risk)

---

## SUMMARY STATISTICS

| Category | Count | Lines | Risk |
|----------|-------|-------|------|
| Stub files to delete | 9 | 18 | LOW |
| Component duplicates | 8 sets | ~1000+ | MEDIUM |
| Utility duplicates | 8 files | ~400+ | LOW |
| Type duplicates | 2 files | ~21 | LOW |
| Platform utilities | 3 helpers | ~100+ | MEDIUM |
| Potential variations | 3 files | ~600 | HIGH |
| **TOTAL** | **30+** | **~2100+** | - |

---

## NEXT ACTIONS

1. Review and approve consolidation strategy
2. Start with Phase 1 (stub file deletion)
3. Run full test suite after each phase
4. Update tsconfig paths if needed
5. Verify package.json exports match canonical locations
6. Consider creating @sudoku-web/shared for truly shared utilities

---

## FILES BY LOCATION (Detailed Reference)

### Files to DELETE from apps/template/:
```
/components/AppDownloadModal/AppDownloadModal.tsx
/components/AppDownloadModal/AppDownloadModal.test.tsx
/components/HeaderUser/DeleteAccountDialog.tsx
/components/HeaderUser/HeaderUser.tsx
/components/HeaderUser/UserAvatar.tsx
/components/HeaderUser/UserButton.tsx
/components/HeaderUser/UserPanel.tsx
/helpers/calculateSeconds.ts
/helpers/capacitor.ts
/helpers/electron.ts
/helpers/formatSeconds.ts
/helpers/pkce.ts
/config/dailyLimits.ts
/config/premiumFeatures.tsx
/utils/dailyActionCounter.ts
/utils/playerColors.ts
```

### Files to DELETE from apps/sudoku/:
```
/components/RaceTrack/RaceTrack.tsx (VERIFY first)
/components/SudokuBox/SudokuBox.tsx (VERIFY first)
/components/TimerDisplay/TimerDisplay.tsx
/components/leaderboard/scoringConfig.ts
/components/leaderboard/scoringUtils.ts
/hooks/gameState.ts
/hooks/useParties.ts
/hooks/timer.test.ts
```

### Files to DELETE from packages/template/:
```
/components/ErrorBoundary/ErrorBoundary.tsx
/components/ErrorBoundary/ErrorBoundary.test.tsx
/components/GlobalErrorHandler/GlobalErrorHandler.tsx
/components/GlobalErrorHandler/GlobalErrorHandler.test.tsx
/providers/ThemeColorProvider.tsx
/types/subscriptionContext.ts
/types/userProfile.ts
/helpers/capacitor.ts
/helpers/electron.ts
/helpers/pkce.ts
```

### Files to DELETE from packages/auth/:
```
/hooks/useAuth.ts
/hooks/useSession.ts
/hooks/useUser.ts
```

### Files to DELETE from packages/ui/:
```
/hooks/useDarkMode.ts
/hooks/useTheme.ts
/helpers/capacitor.ts (short variant)
```

### Files to DELETE from packages/shared/:
```
/src/index.ts
```

