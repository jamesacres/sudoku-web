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
// Note: These have naming conflicts with entity types above, so consumers
// should import these directly from './serverTypes' when needed
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
