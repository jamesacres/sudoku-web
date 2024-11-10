'use client';
import { useServerStorage } from '@/hooks/serverStorage';
import { UserContext } from '@/providers/UserProvider';
import { PublicInvite } from '@/types/serverTypes';
import { useSearchParams } from 'next/navigation';
import { useContext, useEffect, useState } from 'react';
import { Loader } from 'react-feather';

export default function Invite() {
  const searchParams = useSearchParams();
  const inviteId = searchParams.get('inviteId');

  const { getPublicInvite } = useServerStorage({});
  const [isLoading, setIsLoading] = useState(true);
  const [publicInvite, setPublicInvite] = useState<PublicInvite | undefined>(
    undefined
  );

  useEffect(() => {
    let active = true;

    if (inviteId) {
      const serverPromise = async () => {
        const publicInvite = await getPublicInvite(inviteId);
        if (active && publicInvite) {
          setPublicInvite(publicInvite);
        }
        setIsLoading(false);
      };
      serverPromise();
    }

    return () => {
      active = false;
    };
  }, [getPublicInvite, inviteId]);

  const { user } = useContext(UserContext) || {};
  return (
    <div className="container mx-auto px-4">
      <h1 className="text-2xl">Invite to Play Sudoku</h1>
      {isLoading ? (
        <Loader className="animate-spin" />
      ) : (
        <>
          {publicInvite ? (
            <>
              <p className="mt-2">
                Someone you know has invited you to join their party{' '}
                <span className="mt-2 text-xl font-bold">
                  {publicInvite.description}
                </span>{' '}
                and play sudoku.
              </p>
              <p>Accept Invite? Login?</p>
            </>
          ) : (
            <p>Invite has expired</p>
          )}
        </>
      )}
    </div>
  );
}
