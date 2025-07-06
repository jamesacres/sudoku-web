import React from 'react';
import { KillerCage, CellPosition } from '@/types/killer';
import { positionToString } from '@/helpers/killerUtils';

interface KillerCageProps {
  cage: KillerCage;
  cellPosition: CellPosition;
  isTopLeft: boolean;
  children: React.ReactNode;
  isValid?: boolean;
  isComplete?: boolean;
}

const KillerCageComponent: React.FC<KillerCageProps> = ({
  cage,
  cellPosition,
  isTopLeft,
  children,
  isValid = true,
  isComplete = false,
}) => {
  // Calculate which borders should be drawn for this cell
  const getBorderStyle = (): React.CSSProperties => {
    const style: React.CSSProperties = {};

    // Check each direction to see if we need a cage border
    const directions = ['top', 'right', 'bottom', 'left'];

    directions.forEach((direction) => {
      const adjacentPos = getAdjacentPosition(cellPosition, direction);
      const isAdjacentInCage =
        adjacentPos &&
        cage.cells.some(
          (cell) => positionToString(cell) === positionToString(adjacentPos)
        );

      if (!isAdjacentInCage) {
        // Draw border on this side
        const borderColor = isComplete
          ? isValid
            ? '#16a34a'
            : '#dc2626' // green if valid, red if invalid
          : '#7c3aed'; // purple for incomplete cages

        const borderStyle = `3px solid ${borderColor}`;

        // Use explicit property assignment instead of dynamic key
        if (direction === 'top') {
          style.borderTop = borderStyle;
        } else if (direction === 'right') {
          style.borderRight = borderStyle;
        } else if (direction === 'bottom') {
          style.borderBottom = borderStyle;
        } else if (direction === 'left') {
          style.borderLeft = borderStyle;
        }
      }
    });

    return style;
  };

  // Helper function to get adjacent position
  const getAdjacentPosition = (
    pos: CellPosition,
    direction: string
  ): CellPosition | null => {
    // Calculate absolute position
    const absoluteRow = pos.boxY * 3 + pos.cellY;
    const absoluteCol = pos.boxX * 3 + pos.cellX;

    let newRow = absoluteRow;
    let newCol = absoluteCol;

    // Apply direction offset
    switch (direction) {
      case 'top':
        newRow -= 1;
        break;
      case 'bottom':
        newRow += 1;
        break;
      case 'left':
        newCol -= 1;
        break;
      case 'right':
        newCol += 1;
        break;
    }

    // Check bounds
    if (newRow < 0 || newRow >= 9 || newCol < 0 || newCol >= 9) {
      return null;
    }

    // Convert back to box/cell coordinates
    return {
      boxX: Math.floor(newCol / 3),
      boxY: Math.floor(newRow / 3),
      cellX: newCol % 3,
      cellY: newRow % 3,
    };
  };

  return (
    <div className="relative h-full w-full" style={getBorderStyle()}>
      {/* Sum indicator in top-left cell of cage */}
      {isTopLeft && (
        <div
          className="absolute top-0 left-0 z-10 rounded-br bg-white px-1 text-xs font-bold text-gray-700 dark:bg-zinc-900 dark:text-gray-300"
          style={{ fontSize: '10px', lineHeight: '12px' }}
          title={`Cage ${cage.id}: ${cage.cells.length} cells, sum = ${cage.sum}`}
          onClick={() => console.log('🏷️ Cage clicked:', cage)}
        >
          {cage.sum}
        </div>
      )}

      {/* Cell content */}
      <div className="h-full w-full">{children}</div>
    </div>
  );
};

export default KillerCageComponent;
