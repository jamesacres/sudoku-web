'use client';
import { useContext } from 'react';
import { ServerStateResult } from '@/types/serverTypes';
import { ServerState } from '@/types/state';
import { UserContext } from '@/providers/UserProvider';
import { useSessions } from '@/providers/SessionsProvider/SessionsProvider';
import { useParties } from '@/hooks/useParties';
import { calculateCompletionPercentage } from '@/helpers/calculateCompletionPercentage';
import { calculateSeconds } from '@/helpers/calculateSeconds';
import {
  puzzleTextToPuzzle,
  puzzleToPuzzleText,
} from '@/helpers/puzzleTextToPuzzle';
import { Award, Loader } from 'react-feather';
import SimpleSudoku from './SimpleSudoku';
import Link from 'next/link';

interface IntegratedSessionRowProps {
  session: ServerStateResult<ServerState>;
  userSessions?: ServerStateResult<ServerState>[]; // Optional: user's sessions for cross-referencing
}

export const IntegratedSessionRow = ({
  session,
  userSessions,
}: IntegratedSessionRowProps) => {
  const { user } = useContext(UserContext) || {};
  const { friendSessions, isFriendSessionsLoading } = useSessions();
  const { parties } = useParties();

  const initial = puzzleToPuzzleText(session.state.initial);
  const final = puzzleToPuzzleText(session.state.final);

  // Use user's session for calculations if we're in FriendsTab context
  const userSession = userSessions?.find(
    (s) => s.sessionId === session.sessionId
  );
  const actualSession = userSessions ? userSession : session;

  const latest = actualSession
    ? actualSession.state.answerStack[
        actualSession.state.answerStack.length - 1
      ]
    : session.state.initial;
  const myPercentage = actualSession
    ? calculateCompletionPercentage(
        actualSession.state.initial,
        actualSession.state.final,
        latest
      )
    : 0;
  const isCompleted = actualSession?.state.completed;

  // Helper function to get all player sessions for this puzzle, sorted by performance
  const getAllPlayerSessionsForPuzzle = () => {
    if (!friendSessions) return [];

    const allPlayerSessions: Array<{
      nickname: string;
      userId: string | null; // null for current user
      completionPercentage: number;
      completionTime: number | null;
      isCompleted: boolean;
      isCurrentUser: boolean;
      isWinner: boolean;
    }> = [];

    // Add user's own session - use userSessions if provided (for FriendsTab)
    const userSession = userSessions?.find(
      (s) => s.sessionId === session.sessionId
    );

    // Only use friend's session data if we're NOT in FriendsTab context
    const actualSession = userSessions ? userSession : session;

    let myLatest, myCompletionPercentage, myCompletionTime, isUserCompleted;

    if (actualSession) {
      myLatest =
        actualSession.state.answerStack[
          actualSession.state.answerStack.length - 1
        ];
      myCompletionPercentage = calculateCompletionPercentage(
        actualSession.state.initial,
        actualSession.state.final,
        myLatest
      );
      myCompletionTime = actualSession.state.completed?.seconds || null;
      isUserCompleted = !!actualSession.state.completed;
    } else {
      // User hasn't played this puzzle (FriendsTab only)
      myLatest = session.state.initial;
      myCompletionPercentage = 0;
      myCompletionTime = null;
      isUserCompleted = false;
    }

    // Only add user to the list if they have actually played this puzzle, or if we're in MyPuzzlesTab
    if (actualSession || !userSessions) {
      allPlayerSessions.push({
        nickname: 'You',
        userId: null, // Mark as current user
        completionPercentage: myCompletionPercentage,
        completionTime: myCompletionTime,
        isCompleted: isUserCompleted,
        isCurrentUser: true,
        isWinner: false, // Will be determined later
      });
    }

    // Add friends' sessions (excluding current user)
    let hasFriends = false;
    Object.entries(friendSessions).forEach(([userId, userSessionData]) => {
      // Skip if this is the current user
      if (userId === user?.sub) {
        return;
      }

      if (userSessionData?.sessions) {
        const matchingSession = userSessionData.sessions.find(
          (friendSession) => {
            // Match based on session ID (puzzle ID)
            return friendSession.sessionId === session.sessionId;
          }
        );
        if (matchingSession) {
          hasFriends = true;
          // Get friend nickname from parties
          const friendNickname =
            parties
              ?.flatMap((party) => party.members)
              .find((member) => member.userId === userId)?.memberNickname ||
            'Unknown';

          // Calculate completion percentage
          const latest =
            matchingSession.state.answerStack[
              matchingSession.state.answerStack.length - 1
            ];
          const completionPercentage = calculateCompletionPercentage(
            matchingSession.state.initial,
            matchingSession.state.final,
            latest
          );

          const completionTime =
            matchingSession.state.completed?.seconds || null;
          const isCompleted = !!matchingSession.state.completed;

          allPlayerSessions.push({
            nickname: friendNickname,
            userId,
            completionPercentage,
            completionTime,
            isCompleted,
            isCurrentUser: false,
            isWinner: false, // Will be determined later
          });
        }
      }
    });

    // Don't show list if only the current user is playing
    if (!hasFriends) return [];

    // Determine the winner among completed puzzles
    const completedSessions = allPlayerSessions.filter(
      (session) => session.isCompleted && session.completionTime !== null
    );
    if (completedSessions.length > 0) {
      // Find the fastest completion time
      const fastestTime = Math.min(
        ...completedSessions.map((session) => session.completionTime!)
      );
      // Mark all sessions with the fastest time as winners (handles ties)
      completedSessions.forEach((session) => {
        if (session.completionTime === fastestTime) {
          session.isWinner = true;
        }
      });
    }

    // Sort by completion status first (completed first), then by completion percentage (highest first), then by completion time (fastest first)
    return allPlayerSessions.sort((a, b) => {
      // Completed puzzles first
      if (a.isCompleted !== b.isCompleted) {
        return a.isCompleted ? -1 : 1;
      }

      // If both completed, sort by time (fastest first)
      if (
        a.isCompleted &&
        b.isCompleted &&
        a.completionTime &&
        b.completionTime
      ) {
        return a.completionTime - b.completionTime;
      }

      // If both incomplete, sort by completion percentage (highest first)
      if (!a.isCompleted && !b.isCompleted) {
        return b.completionPercentage - a.completionPercentage;
      }

      return 0;
    });
  };

  const playerSessions = getAllPlayerSessionsForPuzzle();

  // Helper to get the correct timer session and display
  const getTimerDisplay = () => {
    const userSession = userSessions?.find(
      (s) => s.sessionId === session.sessionId
    );
    const timerSession = userSession || (!userSessions ? session : null);

    if (timerSession?.state.timer !== undefined) {
      const seconds = calculateSeconds(timerSession.state.timer);
      return (
        <span className="text-xs opacity-75">
          {Math.floor(seconds / 60)}m {seconds % 60}s
        </span>
      );
    }
    return null;
  };

  return (
    <li
      key={session.sessionId}
      className="rounded-lg border-2 border-stone-200 bg-stone-50/80 hover:bg-stone-100 dark:border-zinc-600 dark:bg-zinc-800 dark:hover:bg-zinc-700"
    >
      <Link
        href={`/puzzle?initial=${initial}&final=${final}${
          isCompleted ? '&alreadyCompleted=true' : ''
        }`}
      >
        <div>
          <SimpleSudoku
            initial={puzzleTextToPuzzle(initial)}
            final={puzzleTextToPuzzle(final)}
            latest={latest}
          />
          <div className="px-4 py-2 text-center text-gray-900 dark:text-white">
            <p>
              {(() => {
                // Use user's session if we're in FriendsTab context
                const userSession = userSessions?.find(
                  (s) => s.sessionId === session.sessionId
                );
                const gameSession =
                  userSession || (!userSessions ? session : null);

                if (
                  !gameSession ||
                  (gameSession.state.answerStack.length || 0) <= 1
                ) {
                  return 'Start Game';
                }

                return gameSession.state.completed
                  ? 'You Completed!'
                  : 'Continue Game';
              })()}
            </p>
          </div>
        </div>
      </Link>

      {/* Progress Section - Always show */}
      <div className="border-t border-stone-200 bg-stone-100/50 dark:border-zinc-600 dark:bg-zinc-700/50">
        <div className="p-2">
          <div className="space-y-1">
            {/* Show all players in sorted order, including user */}
            {playerSessions.length > 0 ? (
              playerSessions.map(
                ({
                  nickname,
                  userId,
                  completionPercentage,
                  completionTime,
                  isCompleted,
                  isCurrentUser,
                  isWinner,
                }) => (
                  <div
                    key={`${session.sessionId}-${userId || 'user'}`}
                    className={`flex items-center justify-between rounded px-2 py-1 text-xs ${
                      isWinner
                        ? 'bg-yellow-100/70 text-yellow-900 dark:bg-yellow-950/30 dark:text-yellow-100'
                        : isCurrentUser
                          ? 'bg-green-100/50 text-green-900 dark:bg-green-950/30 dark:text-green-100'
                          : 'bg-blue-100/50 text-blue-900 dark:bg-blue-950/30 dark:text-blue-100'
                    }`}
                  >
                    <span className="flex items-center gap-1 font-medium">
                      {isWinner && (
                        <Award className="h-3 w-3 text-yellow-600 dark:text-yellow-400" />
                      )}
                      {nickname}
                    </span>
                    <div className="flex items-center gap-1">
                      {isCompleted ? (
                        <>
                          <span className="text-green-600 dark:text-green-400">
                            ✅
                          </span>
                          {completionTime && (
                            <span className="text-xs opacity-75">
                              {Math.floor(completionTime / 60)}m{' '}
                              {completionTime % 60}s
                            </span>
                          )}
                        </>
                      ) : isCurrentUser ? (
                        <>
                          {getTimerDisplay()}
                          <span className="ml-1 opacity-75">
                            {myPercentage}%
                          </span>
                        </>
                      ) : (
                        <span className="opacity-75">
                          {completionPercentage}%
                        </span>
                      )}
                    </div>
                  </div>
                )
              )
            ) : (
              /* Show only user when no friends or still loading */
              <div className="flex items-center justify-between rounded bg-green-100/50 px-2 py-1 text-xs text-green-900 dark:bg-green-950/30 dark:text-green-100">
                <span className="flex items-center gap-1 font-medium">You</span>
                <div className="flex items-center gap-1">
                  {isCompleted ? (
                    <>
                      <span className="text-green-600 dark:text-green-400">
                        ✅
                      </span>
                      {session.state.completed && (
                        <span className="text-xs opacity-75">
                          {Math.floor(session.state.completed.seconds / 60)}m{' '}
                          {session.state.completed.seconds % 60}s
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      {getTimerDisplay()}
                      <span className="ml-1 opacity-75">{myPercentage}%</span>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Show subtle loading indicator for friends only */}
            {parties &&
              parties.length > 0 &&
              isFriendSessionsLoading &&
              playerSessions.length === 0 && (
                <div className="flex items-center justify-center p-1 text-xs opacity-50">
                  <Loader className="mr-1 h-2 w-2 animate-spin text-gray-400" />
                  <span className="text-[10px] text-gray-500 dark:text-gray-500">
                    Loading friends...
                  </span>
                </div>
              )}
          </div>
        </div>
      </div>
    </li>
  );
};

export default IntegratedSessionRow;
