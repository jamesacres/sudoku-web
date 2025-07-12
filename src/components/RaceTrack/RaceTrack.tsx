'use client';
import { Parties, Session } from '@/types/serverTypes';
import { ServerState } from '@/types/state';
import { calculateCompletionPercentage } from '@/helpers/calculateCompletionPercentage';
import { useParties } from '@/hooks/useParties';
import { memo, useMemo } from 'react';
import { getPlayerColor, getAllUserIds } from '@/utils/playerColors';

interface Arguments {
  sessionParties: Parties<Session<ServerState>>;
  initial: any;
  final: any;
  answer: any;
  userId?: string;
  onClick?: () => void;
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
  onClick,
}: Arguments) => {
  const { getNicknameByUserId, parties } = useParties();

  // Get consistent ordering of all user IDs for color assignment
  const allUserIds = useMemo(() => getAllUserIds(parties), [parties]);

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

          // Get the user's nickname from parties data, fallback to a default
          const nickname =
            getNicknameByUserId(memberId) || `Player ${memberId.slice(-4)}`;

          progressMap[memberId] = {
            userId: memberId,
            nickname,
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
  }, [sessionParties, initial, final, answer, userId, getNicknameByUserId]);

  return (
    <div className="mx-auto mt-2 mb-2 max-w-xl lg:mt-4 lg:mr-0">
      {/* Compact race track design */}
      <div
        className="relative cursor-pointer"
        onClick={() => onClick && onClick()}
        title="Click to view friends"
      >
        {/* Main track */}
        <div className="relative h-10 overflow-visible rounded-lg bg-stone-100 lg:h-14 dark:bg-gray-800">
          {/* Track surface with center line */}
          <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-stone-200 via-stone-100 to-stone-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            {/* Dashed center line */}
            <div
              className="absolute top-1/2 right-16 left-6 h-0.5 -translate-y-1/2 transform bg-white opacity-60"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(to right, white 0px, white 6px, transparent 6px, transparent 12px)',
              }}
            ></div>
          </div>

          {/* START label inside track */}
          <div className="absolute top-1/2 left-1 -translate-y-1/2 transform">
            <span className="rounded bg-green-600 px-1.5 py-0.5 text-xs font-bold text-white">
              START
            </span>
          </div>

          {/* FINISH label and flag inside track */}
          <div className="absolute top-1/2 right-1 flex -translate-y-1/2 transform items-center">
            <span className="mr-1 rounded bg-red-600 px-1 py-0.5 text-xs font-bold text-white">
              FINISH
            </span>
            {/* Checkered flag */}
            <div
              className="h-3 w-4 border border-gray-800 bg-white"
              style={{
                backgroundImage: `
                  linear-gradient(45deg, black 25%, transparent 25%),
                  linear-gradient(-45deg, black 25%, transparent 25%),
                  linear-gradient(45deg, transparent 75%, black 75%),
                  linear-gradient(-45deg, transparent 75%, black 75%)
                `,
                backgroundSize: '2px 2px',
                backgroundPosition: '0 0, 0 1px, 1px -1px, -1px 0px',
              }}
            ></div>
          </div>

          {/* Progress tick marks */}
          {[25, 50, 75].map((tick) => (
            <div
              key={tick}
              className="absolute top-0 bottom-0 w-px bg-yellow-400 opacity-40"
              style={{ left: `${tick}%` }}
            ></div>
          ))}

          {/* Player karts */}
          {allPlayerProgress.map((player, index) => {
            const colorClass = getPlayerColor(
              player.userId,
              allUserIds,
              player.isCurrentUser
            );

            // Calculate vertical spacing within the track (responsive)
            const trackHeight = window.innerWidth >= 1024 ? 56 : 40; // h-14 = 56px, h-10 = 40px
            const totalPlayers = allPlayerProgress.length;
            const playerHeight = Math.min(8, trackHeight / totalPlayers);
            const verticalOffset = index * playerHeight + 2;

            return (
              <div
                key={player.userId}
                className="absolute transform transition-all duration-700 ease-out"
                style={{
                  left: `${Math.min(Math.max(player.percentage * 0.83 + 12, 12), 95)}%`, // Scale 0-100% to 12-95% of track
                  top: `${verticalOffset}px`,
                  transform: 'translateX(-50%)',
                }}
              >
                {/* Smaller kart */}
                <div
                  className={`h-3 w-5 ${colorClass} relative rounded border border-gray-800 shadow-sm dark:border-gray-200`}
                >
                  {/* Tiny wheels */}
                  <div className="absolute top-0 -left-0.5 h-0.5 w-0.5 rounded-full bg-gray-800 dark:bg-gray-200"></div>
                  <div className="absolute top-0 -right-0.5 h-0.5 w-0.5 rounded-full bg-gray-800 dark:bg-gray-200"></div>
                  <div className="absolute bottom-0 -left-0.5 h-0.5 w-0.5 rounded-full bg-gray-800 dark:bg-gray-200"></div>
                  <div className="absolute -right-0.5 bottom-0 h-0.5 w-0.5 rounded-full bg-gray-800 dark:bg-gray-200"></div>

                  {/* Driver dot */}
                  <div className="absolute top-0.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 transform rounded-full bg-yellow-300"></div>

                  {/* Crown for current user */}
                  {player.isCurrentUser && (
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 transform text-xs">
                      👑
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Compact horizontal player legend - lowest to highest percentage */}
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
          {[...allPlayerProgress].reverse().map((player) => {
            const colorClass = getPlayerColor(
              player.userId,
              allUserIds,
              player.isCurrentUser
            );

            return (
              <div
                key={`${player.userId}-info`}
                className="flex items-center gap-1"
              >
                {/* Color indicator */}
                <div className={`h-2 w-2 rounded-full ${colorClass}`}></div>
                {/* Player name with percentage */}
                <span
                  className={`font-medium ${player.isCurrentUser ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'}`}
                >
                  {player.nickname}
                  {player.isCurrentUser && ' 👑'}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  ({player.percentage}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Prevent re-render on timer change
const MemoisedRaceTrack = memo(function MemoisedRaceTrack(args: Arguments) {
  return RaceTrack(args);
});

export default MemoisedRaceTrack;
