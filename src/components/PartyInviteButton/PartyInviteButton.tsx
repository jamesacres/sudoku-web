import { useServerStorage } from '@/hooks/serverStorage';
import { useState } from 'react';
import { Check, Copy, Loader } from 'react-feather';

const PartyInviteButton = ({
  puzzleId,
  partyId,
}: {
  puzzleId: string;
  partyId: string;
}) => {
  const sessionId = `sudoku-${puzzleId}`;
  const [isLoading, setIsLoading] = useState(false);
  const [inviteUrl, setInviteUrl] = useState('');
  const [showCopied, setShowCopied] = useState(false);
  const { createInvite } = useServerStorage({});

  const copyInviteUrl = async () => {
    setIsLoading(true);

    let latestInviteUrl = inviteUrl;
    if (!inviteUrl) {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      const invite = await createInvite({
        sessionId,
        expiresAt: expiresAt.toISOString(),
        description: 'Play Sudoku with me',
        resourceId: `party-${partyId}`,
      });
      if (invite) {
        latestInviteUrl = `https://sudoku.bubblyclouds.com/invite?inviteId=${invite.inviteId}`;
        setInviteUrl(latestInviteUrl);
      }
    }

    setIsLoading(false);

    if (latestInviteUrl) {
      navigator.clipboard.writeText(latestInviteUrl);
      setShowCopied(true);
      setTimeout(() => {
        setShowCopied(false);
      }, 5000);
    }
  };

  return (
    <button
      className="mt-2 w-full rounded-lg bg-neutral-500 px-4 py-2 text-white hover:bg-neutral-700 disabled:bg-neutral-300"
      onClick={async () => {
        await copyInviteUrl();
      }}
    >
      {showCopied ? (
        <>
          <Check className="float-left mr-2" /> Copied invite link! Paste in a
          message to a friend
        </>
      ) : (
        <>
          {isLoading ? (
            <>
              <Loader className="animate-spin" />
            </>
          ) : (
            <>
              <Copy className="float-left mr-2" /> Copy Invite URL
            </>
          )}
        </>
      )}
    </button>
  );
};

export { PartyInviteButton };
