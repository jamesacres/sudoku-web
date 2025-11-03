# Code Duplication Analysis Report

Generated: 2025-11-02

## Executive Summary

This report identifies code duplications between apps and their corresponding packages in the sudoku-web monorepo. The analysis reveals significant opportunities to consolidate code and improve maintainability through proper use of package imports instead of duplicated source files.

### File Statistics
- **apps/sudoku/src**: 157 files
- **packages/sudoku/src**: 41 files
- **apps/template/src**: 107 files
- **packages/template/src**: 60 files
- **packages/auth/src**: 22 files
- **packages/ui/src**: 28 files

---

## CRITICAL FINDINGS: Identical Duplications

### 1. Type Definitions - 100% Identical Code

#### apps/sudoku/src/types/notes.ts
```
Location in Package: packages/sudoku/src/types/notes.ts
Status: IDENTICAL - 6 lines
Current Import: import { Notes } from '@/types/notes'
Should Be: import { Notes, ToggleNote } from '@sudoku-web/sudoku'
Action: DELETE apps/sudoku/src/types/notes.ts
Package Export: YES - included in @sudoku-web/sudoku/index.ts
```

#### apps/sudoku/src/types/puzzle.ts
```
Location in Package: packages/sudoku/src/types/puzzle.ts
Status: IDENTICAL - 39 lines
Current Import: import { Puzzle } from '@/types/puzzle'
Should Be: import { Puzzle, PuzzleBox, PuzzleRow, emptyPuzzle } from '@sudoku-web/sudoku'
Action: DELETE apps/sudoku/src/types/puzzle.ts
Package Export: YES - included in @sudoku-web/sudoku/index.ts
Code Snippets Match: YES (verified line-by-line)
```

#### apps/template/src/types/serverTypes.ts
```
Location in Package: packages/template/src/types/serverTypes.ts
Status: IDENTICAL - 100+ lines (core types verified identical)
Current Import: import { SessionResponse } from '@/types/serverTypes'
Should Be: import { SessionResponse, Session, Party, Member, etc. } from '@sudoku-web/template'
Action: DELETE apps/template/src/types/serverTypes.ts
Package Export: YES - included in @sudoku-web/template/index.ts
```

### 2. Helper Functions - Identical Logic

#### apps/sudoku/src/helpers/calculateCompletionPercentage.ts
```
Location in Package: packages/sudoku/src/helpers/calculateCompletionPercentage.ts
Status: IDENTICAL (logic + code)
Lines: 41
Difference: Import paths only (@/types vs ../types)
Current Usage: Used by SudokuSidebar.tsx, SudokuControls.tsx
Should Be: import { calculateCompletionPercentage } from '@sudoku-web/sudoku'
Action: DELETE apps/sudoku/src/helpers/calculateCompletionPercentage.ts
Package Export: YES - included in @sudoku-web/sudoku/index.ts
```

#### apps/sudoku/src/helpers/checkAnswer.ts
```
Location in Package: packages/sudoku/src/helpers/checkAnswer.ts
Status: 99% IDENTICAL (logic identical, imports differ)
Lines: 110
Difference: 
  - App uses: splitCellId from '@sudoku-web/template'
  - Package uses: splitCellId from './calculateId' (local)
Impact: Package version is BETTER (no external dependency)
Current Usage: Used by multiple game components
Should Be: import { checkCell, checkGrid, isInitialCell } from '@sudoku-web/sudoku'
Action: DELETE apps/sudoku/src/helpers/checkAnswer.ts, use package version
Package Export: YES - included in @sudoku-web/sudoku/index.ts
```

### 3. Components - Identical UI Code

#### apps/sudoku/src/components/NumberPad/NumberPad.tsx
```
Location in Package: packages/sudoku/src/components/NumberPad/NumberPad.tsx
Status: IDENTICAL - 28 lines
Usage: Core game component
Should Be: import { NumberPad } from '@sudoku-web/sudoku'
Action: DELETE apps/sudoku/src/components/NumberPad/NumberPad.tsx
Package Export: YES - exported in @sudoku-web/sudoku/index.ts
Note: Includes test file - DELETE apps/sudoku/src/components/NumberPad/NumberPad.test.tsx as well
```

