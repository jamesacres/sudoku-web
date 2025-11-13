// Import Puzzle types from gameState
export type {
  Notes,
  PuzzleRowOrColumn,
  PuzzleBox,
  PuzzleRow,
  Puzzle,
} from './gameState';
import type { Puzzle } from './gameState';

export const emptyPuzzle: Puzzle<number> = {
  '0': {
    '0': { '0': [], '1': [], '2': [] },
    '1': { '0': [], '1': [], '2': [] },
    '2': { '0': [], '1': [], '2': [] },
  },
  '1': {
    '0': { '0': [], '1': [], '2': [] },
    '1': { '0': [], '1': [], '2': [] },
    '2': { '0': [], '1': [], '2': [] },
  },
  '2': {
    '0': { '0': [], '1': [], '2': [] },
    '1': { '0': [], '1': [], '2': [] },
    '2': { '0': [], '1': [], '2': [] },
  },
};
