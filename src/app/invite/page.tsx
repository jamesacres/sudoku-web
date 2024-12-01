'use client';
import { useServerStorage } from '@/hooks/serverStorage';
import { UserContext } from '@/providers/UserProvider';
import { PublicInvite } from '@/types/serverTypes';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useContext, useEffect, useState } from 'react';
import { Loader } from 'react-feather';

function InviteComponent() {
  const searchParams = useSearchParams();
  const inviteId = searchParams.get('inviteId');

  const router = useRouter();
  const { isLoggingIn, user, loginRedirect } = useContext(UserContext) || {};
  const { getPublicInvite, createMember, listParties } = useServerStorage({});
  const [isLoading, setIsLoading] = useState(true);
  const [publicInvite, setPublicInvite] = useState<PublicInvite | undefined>(
    undefined
  );
  const name = user ? user?.given_name || user?.name : '';
  const [memberNickname, setMemberNickname] = useState(name || '');
  const [isJoining, setIsJoining] = useState(false);

  const redirect = useCallback(
    (redirectUri: string | undefined) => {
      const uri =
        redirectUri &&
        new RegExp('^/puzzle\\?initial=[1-9.]+&final=[1-9]+$').test(redirectUri)
          ? redirectUri
          : '/';
      router.replace(uri);
    },
    [router]
  );

  const isAlreadyAMember = useCallback(
    async (partyId: string) => {
      const parties = await listParties();
      const party = parties?.find((party) => party.partyId === partyId);
      return !!party;
    },
    [listParties]
  );

  const checkIfMemberAndRedirect = useCallback(
    async (publicInvite: PublicInvite) => {
      const partyId = publicInvite.resourceId.replace('party-', '');
      if (await isAlreadyAMember(partyId)) {
        // They're a member! redirect to the game
        redirect(publicInvite?.redirectUri);
        return true;
      }
      return false;
    },
    [isAlreadyAMember, redirect]
  );

  useEffect(() => {
    let active = true;

    if (inviteId && !publicInvite) {
      const serverPromise = async () => {
        const publicInvite = await getPublicInvite(inviteId);
        if (active && publicInvite) {
          // Check if they are already a member, and redirect if so
          if (!(await checkIfMemberAndRedirect(publicInvite))) {
            // Otherwise, show invite page
            setPublicInvite(publicInvite);
            setIsLoading(false);
          }
        }
      };
      serverPromise();
    }

    return () => {
      active = false;
    };
  }, [getPublicInvite, inviteId, publicInvite, checkIfMemberAndRedirect]);

  const joinParty = async () => {
    try {
      if (!isJoining && inviteId) {
        setIsJoining(true);
        await createMember({
          memberNickname,
          inviteId,
        });
        redirect(publicInvite?.redirectUri);
      }
    } catch (e) {
      console.error(e);
      setIsJoining(false);
    }
  };

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-2xl">👋 Hi{name ? ` ${name}` : ''}!</h1>
      {isLoading ? (
        <Loader className="mt-4 animate-spin" />
      ) : (
        <>
          {publicInvite ? (
            <>
              <p className="mt-4">
                Join my party{' '}
                <span className="mt-2 text-xl font-bold">
                  {publicInvite.description}
                </span>{' '}
                and solve my Sudoku puzzle!
              </p>
              <p className="mt-4">
                Any other puzzles you and party members play in future will also
                be shared with your group.
              </p>
              <p className="mt-4">Happy puzzling! 🎉</p>
              {user ? (
                <>
                  <div className="mb-4">
                    <label
                      className="mb-2 mt-4 block text-sm font-bold"
                      htmlFor="memberNickname"
                    >
                      What does this group call you? (Nickname)
                    </label>
                    <input
                      className={`${isJoining ? 'cursor-wait' : ''} inline-block rounded border-2 border-neutral-600 bg-neutral-500 px-4 py-2 text-white hover:bg-neutral-700 focus:outline-none disabled:bg-neutral-300`}
                      disabled={isJoining}
                      id="memberNickname"
                      type="text"
                      placeholder="Nickname"
                      value={memberNickname}
                      onChange={(e) => setMemberNickname(e.target.value)}
                    />
                  </div>
                  <button
                    disabled={isJoining}
                    onClick={() => {
                      joinParty();
                    }}
                    className={`${isJoining ? 'cursor-wait' : ''} mt-4 inline-block rounded bg-neutral-500 px-4 py-2 text-white hover:bg-neutral-700 disabled:bg-neutral-300`}
                  >
                    {isJoining ? (
                      <Loader className="animate-spin" />
                    ) : (
                      'Join Party'
                    )}
                  </button>
                </>
              ) : (
                <button
                  disabled={isLoggingIn}
                  onClick={() => loginRedirect && loginRedirect()}
                  className={`${isLoggingIn ? 'cursor-wait' : ''} mr-4 mt-4 inline-block rounded bg-neutral-500 px-4 py-2 text-white hover:bg-neutral-700 disabled:bg-neutral-300`}
                >
                  Sign in to continue
                </button>
              )}
            </>
          ) : (
            <p className="mt-4">Invite has expired</p>
          )}
        </>
      )}
    </div>
  );
}

export default function Invite() {
  return (
    <Suspense>
      <InviteComponent />
    </Suspense>
  );
}
