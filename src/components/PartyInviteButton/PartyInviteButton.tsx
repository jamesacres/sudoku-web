import { useServerStorage } from '@/hooks/serverStorage';
import { useState } from 'react';
import { Check, Copy, Loader } from 'react-feather';

const PartyInviteButton = ({
  puzzleId,
  redirectUri,
  partyId,
  partyName,
}: {
  puzzleId: string;
  redirectUri: string;
  partyId: string;
  partyName: string;
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
      className="mt-2 w-full cursor-pointer rounded-lg bg-neutral-500 px-4 py-2 text-sm text-white hover:bg-neutral-700 disabled:bg-neutral-300"
      onClick={async () => {
        await copyInviteUrl();
      }}
    >
      {showCopied ? (
        <>
          <Check className="float-left mr-2" size={20} /> Copied to clipboard!
        </>
      ) : (
        <>
          {isLoading ? (
            <>
              <Loader className="animate-spin" size={20} />
            </>
          ) : (
            <>
              <Copy className="float-left mr-2" size={20} /> Copy Invite URL
            </>
          )}
        </>
      )}
    </button>
  );
};

export { PartyInviteButton };
