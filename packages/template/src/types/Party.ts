// Party entity types
export interface PartySettings {
  maxMembers?: number;            // Maximum allowed members
  isPublic: boolean;              // Public vs private party
  invitationRequired: boolean;    // Whether invitations are required to join
}

export interface Party {
  partyId: string;                // Unique party identifier
  name: string;                   // Party/group name
  description?: string;           // Optional description
  createdBy: string;             // Creator user ID (owner)
  createdAt: Date;               // Party creation time
  updatedAt: Date;               // Last modification time
  settings?: PartySettings;       // Party configuration
}

// Generic parties container indexed by party ID
export type Parties<T> = Record<string, Party & { memberSessions: Record<string, T> }>;
