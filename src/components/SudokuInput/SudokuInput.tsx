import React from 'react';
import SudokuInputNotes from '../SudokuInputNotes';
import { Notes } from '@/types/notes';
import { SelectNumber, SetSelectedCell } from '@/types/state';

const SudokuInput = ({
  cellId,
  selectedCell,
  setSelectedCell,
  selectNumber,
  value,
  validation,
  isInitial,
  isMiniNotes,
}: {
  cellId: string;
  selectedCell: string | null;
  setSelectedCell: SetSelectedCell;
  selectNumber: SelectNumber;
  value?: number | Notes;
  validation?: boolean;
  isInitial: boolean;
  isMiniNotes: boolean;
}) => {
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

  return (
    <div
      onClick={(_) => setSelectedCell(cellId)}
      className={`flex h-full w-full items-center justify-center border border-zinc-300 dark:border-zinc-400 ${backgroundClass}`}
    >
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
    </div>
  );
};

export default SudokuInput;
