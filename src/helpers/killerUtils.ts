import { CellPosition } from '@/types/killer';

// Convert cell position to string for use as map key
export const positionToString = (position: CellPosition): string => {
  return `${position.boxX}-${position.boxY}-${position.cellX}-${position.cellY}`;
};

// Convert string back to cell position
export const stringToPosition = (positionString: string): CellPosition => {
  const [boxX, boxY, cellX, cellY] = positionString.split('-').map(Number);
  return { boxX, boxY, cellX, cellY };
};

// Convert cell position to cell ID (compatible with existing system)
export const positionToCellId = (position: CellPosition): string => {
  const boxId = `${position.boxX}${position.boxY}`;
  return `${boxId}${position.cellX}${position.cellY}`;
};

// Convert cell ID back to position
export const cellIdToPosition = (cellId: string): CellPosition => {
  // Parse cellId format: "box:0,0,cell:0,0"
  const [boxPart, cellPart] = cellId.split(',cell:');
  const boxCoords = boxPart.replace('box:', '').split(',');
  const cellCoords = cellPart.split(',');

  return {
    boxX: parseInt(boxCoords[0]),
    boxY: parseInt(boxCoords[1]),
    cellX: parseInt(cellCoords[0]),
    cellY: parseInt(cellCoords[1]),
  };
};

// Get all adjacent positions (up, down, left, right)
export const getAdjacentPositions = (
  position: CellPosition
): CellPosition[] => {
  const adjacent: CellPosition[] = [];

  // Calculate absolute row and column in 9x9 grid
  const absoluteRow = position.boxY * 3 + position.cellY;
  const absoluteCol = position.boxX * 3 + position.cellX;

  // Define possible moves (up, down, left, right)
  const moves = [
    [-1, 0], // up
    [1, 0], // down
    [0, -1], // left
    [0, 1], // right
  ];

  moves.forEach(([deltaRow, deltaCol]) => {
    const newRow = absoluteRow + deltaRow;
    const newCol = absoluteCol + deltaCol;

    // Check bounds (0-8 for both row and col)
    if (newRow >= 0 && newRow < 9 && newCol >= 0 && newCol < 9) {
      // Convert back to box/cell coordinates
      const newBoxY = Math.floor(newRow / 3);
      const newCellY = newRow % 3;
      const newBoxX = Math.floor(newCol / 3);
      const newCellX = newCol % 3;

      adjacent.push({
        boxX: newBoxX,
        boxY: newBoxY,
        cellX: newCellX,
        cellY: newCellY,
      });
    }
  });

  return adjacent;
};

// Check if two positions are adjacent
export const arePositionsAdjacent = (
  pos1: CellPosition,
  pos2: CellPosition
): boolean => {
  const adjacent = getAdjacentPositions(pos1);
  return adjacent.some(
    (adj) =>
      adj.boxX === pos2.boxX &&
      adj.boxY === pos2.boxY &&
      adj.cellX === pos2.cellX &&
      adj.cellY === pos2.cellY
  );
};

// Check if a cage is connected (all cells are reachable from each other)
export const isCageConnected = (cells: CellPosition[]): boolean => {
  if (cells.length <= 1) return true;

  const visited = new Set<string>();
  const queue = [cells[0]];
  visited.add(positionToString(cells[0]));

  while (queue.length > 0) {
    const current = queue.shift()!;
    const adjacent = getAdjacentPositions(current);

    adjacent.forEach((adjPos) => {
      const adjString = positionToString(adjPos);
      const isCageCell = cells.some(
        (cell) => positionToString(cell) === adjString
      );

      if (isCageCell && !visited.has(adjString)) {
        visited.add(adjString);
        queue.push(adjPos);
      }
    });
  }

  return visited.size === cells.length;
};

// Generate a unique cage ID
export const generateCageId = (): string => {
  return `cage_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Calculate all possible combinations of numbers that sum to target
export const getPossibleCombinations = (
  cageSize: number,
  targetSum: number,
  usedNumbers: Set<number> = new Set()
): number[][] => {
  const combinations: number[][] = [];
  const availableNumbers = Array.from({ length: 9 }, (_, i) => i + 1).filter(
    (n) => !usedNumbers.has(n)
  );

  const generateCombination = (
    remaining: number,
    currentSum: number,
    current: number[],
    startIndex: number
  ): void => {
    if (remaining === 0) {
      if (currentSum === targetSum) {
        combinations.push([...current]);
      }
      return;
    }

    if (currentSum >= targetSum) return;

    for (let i = startIndex; i < availableNumbers.length; i++) {
      const num = availableNumbers[i];
      if (currentSum + num <= targetSum) {
        current.push(num);
        generateCombination(remaining - 1, currentSum + num, current, i + 1);
        current.pop();
      }
    }
  };

  generateCombination(cageSize, 0, [], 0);
  return combinations;
};
