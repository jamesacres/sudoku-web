# Type Organization Migration - Implementation Guide

## Overview
This guide provides step-by-step instructions for migrating type definitions to establish `packages/types` as the single source of truth for shared, generic types.

---

## PHASE 1: Create Shared Types Package

### Step 1.1: Create packages/types directory structure

```bash
mkdir -p /home/node/sudoku-web/packages/types/src/entities
```

### Step 1.2: Create subscriptionContext.ts in packages/types

Copy from: `/home/node/sudoku-web/packages/template/src/types/subscriptionContext.ts`

**File**: `/home/node/sudoku-web/packages/types/src/subscriptionContext.ts`
```typescript
/**
 * Enum for subscription modal contexts
 * Used to provide specific messaging based on which premium feature was blocked
 */
export enum SubscriptionContext {
  UNDO = 'undo',
  CHECK_GRID = 'checkGrid',
  REVEAL = 'reveal',
  THEME_COLOR = 'themeColor',
  DAILY_PUZZLE_LIMIT = 'dailyPuzzleLimit',
  REMOVE_MEMBER = 'removeMember',
  MULTIPLE_PARTIES = 'multipleParties',
  PARTY_MAX_SIZE = 'maxSize',
}
```

### Step 1.3: Create stateType.ts in packages/types

Copy from: `/home/node/sudoku-web/packages/template/src/types/StateType.ts`

**File**: `/home/node/sudoku-web/packages/types/src/stateType.ts`
```typescript
export enum StateType {
  PUZZLE = 'PUZZLE',
  TIMER = 'TIMER',
}
```

### Step 1.4: Create userProfile.ts in packages/types

Copy from: `/home/node/sudoku-web/packages/auth/src/types/UserProfile.ts` or template version

**File**: `/home/node/sudoku-web/packages/types/src/userProfile.ts`
```typescript
export interface UserProfile {
  sub: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
}
```

### Step 1.5: Create entities/party.ts in packages/types

Copy from: `/home/node/sudoku-web/packages/template/src/types/Party.ts`

**File**: `/home/node/sudoku-web/packages/types/src/entities/party.ts`
```typescript
export interface PartySettings {
  maxMembers?: number;
  isPublic: boolean;
  invitationRequired: boolean;
}

export interface Party {
  partyId: string;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  settings?: PartySettings;
}

export type Parties<T> = Record<
  string,
  Party & { memberSessions: Record<string, T> }
>;
```

### Step 1.6: Create entities/partyMember.ts in packages/types

Copy from: `/home/node/sudoku-web/packages/template/src/types/PartyMember.ts`

**File**: `/home/node/sudoku-web/packages/types/src/entities/partyMember.ts`
```typescript
export interface PartyMember {
  userId: string;
  partyId: string;
  memberNickname?: string;
  role: 'owner' | 'moderator' | 'member';
  joinedAt: Date;
  status: 'active' | 'invited' | 'declined' | 'left';
}

export interface PartyInvitation {
  invitationId: string;
  partyId: string;
  invitedBy: string;
  invitedUser: string;
  status: 'pending' | 'accepted' | 'declined';
  expiresAt: Date;
  createdAt: Date;
}
```

### Step 1.7: Create entities/session.ts in packages/types

Copy from: `/home/node/sudoku-web/packages/template/src/types/Session.ts`

**File**: `/home/node/sudoku-web/packages/types/src/entities/session.ts`
```typescript
export interface Session<T = any> {
  sessionId: string;
  userId: string;
  state: T;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
}

export interface CollaborativeSession<T> extends Session<T> {
  partyId: string;
  participantIds: string[];
}
```

### Step 1.8: Update packages/types/src/index.ts

**File**: `/home/node/sudoku-web/packages/types/src/index.ts`
```typescript
// Subscription context enum
export { SubscriptionContext } from './subscriptionContext';

// State type enum
export { StateType } from './stateType';

// User types
export type { UserProfile } from './userProfile';

// Entity types
export type { PartySettings, Party, Parties } from './entities/party';
export type { PartyMember, PartyInvitation } from './entities/partyMember';
export type { Session, CollaborativeSession } from './entities/session';
```

---

## PHASE 2: Update Package Dependencies

### Step 2.1: Update packages/template/package.json

Ensure it depends on @sudoku-web/types:

```json
{
  "dependencies": {
    "@sudoku-web/types": "*",
    ...
  }
}
```

### Step 2.2: Update packages/sudoku/package.json

Add dependency on @sudoku-web/types:

