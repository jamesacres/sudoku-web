import React, { memo } from 'react';
import SudokuInputNotes from '../SudokuInputNotes';
import { Notes } from '@/types/notes';
import { SelectNumber, SetSelectedCell } from '@/types/state';
import { KillerCage, CellPosition } from '@/types/killer';
import KillerCageComponent from '../KillerCage';

interface Arguments {
  cellId: string;
  selectedCell: string | null;
  setSelectedCell: SetSelectedCell;
  selectNumber: SelectNumber;
  value?: number | Notes;
  validation?: boolean;
  isInitial: boolean;
  isMiniNotes: boolean;
  isZoomMode?: boolean;
  onDragStart?: (e: React.PointerEvent) => void;
  // Killer sudoku props
  killerCage?: KillerCage;
  cellPosition?: CellPosition;
  isCageTopLeft?: boolean;
  isCageValid?: boolean;
  isCageComplete?: boolean;
  isKillerMode?: boolean;
}

const SudokuInput = ({
  cellId,
  selectedCell,
  setSelectedCell,
  selectNumber,
  value,
  validation,
  isInitial,
  isMiniNotes,
  isZoomMode,
  onDragStart,
  killerCage,
  cellPosition,
  isCageTopLeft = false,
  isCageValid = true,
  isCageComplete = false,
  isKillerMode = false,
}: Arguments) => {
  const isNotesMode = !(value && typeof value === 'number');
  const notes = isNotesMode && typeof value === 'object' ? value : {};

  const isSelected = selectedCell === cellId;

  let backgroundClass = undefined;
  if (!isNotesMode && value && validation !== undefined) {
    backgroundClass = validation ? 'bg-green-600' : 'bg-red-600';
  } else if (isSelected) {
    backgroundClass = `dark:bg-theme-primary-dark/75 bg-theme-primary-lighter${isInitial ? '/50' : ''}`;
  }

  const textClass = isInitial
    ? 'text-zinc-500 dark:text-zinc-400'
    : 'text-zinc-900 dark:text-zinc-50';

  const handlePointerDown = (e: React.PointerEvent) => {
    // Always handle cell selection first
    setSelectedCell(cellId);

    // If in zoom mode and drag handler is provided, also start drag
    if (isZoomMode && onDragStart) {
      onDragStart(e);
    }
  };

  const cellContent = (
    <>
      {isNotesMode ? (
        <SudokuInputNotes
          isSelected={isSelected}
          isMiniNotes={isMiniNotes}
          notes={notes}
          selectNumber={selectNumber}
        />
      ) : (
        <div
          data-cell-id={cellId}
          className={`text-center text-lg sm:text-3xl ${textClass}`}
        >
          {!!value && value}
        </div>
      )}
    </>
  );

  // Render with killer cage wrapper if in killer mode
  if (isKillerMode && killerCage && cellPosition) {
    return (
      <div
        data-cell-container-id={cellId}
        onPointerDown={handlePointerDown}
        className="h-full w-full"
      >
        <KillerCageComponent
          cage={killerCage}
          cellPosition={cellPosition}
          isTopLeft={isCageTopLeft}
          isValid={isCageValid}
          isComplete={isCageComplete}
        >
          <div
            className={`flex h-full w-full items-center justify-center ${backgroundClass}`}
          >
            {cellContent}
          </div>
        </KillerCageComponent>
      </div>
    );
  }

  // Regular sudoku rendering
  return (
    <div
      data-cell-container-id={cellId}
      onPointerDown={handlePointerDown}
      className={`flex h-full w-full items-center justify-center border border-zinc-300 dark:border-zinc-400 ${backgroundClass}`}
    >
      {cellContent}
    </div>
  );
};

// Prevent re-render on timer change
const MemoisedSudokuInput = memo(function MemoisedSudokuInput(args: Arguments) {
  return SudokuInput(args);
});

export default MemoisedSudokuInput;