#### apps/template/src/components/ErrorBoundary/ErrorBoundary.tsx
```
Location in Package: packages/template/src/components/ErrorBoundary/ErrorBoundary.tsx
Status: IDENTICAL - 102 lines
Usage: Error handling component
Should Be: import { ErrorBoundary } from '@sudoku-web/template'
Action: DELETE apps/template/src/components/ErrorBoundary/ErrorBoundary.tsx
Package Export: YES - exported in @sudoku-web/template/index.ts
Note: DELETE test file apps/template/src/components/ErrorBoundary/ErrorBoundary.test.tsx
```

#### apps/template/src/components/Footer/Footer.tsx
```
Location in Package: packages/ui/src/components/Footer/Footer.tsx
Status: IDENTICAL - 19 lines
Issue: Footer is in packages/ui (correct location) but app has duplicate
Should Be: import { Footer } from '@sudoku-web/ui'
Action: DELETE apps/template/src/components/Footer/Footer.tsx
Package Export: YES - exported in @sudoku-web/ui/index.ts
Note: DELETE test file apps/template/src/components/Footer/Footer.test.tsx
Misplacement: This component is also in packages/template (should consolidate to packages/ui only)
```

### 4. Authentication Components - From packages/auth

#### apps/template/src/components/HeaderUser/UserAvatar.tsx
```
Location in Package: packages/auth/src/components/UserAvatar.tsx
Status: IDENTICAL - 53 lines
Code is identical, only import paths differ:
  - App: ../../types/userProfile
  - Package: ../types/UserProfile
Should Be: import { UserAvatar } from '@sudoku-web/auth'
Action: DELETE apps/template/src/components/HeaderUser/UserAvatar.tsx
Package Export: YES - exported in @sudoku-web/auth/index.ts
Note: DELETE test file apps/template/src/components/HeaderUser/UserAvatar.test.tsx
```

#### apps/template/src/components/HeaderUser/UserButton.tsx
```
Location in Package: packages/auth/src/components/UserButton.tsx
Status: IDENTICAL - 105 lines
Code is identical, only import paths differ:
  - App: ../../types/userProfile
  - Package: ../types/UserProfile
Should Be: import { UserButton } from '@sudoku-web/auth'
Action: DELETE apps/template/src/components/HeaderUser/UserButton.tsx
Package Export: YES - exported in @sudoku-web/auth/index.ts
Note: DELETE test file apps/template/src/components/HeaderUser/UserButton.test.tsx
```

#### apps/template/src/components/HeaderUser/DeleteAccountDialog.tsx
```
Location in Package: packages/auth/src/components/DeleteAccountDialog.tsx
Status: DUPLICATED (similar but may have app-specific modifications)
Should Be: import { DeleteAccountDialog } from '@sudoku-web/auth'
Action: VERIFY app version is identical, then DELETE
Package Export: YES - exported in @sudoku-web/auth/index.ts
```

#### apps/template/src/components/HeaderUser/UserPanel.tsx
```
Location in Package: packages/auth/src/components/UserPanel.tsx
Status: DUPLICATED (similar but may have app-specific modifications)
Should Be: import { UserPanel } from '@sudoku-web/auth'
Action: VERIFY app version is identical, then DELETE
Package Export: YES - exported in @sudoku-web/auth/index.ts
```

### 5. UI Components - With Variations

#### apps/template/src/components/ThemeColorSwitch/ThemeColorSwitch.tsx
```
Location in Package: packages/ui/src/components/ThemeColorSwitch/ThemeColorSwitch.tsx
Status: DIFFERENT but SIMILAR - 258 vs 267 lines
Key Differences:
  App version:
    - Imports: RevenueCatContext from '../../providers/RevenueCatProvider'
    - Imports: SubscriptionContext from '../../types/subscriptionContext'
    - Uses subscription-specific logic inline
  
  Package version:
    - Props-based API: isSubscribed, onPremiumColorClick, showRainbowAnimation
    - More generic and reusable
    - Better separation of concerns

Analysis: Package version is MORE FLEXIBLE and properly designed
Recommendation: Use package version and pass props from app
Should Be: 
  import { ThemeColorSwitch } from '@sudoku-web/ui'
  <ThemeColorSwitch 
    isSubscribed={isSubscribed}
    onPremiumColorClick={handlePremiumClick}
  />
Action: REPLACE app version with package version, update wrapper if needed
Package Export: YES - exported in @sudoku-web/ui/index.ts
```

