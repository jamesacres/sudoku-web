'use client';
import { Puzzle, PuzzleRowOrColumn } from '@/types/puzzle';
import SudokuBox from '../SudokuBox';
import React from 'react';
import {
  calculateBoxId,
  calculateNextCellId,
  splitCellId,
} from '@/helpers/calculateId';
import { checkCell, checkGrid } from '@/helpers/checkAnswer';

export type SetSelectedCell = (_cell: string | null) => void;

const Sudoku = ({
  puzzle: { initial, final },
}: {
  puzzle: { initial: Puzzle; final: Puzzle };
}) => {
  const [selectedCell, setSelectedCell] = React.useState<null | string>(null);
  const [answer, setAnswerState] = React.useState<Puzzle>(
    structuredClone(initial)
  );
  const [validation, setValidation] = React.useState<
    undefined | Puzzle<boolean | undefined>
  >(undefined);

  const setAnswer = React.useCallback(
    (value: number) => {
      if (selectedCell) {
        const { box, cell } = splitCellId(selectedCell);
        if (!initial[box.x][box.y][cell.x][cell.y]) {
          const nextAnswer = structuredClone(answer);
          nextAnswer[box.x][box.y][cell.x][cell.y] = value;
          setAnswerState(nextAnswer);
        }
      }
    },
    [initial, answer, selectedCell]
  );

  React.useEffect(() => {
    setValidation(undefined);
  }, [answer, selectedCell]);

  React.useEffect(() => {
    const keydownHandler = (e: KeyboardEvent) => {
      if (selectedCell) {
        let nextCell;
        if (e.key === 'ArrowDown') {
          nextCell = calculateNextCellId(selectedCell, 'down');
        } else if (e.key === 'ArrowUp') {
          nextCell = calculateNextCellId(selectedCell, 'up');
        } else if (e.key === 'ArrowLeft') {
          nextCell = calculateNextCellId(selectedCell, 'left');
        } else if (e.key === 'ArrowRight') {
          nextCell = calculateNextCellId(selectedCell, 'right');
        } else if (e.key === 'Backspace' || e.key === 'Delete') {
          setAnswer(0);
        } else if (/[1-9]/.test(e.key)) {
          setAnswer(Number(e.key));
        }
        if (nextCell) {
          setSelectedCell(nextCell);
        }
      }
    };
    window.addEventListener('keydown', keydownHandler);
    return () => window.removeEventListener('keydown', keydownHandler);
  }, [selectedCell, setSelectedCell, setAnswer]);

  return (
    <div className="container mx-auto max-w-screen-md">
      <div className="grid grid-cols-3 grid-rows-3">
        {Array.from(Array(3)).map((_, y) =>
          Array.from(Array(3)).map((_, x) => {
            const boxId = calculateBoxId(x, y);
            return (
              <SudokuBox
                boxId={boxId}
                selectedCell={selectedCell}
                setSelectedCell={setSelectedCell}
                key={boxId}
                answer={answer[x as PuzzleRowOrColumn][y as PuzzleRowOrColumn]}
                validation={
                  validation &&
                  validation[x as PuzzleRowOrColumn][y as PuzzleRowOrColumn]
                }
              />
            );
          })
        )}
      </div>
      <div className="mt-4 border-t-2 border-t-pink-500 pt-4">
        <button
          onClick={() => setValidation(checkGrid(initial, final, answer))}
          className="rounded bg-pink-500 px-4 py-2 font-bold text-white hover:bg-pink-700"
        >
          Check Grid
        </button>
        <button
          disabled={!selectedCell}
          onClick={() =>
            selectedCell &&
            setValidation(checkCell(selectedCell, initial, final, answer))
          }
          className="ml-4 rounded bg-pink-500 px-4 py-2 font-bold text-white hover:bg-pink-700 disabled:bg-pink-300"
        >
          Check Cell
        </button>
      </div>
    </div>
  );
};

export default Sudoku;
