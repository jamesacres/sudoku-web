# Type Definitions Analysis Report

## Executive Summary

This report analyzes type definitions across the sudoku-web monorepo to identify which should be in `packages/types` (shared, generic) vs `packages/template` (template-specific) vs app-level definitions (apps/sudoku, apps/template).

## Current State Overview

### Directory Structure
```
packages/
├── types/         (Currently empty placeholder)
│   └── src/index.ts (exports {})
├── sudoku/        (Game-specific types)
│   └── src/types/
├── template/      (Contains both generic and specific types)
│   └── src/types/
├── auth/
├── ui/
└── shared/

apps/
├── sudoku/        (Re-exports from packages)
│   └── src/types/
└── template/      (Contains types and re-exports)
    └── src/types/
```

## Type Files Inventory

### packages/types/src
- **index.ts** - EMPTY (placeholder only)

### packages/template/src/types (8 files)
1. **subscriptionContext.ts** - SubscriptionContext enum (generic to template)
2. **StateType.ts** - StateType enum (generic to template)
3. **userProfile.ts** - UserProfile interface (generic)
4. **serverTypes.ts** - Complex types (generic, multi-use)
5. **Party.ts** - Party entity types (generic)
6. **PartyMember.ts** - Party membership types (generic)
7. **Session.ts** - Session entity types (generic)
8. **index.ts** - Exports from above

### apps/template/src/types (8 files - DUPLICATES)
1. **subscriptionContext.ts** - SubscriptionContext enum (duplicate)
2. **StateType.ts** - StateType enum (duplicate)
3. **userProfile.ts** - UserProfile interface (duplicate)
4. **serverTypes.ts** - Complex types (duplicate)
5. **userSessions.ts** - UserSession interfaces
6. **tabs.ts** - Tab enum (app-specific)
7. **index.ts** - Exports from above
8. (Missing: Party.ts, PartyMember.ts, Session.ts)

### packages/sudoku/src/types (8 files - game-specific)
1. **Cell.ts** - Sudoku cell type
2. **SudokuGrid.ts** - Grid and state types
3. **notes.ts** - Note-taking types
4. **puzzle.ts** - Puzzle definitions
5. **state.ts** - Game state types
6. **timer.ts** - Timer types
7. **serverTypes.ts** - Server communication types
8. **index.ts** - Exports

### apps/sudoku/src/types
- **index.ts** - Re-exports from @sudoku-web/sudoku and @sudoku-web/template

### packages/auth/src/types (3 files)
1. **User.ts** - User interface
2. **AuthToken.ts** - Auth token types
3. **UserProfile.ts** - User profile (similar to template)
4. **index.ts** - Exports

### apps/sudoku/src/components/leaderboard/types.ts (app-specific)
- FriendsLeaderboardScore
- PuzzleType
- ScoringResult
- AllFriendsSessionsMap

### packages/ui/src/types
- ThemeConfig.ts

---

## Type Analysis by Category

### 1. DUPLICATES (Priority: HIGH - MOVE to packages/types)

#### SubscriptionContext
```typescript
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
- **Location**: apps/template/src/types/subscriptionContext.ts, packages/template/src/types/subscriptionContext.ts
- **Generic?**: YES - Used across multiple apps
- **Used by**: 
  - packages/sudoku/src/hooks/gameState.ts
  - packages/template/src/providers/RevenueCatProvider
  - apps/sudoku/src/components/SudokuSidebar
  - apps/sudoku/src/config/subscriptionMessages.tsx
- **Recommendation**: MOVE to packages/types
- **Status**: Generic, used by multiple packages

#### StateType
```typescript
export enum StateType {
  PUZZLE = 'PUZZLE',
  TIMER = 'TIMER',
}
```
- **Location**: apps/template/src/types/StateType.ts, packages/template/src/types/StateType.ts
- **Generic?**: YES - Used for state type discrimination
- **Used by**:
  - packages/template/src/hooks/serverStorage.ts
  - packages/template/src/hooks/localStorage.ts
  - apps/sudoku/src/hooks/gameState.ts
  - apps/sudoku/src/hooks/useLocalStorage.test.ts
- **Recommendation**: MOVE to packages/types
- **Status**: Generic, used across multiple packages

#### UserProfile
```typescript
export interface UserProfile {
  sub: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
}
```
- **Location**: apps/template/src/types/userProfile.ts, packages/template/src/types/userProfile.ts
- **Exists also in**: packages/auth/src/types/UserProfile.ts
- **Generic?**: YES - Standard auth profile
- **Recommendation**: CONSOLIDATE in packages/types or packages/auth
- **Status**: Duplicate across template and auth packages

### 2. GENERIC TYPES (Priority: HIGH - MOVE to packages/types)

These are non-app-specific types that are reusable across applications.

#### Session & SessionParty Types
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

export interface SessionParty<T> {
  memberSessions: {
    [userId: string]: T | undefined;
  };
}
```
- **Location**: packages/template/src/types/Session.ts, apps/template/src/types/serverTypes.ts
- **Generic?**: YES - Generic session management
- **Used by**: Multiple packages
- **Recommendation**: MOVE to packages/types
- **Reason**: Generic entity types used across packages

