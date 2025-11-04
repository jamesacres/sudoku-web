# Party Type Field-by-Field Comparison

## Side-by-Side Type Definitions

### Entity Party (@sudoku-web/types/entities/party.ts)

```typescript
export interface Party {
  partyId: string;           // Party unique identifier
  name: string;              // Party display name
  description?: string;      // Optional description
  createdBy: string;         // Creator user ID
  createdAt: Date;           // Creation timestamp
  updatedAt: Date;           // Last update timestamp
  settings?: PartySettings;  // Optional configuration
}

export interface PartySettings {
  maxMembers?: number;
  isPublic: boolean;
  invitationRequired: boolean;
}

export type Parties<T> = Record<
  string,
  Party & { memberSessions: Record<string, T> }
>;
```

**Total Fields:** 7
**Complex Fields:** PartySettings (optional)
**Members Included:** No

---

### API Response Party (packages/template/src/types/serverTypes.ts)

```typescript
export interface PartyResponse {
  partyId: string;           // Party unique identifier
  appId: string;             // APPLICATION ID (API-ONLY)
  partyName: string;         // Party display name (DIFFERENT NAME)
  createdBy: string;         // Creator user ID
  maxSize?: number;          // Max party size (API-ONLY)
  entitlementDuration?: EntitlementDuration;  // (API-ONLY)
  createdAt: string;         // Creation timestamp (AS STRING)
  updatedAt: string;         // Last update timestamp (AS STRING)
}

export interface Party extends Omit<PartyResponse, 'createdAt' | 'updatedAt'> {
  createdAt: Date;           // Converted to Date
  updatedAt: Date;           // Converted to Date
  isOwner: boolean;          // COMPUTED: is current user owner?
  members: Member[];         // FULL MEMBER ARRAY
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

**Total Fields:** 9 (before omit/extend), 11 (after conversion)
**Complex Fields:** Member[] array (required)
**Members Included:** Yes

---

## Field Mapping and Differences

| Field Name | Entity Party | API Party | Type | Notes |
|------------|--------------|-----------|------|-------|
| partyId | ✓ | ✓ | string | Same in both |
| name | ✓ | ✗ | - | Entity uses "name" |
| partyName | ✗ | ✓ | string | API uses "partyName" |
| description | ✓ | ✗ | string? | Only in entity |
| settings | ✓ | ✗ | PartySettings? | Only in entity |
| createdBy | ✓ | ✓ | string | Same in both |
| createdAt | ✓ | ✓ | Date | Both Date in final form |
| updatedAt | ✓ | ✓ | Date | Both Date in final form |
| appId | ✗ | ✓ | string | API-specific |
| maxSize | ✗ | ✓ | number? | API-specific |
| entitlementDuration | ✗ | ✓ | enum? | API-specific |
| isOwner | ✗ | ✓ | boolean | API-computed |
| members | ✗ | ✓ | Member[] | API-included |

## Member Type Comparison

### Entity PartyMember (@sudoku-web/types/entities/partyMember.ts)

```typescript
export interface PartyMember {
  userId: string;
  partyId: string;
  memberNickname?: string;
  role: 'owner' | 'moderator' | 'member';
  joinedAt: Date;
  status: 'active' | 'invited' | 'declined' | 'left';
}
```

### API Member (packages/template/src/types/serverTypes.ts)

```typescript
export interface MemberResponse {
  userId: string;
  resourceId: string;
  memberNickname: string;
  createdAt: string;
  updatedAt: string;
}

