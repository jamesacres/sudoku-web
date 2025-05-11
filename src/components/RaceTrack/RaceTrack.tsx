'use client';
import { Parties, Session } from '@/types/serverTypes';
import { ServerState } from '@/types/state';
import { calculateCompletionPercentage } from '@/helpers/calculateCompletionPercentage';
import { Flag } from 'react-feather';
import { useMemo } from 'react';

interface RaceTrackProps {
  sessionParties: Parties<Session<ServerState>>;
  initial: any;
  final: any;
  answer: any;
  userId?: string;
}

interface PlayerProgress {
  userId: string;
  nickname: string;
  percentage: number;
  isCurrentUser: boolean;
}

const RaceTrack = ({
  sessionParties,
  initial,
  final,
  answer,
  userId,
}: RaceTrackProps) => {
  // Calculate and collect progress for all unique users
  const allPlayerProgress = useMemo((): PlayerProgress[] => {
    const progressMap: Record<string, PlayerProgress> = {};

    // Add current user's progress
    if (userId) {
      const currentUserPercentage = calculateCompletionPercentage(
        initial,
        final,
        answer
      );

      progressMap[userId] = {
        userId,
        nickname: 'You',
        percentage: currentUserPercentage,
        isCurrentUser: true,
      };
    }

    // Add all other users from all parties
    Object.values(sessionParties).forEach((party) => {
      if (party?.memberSessions) {
        Object.entries(party.memberSessions).forEach(([memberId, session]) => {
          // Skip if this is the current user (already added)
          if (memberId === userId) return;

          // Skip if we've already processed this user
          if (progressMap[memberId]) return;

          const percentage = session
            ? calculateCompletionPercentage(
                session.state.initial,
                session.state.final,
                session.state.answerStack[session.state.answerStack.length - 1]
              )
            : 0;

          progressMap[memberId] = {
            userId: memberId,
            nickname: 'bob', // TODO move parties into game state to get nickname
            percentage,
            isCurrentUser: false,
          };
        });
      }
    });

    // Convert to array and sort by percentage (highest first)
    return Object.values(progressMap).sort(
      (a, b) => b.percentage - a.percentage
    );
  }, [sessionParties, initial, final, answer, userId]);

  if (allPlayerProgress.length <= 1) {
    return null; // Don't show race if only one player or no players
  }

  return (
    <div className="mx-auto mt-4 mb-6 max-w-xl lg:mr-0">
      <h3 className="mb-2 flex items-center text-lg font-semibold text-gray-800 dark:text-gray-200">
        <Flag
          className="text-theme-primary dark:text-theme-primary-light mr-2"
          size={16}
        />
        Race to the Finish!
      </h3>
      <div className="rounded-lg bg-gray-100 p-4 dark:bg-zinc-800">
        <div className="relative mb-1 h-24">
          {/* Track */}
          <div className="absolute inset-x-0 top-12 h-4 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            {/* Progress indication - small ticks every 10% */}
            {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((tick) => (
              <div
                key={tick}
                className="absolute top-0 h-full w-px bg-gray-300 dark:bg-gray-600"
                style={{ left: `${tick}%` }}
              >
                {tick % 20 === 0 && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 transform text-xs text-gray-500 dark:text-gray-400">
                    {tick}%
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Finish flag */}
          <div className="absolute top-0 right-0 flex h-24 flex-col items-center">
            <div className="bg-theme-primary dark:bg-theme-primary-light h-16 w-0.5"></div>
            <div className="text-theme-primary dark:text-theme-primary-light text-xs font-medium">
              Finish
            </div>
          </div>

          {/* Player markers */}
          {allPlayerProgress.map((player) => (
            <div
              key={player.userId}
              className="absolute top-0 transition-all duration-500 ease-in-out"
              style={{
                left: `${player.percentage}%`,
                transform: 'translateX(-50%)',
              }}
            >
              {/* Flag pole */}
              <div
                className={`h-12 w-1 ${
                  player.isCurrentUser ? 'bg-green-500' : 'bg-blue-500'
                }`}
              ></div>

              {/* Flag */}
              <div
                className={`absolute top-1 left-0 h-3 w-4 ${
                  player.isCurrentUser ? 'bg-green-500' : 'bg-blue-500'
                }`}
              ></div>

              {/* Player info */}
              <div className="absolute top-14 left-1/2 -translate-x-1/2 transform">
                <div className="flex flex-col items-center">
                  <div className="text-xs font-bold whitespace-nowrap">
                    {player.nickname}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {player.percentage}%
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Start line */}
        <div className="ml-1 flex justify-start text-xs text-gray-600 dark:text-gray-400">
          <span>Start</span>
        </div>
      </div>
    </div>
  );
};

export default RaceTrack;
