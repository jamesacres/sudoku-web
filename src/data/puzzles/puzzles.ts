import { puzzleTextToPuzzle } from '@/helpers/puzzleTextToPuzzle';
import { Puzzle } from '@/types/puzzle';

const puzzle1 = `
123 456 789
123 456 789
123 456 789

123 456 789
123 406 789
123 456 789

123 456 789
123 456 789
123 456 789
`;

const puzzles: { [puzzleId: number]: Puzzle } = {
  1: puzzleTextToPuzzle(puzzle1),
};

export default puzzles;
