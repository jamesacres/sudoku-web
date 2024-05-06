import { calculateCellId } from '@/helpers/calculateId';
import { SetSelectedCell } from '../Sudoku';
import SudokuInput from '../SudokuInput';
import { PuzzleBox, PuzzleRowOrColumn } from '@/types/puzzle';
import { SelectNumber } from '@/types/selectNumber';

const SudokuBox = ({
  boxId,
  selectedCell,
  setSelectedCell,
  answer,
  selectNumber,
  validation,
}: {
  boxId: string;
  selectedCell: string | null;
  setSelectedCell: SetSelectedCell;
  answer: PuzzleBox;
  selectNumber: SelectNumber;
  validation?: PuzzleBox<boolean | undefined>;
}) => {
  return (
    <div className="grid aspect-square cursor-pointer grid-cols-3 grid-rows-3 border border-black dark:border-white">
      {Array.from(Array(3)).map((_, y) =>
        Array.from(Array(3)).map((_, x) => {
          const cellId = calculateCellId(boxId, x, y);
          return (
            <SudokuInput
              key={cellId}
              cellId={cellId}
              selectedCell={selectedCell}
              setSelectedCell={setSelectedCell}
              selectNumber={selectNumber}
              value={answer[x as PuzzleRowOrColumn][y as PuzzleRowOrColumn]}
              validation={
                validation &&
                validation[x as PuzzleRowOrColumn][y as PuzzleRowOrColumn]
              }
            />
          );
        })
      )}
    </div>
  );
};

export default SudokuBox;