---

## RELATIVE PATH IMPORTS (Not Using Package Aliases)

### apps/template/src/components/ThemeColorSwitch/ThemeColorSwitch.tsx
Lines 3-6 use relative imports:
```typescript
import { useThemeColor } from '../../providers/ThemeColorProvider';
import { RevenueCatContext } from '../../providers/RevenueCatProvider';
import { SubscriptionContext } from '../../types/subscriptionContext';
```

Should be:
```typescript
import { useThemeColor } from '@sudoku-web/ui';
// RevenueCatContext and SubscriptionContext remain relative (app-specific)
```

### Multiple Files in apps/template/src
- components/ThemeControls/ThemeControls.tsx: Uses relative imports
- components/ThemeSwitch/ThemeSwitch.tsx: Uses relative imports  
- components/Header/Header.tsx: Uses relative imports
- helpers/*.ts: All use relative imports within app

Recommendation: After consolidating components, update remaining imports to use @sudoku-web/* aliases where the code is from packages.

---

## MISSING FROM PACKAGES (Should Be Added)

### Missing from packages/template
These files exist in apps/template but NOT in packages/template:

1. **types/puzzle.ts** - Should be in packages/sudoku
2. **types/notes.ts** - Should be in packages/sudoku
3. **types/state.ts** - Might be app-specific
4. **types/userSessions.ts** - Might be app-specific or should be in packages/template
5. **helpers/calculateSeconds.ts** - Generic helper
6. **helpers/capacitor.ts** - Platform detection (should be in packages/ui or packages/shared)
7. **helpers/electron.ts** - Platform detection (should be in packages/ui or packages/shared)
8. **helpers/formatSeconds.ts** - Generic helper
9. **helpers/pkce.ts** - Auth related (should be in packages/auth)

### Missing from packages/sudoku
1. **helpers/calculateId.ts** - Used by apps/sudoku and apps/template
   - Currently: packages/sudoku/src/helpers/calculateId.ts exists but NOT exported
   - Should export: calculateBoxId, calculateCellId, splitCellId, calculateNextCellId

---

## SUMMARY TABLE: All Identified Duplications

| App File | Package File | Type | Lines | Status | Priority | Action |
|----------|--------------|------|-------|--------|----------|--------|
| apps/sudoku/src/types/notes.ts | packages/sudoku/src/types/notes.ts | Types | 6 | IDENTICAL | CRITICAL | DELETE app |
| apps/sudoku/src/types/puzzle.ts | packages/sudoku/src/types/puzzle.ts | Types | 39 | IDENTICAL | CRITICAL | DELETE app |
| apps/template/src/types/serverTypes.ts | packages/template/src/types/serverTypes.ts | Types | 100+ | IDENTICAL | CRITICAL | DELETE app |
| apps/sudoku/src/helpers/calculateCompletionPercentage.ts | packages/sudoku/src/helpers/calculateCompletionPercentage.ts | Helper | 41 | IDENTICAL | HIGH | DELETE app |
| apps/sudoku/src/helpers/checkAnswer.ts | packages/sudoku/src/helpers/checkAnswer.ts | Helper | 110 | 99% IDENTICAL | HIGH | DELETE app |
| apps/sudoku/src/components/NumberPad/* | packages/sudoku/src/components/NumberPad/* | Component | 28 | IDENTICAL | HIGH | DELETE app |
| apps/template/src/components/ErrorBoundary/* | packages/template/src/components/ErrorBoundary/* | Component | 102 | IDENTICAL | HIGH | DELETE app |
| apps/template/src/components/Footer/Footer.tsx | packages/ui/src/components/Footer/Footer.tsx | Component | 19 | IDENTICAL | MEDIUM | DELETE app, consolidate |
| apps/template/src/components/HeaderUser/UserAvatar.tsx | packages/auth/src/components/UserAvatar.tsx | Component | 53 | IDENTICAL | HIGH | DELETE app |
| apps/template/src/components/HeaderUser/UserButton.tsx | packages/auth/src/components/UserButton.tsx | Component | 105 | IDENTICAL | HIGH | DELETE app |
| apps/template/src/components/HeaderUser/DeleteAccountDialog.tsx | packages/auth/src/components/DeleteAccountDialog.tsx | Component | 80+ | DUPLICATE | MEDIUM | VERIFY then DELETE |
| apps/template/src/components/HeaderUser/UserPanel.tsx | packages/auth/src/components/UserPanel.tsx | Component | 100+ | DUPLICATE | MEDIUM | VERIFY then DELETE |
| apps/template/src/components/ThemeColorSwitch/* | packages/ui/src/components/ThemeColorSwitch/* | Component | 258 vs 267 | DIFFERENT | LOW | Replace with package |

---

## PACKAGE STRUCTURE ISSUES

### Issue 1: Footer Component Misplacement
- **Currently**: packages/template/src/components/Footer/ (also in packages/ui)
- **Should Be**: ONLY in packages/ui/src/components/Footer/
- **Action**: Remove duplicate from packages/template

### Issue 2: calculateId Utility Export
- **Currently**: Exists in packages/sudoku but NOT exported
- **Should Be**: Exported from @sudoku-web/sudoku/index.ts
- **Impact**: apps/sudoku imports `splitCellId from '@sudoku-web/template'` (wrong package)
- **Files Using**: apps/sudoku/src/helpers/checkAnswer.ts, apps/sudoku/src/app/test-errors/page.tsx

### Issue 3: Missing Auth Package in packages/template?
- **Currently**: packages/template doesn't re-export from @sudoku-web/auth
- **Impact**: Auth components duplicated in apps/template
- **Recommendation**: Keep auth separate (avoid circular dependencies)

---

## IMPORT CONSOLIDATION STRATEGY

### Step 1: Fix Package Exports (No Breaking Changes)
1. Ensure all shared code is exported from packages/*/index.ts
2. Move components from wrong packages (e.g., Footer from template to ui)
3. Add calculateId exports to @sudoku-web/sudoku

