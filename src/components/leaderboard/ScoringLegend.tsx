'use client';
import React from 'react';
import { Award } from 'react-feather';
import { Difficulty, BookPuzzleDifficulty } from '@/types/serverTypes';
import { SCORING_CONFIG } from './scoringConfig';

interface ScoringLegendProps {
  isOpen: boolean;
  onClose: () => void;
}

const ScoringLegend: React.FC<ScoringLegendProps> = ({ isOpen, onClose }) => {
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

export default ScoringLegend;
