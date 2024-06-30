'use client';
import { Puzzle, PuzzleRowOrColumn } from '@/types/puzzle';
import SudokuBox from '../SudokuBox';
import React from 'react';
import {
  calculateBoxId,
  calculateCellId,
  calculateNextCellId,
  splitCellId,
} from '@/helpers/calculateId';
import { checkCell, checkGrid, isInitialCell } from '@/helpers/checkAnswer';
import { Notes, ToggleNote } from '@/types/notes';
import { SetAnswer, StateType } from './types';
import SudokuControls from '../SudokuControls';
import { UserContext } from '../UserProvider';
import { SelectNumber } from '@/types/selectNumber';
import { Timer, useTimer } from '@/hooks/timer';
import { formatSeconds } from '@/helpers/formatSeconds';

const getStateKey = (type: StateType, puzzleId: string) => {
  let key = `sudoku-${puzzleId}`;
  if (type !== StateType.PUZZLE) {
    key = `${key}-${type}`;
  }
  return key;
};

const getSavedState = <T,>(
  type: StateType,
  puzzleId: string
): T | undefined => {
  try {
    const savedState = localStorage.getItem(getStateKey(type, puzzleId));
    if (savedState) {
      return JSON.parse(savedState);
    }
  } catch (e) {
    console.error(e);
  }
  return undefined;
};

const saveState = <T,>(type: StateType, puzzleId: string, state: T) => {
  localStorage.setItem(getStateKey(type, puzzleId), JSON.stringify(state));
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
  const {
    calculateSeconds,
    setTimerNewSession,
    setTimerLastInteraction,
    timer,
  } = useTimer();
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
    const savedState = getSavedState<Puzzle[]>(StateType.PUZZLE, puzzleId);
    const savedTimer = getSavedState<Timer>(StateType.TIMER, puzzleId);
    if (savedState) {
      setAnswerStack(savedState);
    }
    if (savedTimer) {
      setTimerNewSession(savedTimer);
    }
  }, [puzzleId, setTimerNewSession]);
  React.useEffect(() => {
    if (answerStack.length > 1) {
      setTimerLastInteraction();
      saveState(StateType.PUZZLE, puzzleId, answerStack);
    }
  }, [puzzleId, answerStack, setTimerLastInteraction]);
  React.useEffect(() => {
    if (timer) {
      saveState(StateType.TIMER, puzzleId, timer);
    }
  }, [puzzleId, timer]);

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
    setTimerLastInteraction();
  }, [answer, selectedCell, setTimerLastInteraction]);

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
