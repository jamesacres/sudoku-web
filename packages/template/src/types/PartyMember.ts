// Party membership types
export interface PartyMember {
  userId: string; // Member user ID
  partyId: string; // Party ID
  memberNickname?: string; // Display name in party context
  role: 'owner' | 'moderator' | 'member'; // User's role
  joinedAt: Date; // When user joined the party
  status: 'active' | 'invited' | 'declined' | 'left'; // Membership status
}

export interface PartyInvitation {
  invitationId: string;
  partyId: string;
  invitedBy: string; // User ID of inviter
  invitedUser: string; // User ID being invited
  status: 'pending' | 'accepted' | 'declined';
  expiresAt: Date;
  createdAt: Date;
}
