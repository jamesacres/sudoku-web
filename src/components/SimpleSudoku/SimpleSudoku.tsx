import { calculateBoxId, calculateCellId } from '@/helpers/calculateId';
import { Puzzle, PuzzleRowOrColumn } from '@/types/puzzle';

const SimpleSudoku = ({ puzzle }: { puzzle: Puzzle<number> }) => {
  return (
    <div className="border-1 ml-auto mr-auto grid max-w-xl grid-cols-3 grid-rows-3 border border-slate-400 lg:mr-0">
      {Array.from(Array(3)).map((_, y) =>
        Array.from(Array(3)).map((_, x) => {
          const boxId = calculateBoxId(x, y);
          return (
            <div
              key={boxId}
              className="grid aspect-square cursor-pointer grid-cols-3 grid-rows-3 border border-slate-400"
            >
              {Array.from(Array(3)).map((_, celly) =>
                Array.from(Array(3)).map((_, cellx) => {
                  const cellId = calculateCellId(boxId, x, y);
                  const value =
                    puzzle[x as PuzzleRowOrColumn][y as PuzzleRowOrColumn][
                      cellx as PuzzleRowOrColumn
                    ][celly as PuzzleRowOrColumn];
                  return (
                    <div
                      key={cellId}
                      className="flex h-full w-full items-center justify-center border border-slate-400"
                    >
                      {value || ''}
                    </div>
                  );
                })
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default SimpleSudoku;
