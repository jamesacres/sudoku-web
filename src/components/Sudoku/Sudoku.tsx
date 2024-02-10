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
import { Notes } from '@/types/notes';
import { SetAnswer } from './types';
import SudokuControls from '../SudokuControls';

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
  const validateGrid = React.useCallback(
    () => setValidation(checkGrid(initial, final, answer)),
    [initial, final, answer]
  );
  const validateCell = React.useCallback(
    () =>
      selectedCell &&
      setValidation(checkCell(selectedCell, initial, final, answer)),
    [selectedCell, initial, final, answer]
  );

  const setAnswer: SetAnswer = React.useCallback(
    (value: number | Notes) => {
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
  }, [selectedCell, setAnswer]);

  return (
    <div className="container mx-auto max-w-screen-md">
      <div className="grid grid-cols-3 grid-rows-3">
        {Array.from(Array(3)).map((_, y) =>
          Array.from(Array(3)).map((_, x) => {
            const boxId = calculateBoxId(x, y);
            return (
              <SudokuBox
                key={boxId}
                boxId={boxId}
                selectedCell={selectedCell}
                setSelectedCell={setSelectedCell}
                answer={answer[x as PuzzleRowOrColumn][y as PuzzleRowOrColumn]}
                setAnswer={setAnswer}
                validation={
                  validation &&
                  validation[x as PuzzleRowOrColumn][y as PuzzleRowOrColumn]
                }
              />
            );
          })
        )}
      </div>
      <SudokuControls
        isValidateCellDisabled={!selectedCell}
        validateCell={validateCell}
        validateGrid={validateGrid}
      />
    </div>
  );
};

export default Sudoku;
