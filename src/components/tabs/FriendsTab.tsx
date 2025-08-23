'use client';
import React, { useState, useMemo } from 'react';
import {
  ServerStateResult,
  Party,
  Difficulty,
  BookPuzzleDifficulty,
} from '@/types/serverTypes';
import { ServerState } from '@/types/state';
import { UserProfile } from '@/types/userProfile';
import {
  Loader,
  ChevronDown,
  ChevronRight,
  Award,
  Zap,
  Calendar,
  Book,
  Camera,
} from 'react-feather';
import { useSessions } from '@/providers/SessionsProvider/SessionsProvider';
import IntegratedSessionRow from '../IntegratedSessionRow';
import { isPuzzleCheated } from '@/helpers/cheatDetection';

// Types for leaderboard
interface FriendsLeaderboardScore {
  userId: string;
  username: string;
  totalScore: number;
  breakdown: {
    volumeScore: number;
    dailyPuzzleScore: number;
    bookPuzzleScore: number;
    scannedPuzzleScore: number;
    difficultyBonus: number;
    speedBonus: number;
    racingBonus: number;
  };
  stats: {
    totalPuzzles: number;
    dailyPuzzles: number;
    bookPuzzles: number;
    scannedPuzzles: number;
    averageTime: number;
    fastestTime: number;
    racingWins: number;
  };
}

// Scoring configuration
const SCORING_CONFIG = {
  DAILY_PUZZLE_BASE: 100,
  BOOK_PUZZLE_BASE: 150,
  SCANNED_PUZZLE_BASE: 75,
  VOLUME_MULTIPLIER: 10,

  DIFFICULTY_MULTIPLIERS: {
    // Daily puzzle difficulties
    [Difficulty.SIMPLE]: 1.0,
    [Difficulty.EASY]: 1.2,
    [Difficulty.INTERMEDIATE]: 1.5,
    [Difficulty.EXPERT]: 2.0,
    // Book puzzle difficulties
    [BookPuzzleDifficulty.VERY_EASY]: 1.0,
    [BookPuzzleDifficulty.EASY]: 1.2,
    [BookPuzzleDifficulty.MODERATELY_EASY]: 1.3,
    [BookPuzzleDifficulty.MODERATE]: 1.4,
    [BookPuzzleDifficulty.MODERATELY_HARD]: 1.6,
    [BookPuzzleDifficulty.HARD]: 1.8,
    [BookPuzzleDifficulty.VICIOUS]: 2.5,
    [BookPuzzleDifficulty.FIENDISH]: 2.8,
    [BookPuzzleDifficulty.DEVILISH]: 3.2,
    [BookPuzzleDifficulty.HELL]: 3.6,
    [BookPuzzleDifficulty.BEYOND_HELL]: 4.0,
  } as Record<string, number>,

  SPEED_THRESHOLDS: {
    LIGHTNING: 180,
    FAST: 300,
    QUICK: 600,
    STEADY: 1200,
  },

  SPEED_BONUSES: {
    LIGHTNING: 500,
    FAST: 300,
    QUICK: 150,
    STEADY: 50,
  },

  RACING_BONUS_PER_PERSON: 25,
};

// Helper functions
const getPuzzleType = (
  session: ServerStateResult<ServerState>
): 'daily' | 'book' | 'scanned' | 'unknown' => {
  if (session.state.metadata?.sudokuId?.includes('oftheday')) return 'daily';
  if (session.state.metadata?.sudokuBookPuzzleId) return 'book';
  if (session.state.metadata?.scannedAt) return 'scanned';
  return 'unknown';
};

const getPuzzleIdentifier = (
  session: ServerStateResult<ServerState>
): string => {
  if (session.state.metadata?.sudokuId) return session.state.metadata.sudokuId;
  if (session.state.metadata?.sudokuBookPuzzleId)
    return session.state.metadata.sudokuBookPuzzleId;
  return session.sessionId;
};

