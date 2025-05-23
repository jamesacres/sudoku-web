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
      className="text-theme-primary dark:text-theme-primary-light flex w-full cursor-pointer items-center justify-center rounded-full bg-gray-100 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-gray-200 active:opacity-80 dark:bg-gray-700 dark:hover:bg-gray-600"
      onClick={async () => {
        await copyInviteUrl();
      }}
      disabled={isLoading}
    >
      {showCopied ? (
        <>
          <Check className="mr-2" size={18} /> Copied to clipboard!
        </>
      ) : (
        <>
          {isLoading ? (
            <Loader className="mx-auto animate-spin" size={18} />
          ) : (
            <>
              <Copy className="mr-2" size={18} /> Copy Invite Link
            </>
          )}
        </>
      )}
    </button>
  );
};

export { PartyInviteButton };
