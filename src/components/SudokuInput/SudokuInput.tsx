import { SetSelectedCell } from '../Sudoku/Sudoku';

const SudokuInput = ({
  cellId,
  selectedCell,
  setSelectedCell,
  value,
}: {
  cellId: string;
  selectedCell: string | null;
  setSelectedCell: SetSelectedCell;
  value?: number;
}) => {
  const isSelected = selectedCell === cellId;
  return (
    <div
      data-cell-id={cellId}
      onClick={(_) => setSelectedCell(cellId)}
      className={`flex h-full w-full items-center justify-center border text-center text-3xl text-black dark:text-white ${isSelected ? 'bg-red-600' : undefined}`}
    >
      {value}
    </div>
  );
};

export default SudokuInput;
