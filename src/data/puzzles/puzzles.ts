import { puzzleTextToPuzzle } from '@/helpers/puzzleTextToPuzzle';
import { Puzzle } from '@/types/puzzle';

const puzzle1 = `
530 070 000
600 195 000
098 000 060

800 060 003
400 803 001
700 020 006

060 000 280
000 419 005
000 080 079
`;

const puzzles: { [puzzleId: number]: Puzzle } = {
  1: puzzleTextToPuzzle(puzzle1),
};

export default puzzles;
