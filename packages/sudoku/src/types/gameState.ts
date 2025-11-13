'use client';

export interface Timer {
  seconds: number;
  inProgress: {
    start: string;
    lastInteraction: string;
  };
  countdown?: number;
  stopped?: boolean;
}

export interface Notes {
  [key: number]: boolean;
}

type Value = number | boolean | Notes | undefined;

export type PuzzleRowOrColumn = 0 | 1 | 2;
export interface PuzzleBox<T extends Value = number | Notes> {
  0: T[];
  1: T[];
  2: T[];
}
export interface PuzzleRow<T extends Value = number | Notes> {
  0: PuzzleBox<T>;
  1: PuzzleBox<T>;
  2: PuzzleBox<T>;
}
export interface Puzzle<T extends Value = number | Notes> {
  0: PuzzleRow<T>;
  1: PuzzleRow<T>;
  2: PuzzleRow<T>;
}

export interface GameStateMetadata {
  difficulty: string;
  sudokuId: string;
  sudokuBookPuzzleId: string;
  scannedAt: string;
}

export interface GameState {
  answerStack: Puzzle[];
  initial: Puzzle<number>;
  final: Puzzle<number>;
  completed?: {
    at: string;
    seconds: number;
  };
  metadata?: Partial<GameStateMetadata>;
}

export interface ServerState extends GameState {
  timer?: Timer;
}
