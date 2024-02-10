import { SetSelectedCell } from '../Sudoku/Sudoku';
import SudokuInput from '../SudokuInput';

const SudokuBox = ({
  boxId,
  selectedCell,
  setSelectedCell,
}: {
  boxId: string;
  selectedCell: string;
  setSelectedCell: SetSelectedCell;
}) => {
  return (
    <div className="grid aspect-square grid-cols-3 grid-rows-3 border">
      {Array.from(Array(3)).map((_, i) =>
        Array.from(Array(3)).map((_, j) => {
          const cellId = `${boxId},cell:${i},${j}`;
          return (
            <SudokuInput
              key={cellId}
              cellId={cellId}
              selectedCell={selectedCell}
              setSelectedCell={setSelectedCell}
              value={i}
            />
          );
        })
      )}
    </div>
  );
};

export default SudokuBox;
