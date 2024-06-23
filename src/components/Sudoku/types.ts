import { Notes } from '@/types/notes';

export type SetSelectedCell = (_cell: string | null) => void;

export type SetAnswer = (_value: number | Notes) => void;

export enum StateType {
  PUZZLE = 'PUZZLE',
  TIMER = 'TIMER',
}

export interface Timer {
  seconds: number;
  inProgress: {
    start: string;
    lastInteraction: string;
  };
}
