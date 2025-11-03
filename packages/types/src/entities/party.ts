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
