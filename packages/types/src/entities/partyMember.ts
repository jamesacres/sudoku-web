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
