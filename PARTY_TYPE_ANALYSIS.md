# Party Type Conflict Analysis

## Overview
The codebase has THREE different Party-related type definitions across different locations:

1. **@sudoku-web/types** - Canonical entity type definition (packages/types/src/entities/party.ts)
2. **@sudoku-web/template** local - Server API response wrapper (packages/template/src/types/serverTypes.ts)
3. **@sudoku-web/sudoku** local - Server API response wrapper (packages/sudoku/src/types/serverTypes.ts)

Additionally, there are companion type definitions in:
- packages/template/src/types/Party.ts (re-exports from @sudoku-web/types)
- packages/template/src/types/PartyMember.ts
- packages/types/src/entities/partyMember.ts

## Type Definition Comparison

### 1. @sudoku-web/types - Canonical Entity Type
**Location:** packages/types/src/entities/party.ts
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
  createdAt: Date;      // Already Date object
  updatedAt: Date;      // Already Date object
  settings?: PartySettings;
}

export type Parties<T> = Record<
  string,
  Party & { memberSessions: Record<string, T> }
>;
```

**Purpose:** Canonical entity definition for internal application logic
**Fields:** Simple, focused on party metadata and settings
**Date Handling:** Uses Date objects directly
**Includes Members:** No, keeps separate concerns

---

### 2. @sudoku-web/template - Server API Response Type
**Location:** packages/template/src/types/serverTypes.ts
```typescript
export interface PartyResponse {
  partyId: string;
  appId: string;                    // API-specific field
  partyName: string;                // Different field name
  createdBy: string;
  maxSize?: number;
  entitlementDuration?: EntitlementDuration;
  createdAt: string;                // String from API
  updatedAt: string;                // String from API
}

export interface MemberResponse {
  userId: string;
  resourceId: string;
  memberNickname: string;
  createdAt: string;
  updatedAt: string;
}

export interface Member extends Omit<MemberResponse, 'createdAt' | 'updatedAt'> {
  createdAt: Date;                  // Converted to Date
  updatedAt: Date;                  // Converted to Date
  isOwner: boolean;                 // Computed field
  isUser: boolean;                  // Computed field
}

export interface Party extends Omit<PartyResponse, 'createdAt' | 'updatedAt'> {
  createdAt: Date;
  updatedAt: Date;
  isOwner: boolean;                 // Computed field
  members: Member[];                // Full member objects included
}

export interface Parties<T> {
  [partyId: string]: SessionParty<T> | undefined;
}

