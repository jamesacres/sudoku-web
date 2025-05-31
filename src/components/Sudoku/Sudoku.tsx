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
import { useContext, useEffect, useRef, useState } from 'react';
import { CelebrationAnimation } from '../CelebrationAnimation';
import { RaceTrack } from '../RaceTrack';
import { UserContext } from '@/providers/UserProvider';

const Sudoku = ({
  puzzle: { initial, final, puzzleId },
  redirectUri,
}: {
  puzzle: { initial: Puzzle<number>; final: Puzzle<number>; puzzleId: string };
  redirectUri: string;
}) => {
  const { user } = useContext(UserContext) || {};

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
    refreshSessionParties,
    sessionParties,
    showSidebar,
    setShowSidebar,
  } = useGameState({
    final,
    initial,
    puzzleId,
  });

  // Reference to the grid for the celebration animation
  const gridRef = useRef<HTMLDivElement>(null);

  // State to track if animation should be shown
  const [showAnimation, setShowAnimation] = useState(false);

  // Show animation when the puzzle is completed
  useEffect(() => {
    if (completed) {
      setShowAnimation(true);

      // Reset animation after it completes - extended to 10 seconds to match the animation duration
      const timer = setTimeout(() => {
        setShowAnimation(false);
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [completed]);

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
        refreshSessionParties={refreshSessionParties}
        sessionParties={sessionParties}
      />

      {/* Display celebration animation when completed */}
      {completed && (
        <CelebrationAnimation isVisible={showAnimation} gridRef={gridRef} />
      )}

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
                className="text-theme-primary dark:text-theme-primary-light cursor-pointer rounded-lg"
              >
                <Sidebar className="float-left mr-2" />
                Friends
              </button>
            </div>
            <div
              className={`grow text-right ${timer?.countdown || !!completed ? 'text-2xl' : ''}`}
            >
              <TimerDisplay
                seconds={calculateSeconds(timer)}
                countdown={timer?.countdown}
                isComplete={!!completed}
              />
            </div>
          </div>
          <div
            ref={gridRef}
            className="border-theme-primary dark:border-theme-primary-light relative mr-auto ml-auto grid max-w-xl grid-cols-3 grid-rows-3 border border-2 bg-zinc-50 lg:mr-0 dark:bg-zinc-900"
          >
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

          {/* Race Track Progress */}
          <RaceTrack
            sessionParties={sessionParties}
            initial={initial}
            final={final}
            answer={answer}
            userId={user?.sub}
            onClick={() => setShowSidebar(true)}
          />
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