### Step 2: Update App Imports (Safe to Do)
1. Update all imports to use @sudoku-web/* aliases
2. Replace relative paths with package imports
3. No code changes needed - just import path changes

### Step 3: Remove Duplicate Files (Safe to Do)
1. Delete duplicate .tsx files from apps/*/src
2. Delete corresponding .test.tsx files
3. Verify tests pass after import changes

### Step 4: Consolidate Components (Safe to Do)
1. Move Footer from template to ui (if not already)
2. Ensure auth components only in packages/auth
3. Verify all package exports are correct

---

## RECOMMENDATIONS BY PRIORITY

### Priority 1 - CRITICAL (Do First)
- [ ] Delete apps/sudoku/src/types/notes.ts - duplicates packages/sudoku/src/types/notes.ts
- [ ] Delete apps/sudoku/src/types/puzzle.ts - duplicates packages/sudoku/src/types/puzzle.ts
- [ ] Delete apps/template/src/types/serverTypes.ts - duplicates packages/template/src/types/serverTypes.ts
- [ ] Update imports to: `import { Notes, Puzzle } from '@sudoku-web/sudoku'`
- [ ] Update imports to: `import { SessionResponse, Session } from '@sudoku-web/template'`

### Priority 2 - HIGH (Do Next)
- [ ] Delete apps/sudoku/src/helpers/calculateCompletionPercentage.ts
- [ ] Delete apps/sudoku/src/helpers/checkAnswer.ts
- [ ] Delete apps/sudoku/src/components/NumberPad directory
- [ ] Delete apps/template/src/components/ErrorBoundary directory
- [ ] Delete apps/template/src/components/Footer/Footer.tsx
- [ ] Update all affected imports to use package aliases