export interface SessionParty<T> {
  memberSessions: {
    [userId: string]: T | undefined;
  };
}
```

**Purpose:** API response handling - converts raw API data to application-ready format
**Fields:** Includes API-specific fields and computed boolean flags
**Date Handling:** Converts string dates to Date objects
**Includes Members:** Yes, fully hydrated with member details

---

### 3. @sudoku-web/sudoku - Server API Response Type (duplicate)
**Location:** packages/sudoku/src/types/serverTypes.ts
```typescript
// IDENTICAL to packages/template/src/types/serverTypes.ts
// Same Party, Member, PartyResponse, MemberResponse definitions
```

**Purpose:** Duplicate for sudoku package use
**Note:** This creates code duplication

---

### 4. Local Re-export in Template
**Location:** packages/template/src/types/Party.ts
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

**Purpose:** Local copy (same as @sudoku-web/types entity definition)
**Status:** Appears to be a partial duplication or legacy file

---

## Key Differences Summary

| Aspect | @sudoku-web/types Entity | serverTypes API Response |
|--------|--------------------------|------------------------|
| **Party Field Name** | `name` | `partyName` |
| **Extra Fields** | None | `appId`, `maxSize`, `entitlementDuration` |
| **Date Format** | `Date` objects | String (converted to Date) |
| **Includes Members** | No | Yes (full Member[] array) |
| **Computed Flags** | None | `isOwner`, `isUser` |
| **Parties Type** | Generic `Record<K, Party & { memberSessions }>` | Specific shape with SessionParty |
| **Use Case** | Generic domain model | API-specific response handling |

---

## Current Usage in Codebase

### SessionsProvider (packages/template/src/providers/SessionsProvider/SessionsProvider.tsx)
**Party Type Used:** `Party` from serverTypes (line 15)
```typescript
import { Party } from '../../types/serverTypes';
```

**Why This Matters:**
- Line 33: `fetchFriendSessions: (parties: Party[]) => Promise<void>;`
- Line 259: `party.members.some((member) => member.userId === userId)` 
- Line 294: `partyId: userParty.partyId`

**Required Fields Used:**
- `partyId` - present in both types
- `members` - ONLY in serverTypes Party
- `members[].userId` - ONLY in serverTypes Party

**Conclusion:** MUST use serverTypes.Party (not entity Party) because it needs the `members` array

---

### PartiesProvider (packages/sudoku/src/providers/PartiesProvider/PartiesProvider.tsx)
**Party Type Used:** `Party` from '@sudoku-web/template' (line 9)
```typescript
import { UserContext, useServerStorage, Party } from '@sudoku-web/template';
```

**Where Party is Used:**
- Line 13: `parties: Party[];` - stored as array
- Line 62: `const [parties, setParties] = useState<Party[]>([]);`
- Line 136: `party.members.find((member) => member.userId === userId)`

**Required Fields Used:**
- `partyId` - present in both
- `members` - ONLY in serverTypes Party
- `members[].userId` - ONLY in serverTypes Party

**Conclusion:** ALSO needs serverTypes.Party for the `members` field

---

### serverStorage Hook (packages/template/src/hooks/serverStorage.ts)
**Party Type Used:** `Party` from './types/serverTypes' (line 12)
```typescript
import { Party, PartyResponse, Member, MemberResponse } from '../types/serverTypes';
```

**Transformation Logic (lines 60-72):**
```typescript
const partyResponseToResult = (
  party: PartyResponse,
  members: Member[],
  user: UserProfile | undefined
) => {
  return {
    ...party,
    members,
    createdAt: new Date(party.createdAt),
    updatedAt: new Date(party.updatedAt),
    isOwner: party.createdBy === user?.sub,
  };
};
```

**Returns:** serverTypes.Party (with members included)

**Conclusion:** Returns serverTypes.Party which includes the computed fields and members array

---

## Missing File: userSessions

### Current Import Error
**File:** packages/template/src/providers/SessionsProvider/SessionsProvider.tsx
**Line 19:** `import { UserSession, UserSessions } from '../../types/userSessions';`

**File Does Not Exist:** packages/template/src/types/userSessions.ts

### Type Requirements Inferred from Code Usage

#### UserSession Type (lines 408-417)
```typescript
const userSession: UserSession = {
  ...friendSessions[userId],
  isLoading: friendSessions[userId].isLoading,
  sessions: [
    ...friendSessions[userId].sessions.filter(
      (session) => session.sessionId !== sessionId
    ),
    newSession,
  ],
};
```

#### UserSessions Type (lines 265-274)
```typescript
const loadingStates: UserSessions = {};
friendUserIds.forEach((userId) => {
  if (
    !friendSessionsRef.current[userId] ||
    (!friendSessionsRef.current[userId]?.isLoading &&
      !friendSessionsRef.current[userId]?.sessions)
  ) {
    loadingStates[userId] = { isLoading: true };
  }
});
```

#### State Declaration (line 58)
```typescript
const [friendSessions, setFriendSessions] = useState<UserSessions>({});
```

#### Usage Pattern (lines 321-330)
```typescript
setFriendSessions((prev) => {
  const updated = { ...prev };
  results.forEach(({ userId, sessions }) => {
    updated[userId] = {
      isLoading: false,
      sessions: sessions || undefined,
    };
  });
  return updated;
});
```

#### Access Pattern (lines 365-368)
```typescript
const userSession = allUserSessions?.sessions?.find(
  (session) => session.sessionId === sessionId
);
```

### Inferred Type Definitions

```typescript
// UserSession - represents sessions for a single friend/user
export interface UserSession {
  isLoading: boolean;
  sessions?: ServerStateResult<ServerState>[];
}