export interface Member extends Omit<MemberResponse, 'createdAt' | 'updatedAt'> {
  createdAt: Date;
  updatedAt: Date;
  isOwner: boolean;      // COMPUTED
  isUser: boolean;       // COMPUTED
}
```

| Field Name | PartyMember | Member | Type | Notes |
|------------|------------|--------|------|-------|
| userId | ✓ | ✓ | string | Same |
| partyId | ✓ | ✗ | - | Only entity |
| memberNickname | ✓ | ✓ | string | Same |
| resourceId | ✗ | ✓ | string | API-specific |
| role | ✓ | ✗ | enum | Only entity |
| joinedAt | ✓ | ✗ | Date | Only entity |
| status | ✓ | ✗ | enum | Only entity |
| createdAt | ✗ | ✓ | Date | API version |
| updatedAt | ✗ | ✓ | Date | API version |
| isOwner | ✗ | ✓ | boolean | API-computed |
| isUser | ✗ | ✓ | boolean | API-computed |

## Why Both Types Exist

### Entity Party
**Purpose:** Domain model for business logic
**Origin:** Design/architecture
**Responsibilities:**
- Describe the party concept independent of API
- Include domain-specific fields (description, settings)
- Use clean names (name, not partyName)
- Omit computed/API-specific fields

### API Party
**Purpose:** Server response handler
**Origin:** API contract
**Responsibilities:**
- Mirror API response structure
- Include API-specific fields (appId, resourceId)
- Provide computed convenience fields (isOwner, isUser)
- Include fully hydrated member objects for queries
- Transform raw API data (string dates -> Date objects)

## Data Flow

```
API Response (JSON)
    ↓
PartyResponse (typed API contract)
    ↓
Party (computed fields + transformed dates + members added)
    ↓
SessionsProvider, PartiesProvider (consumers)
    ↓
Domain logic (may extract to entity Party for pure logic)
```

## When to Use Which Type

### Use Entity Party (@sudoku-web/types)

```typescript
// ✓ Good: Domain logic that doesn't need members
function isPartyAdmin(party: Party, userId: string): boolean {
  return party.createdBy === userId;
}

// ✓ Good: Pure business logic
function calculatePartyAge(party: Party): number {
  return Date.now() - party.createdAt.getTime();
}

// ✗ Bad: Would need members array
function isUserInParty(party: Party, userId: string): boolean {
  return party.members.some(m => m.userId === userId);  // ERROR: no members
}
```

### Use API Party (serverTypes.Party)

```typescript
// ✓ Good: Needs member details
function findUserInParty(party: Party, userId: string): Member | undefined {
  return party.members.find(m => m.userId === userId);
}

// ✓ Good: Needs computed owner flag
function canUserModify(party: Party, userId: string): boolean {
  return party.isOwner && party.createdBy === userId;
}

// ✓ Good: API-specific operations
function getPartyAppId(party: Party): string {
  return party.appId;  // API field
}
```

## Import Patterns

### Correct: Entity Party
```typescript
import { Party } from '@sudoku-web/types';
// or
import type { Party } from '@sudoku-web/types';

// Use when: Pure domain logic, no member details needed
```

### Correct: API Party
```typescript
import { Party } from '@sudoku-web/template/types/serverTypes';
// or
import type { Party } from '@sudoku-web/template';

// Use when: Member details or API operations needed
```

### Avoid: Ambiguous Imports
```typescript
// Confusing - which Party?
import { Party } from './types';

// Better - be explicit
import { Party as EntityParty } from '@sudoku-web/types';
import { Party as ApiParty } from '@sudoku-web/template/types/serverTypes';
```

## Type Hierarchy

```
PartyResponse (raw API response)
    ↓ extends + transforms
serverTypes.Party (API-ready with computed fields)
    ↓ uses in
SessionsProvider, PartiesProvider
    ↓ may extract back to
@sudoku-web/types.Party (for pure domain logic)
```

## Field Name Inconsistencies

### Problem: "name" vs "partyName"
- Entity: `party.name`
- API: `party.partyName`

**Why:**
- Entity uses clean domain terminology
- API reflects backend field names
- Transformation handles conversion in serverStorage

**Solution:**
Keep both - the distinction is intentional and documents the API boundary

## Summary Table: Which Fields to Access Where

| Operation | Type Needed | Example |
|-----------|-------------|---------|
| Get party ID | Either | `party.partyId` |
| Check if user owns | API | `party.isOwner` |
| Get members | API | `party.members` |
| Get creator ID | Either | `party.createdBy` |
| Get app ID | API | `party.appId` |
| Get description | Entity | `party.description` |
| Get settings | Entity | `party.settings` |
| Check member status | API | `party.members[0].isOwner` |
| Calculate age | Either | `Date.now() - party.createdAt` |

