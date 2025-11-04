# Party Type Conflict Resolution Guide

## Problem Overview

The SessionsProvider cannot compile because it imports from a non-existent file (`userSessions.ts`) and uses Party types that exist in multiple conflicting locations.

## Type Definition Map

```
PARTY TYPES IN CODEBASE:

packages/types/src/entities/
  party.ts
    - Party (entity type)
    - PartySettings
    - Parties<T> (generic)
    
    partyMember.ts
    - PartyMember (entity type)
    - PartyInvitation

packages/template/src/types/
  serverTypes.ts
    - PartyResponse (API response)
    - Party (extends PartyResponse + computed)
    - Member (extends MemberResponse + computed)
    - Parties<T> (specific with SessionParty)
    - Session<T>
    - ServerStateResult<T>
    
  Party.ts [REDUNDANT]
    - PartySettings
    - Party (copy of @sudoku-web/types version)
    - Parties<T>
    
  PartyMember.ts
    - PartyMember (copy of @sudoku-web/types version)
    - PartyInvitation
    
  index.ts
    - Re-exports everything

packages/sudoku/src/types/
  serverTypes.ts [DUPLICATE]
    - Identical copy of template/src/types/serverTypes.ts
    - Party, Member, Parties, etc.

packages/sudoku/src/providers/
  PartiesProvider/PartiesProvider.tsx
    - Imports Party from '@sudoku-web/template'
    - Uses party.members - REQUIRES API Party
```

## Current Type Usage

### SessionsProvider Needs
File: `packages/template/src/providers/SessionsProvider/SessionsProvider.tsx`

**Line 15:** `import { Party } from '../../types/serverTypes';`

**Code that requires the API Party with members:**
```typescript
// Line 33
fetchFriendSessions: (parties: Party[]) => Promise<void>;

// Line 243
async (parties: Party[]) => {
  // Line 259
  .flatMap(({ members }) => members)  // REQUIRES members field

  // Line 286
  party.members.some((member) => member.userId === userId)  // REQUIRES members
  
  // Line 294
  partyId: userParty.partyId  // OK in both types
}

// Line 345
async (parties: Party[]) => {
  // Line 359
  (parties: Party[], sessionId: string): Parties<Session<ServerState>>
  
  // Line 363
  [party.partyId]: {  // OK in both
```

**Conclusion:** SessionsProvider MUST import Party from `serverTypes` because it needs the `members[]` field.

### Missing Import
File: `packages/template/src/providers/SessionsProvider/SessionsProvider.tsx`

**Line 19:** `import { UserSession, UserSessions } from '../../types/userSessions';`

**File does not exist.** Need to create it.

## Solution Steps

### STEP 1: Create the Missing userSessions File

**File Path:** `/home/node/sudoku-web/packages/template/src/types/userSessions.ts`

**Content:**
```typescript
/**
 * User session tracking for friend/collaborative sessions
 * 
 * Used by SessionsProvider to track sessions of friends in parties
 * for real-time multiplayer/racing features
 */

import { ServerStateResult } from './serverTypes';
import { ServerState } from '@sudoku-web/sudoku';

/**
 * Represents sessions for a single user
 * Includes loading state and optional session list
 */
export interface UserSession {
  isLoading: boolean;
  sessions?: ServerStateResult<ServerState>[];
}

/**
 * Map of user IDs to their sessions
 * Record<userId, UserSession>
 */
export type UserSessions = Record<string, UserSession | undefined>;
```

### STEP 2: Update Type Exports

**File Path:** `/home/node/sudoku-web/packages/template/src/types/index.ts`

**Add these lines:**
```typescript
// User session tracking
export type { UserSession, UserSessions } from './userSessions';
```

**Updated file should look like:**
```typescript
// Template package type exports

// Re-export entity types from @sudoku-web/types
export type {
  Party,
  PartySettings,
  Parties,
  PartyMember,
  PartyInvitation,
  Session,
  CollaborativeSession,
  UserProfile,
} from '@sudoku-web/types';
export { StateType, SubscriptionContext } from '@sudoku-web/types';

// Template-specific API response types from serverTypes
export type {
  SessionResponse,
  SessionParty,
  StateResponse,
  ServerStateResult,
  PartyResponse,
  MemberResponse,
  Member,
  InviteResponse,
  Invite,
  PublicInvite,
} from './serverTypes';
export { EntitlementDuration } from './serverTypes';

// User session tracking
export type { UserSession, UserSessions } from './userSessions';
```