const calculateSpeedBonus = (completionTimeSeconds: number): number => {
  if (completionTimeSeconds <= SCORING_CONFIG.SPEED_THRESHOLDS.LIGHTNING) {
    return SCORING_CONFIG.SPEED_BONUSES.LIGHTNING;
  }
  if (completionTimeSeconds <= SCORING_CONFIG.SPEED_THRESHOLDS.FAST) {
    return SCORING_CONFIG.SPEED_BONUSES.FAST;
  }
  if (completionTimeSeconds <= SCORING_CONFIG.SPEED_THRESHOLDS.QUICK) {
    return SCORING_CONFIG.SPEED_BONUSES.QUICK;
  }
  if (completionTimeSeconds <= SCORING_CONFIG.SPEED_THRESHOLDS.STEADY) {
    return SCORING_CONFIG.SPEED_BONUSES.STEADY;
  }
  return 0;
};

const calculateRacingBonus = (
  userSession: ServerStateResult<ServerState>,
  allFriendsSessions: Record<string, ServerStateResult<ServerState>[]>,
  currentUserId: string
): { bonus: number; wins: number } => {
  const puzzleId = getPuzzleIdentifier(userSession);
  const userTime = userSession.state.completed?.seconds || Infinity;

  let friendsBeaten = 0;

  // Compare against all other users' sessions (excluding the current user whose score we're calculating)
  Object.entries(allFriendsSessions).forEach(([userId, friendSessions]) => {
    // Skip comparing against the current user's own sessions
    if (userId === currentUserId) return;

    const friendAttempt = friendSessions?.find(
      (session) =>
        getPuzzleIdentifier(session) === puzzleId && session.state.completed
    );

    if (
      friendAttempt &&
      friendAttempt.state.completed &&
      userSession.state.completed
    ) {
      const friendTime = friendAttempt.state.completed.seconds;
      if (userTime < friendTime) {
        friendsBeaten++;
      }
    }
  });

  return {
    bonus: friendsBeaten * SCORING_CONFIG.RACING_BONUS_PER_PERSON,
    wins: friendsBeaten,
  };
};

const calculateUserScore = (
  userSessions: ServerStateResult<ServerState>[],
  allFriendsSessions: Record<string, ServerStateResult<ServerState>[]>,
  currentUserId: string
): FriendsLeaderboardScore['breakdown'] & {
  stats: FriendsLeaderboardScore['stats'];
} => {
  const recent30DaySessions = userSessions.filter(
    (session) => session.state.completed && !isPuzzleCheated(session.state)
  );

  let volumeScore = 0;
  let dailyPuzzleScore = 0;
  let bookPuzzleScore = 0;
  let scannedPuzzleScore = 0;
  let difficultyBonus = 0;
  let speedBonus = 0;
  let racingBonus = 0;

  const stats = {
    totalPuzzles: recent30DaySessions.length,
    dailyPuzzles: 0,
    bookPuzzles: 0,
    scannedPuzzles: 0,
    averageTime: 0,
    fastestTime: Infinity,
    racingWins: 0,
  };

  let totalTime = 0;

  for (const session of recent30DaySessions) {
    const completionTime = session.state.completed?.seconds || 0;
    totalTime += completionTime;
    stats.fastestTime = Math.min(stats.fastestTime, completionTime);

    volumeScore += SCORING_CONFIG.VOLUME_MULTIPLIER;

    const puzzleType = getPuzzleType(session);
    let baseScore = 0;
    let difficultyMultiplier = 1;

    switch (puzzleType) {
      case 'daily':
        baseScore = SCORING_CONFIG.DAILY_PUZZLE_BASE;
        stats.dailyPuzzles++;
        dailyPuzzleScore += baseScore;
        difficultyMultiplier =
          SCORING_CONFIG.DIFFICULTY_MULTIPLIERS[
            session.state.metadata?.difficulty || ''
          ] || 1;
        break;

      case 'book':
        baseScore = SCORING_CONFIG.BOOK_PUZZLE_BASE;
        stats.bookPuzzles++;
        bookPuzzleScore += baseScore;
        difficultyMultiplier =
          SCORING_CONFIG.DIFFICULTY_MULTIPLIERS[
            session.state.metadata?.difficulty || ''
          ] || 1;
        break;

      case 'scanned':
        baseScore = SCORING_CONFIG.SCANNED_PUZZLE_BASE;
        stats.scannedPuzzles++;
        scannedPuzzleScore += baseScore;
        break;
    }

    const difficultyBonusForPuzzle = baseScore * (difficultyMultiplier - 1);
    difficultyBonus += difficultyBonusForPuzzle;

    const speedBonusForPuzzle = calculateSpeedBonus(completionTime);
    speedBonus += speedBonusForPuzzle;

    const racingResult = calculateRacingBonus(
      session,
      allFriendsSessions,
      currentUserId
    );
    racingBonus += racingResult.bonus;
    stats.racingWins += racingResult.wins;
  }

  stats.averageTime =
    stats.totalPuzzles > 0 ? totalTime / stats.totalPuzzles : 0;
  stats.fastestTime = stats.fastestTime === Infinity ? 0 : stats.fastestTime;

  return {
    volumeScore,
    dailyPuzzleScore,
    bookPuzzleScore,
    scannedPuzzleScore,
    difficultyBonus,
    speedBonus,
    racingBonus,
    stats,
  };
};

