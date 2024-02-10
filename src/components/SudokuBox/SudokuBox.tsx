import { calculateCellId } from '@/helpers/calculateId';
import { SetSelectedCell } from '../Sudoku/Sudoku';
import SudokuInput from '../SudokuInput';

const SudokuBox = ({
  boxId,
  selectedCell,
  setSelectedCell,
}: {
  boxId: string;
  selectedCell: string | null;
  setSelectedCell: SetSelectedCell;
}) => {
  return (
    <div className="grid aspect-square grid-cols-3 grid-rows-3 border">
      {Array.from(Array(3)).map((_, y) =>
        Array.from(Array(3)).map((_, x) => {
          const cellId = calculateCellId(boxId, x, y);
          return (
            <SudokuInput
              key={cellId}
              cellId={cellId}
              selectedCell={selectedCell}
              setSelectedCell={setSelectedCell}
              value={y}
            />
          );
        })
      )}
    </div>
  );
};

export default SudokuBox;
