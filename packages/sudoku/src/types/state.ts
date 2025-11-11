import { Notes } from './notes';
// Import ServerState from the shared types package
export type {
  ServerState,
  GameState,
  GameStateMetadata,
  Timer,
} from '@sudoku-web/types/gameState';

export type SelectNumber = (_value: number, forceNotes?: boolean) => void;

export type SetSelectedCell = (_cell: string | null) => void;

export type SetAnswer = (_value: number | Notes) => void;