```json
{
  "dependencies": {
    "@sudoku-web/types": "*",
    ...
  }
}
```

---

## PHASE 3: Update Imports - packages/sudoku

### Step 3.1: Update packages/sudoku/src/hooks/gameState.ts

**BEFORE**:
```typescript
import type { SubscriptionContext as SubscriptionContextType } from '@sudoku-web/template';
```

**AFTER**:
```typescript
import type { SubscriptionContext as SubscriptionContextType } from '@sudoku-web/types';
```

### Step 3.2: Verify no other sudoku imports need updating

```bash
grep -r "from '@sudoku-web/template'" /home/node/sudoku-web/packages/sudoku/src/
```

---

## PHASE 4: Update Imports - packages/template

### Step 4.1: Update packages/template/src/types/index.ts

**BEFORE**:
```typescript
export { SubscriptionContext } from './subscriptionContext';
export { Tab } from './tabs';
export type { UserProfile } from './userProfile';
// ... other exports
export { StateType } from './StateType';
```

**AFTER** (Re-export from packages/types):
```typescript
// Re-export from shared types package
export { SubscriptionContext } from '@sudoku-web/types';
export { StateType } from '@sudoku-web/types';
export type { UserProfile } from '@sudoku-web/types';
export type { Party, PartySettings, Parties } from '@sudoku-web/types';
export type { PartyMember, PartyInvitation } from '@sudoku-web/types';
export type { Session, CollaborativeSession } from '@sudoku-web/types';

// Keep template-specific exports
export { Tab } from './tabs';
export type { UserSession, UserSessions } from './userSessions';

// ... other sudoku-related exports
```

### Step 4.2: Update packages/template/src/hooks/serverStorage.ts

**BEFORE**:
```typescript
import { StateType } from '../types/StateType';
```

**AFTER**:
```typescript
import { StateType } from '@sudoku-web/types';
```

### Step 4.3: Update packages/template/src/hooks/localStorage.ts

**BEFORE**:
```typescript
import { StateType } from '../types/StateType';
```

**AFTER**:
```typescript
import { StateType } from '@sudoku-web/types';
```

### Step 4.4: Update packages/template/src/providers/RevenueCatProvider/RevenueCatProvider.tsx

**BEFORE**:
```typescript
import { SubscriptionContext } from '../../types/subscriptionContext';
```

**AFTER**:
```typescript
import { SubscriptionContext } from '@sudoku-web/types';
```

---

## PHASE 5: Update Imports - apps/template

### Step 5.1: Update apps/template/src/types/index.ts

**BEFORE**:
```typescript
export { SubscriptionContext } from './subscriptionContext';
export { Tab } from './tabs';
export type { UserProfile } from './userProfile';
export { StateType } from './StateType';
export type {
  ServerStateResult,
  Party,
  // ... other types
} from './serverTypes';
```

**AFTER** (Re-export from packages):
```typescript
// Re-export from packages
export { SubscriptionContext } from '@sudoku-web/template';
export { StateType } from '@sudoku-web/template';
export type { UserProfile } from '@sudoku-web/template';
export type { Party } from '@sudoku-web/template';

// Keep app-specific types
export { Tab } from './tabs';
export type { UserSession, UserSessions } from './userSessions';

// Other re-exports...
```

### Step 5.2: Update apps/template/src/providers/SessionsProvider/SessionsProvider.tsx

**BEFORE**:
```typescript
import { StateType } from '../../types/StateType';
```

**AFTER**:
```typescript
import { StateType } from '@sudoku-web/types';
```

### Step 5.3: Update apps/template/src/hooks/serverStorage.ts

**BEFORE**:
```typescript
import { StateType } from '../types/StateType';
```

**AFTER**:
```typescript
import { StateType } from '@sudoku-web/types';
```

### Step 5.4: Update apps/template/src/hooks/localStorage.ts

**BEFORE**:
```typescript
import { StateType } from '../types/StateType';
```

**AFTER**:
```typescript
import { StateType } from '@sudoku-web/types';
```

### Step 5.5: Update apps/template/src/components/ThemeColorSwitch/ThemeColorSwitch.tsx

**BEFORE**:
```typescript
import { SubscriptionContext } from '../../types/subscriptionContext';
```

**AFTER**:
```typescript
import { SubscriptionContext } from '@sudoku-web/types';
```

### Step 5.6: Update apps/template/src/components/PremiumFeatures/PremiumFeatures.tsx

