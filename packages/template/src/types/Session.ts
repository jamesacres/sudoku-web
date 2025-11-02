// Session entity types
export interface Session<T = any> {
  sessionId: string;              // Unique session identifier
  userId: string;                 // Creator/owner user ID
  state: T;                       // Generic session state (game data, collaboration data, etc.)
  createdAt: Date;               // Session creation time
  updatedAt: Date;               // Last modification time
  expiresAt?: Date;              // Optional expiration time
}

// Generic collaborative session tracking
export interface CollaborativeSession<T> extends Session<T> {
  partyId: string;               // Associated party ID
  participantIds: string[];      // Active participant user IDs
}
