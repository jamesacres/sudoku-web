'use client';
import { Puzzle, PuzzleRowOrColumn } from '@/types/puzzle';
import SudokuBox from '../SudokuBox';
import { calculateBoxId } from '@/helpers/calculateId';
import { isInitialCell } from '@/helpers/checkAnswer';
import SudokuControls from '../SudokuControls';
import { useGameState } from '@/hooks/gameState';
import { TimerDisplay } from '../TimerDisplay/TimerDisplay';
import { calculateSeconds } from '@/helpers/calculateSeconds';
import SudokuSidebar from '../SudokuSidebar/SudokuSidebar';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { CelebrationAnimation } from '../CelebrationAnimation';
import { RaceTrack } from '../RaceTrack';
import { UserContext } from '@/providers/UserProvider';
import { RevenueCatContext } from '@/providers/RevenueCatProvider';
import { useDrag } from '@/hooks/useDrag';
import MemoisedSidebarButton from '../SidebarButton/SidebarButton';
import {
  addDailyPuzzleId,
  getDailyPuzzleCount,
} from '@/utils/dailyPuzzleCounter';
import { useRouter } from 'next/navigation';
import { SubscriptionContext } from '@/types/subscriptionContext';
import { DAILY_LIMITS } from '@/config/dailyLimits';

const Sudoku = ({
  puzzle: { initial, final, puzzleId },
  redirectUri,
}: {
  puzzle: { initial: Puzzle<number>; final: Puzzle<number>; puzzleId: string };
  redirectUri: string;
}) => {
  const router = useRouter();
  const { user } = useContext(UserContext) || {};
  const { isSubscribed, subscribeModal } = useContext(RevenueCatContext) || {};

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
    selectedCellHasNotes,
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
    setTimerNewSession,
    refreshSessionParties,
    sessionParties,
    showSidebar,
    setShowSidebar,
    isZoomMode,
    setIsZoomMode,
  } = useGameState({
    final,
    initial,
    puzzleId,
  });
  const friendsOnClick = useCallback(() => {
    setShowSidebar((showSidebar) => !showSidebar);
  }, [setShowSidebar]);
  const raceTrackOnClick = useCallback(
    () => setShowSidebar(true),
    [setShowSidebar]
  );

  // Reference to the grid for the celebration animation
  const gridRef = useRef<HTMLDivElement>(null);

  // State to track if animation should be shown
  const [showAnimation, setShowAnimation] = useState(false);
  const [showAdvancedControls, setShowAdvancedControls] = useState(false);

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

  // Add puzzle ID to daily tracking when puzzle starts (countdown begins)
  useEffect(() => {
    addDailyPuzzleId(puzzleId);
  }, [puzzleId]);

  // Handle countdown finishing for subscription modal
  useEffect(() => {
    if (timer?.countdown === 1 && !isSubscribed) {
      if (getDailyPuzzleCount() > DAILY_LIMITS.PUZZLE) {
        // Countdown just reached "GO!" - show subscription modal after a brief delay
        setPauseTimer(true);
        subscribeModal?.showModalIfRequired(
          () => {
            // Count down and resume
            setTimerNewSession();
            setPauseTimer(false);
          },
          () => {
            // Navigate to homepage on cancel
            router.replace('/');
          },
          SubscriptionContext.DAILY_PUZZLE_LIMIT
        );
      }
    }
  }, [
    router,
    timer?.countdown,
    isSubscribed,
    subscribeModal,
    setPauseTimer,
    setTimerNewSession,
  ]);

  // Use drag hook for all drag-related functionality
  const { dragOffset, dragStarted, zoomOrigin, handleDragStart } = useDrag({
    isZoomMode,
    selectedCell,
    gridRef,
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
    <div
      className={`${showAdvancedControls ? 'pb-120' : 'pb-90'} lg:pb-0 landscape:mb-120 sm:landscape:pb-[calc(60vh)] lg:landscape:mb-0 lg:landscape:pb-0`}
    >
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
        <div className="container mx-auto px-4 pb-4 lg:pb-0">
          <div className="flex h-[calc(58dvh)] flex-col">
            <div className="mt-auto">
              {/* App Branding Header */}
              <div className="mr-auto ml-auto max-w-xl px-4 pb-1 lg:mr-0">
                <div className="text-right">
                  <span className="bg-theme-primary inline-flex items-center bg-clip-text text-sm text-transparent">
                    Sudoku Race
                  </span>
                </div>
              </div>

              <div className="mr-auto ml-auto flex max-w-xl px-4 pb-1 lg:mr-0">
                <div
                  className="flex-nowrap items-center xl:hidden"
                  role="group"
                  aria-label="Button group"
                >
                  <MemoisedSidebarButton friendsOnClick={friendsOnClick} />
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

              <div className="relative overflow-visible lg:overflow-hidden">
                <div
                  ref={gridRef}
                  className={`border-theme-primary dark:border-theme-primary-light landscape:max-w-[calc(100dvh - 400px)] portrait:max-h-[calc(50dvh - 400px)] relative mr-auto ml-auto grid max-h-full max-w-xl grid-cols-3 grid-rows-3 border border-2 bg-zinc-50 lg:mr-0 portrait:max-w-[calc(50dvh)] dark:bg-zinc-900 ${
                    dragStarted
                      ? 'cursor-grabbing'
                      : isZoomMode && selectedCell
                        ? 'cursor-grab'
                        : ''
                  } ${dragStarted ? '' : 'transition-all duration-300'}`}
                  style={{
                    transform:
                      isZoomMode && selectedCell
                        ? `scale(1.5) translate(${dragOffset.x}px, ${dragOffset.y}px)`
                        : 'scale(1)',
                    transformOrigin: zoomOrigin,
                    touchAction: isZoomMode ? 'none' : 'auto',
                  }}
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
                            answer[x as PuzzleRowOrColumn][
                              y as PuzzleRowOrColumn
                            ]
                          }
                          selectNumber={selectNumber}
                          validation={
                            validation &&
                            validation[x as PuzzleRowOrColumn][
                              y as PuzzleRowOrColumn
                            ]
                          }
                          initial={
                            initial[x as PuzzleRowOrColumn][
                              y as PuzzleRowOrColumn
                            ]
                          }
                          isZoomMode={isZoomMode}
                          onDragStart={handleDragStart}
                        />
                      );
                    })
                  )}
                </div>
              </div>

              {/* Race Track Progress */}
              {!showAnimation && (
                <RaceTrack
                  sessionParties={sessionParties}
                  initial={initial}
                  final={final}
                  answer={answer}
                  userId={user?.sub}
                  onClick={raceTrackOnClick}
                  countdown={timer?.countdown}
                />
              )}
            </div>
          </div>
        </div>
        {/* Sticky controls for mobile, regular positioning for desktop */}
        <div className="lg:container lg:mx-auto lg:basis-3/5">
          {!completed && (
            <div className="fixed inset-x-0 bottom-0 z-10 lg:relative">
              <SudokuControls
                isInputDisabled={
                  !selectedCell || isInitialCell(selectedCell, initial)
                }
                isValidateCellDisabled={
                  !selectedCell ||
                  isInitialCell(selectedCell, initial) ||
                  !selectedAnswer()
                }
                isDeleteDisabled={
                  !selectedCell ||
                  isInitialCell(selectedCell, initial) ||
                  (!selectedAnswer() && !selectedCellHasNotes())
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
                isZoomMode={isZoomMode}
                setIsZoomMode={setIsZoomMode}
                reset={reset}
                reveal={reveal}
                onAdvancedToggle={setShowAdvancedControls}
                isSubscribed={isSubscribed}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sudoku;
