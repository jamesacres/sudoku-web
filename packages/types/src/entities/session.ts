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
