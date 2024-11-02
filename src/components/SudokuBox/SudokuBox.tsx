import { calculateCellId } from '@/helpers/calculateId';
import SudokuInput from '../SudokuInput';
import { PuzzleBox, PuzzleRowOrColumn } from '@/types/puzzle';
import { SelectNumber, SetSelectedCell } from '@/types/state';
import { memo } from 'react';

interface Arguments {
  boxId: string;
  selectedCell: string | null;
  setSelectedCell: SetSelectedCell;
  answer: PuzzleBox;
  selectNumber: SelectNumber;
  validation?: PuzzleBox<boolean | undefined>;
  initial: PuzzleBox;
  isMiniNotes: boolean;
}

const SudokuBox = ({
  boxId,
  selectedCell,
  setSelectedCell,
  answer,
  selectNumber,
  validation,
  initial,
  isMiniNotes,
}: Arguments) => {
  return (
    <div className="grid aspect-square cursor-pointer grid-cols-3 grid-rows-3 border border-slate-400">
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
              isInitial={
                !!initial[x as PuzzleRowOrColumn][y as PuzzleRowOrColumn]
              }
              isMiniNotes={isMiniNotes}
            />
          );
        })
      )}
    </div>
  );
};

// Prevent re-render on timer change
const MemoisedSudokuBox = memo(function MemoisedSudokuBox(args: Arguments) {
  return SudokuBox(args);
});

export default MemoisedSudokuBox;
