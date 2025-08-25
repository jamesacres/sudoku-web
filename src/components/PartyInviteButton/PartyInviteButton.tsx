import { useServerStorage } from '@/hooks/serverStorage';
import { useState } from 'react';
import { CopyButton } from '../CopyButton/CopyButton';

const PartyInviteButton = ({
  puzzleId,
  redirectUri,
  partyId,
  partyName,
  extraSmall = false,
}: {
  puzzleId: string;
  redirectUri: string;
  partyId: string;
  partyName: string;
  extraSmall?: boolean;
}) => {
  const sessionId = `sudoku-${puzzleId}`;
  const [inviteUrl, setInviteUrl] = useState('');
  const { createInvite } = useServerStorage({});

  const getInviteUrl = async (): Promise<string> => {
    let latestInviteUrl = inviteUrl;
    if (!inviteUrl) {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      const invite = await createInvite({
        sessionId,
        redirectUri,
        expiresAt: expiresAt.toISOString(),
        description: partyName,
        resourceId: `party-${partyId}`,
      });
      if (invite) {
        latestInviteUrl = `https://sudoku.bubblyclouds.com/invite?inviteId=${invite.inviteId}`;
        setInviteUrl(latestInviteUrl);
      }
    }
    return latestInviteUrl;
  };

  return <CopyButton getText={getInviteUrl} extraSmall={extraSmall} />;
};

export { PartyInviteButton };
