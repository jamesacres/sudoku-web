import { Notes } from '@/types/notes';
import { Puzzle, PuzzleRowOrColumn } from '@/types/puzzle';

export const calculateCompletionPercentage = (
  initial: Puzzle<number | Notes>,
  final: Puzzle<number | Notes>,
  latest: Puzzle<number | Notes> | undefined
): number => {
  if (!latest) return 0;

  const rowOrColumn: PuzzleRowOrColumn[] = [0, 1, 2];
  let totalEmptyCells = 0;
  let correctlySolvedCells = 0;

  for (const boxX of rowOrColumn) {
    for (const boxY of rowOrColumn) {
      for (const cellX of rowOrColumn) {
        for (const cellY of rowOrColumn) {
          // Check if this is a cell the user needs to fill (not provided initially)
          if (!initial[boxX][boxY][cellX][cellY]) {
            totalEmptyCells++;

            // Check if the cell has been filled correctly
            if (
              latest[boxX][boxY][cellX][cellY] ===
              final[boxX][boxY][cellX][cellY]
            ) {
              correctlySolvedCells++;
            }
          }
        }
      }
    }
  }

  // Return the percentage completed (avoid division by zero)
  if (totalEmptyCells === 0) return 100;
  return Math.round((correctlySolvedCells / totalEmptyCells) * 100);
};