**BEFORE**:
```typescript
import { SubscriptionContext } from '../../types/subscriptionContext';
```

**AFTER**:
```typescript
import { SubscriptionContext } from '@sudoku-web/types';
```

---

## PHASE 6: Update Imports - apps/sudoku

### Step 6.1: Update apps/sudoku/src/types/index.ts

**BEFORE**:
```typescript
export type {
  Puzzle,
  // ... sudoku types from package
} from '@sudoku-web/sudoku';
```

**AFTER**:
```typescript
export type {
  Puzzle,
  // ... sudoku types from package
} from '@sudoku-web/sudoku';

// Re-export shared types
export { SubscriptionContext, StateType } from '@sudoku-web/types';
export type { Party, Invite } from '@sudoku-web/types';
```

### Step 6.2: Update apps/sudoku/src/hooks/gameState.ts

**BEFORE**:
```typescript
import { StateType } from '@sudoku-web/template';
```

**AFTER**:
```typescript
import { StateType } from '@sudoku-web/types';
```

### Step 6.3: Update apps/sudoku/src/components/SudokuSidebar/SudokuSidebar.tsx

**BEFORE**:
```typescript
import { SubscriptionContext } from '@sudoku-web/template';
```

**AFTER**:
```typescript
import { SubscriptionContext } from '@sudoku-web/types';
```

### Step 6.4: Update apps/sudoku/src/config/subscriptionMessages.tsx

**BEFORE**:
```typescript
import { SubscriptionContext } from '@sudoku-web/template';
```

**AFTER**:
```typescript
import { SubscriptionContext } from '@sudoku-web/types';
```

### Step 6.5: Update apps/sudoku/src/hooks/localStorage.test.ts

**BEFORE**:
```typescript
import { useLocalStorage, StateResult, StateType } from '@sudoku-web/template';
```

**AFTER**:
```typescript
import { useLocalStorage, StateResult } from '@sudoku-web/template';
import { StateType } from '@sudoku-web/types';
```

### Step 6.6: Update apps/sudoku/src/hooks/useLocalStorage.test.ts

**BEFORE**:
```typescript
import { useLocalStorage, StateType } from '@sudoku-web/template';
```

**AFTER**:
```typescript
import { useLocalStorage } from '@sudoku-web/template';
import { StateType } from '@sudoku-web/types';
```

---

## PHASE 7: Cleanup - Remove Duplicate Type Files

### Step 7.1: Remove apps/template duplicate type files

```bash
rm /home/node/sudoku-web/apps/template/src/types/subscriptionContext.ts
rm /home/node/sudoku-web/apps/template/src/types/StateType.ts
rm /home/node/sudoku-web/apps/template/src/types/userProfile.ts
# Keep: tabs.ts, userSessions.ts, index.ts
```

### Step 7.2: Optional - Remove packages/template duplicate type files

These can be kept as re-exports for backward compatibility, or removed if internal only:

```bash
# Keep as re-export files or delete:
# rm /home/node/sudoku-web/packages/template/src/types/subscriptionContext.ts
# rm /home/node/sudoku-web/packages/template/src/types/StateType.ts
# rm /home/node/sudoku-web/packages/template/src/types/userProfile.ts
# rm /home/node/sudoku-web/packages/template/src/types/Party.ts
# rm /home/node/sudoku-web/packages/template/src/types/PartyMember.ts
# rm /home/node/sudoku-web/packages/template/src/types/Session.ts
```

---

## PHASE 8: Verification & Testing

### Step 8.1: Type checking

```bash
cd /home/node/sudoku-web
npm run type-check
```

Expected: No TypeScript errors

### Step 8.2: Linting

```bash
npm run lint
```

Expected: No linting errors

### Step 8.3: Run tests

```bash
npm test
```

Expected: All tests pass

### Step 8.4: Build

```bash
npm run build
```

Expected: Build succeeds

### Step 8.5: Verify imports work

Create a test file to verify imports resolve correctly:

```bash
cat > /tmp/test_imports.ts << 'INNER_EOF'
import { SubscriptionContext, StateType } from '@sudoku-web/types';
import type { Party, PartyMember, Session } from '@sudoku-web/types';
import type { UserProfile } from '@sudoku-web/types';

// Verify enums are accessible
const ctx: SubscriptionContext = SubscriptionContext.UNDO;
const state: StateType = StateType.PUZZLE;

console.log('✓ All imports successful');
INNER_EOF
```

---

## Troubleshooting

### Issue: "Cannot find module '@sudoku-web/types'"

