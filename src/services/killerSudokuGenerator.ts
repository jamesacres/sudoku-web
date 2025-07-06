import { Puzzle } from '@/types/puzzle';
import {
  KillerCage,
  KillerPuzzle,
  CellPosition,
  CageGenerationOptions,
  KillerConversionResult,
} from '@/types/killer';
import {
  positionToString,
  getAdjacentPositions,
  generateCageId,
  isCageConnected,
  positionToCellId,
} from '@/helpers/killerUtils';

export class KillerSudokuGenerator {
  private readonly DEFAULT_OPTIONS: CageGenerationOptions = {
    minCageSize: 2,
    maxCageSize: 3, // Even smaller for testing
    allowSingleCells: false,
  };

  /**
   * Convert a completed regular sudoku to killer sudoku
   */
  convertToKillerSudoku(
    completedPuzzle: Puzzle<number>,
    options: Partial<CageGenerationOptions> = {}
  ): KillerConversionResult {
    try {
      const config = { ...this.DEFAULT_OPTIONS, ...options };
      const cages = this.generateCages(completedPuzzle, config);

      // Calculate cage sums based on the completed puzzle
      const cagesWithSums = cages.map((cage) => ({
        ...cage,
        sum: this.calculateCageSum(cage, completedPuzzle),
      }));

      // Create empty initial puzzle (killer sudoku typically starts empty)
      const emptyPuzzle = this.createEmptyPuzzle();

      // Create cage map for efficient lookups
      const cageMap = this.createCageMap(cagesWithSums);

      const killerPuzzle: KillerPuzzle = {
        ...emptyPuzzle,
        cages: cagesWithSums,
        cageMap,
      };

      return {
        killerPuzzle,
        killerInitial: emptyPuzzle, // Empty puzzle for initial state
        killerFinal: completedPuzzle, // Solution for validation
        cages: cagesWithSums,
        success: true,
      };
    } catch (error) {
      return {
        killerPuzzle: {} as KillerPuzzle,
        killerInitial: {} as Puzzle<number>,
        killerFinal: {} as Puzzle<number>,
        cages: [],
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Generate cages that cover all cells in the puzzle
   */
  private generateCages(
    puzzle: Puzzle<number>,
    options: CageGenerationOptions
  ): KillerCage[] {
    const cages: KillerCage[] = [];
    const usedCells = new Set<string>();

    // Get all cell positions
    const allPositions = this.getAllPositions();

    // Shuffle positions for random cage generation
    const shuffledPositions = this.shuffleArray([...allPositions]);

    for (const position of shuffledPositions) {
      const positionString = positionToString(position);

      if (!usedCells.has(positionString)) {
        const cage = this.generateCageFromPosition(
          position,
          usedCells,
          options
        );

        if (cage && cage.cells.length > 0) {
          // Mark all cells in this cage as used
          cage.cells.forEach((cell) => {
            const cellString = positionToString(cell);
            if (usedCells.has(cellString)) {
              console.error(`Cell ${cellString} already used!`);
            }
            usedCells.add(cellString);
          });

          cages.push(cage);
        }
      }
    }

    // Handle any remaining single cells
    const remainingPositions = allPositions.filter(
      (pos) => !usedCells.has(positionToString(pos))
    );

    if (remainingPositions.length > 0) {
      remainingPositions.forEach((pos) => {
        cages.push({
          id: generateCageId(),
          cells: [pos],
          sum: 0, // Will be calculated later
        });
      });
    }

    return cages;
  }

  /**
   * Generate a cage starting from a specific position
   */
  private generateCageFromPosition(
    startPosition: CellPosition,
    usedCells: Set<string>,
    options: CageGenerationOptions
  ): KillerCage | null {
    const targetSize = this.randomBetween(
      options.minCageSize,
      options.maxCageSize
    );
    const cage: KillerCage = {
      id: generateCageId(),
      cells: [startPosition],
      sum: 0, // Will be calculated later
    };

    const visited = new Set<string>([positionToString(startPosition)]);
    const candidates = this.getAvailableNeighbors(
      startPosition,
      usedCells,
      visited
    );

    // Use a growth algorithm to expand the cage
    while (cage.cells.length < targetSize && candidates.length > 0) {
      // Pick a random candidate
      const randomIndex = Math.floor(Math.random() * candidates.length);
      const nextPosition = candidates[randomIndex];

      cage.cells.push(nextPosition);
      visited.add(positionToString(nextPosition));

      // Remove the selected candidate and add new neighbors
      candidates.splice(randomIndex, 1);

      const newNeighbors = this.getAvailableNeighbors(
        nextPosition,
        usedCells,
        visited
      );
      candidates.push(...newNeighbors);

      // Remove duplicates
      const uniqueCandidates = candidates.filter(
        (candidate, index) =>
          candidates.findIndex(
            (c) => positionToString(c) === positionToString(candidate)
          ) === index
      );
      candidates.length = 0;
      candidates.push(...uniqueCandidates);
    }

    // Verify the cage is connected
    if (!isCageConnected(cage.cells)) {
      console.warn('Generated cage is not connected, retrying...');
      return null;
    }

    return cage;
  }

  /**
   * Get available neighboring positions
   */
  private getAvailableNeighbors(
    position: CellPosition,
    usedCells: Set<string>,
    visited: Set<string>
  ): CellPosition[] {
    const adjacent = getAdjacentPositions(position);

    return adjacent.filter((adjPos) => {
      const adjString = positionToString(adjPos);
      return !usedCells.has(adjString) && !visited.has(adjString);
    });
  }

  /**
   * Calculate the sum for a cage based on the completed puzzle
   */
  private calculateCageSum(cage: KillerCage, puzzle: Puzzle<number>): number {
    return cage.cells.reduce((sum, position) => {
      // Access puzzle using correct coordinate order: [boxX][boxY][cellX][cellY]
      const value =
        puzzle[position.boxX as 0 | 1 | 2][position.boxY as 0 | 1 | 2][
          position.cellX as 0 | 1 | 2
        ][position.cellY as 0 | 1 | 2];
      return sum + value;
    }, 0);
  }

  /**
   * Create an empty puzzle (all cells set to 0)
   */
  private createEmptyPuzzle(): Puzzle<number> {
    return {
      0: {
        0: { 0: [0, 0, 0], 1: [0, 0, 0], 2: [0, 0, 0] },
        1: { 0: [0, 0, 0], 1: [0, 0, 0], 2: [0, 0, 0] },
        2: { 0: [0, 0, 0], 1: [0, 0, 0], 2: [0, 0, 0] },
      },
      1: {
        0: { 0: [0, 0, 0], 1: [0, 0, 0], 2: [0, 0, 0] },
        1: { 0: [0, 0, 0], 1: [0, 0, 0], 2: [0, 0, 0] },
        2: { 0: [0, 0, 0], 1: [0, 0, 0], 2: [0, 0, 0] },
      },
      2: {
        0: { 0: [0, 0, 0], 1: [0, 0, 0], 2: [0, 0, 0] },
        1: { 0: [0, 0, 0], 1: [0, 0, 0], 2: [0, 0, 0] },
        2: { 0: [0, 0, 0], 1: [0, 0, 0], 2: [0, 0, 0] },
      },
    };
  }

  /**
   * Get all possible cell positions in the puzzle
   */
  private getAllPositions(): CellPosition[] {
    const positions: CellPosition[] = [];

    // Generate positions in absolute row/col order first for debugging
    for (let absoluteRow = 0; absoluteRow < 9; absoluteRow++) {
      for (let absoluteCol = 0; absoluteCol < 9; absoluteCol++) {
        const boxY = Math.floor(absoluteRow / 3);
        const boxX = Math.floor(absoluteCol / 3);
        const cellY = absoluteRow % 3;
        const cellX = absoluteCol % 3;

        positions.push({ boxX, boxY, cellX, cellY });
      }
    }

    return positions;
  }

  /**
   * Create a map from cell positions to cage IDs
   */
  private createCageMap(cages: KillerCage[]): Map<string, string> {
    const cageMap = new Map<string, string>();

    cages.forEach((cage) => {
      cage.cells.forEach((position) => {
        const cellId = positionToCellId(position);
        cageMap.set(cellId, cage.id);
      });
    });

    return cageMap;
  }

  /**
   * Shuffle an array using Fisher-Yates algorithm
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Generate a random number between min and max (inclusive)
   */
  private randomBetween(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
