/**
 * Configuration for daily limits in the freemium model
 * These limits apply to non-subscribed users and reset daily at midnight
 */
export const DAILY_LIMITS = {
  /** Number of free undo actions per day */
  UNDO: 2,

  /** Number of free cell check actions per day */
  CHECK_CELL: 2,

  /** Number of free grid check actions per day */
  CHECK_GRID: 2,

  /** Number of free puzzles per day */
  PUZZLE: 1,
};
