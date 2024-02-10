'use client';
import { Puzzle } from '@/data/puzzles/puzzles';
import SudokuBox from '../SudokuBox';
import React from 'react';

export type SetSelectedCell = (cell: string | null) => void;

const Sudoku = ({ puzzle }: { puzzle: Puzzle }) => {
  const [selectedCell, setSelectedCell] = React.useState<null | string>(null);
  return (
    <div className="container mx-auto max-w-screen-md">
      <div className="grid grid-cols-3 grid-rows-3">
        {Array.from(Array(3)).map((_, i) =>
          Array.from(Array(3)).map((_, j) => (
            <SudokuBox
              boxId={`box:${i},${j}`}
              selectedCell={selectedCell}
              setSelectedCell={setSelectedCell}
              key={crypto.randomUUID()}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Sudoku;
