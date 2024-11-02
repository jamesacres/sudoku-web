'use client';
import { Puzzle, PuzzleRowOrColumn } from '@/types/puzzle';
import SudokuBox from '../SudokuBox';
import { calculateBoxId } from '@/helpers/calculateId';
import { isInitialCell } from '@/helpers/checkAnswer';
import SudokuControls from '../SudokuControls';
import { useGameState } from '@/hooks/gameState';
import { TimerDisplay } from '../TimerDisplay/TimerDisplay';
import { calculateSeconds } from '@/helpers/calculateSeconds';

const Sudoku = ({
  puzzle: { initial, final, puzzleId },
}: {
  puzzle: { initial: Puzzle<number>; final: Puzzle<number>; puzzleId: string };
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
  } = useGameState({
    final,
    initial,
    puzzleId,
  });

  return (
    <div>
      <div className="flex flex-col items-center lg:flex-row">
        <div className="container mx-auto px-4">
          <div className="mb-8 ml-auto mr-auto max-w-xl p-4 lg:mr-0">
            <TimerDisplay seconds={calculateSeconds(timer)} />
          </div>
          <div className="ml-auto mr-auto grid max-w-xl grid-cols-3 grid-rows-3 border border-2 border-slate-400 lg:mr-0">
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
          />
        </div>
      </div>
    </div>
  );
};

export default Sudoku;
