import { puzzleTextToPuzzle } from '@/helpers/puzzleTextToPuzzle';
import { Puzzle } from '@/types/puzzle';

const puzzle1 = `53..7....6..195....98....6.8...6...34..8.3..17...2...6.6....28....419..5....8..79`;
const answer1 = `534678912672195348198342567859761423426853791713924856961537284287419635345286179`;

const puzzles: {
  [puzzleId: number]: { initial: Puzzle<number>; final: Puzzle<number> };
} = {
  1: {
    initial: puzzleTextToPuzzle(puzzle1),
    final: puzzleTextToPuzzle(answer1),
  },
};

export default puzzles;
