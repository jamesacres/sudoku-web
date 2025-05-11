'use client';
import { ServerStateResult, Party } from '@/types/serverTypes';
import { ServerState } from '@/types/state';
import { UserSessions } from '@/types/userSessions';
import { UserProfile } from '@/types/userProfile';
import { Loader, ChevronDown } from 'react-feather';
import SessionRow from '../SessionRow';

interface FriendsTabProps {
  user: UserProfile | undefined;
  parties: Party[] | undefined;
  expandUser: (partyId: string, userId: string) => void;
  userSessions: UserSessions;
  mySessions: ServerStateResult<ServerState>[] | undefined;
}

export const FriendsTab = ({
  user,
  parties,
  expandUser,
  userSessions,
  mySessions,
}: FriendsTabProps) => {
  return (
    <div className="mb-4">
      <h1 className="mb-2 text-4xl font-extrabold">Friends</h1>
      <p className="mb-4">
        Invite others using the sidebar when solving a puzzle, then come back
        here to see their own puzzles.
      </p>
      <p className="mb-4">
        Select a friend below to see and solve their puzzles. Who will be the
        quickest?
      </p>

      {parties?.length ? (
        <>
          <ul className="space-y-4 pb-16">
            {parties?.map(({ partyId, members, partyName }) => (
              <li key={partyId}>
                <div className="rounded-2xl border border-gray-200 bg-white/80 p-4 shadow-sm backdrop-blur-sm dark:border-gray-700 dark:bg-zinc-800/80">
                  <h3 className="text-theme-primary dark:text-theme-primary-light text-xl font-semibold">
                    {partyName}
                  </h3>
                  <ul className="mt-4 space-y-4">
                    {members
                      .filter(({ userId }) => userId !== user?.sub)
                      .map(({ userId, memberNickname }) => (
                        <li
                          key={userId}
                          className="rounded-xl bg-gray-50 dark:bg-zinc-700/40"
                        >
                          <button
                            className="flex w-full cursor-pointer items-center p-3"
                            onClick={() => expandUser(partyId, userId)}
                          >
                            <span className="mr-2 text-xl">🧍</span>
                            <span className="font-medium text-gray-800 dark:text-gray-200">
                              {memberNickname}
                            </span>
                            {userSessions[userId]?.isLoading ? (
                              <Loader className="mr-0 ml-auto animate-spin" />
                            ) : (
                              <>
                                {userSessions[userId]?.sessions ? (
                                  <></>
                                ) : (
                                  <ChevronDown className="mr-0 ml-auto" />
                                )}
                              </>
                            )}
                          </button>
                          {userSessions[userId]?.sessions && (
                            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4">
                              {userSessions[userId]?.sessions?.map(
                                (userSession) => (
                                  <SessionRow
                                    key={userSession.sessionId}
                                    memberSession={userSession}
                                    mySession={mySessions?.find(
                                      (session) =>
                                        session.sessionId ===
                                        userSession.sessionId
                                    )}
                                    display="my"
                                    memberNickname={memberNickname}
                                  />
                                )
                              )}
                            </ul>
                          )}
                        </li>
                      ))}
                  </ul>
                </div>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <></>
      )}
    </div>
  );
};

export default FriendsTab;
