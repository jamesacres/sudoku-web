'use client';
import { Puzzle, PuzzleRowOrColumn } from '@/types/puzzle';
import SudokuBox from '../SudokuBox';
import React from 'react';
import {
  calculateBoxId,
  calculateNextCellId,
  splitCellId,
} from '@/helpers/calculateId';
import { checkCell, checkGrid, isInitialCell } from '@/helpers/checkAnswer';
import { Notes, ToggleNote } from '@/types/notes';
import { SetAnswer } from './types';
import SudokuControls from '../SudokuControls';
import { UserContext } from '../UserProvider';
import { SelectNumber } from '@/types/selectNumber';

const getSavedState = (puzzleId: string) => {
  try {
    const savedState = localStorage.getItem(`sudoku-${puzzleId}`);
    if (savedState) {
      return JSON.parse(savedState);
    }
  } catch (e) {
    console.error(e);
  }
  return undefined;
};

const saveState = (puzzleId: string, state: Puzzle[]) => {
  localStorage.setItem(`sudoku-${puzzleId}`, JSON.stringify(state));
};

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
  if (user) {
    // TODO only fetch when needed
    // fetchSession();
  }

  const [isNotesMode, setIsNotesMode] = React.useState<boolean>(false);
  const [selectedCell, setSelectedCell] = React.useState<null | string>(null);
  const [answerStack, setAnswerStack] = React.useState<Puzzle[]>([
    structuredClone(initial),
  ]);
  const [redoAnswerStack, setRedoAnswerStack] = React.useState<Puzzle[]>([]);

  // Answers
  const answer = answerStack[answerStack.length - 1];
  const pushAnswer = React.useCallback(
    (nextAnswer: Puzzle) => {
      setAnswerStack([...answerStack, nextAnswer]);
      setRedoAnswerStack([]);
    },
    [answerStack]
  );
  const setAnswer: SetAnswer = React.useCallback(
    (value: number | Notes) => {
      if (selectedCell) {
        const { box, cell } = splitCellId(selectedCell);
        if (!initial[box.x][box.y][cell.x][cell.y]) {
          const nextAnswer = structuredClone(answer);
          nextAnswer[box.x][box.y][cell.x][cell.y] = value;
          pushAnswer(nextAnswer);
        }
      }
    },
    [initial, answer, selectedCell, pushAnswer]
  );
  const toggleNote: ToggleNote = React.useCallback(
    (value: number) => {
      if (selectedCell) {
        const { box, cell } = splitCellId(selectedCell);
        if (!initial[box.x][box.y][cell.x][cell.y]) {
          const currentAnswer = answer[box.x][box.y][cell.x][cell.y];
          const notes = typeof currentAnswer === 'object' ? currentAnswer : {};
          if (notes) {
            const nextNotes = { ...notes, [value]: !notes[value] };
            setAnswer(nextNotes);
          }
        }
      }
    },
    [initial, answer, selectedCell, setAnswer]
  );
  const selectNumber: SelectNumber = React.useCallback(
    (number: number) => {
      if (isNotesMode) {
        toggleNote(number);
      } else {
        setAnswer(number);
      }
    },
    [isNotesMode, setAnswer, toggleNote]
  );

  const selectedAnswer = React.useCallback(() => {
    if (selectedCell) {
      const { box, cell } = splitCellId(selectedCell);
      const result = answer[box.x][box.y][cell.x][cell.y];
      if (typeof result === 'number') {
        return result;
      }
    }
  }, [answer, selectedCell]);

  // Undo and Redo
  // Don't undo initial state
  const isUndoDisabled = answerStack.length < 2;
  const undo = React.useCallback(() => {
    if (!isUndoDisabled) {
      const lastAnswer = answerStack[answerStack.length - 1];
      setRedoAnswerStack([...redoAnswerStack, lastAnswer]);
      setAnswerStack(answerStack.slice(0, answerStack.length - 1));
    }
  }, [isUndoDisabled, answerStack, redoAnswerStack]);
  const isRedoDisabled = !redoAnswerStack.length;
  const redo = React.useCallback(() => {
    if (!isRedoDisabled) {
      const lastUndo = redoAnswerStack[redoAnswerStack.length - 1];
      setAnswerStack([...answerStack, lastUndo]);
      setRedoAnswerStack(redoAnswerStack.slice(0, redoAnswerStack.length - 1));
    }
  }, [isRedoDisabled, answerStack, redoAnswerStack]);

  // Restore and save state
  React.useEffect(() => {
    const savedState = getSavedState(puzzleId);
    if (savedState) {
      setAnswerStack(savedState);
    }
  }, [puzzleId]);
  React.useEffect(() => {
    if (answerStack.length > 1) {
      saveState(puzzleId, answerStack);
    }
  }, [puzzleId, answerStack]);

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
      if (selectedCell) {
        let nextCell;
        if (e.key === 'ArrowDown') {
          nextCell = calculateNextCellId(selectedCell, 'down');
          e.preventDefault();
        } else if (e.key === 'ArrowUp') {
          nextCell = calculateNextCellId(selectedCell, 'up');
          e.preventDefault();
        } else if (e.key === 'ArrowLeft') {
          nextCell = calculateNextCellId(selectedCell, 'left');
          e.preventDefault();
        } else if (e.key === 'ArrowRight') {
          nextCell = calculateNextCellId(selectedCell, 'right');
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
  ]);

  return (
    <div>
      <div className="container mx-auto max-w-screen-sm">
        <div className="mb-4 mt-4 border-b-2 border-blue-500 pb-4 pl-0 pr-2">
          <p>
            Tips: use your keyboard if you have one, toggle notes mode with n.
          </p>
          <p>TODO parties and members</p>
        </div>
      </div>
      <div className="container mx-auto max-w-xl">
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
                  answer={
                    answer[x as PuzzleRowOrColumn][y as PuzzleRowOrColumn]
                  }
                  selectNumber={selectNumber}
                  validation={
                    validation &&
                    validation[x as PuzzleRowOrColumn][y as PuzzleRowOrColumn]
                  }
                />
              );
            })
          )}
        </div>
      </div>
      <div className="container mx-auto max-w-screen-sm">
        <SudokuControls
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
  );
};

export default Sudoku;