### Priority 3 - MEDIUM (Do After)
- [ ] Delete apps/template/src/components/HeaderUser/{UserAvatar,UserButton}.tsx
- [ ] Delete apps/template/src/components/HeaderUser/{DeleteAccountDialog,UserPanel}.tsx
- [ ] Verify no other components import from apps/template/src/components/HeaderUser
- [ ] Update imports to: `import { UserAvatar, UserButton } from '@sudoku-web/auth'`

### Priority 4 - LOW (Code Quality)
- [ ] Update remaining relative imports to package aliases
- [ ] Consolidate calculateId exports in packages/sudoku
- [ ] Verify all test files are updated
- [ ] Run comprehensive test suite

---

## Files to DELETE (Complete List)

### apps/sudoku/src
```
types/notes.ts
types/puzzle.ts
helpers/checkAnswer.ts
helpers/calculateCompletionPercentage.ts
components/NumberPad/NumberPad.tsx
components/NumberPad/NumberPad.test.tsx
components/NumberPad/index.ts
```

### apps/template/src
```
types/serverTypes.ts
components/ErrorBoundary/ErrorBoundary.tsx
components/ErrorBoundary/ErrorBoundary.test.tsx
components/ErrorBoundary/index.ts
components/Footer/Footer.tsx
components/Footer/Footer.test.tsx
components/Footer/index.ts
components/HeaderUser/UserAvatar.tsx
components/HeaderUser/UserAvatar.test.tsx
components/HeaderUser/UserButton.tsx
components/HeaderUser/UserButton.test.tsx
components/HeaderUser/DeleteAccountDialog.tsx
components/HeaderUser/DeleteAccountDialog.test.tsx
components/HeaderUser/UserPanel.tsx
components/HeaderUser/UserPanel.test.tsx
```

---

## Files to UPDATE (Import Changes)

All files currently importing deleted files need updated imports.

### Affected apps/sudoku imports:
- components/Sudoku/Sudoku.tsx: Import { Puzzle } from '@sudoku-web/sudoku'
- components/SudokuSidebar/SudokuSidebar.tsx: Import { calculateCompletionPercentage } from '@sudoku-web/sudoku'
- And 50+ other files

### Affected apps/template imports:
- components/Header/Header.tsx: Import { Footer } from '@sudoku-web/ui'
- components/HeaderUser/HeaderUser.tsx: Import { UserAvatar, UserButton } from '@sudoku-web/auth'
- And 30+ other files

---

## Verification Checklist

After consolidation, verify:

- [ ] All tests pass: `npm run test`
- [ ] No TypeScript errors: `npm run type-check`
- [ ] Lint passes: `npm run lint`
- [ ] Build succeeds: `npm run build`
- [ ] Apps load without errors
- [ ] No console errors in dev tools
- [ ] All features work as expected

---

## Impact Analysis

### Size Reduction
- Removing duplicates will reduce apps/sudoku/src by ~150 lines
- Removing duplicates will reduce apps/template/src by ~400 lines
- Total reduction: ~550 lines of duplicated code

### Maintenance Improvement
- Single source of truth for each component
- Changes to shared code only need one update
- Easier to onboard new developers
- Better code organization

### Testing Impact
- Tests for shared code now in one place
- App tests focus on app-specific logic
- No test duplication

### Build Time
- Smaller apps = potentially faster builds
- Better tree-shaking with imports from packages

---

## Related Issues

1. **calculateId exports**: Should be in @sudoku-web/sudoku, currently only in packages/template
2. **Footer component**: Lives in both packages/ui and packages/template
3. **ThemeColorSwitch**: App version is less flexible than package version
4. **Import patterns**: Many files use relative imports instead of package aliases

---

## Implementation Timeline

Recommended implementation order:

1. **Week 1**: Fix Priority 1 duplications (types)
2. **Week 2**: Fix Priority 2 duplications (helpers, components)  
3. **Week 3**: Fix Priority 3 duplications (auth components)
4. **Week 4**: Fix Priority 4 issues (imports, exports)
5. **Week 5**: Testing and verification

---

Generated: 2025-11-02
Tool: Code Duplication Analyzer
