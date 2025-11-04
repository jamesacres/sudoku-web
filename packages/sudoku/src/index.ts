/**
 * @sudoku-web/sudoku - Sudoku Game Logic Package
 *
 * Provides Sudoku-specific game logic including puzzle generation, solving algorithms,
 * grid validation, game state management, and reusable game UI components.
 *
 * @packageDocumentation
 */

// ===== Providers =====

/** Parties context provider for multiplayer game state */
export { default as PartiesProvider, PartiesContext } from './providers/PartiesProvider';

/** Book puzzle context provider for book selection */
export { BookProvider, useBook } from './providers/BookProvider/BookProvider';

// ===== Components =====

/** Number input pad for sudoku cell entry (1-9) */
export { default as NumberPad } from './components/NumberPad';

/** Displays elapsed time in formatted MM:SS format */
export { TimerDisplay } from './components/TimerDisplay';

/** Visual indicator for puzzle correctness (red/yellow/green traffic light) */
export { TrafficLight } from './components/TrafficLight';

/** Simple sudoku grid display component (read-only visualization) */
export { default as SimpleSudoku } from './components/SimpleSudoku';

// Note: The following components have app-specific dependencies and are NOT exported:
// - SudokuBox (depends on SudokuInput which is app-specific)
// - Sudoku, RaceTrack (depend on app-specific hooks/context)
// Apps should implement their own versions or copy these as templates

// ===== Helpers =====

/** Check if a single cell value is correct */
export { checkCell } from './helpers/checkAnswer';

/** Detect if a puzzle was cheated (more than one cell changed) */
export { isPuzzleCheated } from './helpers/cheatDetection';

/** Scoring configuration for different puzzle types and difficulty levels */
export { SCORING_CONFIG } from './helpers/scoringConfig';

/** Scoring calculation utilities for leaderboards and rankings */
export { getPuzzleType, getPuzzleIdentifier, calculateSpeedBonus, calculateRacingBonus, calculateUserScore, formatTime, getUsernameFromParties } from './helpers/scoringUtils';

/** Check if entire grid is valid and complete */
export { checkGrid } from './helpers/checkAnswer';

/** Check if cell is part of initial puzzle (not user-entered) */
export { isInitialCell } from './helpers/checkAnswer';

/** Calculate puzzle completion percentage (0-100) */
export { calculateCompletionPercentage } from './helpers/calculateCompletionPercentage';

/** Convert puzzle text string to 2D array */
export { puzzleTextToPuzzle } from './helpers/puzzleTextToPuzzle';

/** Convert 2D puzzle array to text string */
export { puzzleToPuzzleText } from './helpers/puzzleTextToPuzzle';

/** Calculate box ID (0-8) from row and column */
export { calculateBoxId } from './helpers/calculateId';

/** Calculate cell ID string from row and column */
export { calculateCellId } from './helpers/calculateId';

/** Split cell ID string back to row and column */
export { splitCellId } from './helpers/calculateId';

/** Calculate next cell ID (for auto-advance) */
export { calculateNextCellId } from './helpers/calculateId';

// ===== Hooks =====

/** Game timer hook with start/stop/reset functionality */
export { useTimer } from './hooks/timer';

/** Hook to access Parties context with automatic lazy loading */
export { useParties } from './hooks/useParties';

// Note: useGameState has app-specific dependencies (useSessions)
// It's in the package but not exported - apps should implement their own version

// ===== Utilities =====

/** Get today's date string (YYYY-MM-DD) */
export { getTodayDateString } from './utils/dailyPuzzleCounter';

/** Get list of puzzle IDs completed today */
export { getDailyPuzzleIds } from './utils/dailyPuzzleCounter';

/** Add a puzzle ID to today's completed list */
export { addDailyPuzzleId } from './utils/dailyPuzzleCounter';

/** Get count of puzzles completed today */
export { getDailyPuzzleCount } from './utils/dailyPuzzleCounter';

// ===== Types =====

/** Sudoku cell information */
export type { Cell } from './types/Cell';

/** 9x9 sudoku grid */
export type { SudokuGrid } from './types/SudokuGrid';

/** Complete game state */
export type { SudokuState } from './types/SudokuGrid';

/** Note-taking for candidate numbers */
export type { Notes, ToggleNote } from './types/notes';

/** Initial puzzle definition (9x9 array) */
export type {
  Puzzle,
  PuzzleRowOrColumn,
  PuzzleBox,
  PuzzleRow,
} from './types/puzzle';

/** 9x9 grid of zeros (empty puzzle constant) */
export { emptyPuzzle } from './types/puzzle';

/** Timer state information */
export type { Timer } from './types/timer';

/** Friends leaderboard score with breakdown and statistics */
export type { FriendsLeaderboardScore } from './types/scoringTypes';

/** Type of puzzle (daily, book, scanned, or unknown) */
export type { PuzzleType } from './types/scoringTypes';

/** Scoring calculation result with all bonus components */
export type { ScoringResult } from './types/scoringTypes';

/** Map of all friend sessions for scoring calculations */
export type { AllFriendsSessionsMap } from './types/scoringTypes';

/** Select a number from number pad */
export type { SelectNumber } from './types/state';

/** Set currently selected cell */
export type { SetSelectedCell } from './types/state';

/** Set answer for a cell */
export type { SetAnswer } from './types/state';

/** Game metadata (puzzleId, difficulty, timestamps) */
export type { GameStateMetadata } from './types/state';

/** Complete game state (generic) */
export type { GameState } from './types/state';

/** Server state data */
export type { ServerState } from './types/state';

// ===== Server Types =====

/** Session response from server */
export type { SessionResponse } from './types/serverTypes';

/** Session with parsed data */
export type { Session } from './types/serverTypes';

/** Party-specific session data */
export type { SessionParty } from './types/serverTypes';

/** Map of party IDs to session data */
export type { Parties } from './types/serverTypes';

/** State response with party data */
export type { StateResponse } from './types/serverTypes';

/** Server state result */
export type { ServerStateResult } from './types/serverTypes';

/** Party response from server */
export type { PartyResponse } from './types/serverTypes';

/** Member response from server */
export type { MemberResponse } from './types/serverTypes';

/** Party member data */
export type { Member } from './types/serverTypes';

/** Party data */
export type { Party } from './types/serverTypes';

/** Invitation response from server */
export type { InviteResponse } from './types/serverTypes';

/** Invitation data */
export type { Invite } from './types/serverTypes';

/** Public invitation data */
export type { PublicInvite } from './types/serverTypes';

/** Sudoku of the day response from server */
export type { SudokuOfTheDayResponse } from './types/serverTypes';

/** Sudoku of the day with parsed data */
export type { SudokuOfTheDay } from './types/serverTypes';

/** Sudoku book puzzle data */
export type { SudokuBookPuzzle } from './types/serverTypes';

/** Sudoku book of the month response from server */
export type { SudokuBookOfTheMonthResponse } from './types/serverTypes';

/** Sudoku book of the month with parsed data */
export type { SudokuBookOfTheMonth } from './types/serverTypes';

// ===== Enums =====

/** Entitlement duration options */
export { EntitlementDuration } from './types/serverTypes';

/** Puzzle difficulty levels */
export { Difficulty } from './types/serverTypes';

/** Book puzzle difficulty levels */
export { BookPuzzleDifficulty } from './types/serverTypes';
