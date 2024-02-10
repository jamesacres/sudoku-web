export type PuzzleRowOrColumn = 0 | 1 | 2;
export interface PuzzleBox {
  0: number[];
  1: number[];
  2: number[];
}
export interface PuzzleRow {
  0: PuzzleBox;
  1: PuzzleBox;
  2: PuzzleBox;
}
export interface Puzzle {
  0: PuzzleRow;
  1: PuzzleRow;
  2: PuzzleRow;
}
