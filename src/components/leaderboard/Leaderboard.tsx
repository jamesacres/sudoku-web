'use client';
import React, { useState, useMemo } from 'react';
import { Award } from 'react-feather';
import { ServerStateResult, Party } from '@/types/serverTypes';
import { ServerState } from '@/types/state';
import { UserProfile } from '@/types/userProfile';
import { FriendsLeaderboardScore, AllFriendsSessionsMap } from './types';
import { calculateUserScore, getUsernameFromParties } from './scoringUtils';
import FriendLeaderboardEntry from './FriendLeaderboardEntry';
import ScoringLegend from './ScoringLegend';
import { UserSessions } from '@/types/userSessions';

interface LeaderboardProps {
  sessions: ServerStateResult<ServerState>[] | null;
  friendSessions: UserSessions;
  parties: Party[];
  user: UserProfile;
}

const Leaderboard: React.FC<LeaderboardProps> = ({
  sessions,
  friendSessions,
  parties,
  user,
}) => {
  const [showScoringLegend, setShowScoringLegend] = useState(false);

  // Calculate leaderboard data
  const leaderboardData = useMemo(() => {
    if (!sessions || !parties || !user || !friendSessions) return [];

    // Get all friend sessions for racing bonus calculation
    const allFriendsSessions: AllFriendsSessionsMap = {};
    Object.entries(friendSessions).forEach(([userId, userSession]) => {
      if (userSession?.sessions) {
        allFriendsSessions[userId] = userSession.sessions;
      }
    });

    // Add current user's sessions
    if (sessions) {
      allFriendsSessions[user.sub] = sessions;
    }

    const leaderboard: FriendsLeaderboardScore[] = [];

    // Calculate score for current user
    if (sessions) {
      const userScore = calculateUserScore(
        sessions,
        allFriendsSessions,
        user.sub
      );
      const totalScore =
        userScore.volumeScore +
        userScore.dailyPuzzleScore +
        userScore.bookPuzzleScore +
        userScore.scannedPuzzleScore +
        userScore.difficultyBonus +
        userScore.speedBonus +
        userScore.racingBonus;

      leaderboard.push({
        userId: user.sub,
        username: user.name || 'You',
        totalScore,
        breakdown: {
          volumeScore: userScore.volumeScore,
          dailyPuzzleScore: userScore.dailyPuzzleScore,
          bookPuzzleScore: userScore.bookPuzzleScore,
          scannedPuzzleScore: userScore.scannedPuzzleScore,
          difficultyBonus: userScore.difficultyBonus,
          speedBonus: userScore.speedBonus,
          racingBonus: userScore.racingBonus,
        },
        stats: userScore.stats,
      });
    }

    // Calculate scores for friends
    Object.entries(friendSessions).forEach(([userId, userSession]) => {
      if (userSession?.sessions && userId !== user.sub) {
        const friendScore = calculateUserScore(
          userSession.sessions,
          allFriendsSessions,
          userId
        );
        const totalScore =
          friendScore.volumeScore +
          friendScore.dailyPuzzleScore +
          friendScore.bookPuzzleScore +
          friendScore.scannedPuzzleScore +
          friendScore.difficultyBonus +
          friendScore.speedBonus +
          friendScore.racingBonus;

        leaderboard.push({
          userId,
          username: getUsernameFromParties(userId, parties),
          totalScore,
          breakdown: {
            volumeScore: friendScore.volumeScore,
            dailyPuzzleScore: friendScore.dailyPuzzleScore,
            bookPuzzleScore: friendScore.bookPuzzleScore,
            scannedPuzzleScore: friendScore.scannedPuzzleScore,
            difficultyBonus: friendScore.difficultyBonus,
            speedBonus: friendScore.speedBonus,
            racingBonus: friendScore.racingBonus,
          },
          stats: friendScore.stats,
        });
      }
    });

    // Sort by total score descending
    return leaderboard
      .filter((entry) => entry.stats.totalPuzzles > 0)
      .sort((a, b) => b.totalScore - a.totalScore);
  }, [sessions, friendSessions, parties, user]);

  if (leaderboardData.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <Award className="mr-3 text-yellow-500" size={28} />
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              Leaderboard
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Last 30 days
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowScoringLegend(true)}
            className="flex items-center text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
          >
            How scoring works
          </button>
        </div>
      </div>

      {
        <div className="mb-6 space-y-3">
          {leaderboardData.map((entry, index) => (
            <FriendLeaderboardEntry
              key={entry.userId}
              entry={entry}
              rank={index + 1}
              isCurrentUser={entry.userId === user?.sub}
            />
          ))}
        </div>
      }

      <ScoringLegend
        isOpen={showScoringLegend}
        onClose={() => setShowScoringLegend(false)}
      />
    </div>
  );
};

export default Leaderboard;
