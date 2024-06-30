import { Notes } from './notes';

export type SelectNumber = (_value: number) => void;

export type SetSelectedCell = (_cell: string | null) => void;

export type SetAnswer = (_value: number | Notes) => void;