const formatTime = (seconds: number): string => {
  if (seconds === 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const getUsernameFromParties = (userId: string, parties: Party[]): string => {
  for (const party of parties) {
    const member = party.members.find((m) => m.userId === userId);
    if (member) return member.memberNickname;
  }
  return 'Unknown User';
};

// Leaderboard UI Components
const FriendLeaderboardEntry: React.FC<{
  entry: FriendsLeaderboardScore;
  rank: number;
  isCurrentUser: boolean;
}> = ({ entry, rank, isCurrentUser }) => {
  const [showBreakdown, setShowBreakdown] = useState(false);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 ${
        isCurrentUser
          ? 'border-blue-300 bg-blue-50/80 shadow-lg'
          : 'border-stone-200 bg-stone-50/80 shadow-sm'
      } backdrop-blur-sm dark:border-gray-700 dark:bg-zinc-800/80`}
    >
      <div
        className="hover:bg-opacity-90 flex cursor-pointer items-center p-4 transition-all"
        onClick={() => setShowBreakdown(!showBreakdown)}
      >
        <div className="w-16 text-center">
          <span className="text-2xl font-bold">{getRankIcon(rank)}</span>
        </div>

        <div className="ml-4 flex-1">
          <div className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            {entry.username}
            {isCurrentUser && (
              <span className="ml-2 text-sm text-blue-600">(You)</span>
            )}
          </div>
          <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {entry.stats.totalPuzzles} puzzles • Avg:{' '}
            {formatTime(entry.stats.averageTime)}
            {entry.stats.fastestTime > 0 && (
              <> • Best: {formatTime(entry.stats.fastestTime)}</>
            )}
            {entry.stats.racingWins > 0 && (
              <> • 🏁 {entry.stats.racingWins} wins</>
            )}
          </div>
        </div>

        <div className="mr-4 text-right">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {entry.totalScore.toLocaleString()}
          </div>
          <div className="text-sm text-gray-500">points</div>
        </div>

        <div className="text-gray-400">
          {showBreakdown ? (
            <ChevronDown size={20} />
          ) : (
            <ChevronRight size={20} />
          )}
        </div>
      </div>

      {showBreakdown && (
        <ScoreBreakdown breakdown={entry.breakdown} stats={entry.stats} />
      )}
    </div>
  );
};

const ScoreBreakdown: React.FC<{
  breakdown: FriendsLeaderboardScore['breakdown'];
  stats: FriendsLeaderboardScore['stats'];
}> = ({ breakdown, stats }) => {
  const breakdownItems = [
    {
      label: 'Volume Bonus',
      value: breakdown.volumeScore,
      detail: `${stats.totalPuzzles} puzzles completed`,
      icon: <Award size={16} className="text-green-600" />,
      color: 'border-l-green-500',
    },
    {
      label: 'Daily Puzzles',
      value: breakdown.dailyPuzzleScore,
      detail: `${stats.dailyPuzzles} daily challenges`,
      icon: <Calendar size={16} className="text-blue-600" />,
      color: 'border-l-blue-500',
    },
    {
      label: 'Book Puzzles',
      value: breakdown.bookPuzzleScore,
      detail: `${stats.bookPuzzles} from puzzle books`,
      icon: <Book size={16} className="text-purple-600" />,
      color: 'border-l-purple-500',
    },
    {
      label: 'Scanned Puzzles',
      value: breakdown.scannedPuzzleScore,
      detail: `${stats.scannedPuzzles} imported puzzles`,
      icon: <Camera size={16} className="text-orange-600" />,
      color: 'border-l-orange-500',
    },
    {
      label: 'Difficulty Bonus',
      value: breakdown.difficultyBonus,
      detail: 'Harder puzzles = more points',
      icon: <Award size={16} className="text-red-600" />,
      color: 'border-l-red-500',
    },
    {
      label: 'Speed Bonus',
      value: breakdown.speedBonus,
      detail: `Fastest: ${formatTime(stats.fastestTime)}`,
      icon: <Zap size={16} className="text-yellow-600" />,
      color: 'border-l-yellow-500',
    },
    {
      label: 'Racing Bonus',
      value: breakdown.racingBonus,
      detail: 'Beat friends who also completed',
      icon: <Award size={16} className="text-indigo-600" />,
      color: 'border-l-indigo-500',
    },
  ];

  return (
    <div className="border-t border-gray-200 bg-gray-50/50 px-4 pb-4 dark:border-gray-600 dark:bg-zinc-700/30">
      <div className="mb-3 pt-4 font-semibold text-gray-700 dark:text-gray-300">
        Score Breakdown
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {breakdownItems.map(
          (item) =>
            item.value > 0 && (
              <div
                key={item.label}
                className={`rounded-lg border-l-4 bg-white p-3 dark:bg-zinc-800 ${item.color} shadow-sm`}
              >
                <div className="mb-2 flex items-center">
                  {item.icon}
                  <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {item.label}
                  </span>
                </div>
                <div className="mb-1 text-lg font-bold text-green-600 dark:text-green-400">
                  +{item.value.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {item.detail}
                </div>
              </div>
            )
        )}
      </div>
    </div>
  );
};

const ScoringLegend: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="bg-opacity-50 pb-safe fixed inset-0 z-[60] flex items-center justify-center bg-black p-4">
      <div className="max-h-[calc(90vh-env(safe-area-inset-bottom))] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white dark:bg-zinc-800">
        <div className="sticky top-0 z-10 bg-white p-6 pb-4 dark:bg-zinc-800">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center text-xl font-bold text-gray-800 dark:text-gray-200">
              <Award className="mr-2" size={24} />
              Scoring System
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>
        </div>
        <div className="pb-safe px-6 pb-6">
          <div className="space-y-6">
            <div>
              <h4 className="mb-3 font-semibold text-gray-700 dark:text-gray-300">
                📊 Base Points
              </h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>
                  • Any puzzle: +{SCORING_CONFIG.VOLUME_MULTIPLIER} points
                </li>
                <li>
                  • Daily puzzle: +{SCORING_CONFIG.DAILY_PUZZLE_BASE} points
                </li>
                <li>
                  • Book puzzle: +{SCORING_CONFIG.BOOK_PUZZLE_BASE} points
                </li>
                <li>
                  • Scanned puzzle: +{SCORING_CONFIG.SCANNED_PUZZLE_BASE} points
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-3 font-semibold text-gray-700 dark:text-gray-300">
                🔥 Difficulty Multipliers
              </h4>

              <div className="space-y-4">
                {/* Daily Puzzle Difficulties */}
                <div>
                  <h5 className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                    Sudoku of the Day
                  </h5>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
                    {Object.values(Difficulty).map((difficulty) => {
                      const multiplier =
                        SCORING_CONFIG.DIFFICULTY_MULTIPLIERS[difficulty];
                      const displayName =
                        difficulty.charAt(0).toUpperCase() +
                        difficulty.slice(1);
                      return (
                        <div key={difficulty}>
                          • {displayName}: {multiplier}x
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Book Puzzle Difficulties */}
                <div>
                  <h5 className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                    Book Puzzles
                  </h5>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
                    {Object.values(BookPuzzleDifficulty)
                      .sort(
                        (a, b) =>
                          SCORING_CONFIG.DIFFICULTY_MULTIPLIERS[a] -
                          SCORING_CONFIG.DIFFICULTY_MULTIPLIERS[b]
                      )
                      .map((difficulty) => {
                        const multiplier =
                          SCORING_CONFIG.DIFFICULTY_MULTIPLIERS[difficulty];
                        const displayName = difficulty
                          .replace(/^\d+-/, '') // Remove number prefix
                          .split('-')
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() + word.slice(1)
                          )
                          .join(' ');
                        return (
                          <div key={difficulty}>
                            • {displayName}: {multiplier}x
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="mb-3 font-semibold text-gray-700 dark:text-gray-300">
                ⚡ Speed Bonuses
              </h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                {Object.entries(SCORING_CONFIG.SPEED_THRESHOLDS)
                  .sort(([, a], [, b]) => a - b)
                  .map(([speedTier, threshold]) => {
                    const bonus =
                      SCORING_CONFIG.SPEED_BONUSES[
                        speedTier as keyof typeof SCORING_CONFIG.SPEED_BONUSES
                      ];
                    const minutes = Math.floor(threshold / 60);
                    const seconds = threshold % 60;
                    const timeDisplay =
                      seconds > 0
                        ? `${minutes}:${seconds.toString().padStart(2, '0')}`
                        : `${minutes} min`;

                    return (
                      <li key={speedTier}>
                        • Under {timeDisplay}: +{bonus} points
                      </li>
                    );
                  })}
              </ul>
            </div>

            <div>
              <h4 className="mb-3 font-semibold text-gray-700 dark:text-gray-300">
                🏁 Racing Bonus
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                +{SCORING_CONFIG.RACING_BONUS_PER_PERSON} points for each friend
                you beat on the same completed puzzle. Complete puzzles faster
                than your friends to earn racing bonuses!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface FriendsTabProps {
  user: UserProfile | undefined;
  parties: Party[] | undefined;
  mySessions: ServerStateResult<ServerState>[] | undefined;
}

export const FriendsTab = ({ user, parties, mySessions }: FriendsTabProps) => {
  const { sessions, friendSessions } = useSessions();
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());
  const [showLeaderboard, setShowLeaderboard] = useState(true);
  const [showScoringLegend, setShowScoringLegend] = useState(false);

  // Calculate leaderboard data
  const leaderboardData = useMemo(() => {
    if (!sessions || !parties || !user) return [];

    // Get all friend sessions for racing bonus calculation
    const allFriendsSessions: Record<string, ServerStateResult<ServerState>[]> =
      {};
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
          userId // Pass the friend's userId to exclude their own sessions from comparison
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
      .filter((entry) => entry.stats.totalPuzzles > 0) // Only show users with completed puzzles
      .sort((a, b) => b.totalScore - a.totalScore);
  }, [sessions, friendSessions, parties, user]);

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

      {/* Leaderboard Section */}
      {leaderboardData.length > 0 && (
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
              <button
                onClick={() => setShowLeaderboard(!showLeaderboard)}
                className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {showLeaderboard ? (
                  <ChevronDown size={20} />
                ) : (
                  <ChevronRight size={20} />
                )}
              </button>
            </div>
          </div>

          {showLeaderboard && (
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
          )}

          <ScoringLegend
            isOpen={showScoringLegend}
            onClose={() => setShowScoringLegend(false)}
          />
        </div>
      )}

      {/* Individual Friends Puzzles Section */}
      {parties?.length !== 0 && (
        <>
          <div className="mt-6 border-t border-gray-200 pt-6 dark:border-gray-700">
            <h2 className="mb-4 text-xl font-bold text-gray-800 dark:text-gray-200">
              Browse Friends&apos; Puzzles
            </h2>
            <p className="mb-4 text-gray-600 dark:text-gray-400">
              Select a friend below to see and solve their recent puzzles. Race
              to be the quickest!
            </p>
          </div>
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
