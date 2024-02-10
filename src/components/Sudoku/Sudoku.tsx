'use client';
import { Puzzle } from '@/data/puzzles/puzzles';
import SudokuBox from '../SudokuBox';
import React from 'react';
import { calculateBoxId, calculateNextCellId } from '@/helpers/calculateId';

export type SetSelectedCell = (_cell: string | null) => void;

const Sudoku = ({ puzzle }: { puzzle: Puzzle }) => {
  const [selectedCell, setSelectedCell] = React.useState<null | string>(null);

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
        }
        if (nextCell) {
          setSelectedCell(nextCell);
        }
      }
    };
    window.addEventListener('keydown', keydownHandler);
    return () => window.removeEventListener('keydown', keydownHandler);
  }, [selectedCell, setSelectedCell]);

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
              />
            );
          })
        )}
      </div>
    </div>
  );
};

export default Sudoku;
