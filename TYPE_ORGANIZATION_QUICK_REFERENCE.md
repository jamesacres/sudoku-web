# Type Organization Quick Reference

## At a Glance

### Current Problem
- **5-6 type definitions are duplicated** between apps/template and packages/template
- **SubscriptionContext and StateType** used across multiple packages
- **packages/types is empty** (currently just a placeholder)
- **No single source of truth** for generic, reusable types

### Top 3 Priority Moves

| Type | Current | Should Move To | Impact | Effort |
|------|---------|----------------|--------|--------|
| **SubscriptionContext** | apps/template, packages/template | packages/types | HIGH - Used by sudoku pkg | LOW |
| **StateType** | apps/template, packages/template | packages/types | HIGH - Used by sudoku pkg | LOW |
| **Party/PartyMember/Session** | packages/template | packages/types | MEDIUM - Generic entities | MEDIUM |

### Types That Stay Put

| Location | Type | Reason |
|----------|------|--------|
| packages/sudoku | Cell, Puzzle, Timer, GameState | Game-specific logic |
| apps/template | Tab, UserSessions | UI-specific to template app |
| apps/sudoku | FriendsLeaderboardScore | App-specific scoring |

---

## Before & After

### BEFORE (Current - Messy)
```
apps/template/src/types/
  ├── subscriptionContext.ts ← DUPLICATE
  ├── StateType.ts           ← DUPLICATE
  ├── userProfile.ts         ← DUPLICATE
  ├── serverTypes.ts         ← DUPLICATE
  ├── tabs.ts                ← Keep
  └── userSessions.ts        ← Keep

packages/template/src/types/
  ├── subscriptionContext.ts ← DUPLICATE
  ├── StateType.ts           ← DUPLICATE
  ├── userProfile.ts         ← DUPLICATE
  ├── serverTypes.ts         ← DUPLICATE
  ├── Party.ts               ← Generic
  ├── PartyMember.ts         ← Generic
  └── Session.ts             ← Generic

packages/types/src/
  └── index.ts               ← EMPTY!
```

### AFTER (Proposed - Clean)
```
packages/types/src/
  ├── index.ts                 ← Main exports
  ├── subscriptionContext.ts   ← MOVED HERE
  ├── stateType.ts             ← MOVED HERE
  ├── userProfile.ts           ← MOVED HERE
  ├── entities/                ← NEW
  │   ├── party.ts             ← MOVED HERE
  │   ├── partyMember.ts       ← MOVED HERE
  │   └── session.ts           ← MOVED HERE
  └── entitlements.ts          ← MOVED/CLARIFIED

apps/template/src/types/
  ├── index.ts                 ← Re-exports from @sudoku-web/template
  ├── tabs.ts                  ← KEEP (app-specific)
  └── userSessions.ts          ← KEEP (app-specific)

packages/template/src/types/
  ├── index.ts                 ← Imports from @sudoku-web/types + re-exports
  └── (Other template-specific utilities)
```

---

## Import Changes

### Packages/sudoku - AFTER
```typescript
// BEFORE:
import { SubscriptionContext } from '@sudoku-web/template';

// AFTER:
import { SubscriptionContext } from '@sudoku-web/types';
```

### Apps/sudoku - AFTER
```typescript
// BEFORE:
import { SubscriptionContext, StateType } from '@sudoku-web/template';

// AFTER:
import { SubscriptionContext, StateType } from '@sudoku-web/types';
import { Party, Invite } from '@sudoku-web/types';
```

### Packages/template - AFTER
```typescript
// Can still import locally but should import from @sudoku-web/types for external consistency
export { SubscriptionContext } from '@sudoku-web/types';
export { StateType } from '@sudoku-web/types';
export * from '@sudoku-web/types'; // Re-export generics
```

---

## Files to Delete After Migration

After updating imports, these files become redundant:

```
apps/template/src/types/subscriptionContext.ts
apps/template/src/types/StateType.ts
apps/template/src/types/userProfile.ts
apps/template/src/types/serverTypes.ts      (partially - keep app-specific)

packages/template/src/types/subscriptionContext.ts   (keep re-export)
packages/template/src/types/StateType.ts              (keep re-export)
packages/template/src/types/Party.ts                  (move to packages/types)
packages/template/src/types/PartyMember.ts            (move to packages/types)
packages/template/src/types/Session.ts                (move to packages/types)
```

---

## Testing Checklist

After migration, verify:
- [ ] All imports resolve correctly
- [ ] No circular dependencies introduced
- [ ] Type checking passes: `npm run type-check`
- [ ] Tests pass: `npm test`
- [ ] Linting passes: `npm run lint`
- [ ] Build succeeds: `npm run build`
- [ ] No runtime errors when using SubscriptionContext
- [ ] No runtime errors when using StateType
- [ ] No runtime errors when using Party/Session types

---

## Migration Complexity Assessment

### Ease: 6/10
- Straightforward file moves and imports
- Well-defined type boundaries
- No complex interdependencies

### Risk: 5/10
- Potential for missed imports during refactor
- Build might break temporarily during transition
- Need comprehensive testing

### Time: 2-3 hours
- File creation/moves: 30 min
- Import updates: 1 hour
- Testing & verification: 30 min
- Troubleshooting buffer: 30 min

---

## Key Files to Review Before Starting

1. `/home/node/sudoku-web/packages/template/package.json` - Add dependency on @sudoku-web/types
2. `/home/node/sudoku-web/packages/sudoku/package.json` - Add dependency on @sudoku-web/types
3. `/home/node/sudoku-web/apps/sudoku/src/types/index.ts` - Update re-exports
4. `/home/node/sudoku-web/apps/template/src/types/index.ts` - Update re-exports

---

## Next Steps

1. **Read**: TYPE_ORGANIZATION_ANALYSIS.md (full detailed analysis)
2. **Plan**: Review migration plan with team
3. **Execute**: Follow Phase 1-4 plan in detailed analysis
4. **Test**: Run full test suite after each phase
5. **Document**: Update CLAUDE.md with new type organization

