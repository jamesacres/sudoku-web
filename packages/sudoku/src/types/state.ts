import { Notes } from './notes';
// Import ServerState from gameState
export type {
  ServerState,
  GameState,
  GameStateMetadata,
  Timer,
} from './gameState';

export type SelectNumber = (_value: number, forceNotes?: boolean) => void;

export type SetSelectedCell = (_cell: string | null) => void;

export type SetAnswer = (_value: number | Notes) => void;