**Solution**: Ensure packages/types is properly linked in tsconfig and build system:
- Check turbo.json references packages/types
- Verify package.json has correct "main" and "types" fields
- Run `npm install` to link packages

### Issue: Circular dependency error

**Solution**: Ensure @sudoku-web/types doesn't import from other packages:
- packages/types should ONLY contain type definitions
- No runtime code, no dependencies on other packages
- No imports from @sudoku-web/sudoku, @sudoku-web/template, etc.

### Issue: Type not found after import change

**Solution**: 
- Check the export is in packages/types/src/index.ts
- Verify file names match (case-sensitive on Linux)
- Clear node_modules cache: `rm -rf node_modules/.pnpm && npm install`

### Issue: Tests fail with import errors

**Solution**:
- Update jest configuration to resolve @sudoku-web/types
- Ensure moduleNameMapper in jest.config.ts includes types package
- Check package.json test scripts if they need updating

---

## Summary Checklist

After completing all phases:

- [ ] packages/types/src/ has new type files
- [ ] packages/types/src/index.ts exports all types
- [ ] packages/template/package.json depends on @sudoku-web/types
- [ ] packages/sudoku/package.json depends on @sudoku-web/types
- [ ] All import statements updated in packages/
- [ ] All import statements updated in apps/
- [ ] Duplicate type files in apps/template removed
- [ ] Type checking passes
- [ ] Linting passes
- [ ] All tests pass
- [ ] Build succeeds
- [ ] No circular dependencies
- [ ] Documentation updated (CLAUDE.md, etc.)

---

## Files Modified Summary

### Created Files (New)
- /home/node/sudoku-web/packages/types/src/subscriptionContext.ts
- /home/node/sudoku-web/packages/types/src/stateType.ts
- /home/node/sudoku-web/packages/types/src/userProfile.ts
- /home/node/sudoku-web/packages/types/src/entities/party.ts
- /home/node/sudoku-web/packages/types/src/entities/partyMember.ts
- /home/node/sudoku-web/packages/types/src/entities/session.ts

### Modified Files (Import Changes)
- /home/node/sudoku-web/packages/sudoku/src/hooks/gameState.ts (1 import)
- /home/node/sudoku-web/packages/template/src/types/index.ts
- /home/node/sudoku-web/packages/template/src/hooks/serverStorage.ts (1 import)
- /home/node/sudoku-web/packages/template/src/hooks/localStorage.ts (1 import)
- /home/node/sudoku-web/packages/template/src/providers/RevenueCatProvider/RevenueCatProvider.tsx (1 import)
- /home/node/sudoku-web/apps/template/src/types/index.ts
- /home/node/sudoku-web/apps/template/src/providers/SessionsProvider/SessionsProvider.tsx (1 import)
- /home/node/sudoku-web/apps/template/src/hooks/serverStorage.ts (1 import)
- /home/node/sudoku-web/apps/template/src/hooks/localStorage.ts (1 import)
- /home/node/sudoku-web/apps/template/src/components/ThemeColorSwitch/ThemeColorSwitch.tsx (1 import)
- /home/node/sudoku-web/apps/template/src/components/PremiumFeatures/PremiumFeatures.tsx (1 import)
- /home/node/sudoku-web/apps/sudoku/src/types/index.ts
- /home/node/sudoku-web/apps/sudoku/src/hooks/gameState.ts (1 import)
- /home/node/sudoku-web/apps/sudoku/src/components/SudokuSidebar/SudokuSidebar.tsx (1 import)
- /home/node/sudoku-web/apps/sudoku/src/config/subscriptionMessages.tsx (1 import)
- /home/node/sudoku-web/apps/sudoku/src/hooks/localStorage.test.ts (1 import)
- /home/node/sudoku-web/apps/sudoku/src/hooks/useLocalStorage.test.ts (1 import)

### Deleted Files (Duplicates)
- /home/node/sudoku-web/apps/template/src/types/subscriptionContext.ts
- /home/node/sudoku-web/apps/template/src/types/StateType.ts
- /home/node/sudoku-web/apps/template/src/types/userProfile.ts

**Total Files Modified**: ~20
**Total New Files**: 6
**Total Files Deleted**: 3+

---

## Post-Migration

Once complete, update project documentation:

1. Update `/home/node/sudoku-web/CLAUDE.md` with new type organization
2. Add entry to any architecture documentation
3. Create a commit message documenting the reorganization
4. Consider adding a comment in packages/types/src/index.ts explaining its purpose

