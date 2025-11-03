# Quick Reference: Component Modularity Summary

## At a Glance

**Total Components Analyzed:** 42
- **Can Move to Packages:** 15
- **Needs Refactoring First:** 8
- **Keep in Apps:** 19

**Total Hooks Analyzed:** 14
- **Already Exported/Good:** 7
- **Can Export/Consolidate:** 3
- **Keep in Apps:** 4

**Total Providers Analyzed:** 8
- **Already Exported:** 5
- **Can Export:** 1
- **Keep in Apps:** 2

---

## Critical Issues Found

### 1. Code Duplication: useDrag Hook
**Status:** DUPLICATE EXISTS
- `/apps/template/src/hooks/useDrag.ts` (16KB)
- `/apps/sudoku/src/hooks/useDrag.ts` (tests reference)
- **Action:** Consolidate - use packages/template version
- **Effort:** 1 hour
- **Risk:** LOW

### 2. Missing Exports: SessionsProvider
**Status:** EXISTS BUT NOT EXPORTED
- Location: `/apps/template/src/providers/SessionsProvider/`
- Currently: Only in apps/template
- Should be: Exported from packages/template
- **Action:** Add to packages/template/src/index.ts
- **Effort:** 10 minutes
- **Risk:** NONE

### 3. Package/App Structure Mismatch
**Status:** Inconsistent pattern
- Some components in packages, same components also in apps
- Need clearer ownership model
- **Action:** Follow PHASE 1-3 plan in main document
- **Effort:** 2-3 hours
- **Risk:** LOW

---

## Movement Priority Matrix

```
┌─────────────────────────────────────────────────────────┐
│           IMPACT                                         │
│              ▲                                          │
│              │                                          │
│         HIGH │  ⭐ CopyButton        ⭐ SessionsProvider
│              │  ⭐ SudokuInput        ⭐ useDrag consol.
│              │  ⭐ CelebrationAnim   ⭐ SudokuBox refactor
│              │                                          │
│         MED  │  ◐ SudokuControls    ◐ PartyInviteBtn
│              │  ◐ PartyInviteBtn    ◐ Modals
│              │  ◐ BookCovers        ◐ useSession export
│              │                                          │
│         LOW  │  ⦿ Leaderboard      ⦿ Sudoku main
│              │  ⦿ SudokuSidebar     ⦿ useGameState
│              │  ⦿ RaceTrack         ⦿ UserContext
│              │                                          │
│              └────────────────────────────────────────►
│              LOW         EFFORT        HIGH             │
└─────────────────────────────────────────────────────────┘

Legend:
⭐ = Move First (Phase 1)
◐ = Move Second (Phase 2)
⦿ = Keep in App (Phase 3)
```

---

## Phase 1: Quick Wins (2-3 hours)

### Immediate Actions (0.5 hours)

**1. Export Missing Items**
```bash
# File: packages/template/src/index.ts
+ export { useDrag } from './hooks/useDrag';
+ export { SessionsProvider } from './providers/SessionsProvider';
+ export { useSession } from './hooks/useSession';
```

**2. Consolidate useDrag**
```bash
# Remove: apps/sudoku/src/hooks/useDrag.ts
# Update: apps/sudoku imports to use @sudoku-web/template
```

### Copy Components (1-2 hours)

**1. CopyButton**
```
FROM: /apps/template/src/components/CopyButton/
TO:   /packages/ui/src/components/CopyButton/
```

**2. CelebrationAnimation**
```
FROM: /apps/template/src/components/CelebrationAnimation/
TO:   /packages/ui/src/components/CelebrationAnimation/
```

**3. Update Exports**
```typescript
// packages/ui/src/index.ts
export { default as CopyButton } from './components/CopyButton';
export { default as CelebrationAnimation } from './components/CelebrationAnimation';
```

**4. Update Apps**
```typescript
// apps/template/src/components/SomeComponent.tsx
// FROM:
import { CopyButton } from '@/components/CopyButton';
// TO:
import { CopyButton } from '@sudoku-web/ui';
```

---

## Phase 2: Strategic Moves (3-6 hours)

### Grid Component Refactoring

**Current Issue:** SudokuBox tightly couples display with app logic

**Solution:** Extract grid logic into reusable component

```typescript
// NEW: packages/sudoku/src/components/SudokuGrid/
interface SudokuGridProps {
  boxId: string;
  selectedCell: string | null;
  answer: PuzzleBox;
  validation?: PuzzleBox<boolean>;
  initial: PuzzleBox;
  isZoomMode?: boolean;
  onDragStart?: (e: PointerEvent) => void;
  onCellClick: (cellId: string) => void;
  onCellInputChange: (cellId: string, value: number | null) => void;
}

export const SudokuGrid: React.FC<SudokuGridProps> = ({...}) => {
  // Generic grid rendering
}

// KEEP in apps/sudoku: SudokuBox wrapper
// It handles app-specific logic and delegates to SudokuGrid
```

### Party/Session Components

**Move to packages/template:**
- PartyInviteButton (uses useServerStorage + CopyButton)
- Party-related UI utilities

**Result:** Enables party features in other collaborative apps

---

## Phase 3: Long-Term (Keep in Apps)

