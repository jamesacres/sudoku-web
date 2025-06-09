import { calculateBoxId, calculateCellId } from '@/helpers/calculateId';
import { Notes } from '@/types/notes';
import { Puzzle, PuzzleRowOrColumn } from '@/types/puzzle';

const SimpleSudoku = ({
  initial,
  final,
  latest,
  transparent,
}: {
  initial: Puzzle<number>;
  final: Puzzle<number>;
  latest: Puzzle<number | Notes> | undefined;
  transparent?: boolean;
}) => {
  const background = transparent ? '' : 'bg-zinc-50 dark:bg-zinc-900';
  return (
    <div
      className={`mr-auto ml-auto grid max-w-xl grid-cols-3 grid-rows-3 border border-1 border-zinc-900 text-black lg:mr-0 dark:border-zinc-50 dark:text-white ${background}`}
    >
      {Array.from(Array(3)).map((_, y) =>
        Array.from(Array(3)).map((_, x) => {
          const boxId = calculateBoxId(x, y);
          return (
            <div
              key={boxId}
              className="grid aspect-square grid-cols-3 grid-rows-3 border border-zinc-900 dark:border-zinc-50"
            >
              {Array.from(Array(3)).map((_, celly) =>
                Array.from(Array(3)).map((_, cellx) => {
                  const cellId = calculateCellId(boxId, cellx, celly);
                  const initialValue =
                    initial[x as PuzzleRowOrColumn][y as PuzzleRowOrColumn][
                      cellx as PuzzleRowOrColumn
                    ][celly as PuzzleRowOrColumn];
                  const finalValue =
                    final[x as PuzzleRowOrColumn][y as PuzzleRowOrColumn][
                      cellx as PuzzleRowOrColumn
                    ][celly as PuzzleRowOrColumn];
                  const latestValue =
                    latest?.[x as PuzzleRowOrColumn][y as PuzzleRowOrColumn][
                      cellx as PuzzleRowOrColumn
                    ][celly as PuzzleRowOrColumn];
                  const hasCorrectGuess =
                    !initialValue && latestValue && latestValue === finalValue;
                  const hasIncorrectGuess =
                    !initialValue &&
                    latestValue &&
                    typeof latestValue === 'number' &&
                    latestValue !== finalValue;
                  const correctBackground = hasCorrectGuess
                    ? 'bg-green-500'
                    : '';
                  const incorrectBackground = hasIncorrectGuess
                    ? 'bg-red-500'
                    : '';
                  return (
                    <div
                      key={cellId}
                      className={`flex h-full w-full items-center justify-center border border-zinc-300 dark:border-zinc-400 ${correctBackground} ${incorrectBackground}`}
                    >
                      {initialValue || ''}
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
