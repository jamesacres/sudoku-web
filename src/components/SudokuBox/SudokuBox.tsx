import { calculateCellId } from '@/helpers/calculateId';
import { SetSelectedCell } from '../Sudoku/Sudoku';
import SudokuInput from '../SudokuInput';
import { PuzzleBox, PuzzleRowOrColumn } from '@/types/puzzle';

const SudokuBox = ({
  boxId,
  selectedCell,
  setSelectedCell,
  answer,
}: {
  boxId: string;
  selectedCell: string | null;
  setSelectedCell: SetSelectedCell;
  answer: PuzzleBox;
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
              value={answer[x as PuzzleRowOrColumn][y as PuzzleRowOrColumn]}
            />
          );
        })
      )}
    </div>
  );
};

export default SudokuBox;