// UserSessions - map of user IDs to their sessions
export type UserSessions = Record<string, UserSession | undefined>;
```

### Where It Fits

```typescript
SessionsContextType {
  // ... other fields
  friendSessions: UserSessions;  // Record<userId, UserSession>
  fetchFriendSessions: (parties: Party[]) => Promise<void>;
}
```

---

## Type Resolution Recommendations

### Issue 1: Party Type Duplication
**Problem:** Three separate Party definitions with similar but conflicting purposes

**Current State:**
- @sudoku-web/types: Generic entity definition (cleanest)
- packages/template/src/types/serverTypes: API response with members
- packages/sudoku/src/types/serverTypes: Duplicate of template version
- packages/template/src/types/Party.ts: Local copy of entity definition

**Recommendations:**

#### Option A: Keep Separate (RECOMMENDED)
**Rationale:** Each type serves a distinct purpose
- **Entity Party** (@sudoku-web/types): Domain model for general use
- **API Party** (serverTypes): API-specific response format with computed fields

**Actions:**
1. Keep @sudoku-web/types/entities/party.ts for domain model
2. Keep template/src/types/serverTypes.ts Party for API responses
3. Delete duplicate packages/sudoku/src/types/serverTypes.ts
4. Update @sudoku-web/sudoku to import from @sudoku-web/template/types/serverTypes
5. Delete packages/template/src/types/Party.ts (redundant)
6. Update packages/template/src/types/index.ts to clarify exports

**Benefits:**
- Clear separation of concerns
- API-specific fields (`appId`, `entitlementDuration`) only in API layer
- Computed fields (`isOwner`, `isUser`) only where needed
- Members array only in contexts that need it

#### Option B: Consolidate to Single Party Type
**Rationale:** Unify types for simplicity
- Combine all fields into one definition

**Drawbacks:**
- API-specific fields leak into domain model
- Harder to maintain separation of concerns
- Requires field renaming (name vs partyName)

**Not Recommended** due to architectural concerns

### Issue 2: Missing userSessions File

**Solution:** Create packages/template/src/types/userSessions.ts

**File Content:**
```typescript
// User session tracking for friend/collaborative sessions
import { ServerStateResult } from './serverTypes';
import { ServerState } from '@sudoku-web/sudoku';

export interface UserSession {
  isLoading: boolean;
  sessions?: ServerStateResult<ServerState>[];
}

export type UserSessions = Record<string, UserSession | undefined>;
```

**Export from index.ts:**
Add to packages/template/src/types/index.ts:
```typescript
export type { UserSession, UserSessions } from './userSessions';
```

### Issue 3: Parties Type Inconsistency

**Problem:** `Parties<T>` type differs between definitions:

```typescript
// @sudoku-web/types version (generic)
export type Parties<T> = Record<
  string,
  Party & { memberSessions: Record<string, T> }
>;

// serverTypes version (specific)
export interface Parties<T> {
  [partyId: string]: SessionParty<T> | undefined;
}
```

**Recommendation:**
- Use serverTypes.Parties<T> for API/server data
- Use @sudoku-web/types Parties<T> for generic domain use
- Add JSDoc comments to clarify distinction

---

## Implementation Plan

### Step 1: Create Missing File
Create `/home/node/sudoku-web/packages/template/src/types/userSessions.ts`

### Step 2: Update Exports
Update `/home/node/sudoku-web/packages/template/src/types/index.ts`
- Add UserSession and UserSessions exports

### Step 3: Remove Duplication
- Delete or consolidate duplicate Party type definitions
- Keep serverTypes.Party as the API response type
- Keep @sudoku-web/types Party for domain model

### Step 4: Fix Imports in Sudoku Package
- Update PartiesProvider and other files to import from correct source
- Ensure consistency

### Step 5: Documentation
- Add JSDoc comments clarifying which Party type to use where
- Document the transformation from API responses to domain models

---

## Summary Table

| File | Type | Purpose | Party Includes Members |
|------|------|---------|----------------------|
| @sudoku-web/types/entities/party.ts | Entity | Domain model | No |
| @sudoku-web/template/types/serverTypes.ts | API Response | Server data | Yes |
| @sudoku-web/sudoku/types/serverTypes.ts | API Response (duplicate) | Should be removed | Yes |
| @sudoku-web/template/types/Party.ts | Redundant | Should be deleted | No |
| (missing) userSessions.ts | Domain | Friend session state | N/A |

