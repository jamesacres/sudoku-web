import { Notes } from '@/types/notes';

export type SetSelectedCell = (_cell: string | null) => void;

export type SetAnswer = (_value: number | Notes) => void;