#### Party & PartyMember Types
```typescript
export interface Party {
  partyId: string;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  settings?: PartySettings;
}

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
- **Location**: packages/template/src/types/Party.ts, packages/template/src/types/PartyMember.ts
- **Generic?**: YES - Party/group collaboration types
- **Used by**: Multiple packages
- **Recommendation**: MOVE to packages/types
- **Reason**: Generic entity types for collaborative features

#### Entitlement & Server Communication Types
```typescript
export enum EntitlementDuration {
  LIFETIME = 'lifetime',
  ONE_MONTH = 'one_month',
  ONE_YEAR = 'one_year',
}

// Includes: PartyResponse, MemberResponse, InviteResponse, Member, Party, Invite, PublicInvite
// Includes: SudokuOfTheDayResponse, SudokuOfTheDay, SudokuBookPuzzle, SudokuBookOfTheMonthResponse
```
- **Location**: packages/sudoku/src/types/serverTypes.ts, packages/template/src/types/serverTypes.ts
- **Generic?**: YES - Server API types
- **Used by**: Multiple packages
- **Recommendation**: CONSOLIDATE in packages/types or packages/sudoku
- **Note**: Currently in sudoku package, also duplicated in template

### 3. APP-SPECIFIC TYPES (Priority: LOW - KEEP in apps)

#### Tab (apps/template specific)
```typescript
export enum Tab {
  START_PUZZLE = 'START_PUZZLE',
  MY_PUZZLES = 'MY_PUZZLES',
  FRIENDS = 'FRIENDS',
}
```
- **Location**: apps/template/src/types/tabs.ts
- **App-specific?**: YES - Template UI-specific
- **Used by**: apps/template UI components
- **Recommendation**: KEEP in apps/template/src/types

#### UserSessions (apps/template specific)
```typescript
export interface UserSession {
  isLoading: boolean;
  sessions?: ServerStateResult<ServerState>[];
}

export interface UserSessions {
  [userId: string]: UserSession | undefined;
}
```
- **Location**: apps/template/src/types/userSessions.ts
- **App-specific?**: MAYBE - Could be generic
- **Used by**: apps/template state management
- **Recommendation**: CONSIDER moving to packages/types (is generic structure)

#### FriendsLeaderboardScore (apps/sudoku specific)
```typescript
export interface FriendsLeaderboardScore {
  userId: string;
  username: string;
  totalScore: number;
  breakdown: { /* scoring details */ };
  stats: { /* statistics */ };
}
```
- **Location**: apps/sudoku/src/components/leaderboard/types.ts
- **App-specific?**: YES - Scoring calculation specific to sudoku
- **Used by**: Leaderboard components in sudoku app
- **Recommendation**: KEEP in apps/sudoku or MOVE to packages/sudoku if reusable

### 4. SUDOKU GAME-SPECIFIC TYPES (Priority: MEDIUM - Already well-placed)

Located in packages/sudoku/src/types - these are game-logic specific and appropriately placed:
- **Cell, SudokuGrid, Puzzle** - Game logic
- **Notes** - Game feature
- **Timer** - Game feature
- **GameState, ServerState** - Game state management

**Recommendation**: KEEP in packages/sudoku - These are specific to sudoku game logic

---

## Dependency Analysis

### What Currently Imports What
```
apps/sudoku imports from:
  - @sudoku-web/sudoku (game types)
  - @sudoku-web/template (SubscriptionContext, StateType, UserProfile, Party, Invite, Session)

apps/template imports from:
  - @sudoku-web/template (various types)
  - Local types (Tab, UserSessions)

packages/sudoku imports from:
  - @sudoku-web/template (SubscriptionContext for gameState hook)

packages/template imports from:
  - @sudoku-web/auth
  - @sudoku-web/shared
  - @sudoku-web/types (declared but empty)
