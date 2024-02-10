export type PuzzleRowOrColumn = 0 | 1 | 2;
export interface PuzzleBox<T extends number | boolean | undefined = number> {
  0: T[];
  1: T[];
  2: T[];
}
export interface PuzzleRow<T extends number | boolean | undefined = number> {
  0: PuzzleBox<T>;
  1: PuzzleBox<T>;
  2: PuzzleBox<T>;
}
export interface Puzzle<T extends number | boolean | undefined = number> {
  0: PuzzleRow<T>;
  1: PuzzleRow<T>;
  2: PuzzleRow<T>;
}