### STEP 3: Remove Type Duplication (Optional but Recommended)

**Delete these files:**
1. `packages/sudoku/src/types/serverTypes.ts` - DUPLICATE
2. `packages/template/src/types/Party.ts` - REDUNDANT

**Reason:** These are copies of types already in serverTypes.ts and @sudoku-web/types

**Update sudoku package imports:**

File: `packages/sudoku/src/types/index.ts`
```typescript
// Change from local import
// import type { Parties } from './serverTypes';

// To re-export from template
export type { Parties } from '@sudoku-web/template';
```

### STEP 4: Add Documentation Comments

**Update serverTypes.ts with JSDoc:**

```typescript
/**
 * API-specific Party type with member details
 * 
 * This is the Party type returned from the server API.
 * It includes:
 * - Full member objects (unlike entity Party)
 * - Computed flags (isOwner, isUser)
 * - API-specific fields (appId, entitlementDuration)
 * 
 * Use this when you need member details or interaction with the server.
 * Use @sudoku-web/types Party for generic domain logic.
 */
export interface Party extends Omit<PartyResponse, 'createdAt' | 'updatedAt'> {
  createdAt: Date;
  updatedAt: Date;
  isOwner: boolean;
  members: Member[];
}
```

## File-by-File Changes

### NEW FILE: `packages/template/src/types/userSessions.ts`
Status: CREATE NEW
```typescript
import { ServerStateResult } from './serverTypes';
import { ServerState } from '@sudoku-web/sudoku';

export interface UserSession {
  isLoading: boolean;
  sessions?: ServerStateResult<ServerState>[];
}

export type UserSessions = Record<string, UserSession | undefined>;
```

### MODIFY: `packages/template/src/types/index.ts`
Status: ADD EXPORTS
```diff
+ export type { UserSession, UserSessions } from './userSessions';
```

### DELETE: `packages/sudoku/src/types/serverTypes.ts`
Status: REMOVE (duplicate)

### DELETE: `packages/template/src/types/Party.ts`
Status: REMOVE (redundant - use @sudoku-web/types instead)

### MODIFY: `packages/sudoku/src/types/index.ts`
Status: UPDATE IMPORTS
```diff
- export type { Parties } from './serverTypes';
+ export type { Parties } from '@sudoku-web/template';
```

## Verification Checklist

After making changes, verify:

- [ ] SessionsProvider imports resolve without errors
- [ ] PartiesProvider imports resolve without errors
- [ ] No duplicate type definitions
- [ ] All Party usages have access to `members` field
- [ ] UserSessions type is exported from @sudoku-web/template
- [ ] Tests compile and pass
- [ ] Type checking passes (`npm run lint`)

## Type Usage Decision Tree

```
WHEN TO USE WHICH PARTY TYPE:

Does your code need the members array?
├─ YES → Use Party from serverTypes
│        (template/src/types/serverTypes.ts)
│        Examples: SessionsProvider, PartiesProvider, serverStorage
│
└─ NO → Does it need API-specific fields?
        ├─ YES → Use PartyResponse and transform manually
        │        (for building responses)
        │
        └─ NO → Use Party from @sudoku-web/types
               (for domain logic, pure entities)
               Examples: Generic domain models
```

## Summary of Changes

| File | Change | Reason |
|------|--------|--------|
| `userSessions.ts` | CREATE | Missing dependency for SessionsProvider |
| `types/index.ts` | UPDATE | Export new types |
| `sudoku/types/serverTypes.ts` | DELETE | Duplicate of template version |
| `template/types/Party.ts` | DELETE | Redundant - use @sudoku-web/types |
| `sudoku/types/index.ts` | UPDATE | Import from correct location |

## Related Documentation

See also:
- `PARTY_TYPE_ANALYSIS.md` - Detailed analysis of all Party types
- `PARTY_TYPE_QUICK_REFERENCE.md` - Quick lookup guide

