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
const answer1 = `
534 678 912
672 195 348
198 342 567

859 761 423
426 853 791
713 924 856

961 537 284
287 419 635
345 286 179
`;

const puzzles: { [puzzleId: number]: { initial: Puzzle; final: Puzzle } } = {
  1: {
    initial: puzzleTextToPuzzle(puzzle1),
    final: puzzleTextToPuzzle(answer1),
  },
};

export default puzzles;
