# Party Type Quick Reference Guide

## The Problem

There are **THREE Party definitions** in the codebase that are causing confusion:

1. **Entity Party** - Domain model from `@sudoku-web/types`
2. **API Party** (v1) - Server response in `@sudoku-web/template/src/types/serverTypes.ts`
3. **API Party** (v2) - Server response DUPLICATE in `@sudoku-web/sudoku/src/types/serverTypes.ts`

Plus a redundant local copy in `@sudoku-web/template/src/types/Party.ts`

## Quick Decision Table

| Context | Use This | Why |
|---------|----------|-----|
| **SessionsProvider** | `Party` from `serverTypes` | Needs `members` array |
| **PartiesProvider** | `Party` from `serverTypes` (via @sudoku-web/template) | Needs `members` array |
| **Generic domain logic** | `Party` from `@sudoku-web/types` | Clean, no API fields |
| **API transformation** | `PartyResponse` + conversion to serverTypes.Party | Proper API layer |

## Key Field Differences

### Entity Party (@sudoku-web/types)
```typescript
{
  partyId: string;
  name: string;              // Note: "name" not "partyName"
  description?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  settings?: PartySettings;
  // NO members field
}
```

### API Response Party (serverTypes)
```typescript
{
  partyId: string;
  partyName: string;         // Note: "partyName" not "name"
  appId: string;             // API-specific
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  maxSize?: number;          // API-specific
  entitlementDuration?: EntitlementDuration;  // API-specific
  isOwner: boolean;          // Computed
  members: Member[];         // FULL MEMBER OBJECTS
}
```

## The Missing File

**File:** `packages/template/src/types/userSessions.ts`
**Status:** DOES NOT EXIST - needs to be created

**What it should contain:**
```typescript
import { ServerStateResult } from './serverTypes';
import { ServerState } from '@sudoku-web/sudoku';

export interface UserSession {
  isLoading: boolean;
  sessions?: ServerStateResult<ServerState>[];
}

export type UserSessions = Record<string, UserSession | undefined>;
```

**Used in:** SessionsProvider for tracking friend sessions

## Code Usage Examples

### WRONG - Using Entity Party where members are needed
```typescript
// This will fail at runtime
import { Party } from '@sudoku-web/types';
// ...
party.members.find(m => m.userId === 'user-id');  // ERROR: members doesn't exist
```

### CORRECT - Using API Party with members
```typescript
// This works
import { Party } from '@sudoku-web/template';  // Re-exports from serverTypes
// ...
party.members.find(m => m.userId === 'user-id');  // OK
```

## What Needs to Be Fixed

### Priority 1: Create Missing userSessions.ts
- Location: `packages/template/src/types/userSessions.ts`
- Unblocks: SessionsProvider compilation

### Priority 2: Update Imports Clarity
- Add comments clarifying which Party to use
- Consolidate duplicate sudoku/types/serverTypes.ts
- Remove redundant template/src/types/Party.ts

### Priority 3: Documentation
- Add JSDoc comments to each Party definition
- Document the transformation layer (PartyResponse -> Party)

## Current Imports by Location

### Correct Imports
- `SessionsProvider`: `import { Party } from '../../types/serverTypes';` ✓
- `serverStorage`: `import { Party } from '../types/serverTypes';` ✓
- `PartiesProvider`: `import { Party } from '@sudoku-web/template';` ✓

### Problematic Imports
- `packages/sudoku/src/types/serverTypes.ts`: DUPLICATE of template version
- `packages/template/src/types/Party.ts`: REDUNDANT copy

## Action Items

1. Create `packages/template/src/types/userSessions.ts`
2. Update `packages/template/src/types/index.ts` to export UserSession and UserSessions
3. Delete `packages/sudoku/src/types/serverTypes.ts` (duplicate)
4. Delete `packages/template/src/types/Party.ts` (redundant)
5. Update sudoku package imports to use template's serverTypes
6. Add JSDoc comments to clarify purpose of each Party definition

## Related Types

### Member vs PartyMember
- `Member` (serverTypes) - With computed fields for ownership checks
- `PartyMember` (@sudoku-web/types) - Clean domain model

### Session vs CollaborativeSession
- Both from `@sudoku-web/types`
- `Session<T>` - Single user session
- `CollaborativeSession<T>` - Multi-party session with participants

