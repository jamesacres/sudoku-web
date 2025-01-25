'use client';
import { Puzzle, PuzzleRowOrColumn } from '@/types/puzzle';
import SudokuBox from '../SudokuBox';
import { calculateBoxId } from '@/helpers/calculateId';
import { isInitialCell } from '@/helpers/checkAnswer';
import SudokuControls from '../SudokuControls';
import { useGameState } from '@/hooks/gameState';
import { TimerDisplay } from '../TimerDisplay/TimerDisplay';
import { calculateSeconds } from '@/helpers/calculateSeconds';
import { Sidebar } from 'react-feather';
import SudokuSidebar from '../SudokuSidebar/SudokuSidebar';
import { useEffect } from 'react';

const Sudoku = ({
  puzzle: { initial, final, puzzleId },
  redirectUri,
}: {
  puzzle: { initial: Puzzle<number>; final: Puzzle<number>; puzzleId: string };
  redirectUri: string;
}) => {
  const {
    answer,
    selectedCell,
    setIsNotesMode,
    isNotesMode,
    setIsMiniNotes,
    isMiniNotes,
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
    timer,
    reset,
    reveal,
    completed,
    setPauseTimer,
    sessionParties,
    showSidebar,
    setShowSidebar,
  } = useGameState({
    final,
    initial,
    puzzleId,
  });

  useEffect(() => {
    if (showSidebar) {
      setPauseTimer(true);
      // Stop scroll
      document.body.classList.add('overflow-y-hidden');
    } else {
      setPauseTimer(false);
      // Allow scroll
      document.body.classList.remove('overflow-y-hidden');
    }
  }, [showSidebar, setPauseTimer]);

  return (
    <div>
      <SudokuSidebar
        showSidebar={showSidebar}
        setShowSidebar={setShowSidebar}
        puzzleId={puzzleId}
        redirectUri={redirectUri}
        sessionParties={sessionParties}
      />

      <div className="flex flex-col items-center lg:flex-row">
        <div className="container mx-auto px-4">
          <div className="mr-auto ml-auto flex max-w-xl p-4 lg:mr-0">
            <div
              className="flex-nowrap items-center xl:hidden"
              role="group"
              aria-label="Button group"
            >
              <button
                onClick={() => {
                  setShowSidebar(!showSidebar);
                }}
                className="rounded-lg dark:text-white"
              >
                <Sidebar className="float-left mr-2" />
                Friends
              </button>
            </div>
            <div className="grow text-right">
              <TimerDisplay
                seconds={calculateSeconds(timer)}
                countdown={timer?.countdown}
                isComplete={!!completed}
              />
            </div>
          </div>
          <div className="mr-auto ml-auto grid max-w-xl grid-cols-3 grid-rows-3 border border-2 border-slate-400 lg:mr-0">
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
                    isMiniNotes={isMiniNotes}
                  />
                );
              })
            )}
          </div>
        </div>
        <div className="container mx-auto basis-3/5">
          {!completed && (
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
              isMiniNotes={isMiniNotes}
              setIsMiniNotes={setIsMiniNotes}
              reset={reset}
              reveal={reveal}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Sudoku;
