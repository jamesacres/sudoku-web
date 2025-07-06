import { calculateCellId } from '@/helpers/calculateId';
import SudokuInput from '../SudokuInput';
import { PuzzleBox, PuzzleRowOrColumn } from '@/types/puzzle';
import { SelectNumber, SetSelectedCell } from '@/types/state';
import { memo, PointerEvent } from 'react';
import { KillerCage, CageValidationResult } from '@/types/killer';
import { cellIdToPosition } from '@/helpers/killerUtils';

interface Arguments {
  boxId: string;
  selectedCell: string | null;
  setSelectedCell: SetSelectedCell;
  answer: PuzzleBox;
  selectNumber: SelectNumber;
  validation?: PuzzleBox<boolean | undefined>;
  initial: PuzzleBox;
  isMiniNotes: boolean;
  isZoomMode?: boolean;
  onDragStart?: (e: PointerEvent) => void;
  // Killer sudoku props
  isKillerMode?: boolean;
  killerCages?: KillerCage[];
  killerCageValidation?: Map<string, CageValidationResult>;
}

const SudokuBox = ({
  boxId,
  selectedCell,
  setSelectedCell,
  answer,
  selectNumber,
  validation,
  initial,
  isMiniNotes,
  isZoomMode,
  onDragStart,
  isKillerMode = false,
  killerCages = [],
  killerCageValidation = new Map(),
}: Arguments) => {
  return (
    <div
      data-box-id={boxId}
      className="border-theme-primary dark:border-theme-primary-light grid aspect-square cursor-pointer grid-cols-3 grid-rows-3 border border-2"
    >
      {Array.from(Array(3)).map((_, y) =>
        Array.from(Array(3)).map((_, x) => {
          const cellId = calculateCellId(boxId, x, y);

          // Find killer sudoku cage for this cell
          let killerCage: KillerCage | undefined;
          let isCageTopLeft = false;
          let isCageValid = true;
          let isCageComplete = false;

          if (isKillerMode && killerCages.length > 0) {
            const cellPosition = cellIdToPosition(cellId);
            killerCage = killerCages.find((cage) =>
              cage.cells.some(
                (pos) =>
                  pos.boxX === cellPosition.boxX &&
                  pos.boxY === cellPosition.boxY &&
                  pos.cellX === cellPosition.cellX &&
                  pos.cellY === cellPosition.cellY
              )
            );

            if (killerCage) {
              // Check if this is the top-left cell of the cage (for sum display)
              const cagePositions = killerCage.cells.map((pos) => ({
                absoluteRow: pos.boxY * 3 + pos.cellY,
                absoluteCol: pos.boxX * 3 + pos.cellX,
                ...pos,
              }));

              const topLeftPosition = cagePositions.reduce(
                (topLeft, current) => {
                  if (current.absoluteRow < topLeft.absoluteRow) return current;
                  if (
                    current.absoluteRow === topLeft.absoluteRow &&
                    current.absoluteCol < topLeft.absoluteCol
                  )
                    return current;
                  return topLeft;
                }
              );

              isCageTopLeft =
                topLeftPosition.boxX === cellPosition.boxX &&
                topLeftPosition.boxY === cellPosition.boxY &&
                topLeftPosition.cellX === cellPosition.cellX &&
                topLeftPosition.cellY === cellPosition.cellY;

              // Get validation result
              const validationResult = killerCageValidation.get(killerCage.id);
              if (validationResult) {
                isCageValid = validationResult.isValid;
                isCageComplete = validationResult.isComplete;
              }
            }
          }

          return (
            <SudokuInput
              key={cellId}
              cellId={cellId}
              selectedCell={selectedCell}
              setSelectedCell={setSelectedCell}
              selectNumber={selectNumber}
              value={answer[x as PuzzleRowOrColumn][y as PuzzleRowOrColumn]}
              validation={
                validation &&
                validation[x as PuzzleRowOrColumn][y as PuzzleRowOrColumn]
              }
              isInitial={
                !!initial[x as PuzzleRowOrColumn][y as PuzzleRowOrColumn]
              }
              isMiniNotes={isMiniNotes}
              isZoomMode={isZoomMode}
              onDragStart={onDragStart}
              // Killer sudoku props
              isKillerMode={isKillerMode}
              killerCage={killerCage}
              cellPosition={killerCage ? cellIdToPosition(cellId) : undefined}
              isCageTopLeft={isCageTopLeft}
              isCageValid={isCageValid}
              isCageComplete={isCageComplete}
            />
          );
        })
      )}
    </div>
  );
};

// Prevent re-render on timer change
const MemoisedSudokuBox = memo(function MemoisedSudokuBox(args: Arguments) {
  return SudokuBox(args);
});

export default MemoisedSudokuBox;
