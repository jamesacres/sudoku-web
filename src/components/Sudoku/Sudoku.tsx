'use client';
import { Puzzle, PuzzleRowOrColumn } from '@/types/puzzle';
import SudokuBox from '../SudokuBox';
import { calculateBoxId } from '@/helpers/calculateId';
import { isInitialCell } from '@/helpers/checkAnswer';
import SudokuControls from '../SudokuControls';
import { UserContext } from '../../providers/UserProvider';
import { useTimer } from '@/hooks/timer';
import { formatSeconds } from '@/helpers/formatSeconds';
import { useGameState } from '@/hooks/gameState';
import { useContext } from 'react';

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
  puzzle: { initial, final, puzzleId },
}: {
  puzzle: { initial: Puzzle; final: Puzzle; puzzleId: string };
}) => {
  const { user } = useContext(UserContext) || {};
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
    selectNumber,
    setSelectedCell,
    selectedAnswer,
    isUndoDisabled,
    isRedoDisabled,
    validation,
    validateCell,
    validateGrid,
  } = useGameState({
    final,
    initial,
    puzzleId,
  });

  if (user) {
    // TODO fetch on load
    // TODO update parties from response
    // TODO overwrite local storage if last updated newer than local
    // TODO update server if local storage newer than server
    // TODO on every puzzle change update server with debounce, update parties from response
    // TODO only fetch when needed
    // fetchSession();
  }

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
