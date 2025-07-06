import { Puzzle } from '@/types/puzzle';
import { KillerCage, CageValidationResult, CellPosition } from '@/types/killer';

/**
 * Validate a single cage's constraints
 */
export const validateCage = (
  cage: KillerCage,
  puzzle: Puzzle<number>
): CageValidationResult => {
  const values: number[] = [];
  let filledCells = 0;

  // Get values from all cage cells
  cage.cells.forEach((position) => {
    const value =
      puzzle[position.boxY as 0 | 1 | 2][position.boxX as 0 | 1 | 2][
        position.cellY as 0 | 1 | 2
      ][position.cellX as 0 | 1 | 2];
    if (value !== 0) {
      values.push(value);
      filledCells++;
    }
  });

  const currentSum = values.reduce((sum, val) => sum + val, 0);
  const isComplete = filledCells === cage.cells.length;
  const hasUniqueValues = new Set(values).size === values.length;
  const sumIsValid = isComplete
    ? currentSum === cage.sum
    : currentSum <= cage.sum;
  const allValuesValid = values.every((val) => val >= 1 && val <= 9);

  const isValid = hasUniqueValues && sumIsValid && allValuesValid;

  return {
    isValid: isComplete ? isValid && currentSum === cage.sum : isValid,
    isComplete,
    currentSum,
    targetSum: cage.sum,
    filledCells,
    totalCells: cage.cells.length,
  };
};

/**
 * Validate all cages in a killer sudoku puzzle
 */
export const validateAllCages = (
  cages: KillerCage[],
  puzzle: Puzzle<number>
): Map<string, CageValidationResult> => {
  const validationResults = new Map<string, CageValidationResult>();

  cages.forEach((cage) => {
    const result = validateCage(cage, puzzle);
    validationResults.set(cage.id, result);
  });

  return validationResults;
};

/**
 * Check if the entire killer sudoku puzzle is valid and complete
 */
export const checkKillerSudoku = (
  cages: KillerCage[],
  puzzle: Puzzle<number>
): {
  isValid: boolean;
  isComplete: boolean;
  cageValidation: Map<string, CageValidationResult>;
  invalidCages: string[];
} => {
  const cageValidation = validateAllCages(cages, puzzle);
  const invalidCages: string[] = [];

  let isValid = true;
  let isComplete = true;

  cageValidation.forEach((result, cageId) => {
    if (!result.isValid) {
      isValid = false;
      invalidCages.push(cageId);
    }
    if (!result.isComplete) {
      isComplete = false;
    }
  });

  // Also check standard sudoku rules
  const hasValidSudokuRules = checkStandardSudokuRules(puzzle);
  if (!hasValidSudokuRules) {
    isValid = false;
  }

  return {
    isValid: isValid && hasValidSudokuRules,
    isComplete: isComplete && isValid,
    cageValidation,
    invalidCages,
  };
};

/**
 * Check standard sudoku rules (rows, columns, boxes)
 */
const checkStandardSudokuRules = (puzzle: Puzzle<number>): boolean => {
  // Check rows
  for (let row = 0; row < 9; row++) {
    const rowValues: number[] = [];
    for (let col = 0; col < 9; col++) {
      const boxX = Math.floor(col / 3);
      const boxY = Math.floor(row / 3);
      const cellX = col % 3;
      const cellY = row % 3;
      const value =
        puzzle[boxY as 0 | 1 | 2][boxX as 0 | 1 | 2][cellY as 0 | 1 | 2][
          cellX as 0 | 1 | 2
        ];
      if (value !== 0) {
        if (rowValues.includes(value)) return false;
        rowValues.push(value);
      }
    }
  }

  // Check columns
  for (let col = 0; col < 9; col++) {
    const colValues: number[] = [];
    for (let row = 0; row < 9; row++) {
      const boxX = Math.floor(col / 3);
      const boxY = Math.floor(row / 3);
      const cellX = col % 3;
      const cellY = row % 3;
      const value =
        puzzle[boxY as 0 | 1 | 2][boxX as 0 | 1 | 2][cellY as 0 | 1 | 2][
          cellX as 0 | 1 | 2
        ];
      if (value !== 0) {
        if (colValues.includes(value)) return false;
        colValues.push(value);
      }
    }
  }

  // Check 3x3 boxes
  for (let boxX = 0; boxX < 3; boxX++) {
    for (let boxY = 0; boxY < 3; boxY++) {
      const boxValues: number[] = [];
      for (let cellX = 0; cellX < 3; cellX++) {
        for (let cellY = 0; cellY < 3; cellY++) {
          const value =
            puzzle[boxY as 0 | 1 | 2][boxX as 0 | 1 | 2][cellY as 0 | 1 | 2][
              cellX as 0 | 1 | 2
            ];
          if (value !== 0) {
            if (boxValues.includes(value)) return false;
            boxValues.push(value);
          }
        }
      }
    }
  }

  return true;
};

/**
 * Get possible values for a cell based on cage constraints
 */
export const getPossibleValuesForCell = (
  position: CellPosition,
  cage: KillerCage,
  puzzle: Puzzle<number>
): number[] => {
  const possibleValues: number[] = [];

  // Get current values in the cage
  const currentValues = cage.cells
    .filter(
      (pos) =>
        !(
          pos.boxX === position.boxX &&
          pos.boxY === position.boxY &&
          pos.cellX === position.cellX &&
          pos.cellY === position.cellY
        )
    )
    .map(
      (pos) =>
        puzzle[pos.boxY as 0 | 1 | 2][pos.boxX as 0 | 1 | 2][
          pos.cellY as 0 | 1 | 2
        ][pos.cellX as 0 | 1 | 2]
    )
    .filter((val) => val !== 0);

  const currentSum = currentValues.reduce((sum, val) => sum + val, 0);
  const remainingSum = cage.sum - currentSum;
  const emptyCells = cage.cells.length - currentValues.length;

  // Check each possible value (1-9)
  for (let value = 1; value <= 9; value++) {
    // Skip if value already used in cage
    if (currentValues.includes(value)) continue;

    // Check if this value allows the cage to be completed
    const minPossibleSum = currentSum + value + (emptyCells - 1); // remaining cells get 1 each
    const maxPossibleSum =
      currentSum +
      value +
      (9 + 8 + 7 + 6 + 5 + 4 + 3 + 2 + 1)
        .toString()
        .split('')
        .map(Number)
        .sort((a, b) => b - a)
        .slice(0, emptyCells - 1)
        .reduce((sum, val) => sum + val, 0);

    if (
      remainingSum >= value &&
      remainingSum <= maxPossibleSum &&
      remainingSum >= minPossibleSum
    ) {
      possibleValues.push(value);
    }
  }

  return possibleValues;
};

/**
 * Check if a cage is mathematically valid (can be completed)
 */
export const isCageMathematicallyValid = (cage: KillerCage): boolean => {
  const cageSize = cage.cells.length;
  const minSum = (cageSize * (cageSize + 1)) / 2; // 1+2+...+cageSize
  const maxSum = (9 * (9 + 1)) / 2 - ((9 - cageSize) * (9 - cageSize + 1)) / 2; // sum of largest cageSize numbers

  return cage.sum >= minSum && cage.sum <= maxSum;
};
