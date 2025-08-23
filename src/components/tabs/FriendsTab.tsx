'use client';
import { useEffect, useState } from 'react';
import { ServerStateResult, Party } from '@/types/serverTypes';
import { ServerState } from '@/types/state';
import { UserProfile } from '@/types/userProfile';
import { Loader, ChevronDown, ChevronRight } from 'react-feather';
import { useSessions } from '@/providers/SessionsProvider/SessionsProvider';
import IntegratedSessionRow from '../IntegratedSessionRow';

interface FriendsTabProps {
  user: UserProfile | undefined;
  parties: Party[] | undefined;
  mySessions: ServerStateResult<ServerState>[] | undefined;
}

export const FriendsTab = ({ user, parties, mySessions }: FriendsTabProps) => {
  const { friendSessions } = useSessions();
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());

  const toggleUserExpansion = (userId: string) => {
    setExpandedUsers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };
  return (
    <div className="mb-4">
      <h1 className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-4xl font-bold text-transparent">
        Racing Teams
      </h1>
      <p className="my-4">
        💡 Send your friends an invite link from the Races sidebar when solving
        a puzzle.
      </p>
      {parties?.length !== 0 && (
        <>
          <p className="mb-4">
            Select a friend below to see and solve their recent puzzles. Race to
            be the quickest!
          </p>
        </>
      )}

      {parties?.length ? (
        <>
          <ul className="space-y-4 pb-16">
            {parties?.map(({ partyId, members, partyName }) => (
              <li key={partyId}>
                <div className="rounded-2xl border border-stone-200 bg-stone-50/80 p-4 shadow-sm backdrop-blur-sm dark:border-gray-700 dark:bg-zinc-800/80">
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
                            className="flex w-full cursor-pointer items-center rounded-xl p-3 transition-colors hover:bg-gray-100 dark:hover:bg-zinc-600/40"
                            onClick={() => toggleUserExpansion(userId)}
                          >
                            <span className="mr-2 text-xl">🧍</span>
                            <span className="font-medium text-gray-800 dark:text-gray-200">
                              {memberNickname}
                            </span>
                            {friendSessions[userId]?.isLoading ? (
                              <Loader className="mr-0 ml-auto animate-spin" />
                            ) : (
                              <>
                                {expandedUsers.has(userId) ? (
                                  <ChevronDown className="mr-0 ml-auto" />
                                ) : (
                                  <ChevronRight className="mr-0 ml-auto" />
                                )}
                              </>
                            )}
                          </button>
                          {expandedUsers.has(userId) &&
                            friendSessions[userId]?.sessions && (
                              <>
                                {friendSessions[userId]?.sessions?.length ? (
                                  <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
                                    {friendSessions[userId]?.sessions
                                      ?.sort(
                                        (a, b) =>
                                          new Date(b.updatedAt).getTime() -
                                          new Date(a.updatedAt).getTime()
                                      )
                                      ?.map((userSession) => (
                                        <IntegratedSessionRow
                                          key={userSession.sessionId}
                                          session={userSession}
                                          userSessions={mySessions}
                                        />
                                      ))}
                                  </ul>
                                ) : (
                                  <p className="px-3 pb-3 text-gray-600 dark:text-gray-400">
                                    No recent puzzles, ask them to play!
                                  </p>
                                )}
                              </>
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
