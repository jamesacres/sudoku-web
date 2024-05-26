import React from 'react';
import { SetSelectedCell } from '../Sudoku';
import SudokuInputNotes from '../SudokuInputNotes';
import { Notes } from '@/types/notes';
import { SelectNumber } from '@/types/selectNumber';

const SudokuInput = ({
  cellId,
  selectedCell,
  setSelectedCell,
  selectNumber,
  value,
  validation,
  isInitial,
}: {
  cellId: string;
  selectedCell: string | null;
  setSelectedCell: SetSelectedCell;
  selectNumber: SelectNumber;
  value?: number | Notes;
  validation?: boolean;
  isInitial: boolean;
}) => {
  const isNotesMode = !(value && typeof value === 'number');
  const notes = isNotesMode && typeof value === 'object' ? value : {};

  const isSelected = selectedCell === cellId;

  let backgroundClass = undefined;
  if (!isNotesMode && value && validation !== undefined) {
    backgroundClass = validation ? 'bg-green-600' : 'bg-red-600';
  } else if (isSelected) {
    const initialBackgroundClass = isInitial
      ? 'dark:bg-opacity-75 bg-opacity-50'
      : '';
    backgroundClass = `dark:bg-blue-600 bg-blue-300 ${initialBackgroundClass}`;
  }

  const textClass = isInitial
    ? 'text-zinc-500 dark:text-zinc-400'
    : 'text-black dark:text-white';

  return (
    <div
      onClick={(_) => setSelectedCell(cellId)}
      className={`flex h-full w-full items-center justify-center border border-slate-400 ${backgroundClass}`}
    >
      {isNotesMode ? (
        <SudokuInputNotes
          isSelected={isSelected}
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
