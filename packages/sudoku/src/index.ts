// @sudoku-web/sudoku - Sudoku Game Logic Package
// Public API exports

// Components
// Note: NumberPad, TimerDisplay, TrafficLight are basic reusable components
export { default as NumberPad } from './components/NumberPad';
export { TimerDisplay } from './components/TimerDisplay';
export { TrafficLight } from './components/TrafficLight';

// Note: The following components have app-specific dependencies and are NOT exported:
// - SudokuBox (depends on SudokuInput which is app-specific)
// - Sudoku, SimpleSudoku, RaceTrack (depend on app-specific hooks/context)
// Apps should implement their own versions or copy these as templates
// export { default as SudokuBox } from './components/SudokuBox';
// export { default as Sudoku } from './components/Sudoku';
// export { default as SimpleSudoku } from './components/SimpleSudoku';
// export { RaceTrack } from './components/RaceTrack';

// Helpers
export { checkCell, checkGrid, isInitialCell } from './helpers/checkAnswer';
export { calculateCompletionPercentage } from './helpers/calculateCompletionPercentage';
export { puzzleTextToPuzzle } from './helpers/puzzleTextToPuzzle';
export { calculateBoxId, calculateCellId, splitCellId, calculateNextCellId } from './helpers/calculateId';

// Hooks
export { useTimer } from './hooks/timer';
// Note: useGameState has app-specific dependencies (useParties, useSessions)
// It's in the package but not exported - apps should implement their own version
// export { useGameState } from './hooks/gameState';

// Utils
export {
  getTodayDateString,
  getDailyPuzzleIds,
  addDailyPuzzleId,
  getDailyPuzzleCount,
} from './utils/dailyPuzzleCounter';

// Types
export type { Cell } from './types/Cell';
export type { SudokuGrid, SudokuState } from './types/SudokuGrid';
export type { Notes, ToggleNote } from './types/notes';
export type { Puzzle, PuzzleRowOrColumn, PuzzleBox, PuzzleRow } from './types/puzzle';
export { emptyPuzzle } from './types/puzzle';
export type { Timer } from './types/timer';
export type {
  SelectNumber,
  SetSelectedCell,
  SetAnswer,
  GameStateMetadata,
  GameState,
  ServerState,
} from './types/state';
export type {
  SessionResponse,
  Session,
  SessionParty,
  Parties,
  StateResponse,
  ServerStateResult,
  PartyResponse,
  MemberResponse,
  Member,
  Party,
  InviteResponse,
  Invite,
  PublicInvite,
  SudokuOfTheDayResponse,
  SudokuOfTheDay,
  SudokuBookPuzzle,
  SudokuBookOfTheMonthResponse,
  SudokuBookOfTheMonth,
} from './types/serverTypes';
export { EntitlementDuration, Difficulty, BookPuzzleDifficulty } from './types/serverTypes';
