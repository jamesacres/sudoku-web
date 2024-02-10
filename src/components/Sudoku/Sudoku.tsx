'use client';
import { Puzzle, PuzzleRowOrColumn } from '@/types/puzzle';
import SudokuBox from '../SudokuBox';
import React from 'react';
import {
  calculateBoxId,
  calculateNextCellId,
  splitCellId,
} from '@/helpers/calculateId';

export type SetSelectedCell = (_cell: string | null) => void;

const Sudoku = ({ puzzle }: { puzzle: Puzzle }) => {
  const [selectedCell, setSelectedCell] = React.useState<null | string>(null);
  const [answer, setAnswer] = React.useState<Puzzle>(structuredClone(puzzle));

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
          const { box, cell } = splitCellId(selectedCell);
          const nextAnswer = structuredClone(answer);
          nextAnswer[box.x][box.y][cell.x][cell.y] = 0;
          setAnswer(nextAnswer);
        } else if (/[1-9]/.test(e.key)) {
          const { box, cell } = splitCellId(selectedCell);
          const nextAnswer = structuredClone(answer);
          nextAnswer[box.x][box.y][cell.x][cell.y] = Number(e.key);
          setAnswer(nextAnswer);
        }
        if (nextCell) {
          setSelectedCell(nextCell);
        }
      }
    };
    window.addEventListener('keydown', keydownHandler);
    return () => window.removeEventListener('keydown', keydownHandler);
  }, [selectedCell, setSelectedCell, answer, setAnswer]);

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
              />
            );
          })
        )}
      </div>
    </div>
  );
};

export default Sudoku;
