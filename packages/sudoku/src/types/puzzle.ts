// Import Puzzle types from the shared types package
export type {
  Notes,
  PuzzleRowOrColumn,
  PuzzleBox,
  PuzzleRow,
  Puzzle,
} from '@sudoku-web/types/gameState';
import type { Puzzle } from '@sudoku-web/types/gameState';

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
