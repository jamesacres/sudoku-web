import { Puzzle, PuzzleRowOrColumn } from '@/types/puzzle';

export const puzzleTextToPuzzle = (puzzleText: string): Puzzle => {
  // eslint-disable-next-line
const puzzle: Puzzle = [[[[0,0,0],[0,0,0],[0,0,0]],[[0,0,0],[0,0,0],[0,0,0]],[[0,0,0],[0,0,0],[0,0,0]]],[[[0,0,0],[0,0,0],[0,0,0]],[[0,0,0],[0,0,0],[0,0,0]],[[0,0,0],[0,0,0],[0,0,0]]],[[[0,0,0],[0,0,0],[0,0,0]],[[0,0,0],[0,0,0],[0,0,0]],[[0,0,0],[0,0,0],[0,0,0]]]];
  const lines = [
    puzzleText.slice(0, 9),
    puzzleText.slice(9, 18),
    puzzleText.slice(18, 27),
    puzzleText.slice(27, 36),
    puzzleText.slice(36, 45),
    puzzleText.slice(45, 54),
    puzzleText.slice(54, 63),
    puzzleText.slice(63, 72),
    puzzleText.slice(72, 81),
  ];
  for (const [row, line] of Object.entries(lines)) {
    const boxes = [line.slice(0, 3), line.slice(3, 6), line.slice(6, 9)];
    for (const [box, columns] of Object.entries(boxes)) {
      const values = columns.split('');
      for (const [column, value] of Object.entries(values)) {
        const boxX = Number(box) as PuzzleRowOrColumn;
        const boxY = Math.floor(Number(row) / 3) as PuzzleRowOrColumn;
        const cellX = Number(column) as PuzzleRowOrColumn;
        const cellY = (Number(row) % 3) as PuzzleRowOrColumn;
        puzzle[boxX][boxY][cellX][cellY] = Number(value.replace('.', '0'));
      }
    }
  }
  return puzzle;
};