```

---

## Recommended Type Organization

### packages/types/src/index.ts (SHARED GENERIC TYPES)
Move the following types from packages/template to packages/types:

1. **subscriptionContext.ts**
   - SubscriptionContext enum
   - Reason: Generic, used by sudoku and template packages

2. **stateType.ts**
   - StateType enum
   - Reason: Generic state discrimination, used across packages

3. **entities.ts** (NEW - consolidate entity types)
   - Party, PartySettings interfaces
   - PartyMember, PartyInvitation interfaces
   - Session, CollaborativeSession interfaces
   - Reason: Generic entity types for collaboration features

4. **user.ts** (consolidate auth-related)
   - UserProfile interface (consolidate from auth and template)
   - Reason: Standard user profile from auth spec

5. **entitlements.ts** (or move to sudoku package)
   - EntitlementDuration enum
   - Reason: Server API type, but tied to puzzle entitlements

### packages/template/src/types - KEEP
After moving generic types, only keep template-specific types:
- Consider what remains after generics are extracted

### packages/sudoku/src/types - KEEP (Already good)
Keep all sudoku-specific types:
- Cell, SudokuGrid, Puzzle, Notes, Timer
- GameState, ServerState (game-specific state)
- Difficulty, BookPuzzleDifficulty (game-specific)

### packages/auth/src/types - KEEP/CONSOLIDATE
Keep or consolidate:
- User, UserPreferences
- AuthToken, SessionState
- Consolidate UserProfile with packages/types

### apps/sudoku/src/types - Keep re-exports only
Change to re-export from packages/@sudoku-web/sudoku

### apps/template/src/types - Keep app-specific only
Keep only:
- Tab enum (UI-specific)
- userSessions.ts (app-specific state)
- Re-export from packages/@sudoku-web/template

---

## Migration Plan Summary

### Phase 1: Create Shared Types Package (packages/types)
1. Create new type files in packages/types/src/:
   - subscriptionContext.ts
   - stateType.ts
   - entities.ts (Party, PartyMember, Session, CollaborativeSession)
   - userProfile.ts

2. Update packages/types/src/index.ts to export all new types

3. Update package.json for packages/sudoku to depend on @sudoku-web/types

### Phase 2: Update Imports
1. Update packages/template to import from @sudoku-web/types instead of local types
2. Update packages/sudoku to import SubscriptionContext from @sudoku-web/types
3. Update apps to import from appropriate packages

### Phase 3: Cleanup
1. Remove duplicate type files from apps/template/src/types
2. Remove now-unused type exports from packages/template/src/types
3. Update apps/sudoku/src/types/index.ts to properly re-export

### Phase 4: Consolidate Entity Types
1. Consider creating a single authoritative location for server API types
2. Choose between packages/sudoku or packages/types for EntitlementDuration, etc.
3. Consolidate serverTypes.ts duplication

---

## Detailed Recommendations Matrix

| Type Name | Current Location | Classification | Recommended Location | Priority | Action |
|-----------|------------------|-----------------|----------------------|----------|--------|
| SubscriptionContext | apps/template, packages/template | Generic, Multi-use | packages/types | HIGH | Move & dedup |
| StateType | apps/template, packages/template | Generic, Multi-use | packages/types | HIGH | Move & dedup |
| UserProfile | apps/template, packages/template, packages/auth | Generic, Duplicate | packages/types | HIGH | Consolidate |
| Party, PartySettings | packages/template | Generic entity | packages/types | HIGH | Move |
| PartyMember, PartyInvitation | packages/template | Generic entity | packages/types | HIGH | Move |
| Session, CollaborativeSession | packages/template | Generic entity | packages/types | MEDIUM | Move |
| UserSession, UserSessions | apps/template | App-specific state | apps/template | LOW | Keep |
| Tab | apps/template | UI enum | apps/template | LOW | Keep |
| FriendsLeaderboardScore | apps/sudoku | Sudoku-specific | apps/sudoku or packages/sudoku | LOW | Keep (consider moving to packages/sudoku) |
| Cell, SudokuGrid, Puzzle | packages/sudoku | Game-specific | packages/sudoku | N/A | Keep |
| Timer | packages/sudoku | Game-specific | packages/sudoku | N/A | Keep |
| GameState, ServerState | packages/sudoku | Game-specific | packages/sudoku | N/A | Keep |
| EntitlementDuration | packages/sudoku | Server API | packages/sudoku or packages/types | MEDIUM | Consolidate/clarify |
| Other server types | packages/sudoku | Server API | packages/sudoku | N/A | Keep |

---

## Specific File Structure After Migration

### packages/types/src/
```
├── index.ts                 (main exports)
├── subscriptionContext.ts   (moved from template)
├── stateType.ts             (moved from template)
├── userProfile.ts           (consolidated from auth/template)
├── entities.ts              (moved from template)
│   ├── Party
│   ├── PartyMember
│   ├── Session
│   └── CollaborativeSession
```

### packages/template/src/types/
```
├── index.ts                 (exports from packages/types + remaining)
└── (only template-specific types remain)
```

### apps/template/src/types/
```
├── index.ts                 (re-exports from packages)
├── tabs.ts                  (app-specific)
└── userSessions.ts          (app-specific state)
```

### apps/sudoku/src/types/
```
├── index.ts                 (re-exports from packages)
├── leaderboard/             (sudoku-specific scoring)
│   └── types.ts
```

---

## Impact Analysis

### Positive Impacts
- Eliminates type duplication (5-6 duplicated type definitions)
- Clarifies type ownership and reusability
- Reduces import confusion (unified source of truth)
- Enables better tree-shaking and smaller bundle sizes
- Follows monorepo best practices

### Potential Breaking Changes
- Any direct imports from packages/template/src/types need updating
- Apps importing directly from files need updating
- Build/type-checking may fail during transition

### Migration Effort
- Estimated 2-3 hours of refactoring
- Need to update ~15-20 import statements
- Should include test updates

