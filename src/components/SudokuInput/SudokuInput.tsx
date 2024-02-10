import React from 'react';
import { SetAnswer, SetSelectedCell } from '../Sudoku';
import SudokuInputNotes from '../SudokuInputNotes';
import { Notes, ToggleNote } from '@/types/notes';

const SudokuInput = ({
  cellId,
  selectedCell,
  setSelectedCell,
  setAnswer,
  value,
  validation,
}: {
  cellId: string;
  selectedCell: string | null;
  setSelectedCell: SetSelectedCell;
  setAnswer: SetAnswer;
  value?: number | Notes;
  validation?: boolean;
}) => {
  const isNotesMode = !(value && typeof value === 'number');
  const notes = isNotesMode && typeof value === 'object' ? value : {};
  const toggleNote: ToggleNote = (value: number) => {
    if (notes) {
      const nextNotes = { ...notes, [value]: !notes[value] };
      setAnswer(nextNotes);
    }
  };

  const isSelected = selectedCell === cellId;

  let backgroundClass = undefined;
  if (!isNotesMode && value && validation !== undefined) {
    backgroundClass = validation ? 'bg-green-600' : 'bg-red-600';
  } else if (isSelected) {
    backgroundClass = 'dark:bg-blue-600 bg-blue-300';
  }

  return (
    <div
      onClick={(_) => setSelectedCell(cellId)}
      className={`flex h-full w-full items-center justify-center border ${backgroundClass}`}
    >
      {isNotesMode ? (
        <SudokuInputNotes
          isSelected={isSelected}
          notes={notes}
          toggleNote={toggleNote}
        />
      ) : (
        <div
          data-cell-id={cellId}
          className={`text-center text-3xl text-black dark:text-white`}
        >
          {!!value && value}
        </div>
      )}
    </div>
  );
};

export default SudokuInput;
