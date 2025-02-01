export interface SessionResponse<T> {
  sessionId: string;
  state: T;
  updatedAt: string;
}

export interface Session<T> {
  sessionId: string;
  state: T;
  updatedAt: Date;
}

export interface SessionParty<T> {
  memberSessions: {
    [userId: string]: T | undefined;
  };
}

export interface Parties<T> {
  [partyId: string]: SessionParty<T> | undefined;
}

export interface StateResponse<T> extends SessionResponse<T> {
  parties: Parties<SessionResponse<T>>;
}

export interface ServerStateResult<T> extends Session<T> {
  parties?: Parties<Session<T>>;
}

export interface PartyResponse {
  partyId: string;
  appId: string;
  partyName: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface MemberResponse {
  userId: string;
  resourceId: string;
  memberNickname: string;
  createdAt: string;
  updatedAt: string;
}

export interface Member
  extends Omit<MemberResponse, 'createdAt' | 'updatedAt'> {
  createdAt: Date;
  updatedAt: Date;
  isOwner: boolean;
  isUser: boolean;
}

export interface Party extends Omit<PartyResponse, 'createdAt' | 'updatedAt'> {
  createdAt: Date;
  updatedAt: Date;
  isOwner: boolean;
  members: Member[];
}

export interface InviteResponse {
  inviteId: string;
  resourceId: string;
  description?: string;
  sessionId?: string;
  redirectUri?: string;
  createdBy: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Invite
  extends Omit<InviteResponse, 'createdAt' | 'updatedAt' | 'expiresAt'> {
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PublicInvite
  extends Pick<
    Invite,
    'description' | 'resourceId' | 'sessionId' | 'redirectUri'
  > {}

export enum Difficulty {
  SIMPLE = 'simple',
  EASY = 'easy',
  INTERMEDIATE = 'intermediate',
  EXPERT = 'expert',
}

export interface SudokuOfTheDayResponse {
  sudokuId: string;
  difficulty: Difficulty;
  initial: string;
  final: string;
  createdAt: string;
  updatedAt: string;
}

export interface SudokuOfTheDay
  extends Omit<SudokuOfTheDayResponse, 'createdAt' | 'updatedAt'> {
  createdAt: Date;
  updatedAt: Date;
}
