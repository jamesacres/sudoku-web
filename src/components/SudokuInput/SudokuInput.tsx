import { SetSelectedCell } from '../Sudoku/Sudoku';

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
  const isSelected = selectedCell === cellId;

  let backgroundClass = undefined;
  if (value && validation !== undefined) {
    backgroundClass = validation ? 'bg-green-600' : 'bg-red-600';
  } else if (isSelected) {
    backgroundClass = 'dark:bg-blue-600 bg-blue-300';
  }

  return (
    <div
      data-cell-id={cellId}
      onClick={(_) => setSelectedCell(cellId)}
      className={`flex h-full w-full items-center justify-center border text-center text-3xl text-black dark:text-white ${backgroundClass}`}
    >
      {!!value && value}
    </div>
  );
};

export default SudokuInput;
