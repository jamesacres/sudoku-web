import { Puzzle, PuzzleRowOrColumn } from '@/types/puzzle';

export const puzzleTextToPuzzle = (puzzleText: string): Puzzle => {
  // eslint-disable-next-line
const puzzle: Puzzle = [[[[0,0,0],[0,0,0],[0,0,0]],[[0,0,0],[0,0,0],[0,0,0]],[[0,0,0],[0,0,0],[0,0,0]]],[[[0,0,0],[0,0,0],[0,0,0]],[[0,0,0],[0,0,0],[0,0,0]],[[0,0,0],[0,0,0],[0,0,0]]],[[[0,0,0],[0,0,0],[0,0,0]],[[0,0,0],[0,0,0],[0,0,0]],[[0,0,0],[0,0,0],[0,0,0]]]];
  const lines = puzzleText.split('\n').filter((line) => !!line);
  for (const [row, line] of Object.entries(lines)) {
    const boxes = line.split(' ');
    for (const [box, columns] of Object.entries(boxes)) {
      const values = columns.split('');
      for (const [column, value] of Object.entries(values)) {
        const boxX = Number(box) as PuzzleRowOrColumn;
        const boxY = Math.floor(Number(row) / 3) as PuzzleRowOrColumn;
        const cellX = Number(column) as PuzzleRowOrColumn;
        const cellY = (Number(row) % 3) as PuzzleRowOrColumn;
        puzzle[boxX][boxY][cellX][cellY] = Number(value);
      }
    }
  }
  return puzzle;
};
