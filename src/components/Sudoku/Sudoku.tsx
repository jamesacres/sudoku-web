'use client';
import { Puzzle, PuzzleRowOrColumn } from '@/types/puzzle';
import SudokuBox from '../SudokuBox';
import { calculateBoxId, splitCellId } from '@/helpers/calculateId';
import { isInitialCell } from '@/helpers/checkAnswer';
import SudokuControls from '../SudokuControls';
import { useGameState } from '@/hooks/gameState';
import { TimerDisplay } from '../TimerDisplay/TimerDisplay';
import { calculateSeconds } from '@/helpers/calculateSeconds';
import { Sidebar } from 'react-feather';
import SudokuSidebar from '../SudokuSidebar/SudokuSidebar';
import {
  PointerEvent as ReactPointerEvent,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
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

  // Store the zoom origin to prevent jumps during drag
  const [zoomOrigin, setZoomOrigin] = useState('center center');

  // State for drag functionality
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [lastPointer, setLastPointer] = useState({ x: 0, y: 0 });
  const [dragStarted, setDragStarted] = useState(false);

  // Update zoom origin when cell selection changes, but only if not currently dragging
  useEffect(() => {
    if (selectedCell && isZoomMode && !isDragging) {
      // Helper function to calculate zoom transform origin based on selected cell
      const getZoomOrigin = (cellId: string) => {
        if (cellId && isZoomMode) {
          const { box, cell } = splitCellId(cellId);
          // Calculate the position of the selected cell in the 9x9 grid
          const totalX = box.x * 3 + cell.x;
          const totalY = box.y * 3 + cell.y;
          // Convert to percentage for transform-origin (center of the cell)
          const originX = ((totalX + 0.5) / 9) * 100;
          const originY = ((totalY + 0.5) / 9) * 100;
          return `${originX}% ${originY}%`;
        }
        return 'center center';
      };

      // Add a small delay to allow for smooth transition
      const timer = setTimeout(() => {
        setZoomOrigin(getZoomOrigin(selectedCell));
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [selectedCell, isZoomMode, isDragging]);

  // Reset drag offset when zoom mode is disabled or cell changes
  useEffect(() => {
    if (!isZoomMode) {
      setDragOffset({ x: 0, y: 0 });
      setZoomOrigin('center center');
    }
  }, [isZoomMode, selectedCell]);

  // Drag handlers
  const handleDragStart = (e: ReactPointerEvent) => {
    if (isZoomMode && selectedCell) {
      setIsDragging(true);
      setDragStarted(false);
      setLastPointer({ x: e.clientX, y: e.clientY });
    }
  };

  // Global drag handlers for move and up events
  useEffect(() => {
    if (!isDragging) return;

    const handlePointerMove = (e: PointerEvent) => {
      if (isDragging && isZoomMode && gridRef.current) {
        const deltaX = e.clientX - lastPointer.x;
        const deltaY = e.clientY - lastPointer.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        // Only start actual dragging after moving at least 5 pixels
        if (!dragStarted && distance > 5) {
          setDragStarted(true);
          // Prevent text selection during drag
          document.body.style.userSelect = 'none';
        }

        if (dragStarted) {
          setDragOffset((prev) => {
            // Reduce movement speed for more controlled dragging
            const sensitivity = 0.5;
            const newX = prev.x + deltaX * sensitivity;
            const newY = prev.y + deltaY * sensitivity;

            // Calculate boundaries based on actual puzzle dimensions and available viewport
            const gridElement = gridRef.current;
            if (!gridElement) return { x: newX, y: newY };

            const gridRect = gridElement.getBoundingClientRect();

            // Calculate how much we can move in each direction
            const scaledWidth = gridRect.width;
            const scaledHeight = gridRect.height;

            // Simple approach: calculate how much the 1.5x scaled puzzle extends beyond viewport
            // When scaled 1.5x, the puzzle becomes 50% larger
            // So we can translate by 25% of the original size in each direction
            const originalWidth = scaledWidth / 1.5;
            const originalHeight = scaledHeight / 1.5;

            // Maximum translation to show all edges without going beyond puzzle border
            const maxOffsetX = originalWidth * 0.25; // 25% of original size
            const maxOffsetY = originalHeight * 0.25; // 25% of original size

            return {
              x: Math.max(-maxOffsetX, Math.min(maxOffsetX, newX)),
              y: Math.max(-maxOffsetY, Math.min(maxOffsetY, newY)),
            };
          });
          e.preventDefault(); // Only prevent default when actually dragging
        }

        setLastPointer({ x: e.clientX, y: e.clientY });
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (dragStarted) {
        e.preventDefault();
        // Restore text selection after drag
        document.body.style.userSelect = '';
      }
      setIsDragging(false);
      setDragStarted(false);
    };

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);

    return () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
      // Ensure text selection is restored if component unmounts during drag
      document.body.style.userSelect = '';
    };
  }, [isDragging, isZoomMode, dragStarted, lastPointer]);

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
          <div className="mr-auto ml-auto flex max-w-xl px-4 py-2 lg:mr-0">
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
          <div className="relative overflow-hidden">
            <div
              ref={gridRef}
              className={`border-theme-primary dark:border-theme-primary-light relative mr-auto ml-auto grid max-w-xl grid-cols-3 grid-rows-3 border border-2 bg-zinc-50 lg:mr-0 dark:bg-zinc-900 ${
                dragStarted
                  ? 'cursor-grabbing select-none'
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
                userSelect: dragStarted ? 'none' : 'auto',
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
                        answer[x as PuzzleRowOrColumn][y as PuzzleRowOrColumn]
                      }
                      selectNumber={selectNumber}
                      validation={
                        validation &&
                        validation[x as PuzzleRowOrColumn][
                          y as PuzzleRowOrColumn
                        ]
                      }
                      initial={
                        initial[x as PuzzleRowOrColumn][y as PuzzleRowOrColumn]
                      }
                      isMiniNotes={isMiniNotes}
                      isZoomMode={isZoomMode}
                      onDragStart={handleDragStart}
                    />
                  );
                })
              )}
            </div>
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
              isMiniNotes={isMiniNotes}
              setIsMiniNotes={setIsMiniNotes}
              isZoomMode={isZoomMode}
              setIsZoomMode={setIsZoomMode}
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
