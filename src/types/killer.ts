import { Puzzle } from './puzzle';
import { Notes } from './notes';

// Position interface for cell coordinates
export interface CellPosition {
  boxX: number;
  boxY: number;
  cellX: number;
  cellY: number;
}

// Killer sudoku cage definition
export interface KillerCage {
  id: string;
  cells: CellPosition[];
  sum: number;
  isComplete?: boolean;
  isValid?: boolean;
}

// Extended puzzle type for killer sudoku
export interface KillerPuzzle<T extends number | Notes = number | Notes>
  extends Puzzle<T> {
  cages: KillerCage[];
  cageMap: Map<string, string>; // cellId -> cageId mapping
}

// Killer sudoku game state extensions
export interface KillerGameState {
  cages: KillerCage[];
  cageValidation: Map<string, boolean>;
  isKillerMode: boolean;
}

// Cage validation result
export interface CageValidationResult {
  isValid: boolean;
  isComplete: boolean;
  currentSum: number;
  targetSum: number;
  filledCells: number;
  totalCells: number;
}

// Conversion result when converting regular sudoku to killer
export interface KillerConversionResult {
  killerPuzzle: KillerPuzzle;
  killerInitial: Puzzle;
  killerFinal: Puzzle;
  cages: KillerCage[];
  success: boolean;
  error?: string;
}

// Helper type for cage generation
export interface CageGenerationOptions {
  minCageSize: number;
  maxCageSize: number;
  targetCageCount?: number;
  allowSingleCells?: boolean;
}
