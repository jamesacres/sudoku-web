import { Puzzle, PuzzleRowOrColumn } from '@/types/puzzle';

export const checkAnswer = (
  initial: Puzzle,
  final: Puzzle,
  answer: Puzzle
): Puzzle<boolean | undefined> => {
  const rowOrColumn: PuzzleRowOrColumn[] = [0, 1, 2];
  // eslint-disable-next-line
  const validation: Puzzle<boolean|undefined> = [[[[undefined,undefined,undefined],[undefined,undefined,undefined],[undefined,undefined,undefined]],[[undefined,undefined,undefined],[undefined,undefined,undefined],[undefined,undefined,undefined]],[[undefined,undefined,undefined],[undefined,undefined,undefined],[undefined,undefined,undefined]]],[[[undefined,undefined,undefined],[undefined,undefined,undefined],[undefined,undefined,undefined]],[[undefined,undefined,undefined],[undefined,undefined,undefined],[undefined,undefined,undefined]],[[undefined,undefined,undefined],[undefined,undefined,undefined],[undefined,undefined,undefined]]],[[[undefined,undefined,undefined],[undefined,undefined,undefined],[undefined,undefined,undefined]],[[undefined,undefined,undefined],[undefined,undefined,undefined],[undefined,undefined,undefined]],[[undefined,undefined,undefined],[undefined,undefined,undefined],[undefined,undefined,undefined]]]];
  for (const boxX of rowOrColumn) {
    for (const boxY of rowOrColumn) {
      for (const cellX of rowOrColumn) {
        for (const cellY of rowOrColumn) {
          if (!initial[boxX][boxY][cellX][cellY]) {
            const isValid =
              final[boxX][boxY][cellX][cellY] ===
              answer[boxX][boxY][cellX][cellY];
            validation[boxX][boxY][cellX][cellY] = isValid;
          }
        }
      }
    }
  }
  return validation;
};
