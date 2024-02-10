import React from 'react';
import { SetSelectedCell } from '../Sudoku/Sudoku';
import SudokuInputNotes from '../SudokuInputNotes';
import { Notes, ToggleNote } from '@/types/notes';

const SudokuInput = ({
  cellId,
  selectedCell,
  setSelectedCell,
  value,
  validation,
}: {
  cellId: string;
  selectedCell: string | null;
  setSelectedCell: SetSelectedCell;
  value?: number;
  validation?: boolean;
}) => {
  const [notes, setNotes] = React.useState<Notes>({});
  const toggleNote: ToggleNote = (value: number) => {
    const nextNotes = { ...notes, [value]: !notes[value] };
    setNotes(nextNotes);
  };

  const isSelected = selectedCell === cellId;

  let backgroundClass = undefined;
  if (value && validation !== undefined) {
    backgroundClass = validation ? 'bg-green-600' : 'bg-red-600';
  } else if (isSelected) {
    backgroundClass = 'dark:bg-blue-600 bg-blue-300';
  }

  return (
    <div
      onClick={(_) => setSelectedCell(cellId)}
      className={`flex h-full w-full items-center justify-center border ${backgroundClass}`}
    >
      {!value ? (
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
