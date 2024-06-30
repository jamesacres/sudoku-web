'use client';
import { Puzzle, PuzzleRowOrColumn } from '@/types/puzzle';
import SudokuBox from '../SudokuBox';
import React from 'react';
import {
  calculateBoxId,
  calculateCellId,
  calculateNextCellId,
} from '@/helpers/calculateId';
import { checkCell, checkGrid, isInitialCell } from '@/helpers/checkAnswer';
import SudokuControls from '../SudokuControls';
import { UserContext } from '../UserProvider';
import { Timer, useTimer } from '@/hooks/timer';
import { formatSeconds } from '@/helpers/formatSeconds';
import { StateType, useLocalStorage } from '@/hooks/localStorage';
import { useGameState } from '@/hooks/gameState';

// const fetchSession = async () => {
//   // TODO move somewhere sensible
//   // TODO add handler for all requests that if we ever get a 401 we should logout the user
//   const response = await fetch(
//     'https://api.bubblyclouds.com/sessions/sudoku-1'
//   );
//   if (response.ok) {
//     const session = await response.json();
//     console.info(session);
//   }
// };

const Sudoku = ({
  puzzleId,
  puzzle: { initial, final },
}: {
  puzzleId: string;
  puzzle: { initial: Puzzle; final: Puzzle };
}) => {
  const { user } = React.useContext(UserContext) || {};
  const { calculateSeconds, timer } = useTimer({
    puzzleId,
  });
  const {
    answer,
    selectedCell,
    setIsNotesMode,
    isNotesMode,
    undo,
    redo,
    setAnswer,
    selectNumber,
    setSelectedCell,
    selectedAnswer,
    isUndoDisabled,
    isRedoDisabled,
  } = useGameState({
    initial,
    puzzleId,
  });

  if (user) {
    // TODO only fetch when needed
    // fetchSession();
  }

  // Validation
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
  React.useEffect(() => {
    setValidation(undefined);
  }, [answer, selectedCell]);

  // Handle keyboard
  React.useEffect(() => {
    const keydownHandler = (e: KeyboardEvent) => {
      if (e.key === 'n') {
        setIsNotesMode(!isNotesMode);
        e.preventDefault();
      } else if (e.key === 'z') {
        undo();
        e.preventDefault();
      } else if (e.key === 'y') {
        redo();
        e.preventDefault();
      }
      let currentSelectedCell =
        selectedCell || calculateCellId(calculateBoxId(0, 0), 0, 0);
      let nextCell;
      if (e.key === 'ArrowDown') {
        nextCell = calculateNextCellId(currentSelectedCell, 'down');
        e.preventDefault();
      } else if (e.key === 'ArrowUp') {
        nextCell = calculateNextCellId(currentSelectedCell, 'up');
        e.preventDefault();
      } else if (e.key === 'ArrowLeft') {
        nextCell = calculateNextCellId(currentSelectedCell, 'left');
        e.preventDefault();
      } else if (e.key === 'ArrowRight') {
        nextCell = calculateNextCellId(currentSelectedCell, 'right');
        e.preventDefault();
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        setAnswer(0);
        e.preventDefault();
      } else if (/[1-9]/.test(e.key)) {
        selectNumber(Number(e.key));
        e.preventDefault();
      }
      if (nextCell) {
        setSelectedCell(nextCell);
      }
    };
    window.addEventListener('keydown', keydownHandler);
    return () => window.removeEventListener('keydown', keydownHandler);
  }, [
    isNotesMode,
    redo,
    selectedCell,
    selectNumber,
    setAnswer,
    setIsNotesMode,
    undo,
    setSelectedCell,
  ]);

  return (
    <div>
      <div className="container mx-auto max-w-screen-sm">
        <div className="mb-4 mt-4 pb-4 pl-0 pr-2">
          <p>
            TODO sync session on answer state change, parties and members -
            invite + accept
          </p>
          \<p>Timer: {formatSeconds(calculateSeconds(timer))}</p>
        </div>
      </div>
      <div className="flex flex-col items-center lg:flex-row">
        <div className="container mx-auto p-4">
          <div className="m-4 ml-auto mr-auto grid max-w-xl grid-cols-3 grid-rows-3 border border-2 border-slate-400 lg:mr-0">
            {Array.from(Array(3)).map((_, y) =>
              Array.from(Array(3)).map((_, x) => {
                const boxId = calculateBoxId(x, y);
                return (
                  <SudokuBox
                    key={boxId}
                    boxId={boxId}
                    selectedCell={selectedCell}
                    setSelectedCell={setSelectedCell}
                    answer={
                      answer[x as PuzzleRowOrColumn][y as PuzzleRowOrColumn]
                    }
                    selectNumber={selectNumber}
                    validation={
                      validation &&
                      validation[x as PuzzleRowOrColumn][y as PuzzleRowOrColumn]
                    }
                    initial={
                      initial[x as PuzzleRowOrColumn][y as PuzzleRowOrColumn]
                    }
                  />
                );
              })
            )}
          </div>
        </div>
        <div className="container mx-auto basis-3/5">
          <SudokuControls
            isInputDisabled={
              !selectedCell || isInitialCell(selectedCell, initial)
            }
            isValidateCellDisabled={
              !selectedCell ||
              isInitialCell(selectedCell, initial) ||
              !selectedAnswer()
            }
            validateCell={validateCell}
            validateGrid={validateGrid}
            isUndoDisabled={isUndoDisabled}
            isRedoDisabled={isRedoDisabled}
            undo={undo}
            redo={redo}
            selectNumber={selectNumber}
            isNotesMode={isNotesMode}
            setIsNotesMode={setIsNotesMode}
          />
        </div>
      </div>
    </div>
  );
};

export default Sudoku;