### Sudoku App - Keep These (Game-Specific)
- Sudoku (main orchestrator - 467 lines, heavy context)
- RaceTrack (racing game logic)
- Leaderboard (game-specific scoring/display)
- SudokuSidebar (complex party + sudoku integration)
- useGameState (sudoku state machine - 25KB)
- PartiesProvider (sudoku party management)
- BookProvider (sudoku books)

**Why:** Tightly coupled to sudoku game rules and features

### Template App - Keep These (App Infrastructure)
- HeaderUser (auth system)
- UserPanel, UserButton, DeleteAccountDialog (user mgmt)
- PremiumFeatures (business logic)

**Why:** Tightly coupled to auth and business rules

---

## Dependency Overview

### Clean Architecture ✓
```
packages/sudoku
  ├─ helpers (core logic) ✓
  ├─ types (game types) ✓
  └─ hooks (game timers) ✓

packages/template
  ├─ providers (context setup) ✓
  ├─ hooks (generic utils) ✓
  └─ components (generic) ✓

packages/ui
  ├─ components (design) ✓
  └─ providers (theme) ✓

packages/types ✓
packages/auth ✓
packages/shared (empty - could be used)

NO CIRCULAR DEPENDENCIES DETECTED ✓
```

### Current Issues Found
1. **Duplication:** useDrag in 2 places
2. **Missing exports:** SessionsProvider, useSession
3. **Opportunity:** packages/shared underutilized

---

## Implementation Checklist

### Week 1 (Phase 1)

- [ ] Task 1.1: Export SessionsProvider (10 min)
- [ ] Task 1.2: Export useDrag (5 min)
- [ ] Task 1.3: Consolidate useDrag hook (30 min)
- [ ] Task 1.4: Copy CopyButton to packages/ui (30 min)
- [ ] Task 1.5: Copy CelebrationAnimation to packages/ui (30 min)
- [ ] Task 1.6: Update all imports (30 min)
- [ ] Task 1.7: Run tests and verify (30 min)

**Total Time:** 2.5-3 hours
**Risk:** LOW
**Value:** HIGH (fewer imports needed by apps)

### Week 2-3 (Phase 2)

- [ ] Task 2.1: Design SudokuGrid component (30 min)
- [ ] Task 2.2: Extract grid logic (2-3 hours)
- [ ] Task 2.3: Update SudokuBox to use SudokuGrid (1 hour)
- [ ] Task 2.4: Move PartyInviteButton (1 hour)
- [ ] Task 2.5: Test and verify (1 hour)

**Total Time:** 4-6 hours
**Risk:** MEDIUM
**Value:** MEDIUM (better code org)

---

## What Gets Cleaner

### Before vs After

**BEFORE:**
- apps/sudoku imports from 4+ locations
- apps/template has duplicate imports
- Components scattered between apps and packages
- No clear "where should this go?" rule

**AFTER:**
- apps only imports specific domain logic
- packages have clear responsibility
- Generic components in packages/ui
- Game logic in packages/sudoku
- App logic in packages/template
- Clear import chains (no circles)

**Example - Reduced Imports:**

```typescript
// BEFORE
import { useWakeLock } from '@/hooks/useWakeLock';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useFetch } from '@/hooks/fetch';
import { useOnline } from '@/hooks/online';
import { useDocumentVisibility } from '@/hooks/documentVisibility';

// AFTER (all from one package)
import { 
  useWakeLock, 
  useLocalStorage, 
  useFetch, 
  useOnline, 
  useDocumentVisibility 
} from '@sudoku-web/template';
```

---

## Risk Levels by Action

| Action | Risk | Why | Mitigation |
|--------|------|-----|-----------|
| Export existing items | NONE | No code changes | Already done in tests |
| Consolidate useDrag | LOW | Simple refactoring | Full test coverage |
| Copy UI components | LOW | No dependencies | Copy, test, delete original |
| Refactor grid logic | MEDIUM | Multiple consumers | Update all at once |
| Move party components | MEDIUM | Some context deps | Good test coverage exists |
| Move game-specific | HIGH | Don't do this! | Keep in apps |

---

## Success Metrics

After completing Phase 1:
- [ ] All tests pass
- [ ] Build completes with no errors
- [ ] No unused imports
- [ ] Import paths cleaner (fewer @/ imports needed)
- [ ] No new circular dependencies

After completing Phase 2:
- [ ] 20%+ reduction in duplicate code
- [ ] Better separation of concerns
- [ ] Easier to add new collaborative features
- [ ] Components more reusable

---

## Files to Read

1. **Main Analysis:** COMPONENT_MODULARIZATION_ANALYSIS.md (this project)
2. **Architecture:** ARCHITECTURE.md (existing)
3. **Package Structure:** packages/*/package.json

## Questions to Ask Team

1. Should packages/shared hold cross-cutting utilities?
2. Should we create a new package for collaborative features?
3. Should party/session components be more generic?
4. Should grid components support other games?

---

## Next Steps

1. **Approve this plan** with team
2. **Execute Phase 1** (quick wins)
3. **Measure impact** (import reduction, maintainability)
4. **Plan Phase 2** based on feedback
5. **Document patterns** for future developers

