'use client';

import { Puzzle } from '@/types/puzzle';
import { Notes, ToggleNote } from '@/types/notes';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  calculateBoxId,
  calculateCellId,
  calculateNextCellId,
  splitCellId,
} from '@/helpers/calculateId';
import { SelectNumber, SetAnswer } from '@/types/state';
import { useLocalStorage } from './localStorage';
import { ServerStateResult, useServerStorage } from './serverStorage';
import { checkCell, checkGrid } from '@/helpers/checkAnswer';
import { StateType } from '@/types/StateType';
import { useTimer } from './timer';
import { Timer } from '@/types/timer';

interface GameState {
  answerStack: Puzzle[];
}

interface ServerState extends GameState {
  timer?: Timer;
}

function useGameState({
  final,
  initial,
  puzzleId,
}: {
  final: Puzzle;
  initial: Puzzle;
  puzzleId: string;
}) {
  const { calculateSeconds, timer, setTimerNewSession } = useTimer({
    puzzleId,
  });

  // Reference to timer value to use without triggering re-renders
  const timerRef = useRef(timer);
  useEffect(() => {
    timerRef.current = timer;
  }, [calculateSeconds, timer]);

  const { getValue: getLocalValue, saveValue: saveLocalValue } =
    useLocalStorage({
      id: puzzleId,
      type: StateType.PUZZLE,
    });
  const { getValue: getServerValue, saveValue: saveServerValue } =
    useServerStorage({
      id: puzzleId,
      type: StateType.PUZZLE,
    });
  const [isNotesMode, setIsNotesMode] = useState<boolean>(false);
  const [selectedCell, setSelectedCell] = useState<null | string>(null);
  const [{ answerStack, isRestored }, setAnswerStack] = useState<{
    answerStack: Puzzle[];
    isRestored?: boolean;
  }>({ answerStack: [structuredClone(initial)] });
  const [redoAnswerStack, setRedoAnswerStack] = useState<Puzzle[]>([]);

  const getValue = useCallback((): {
    localValue: { lastUpdated: number; state: GameState } | undefined;
    serverValuePromise: Promise<ServerStateResult<ServerState> | undefined>;
  } => {
    let localValue = getLocalValue<GameState>();
    const serverValuePromise = getServerValue<ServerState>();
    return { localValue, serverValuePromise };
  }, [getLocalValue, getServerValue]);
  const saveValue = useCallback(
    (
      state: GameState
    ): {
      localValue: { lastUpdated: number; state: GameState } | undefined;
      serverValuePromise: Promise<ServerStateResult<GameState> | undefined>;
    } => {
      const localValue = saveLocalValue<GameState>(state);
      const serverValuePromise = saveServerValue<ServerState>({
        ...state,
        timer: timerRef.current || undefined,
      });
      return { localValue, serverValuePromise };
    },
    [saveLocalValue, saveServerValue, timerRef]
  );

  // Answers
  const answer = answerStack[answerStack.length - 1];
  const pushAnswer = useCallback(
    (nextAnswer: Puzzle) => {
      setAnswerStack({ answerStack: [...answerStack, nextAnswer] });
      setRedoAnswerStack([]);
    },
    [answerStack]
  );
  const setAnswer: SetAnswer = useCallback(
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
  const toggleNote: ToggleNote = useCallback(
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
  const selectNumber: SelectNumber = useCallback(
    (number: number) => {
      if (isNotesMode) {
        toggleNote(number);
      } else {
        setAnswer(number);
      }
    },
    [isNotesMode, setAnswer, toggleNote]
  );

  const selectedAnswer = useCallback(() => {
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
  const undo = useCallback(() => {
    if (!isUndoDisabled) {
      const lastAnswer = answerStack[answerStack.length - 1];
      setRedoAnswerStack([...redoAnswerStack, lastAnswer]);
      setAnswerStack({
        answerStack: answerStack.slice(0, answerStack.length - 1),
      });
    }
  }, [isUndoDisabled, answerStack, redoAnswerStack]);
  const isRedoDisabled = !redoAnswerStack.length;
  const redo = useCallback(() => {
    if (!isRedoDisabled) {
      const lastUndo = redoAnswerStack[redoAnswerStack.length - 1];
      setAnswerStack({ answerStack: [...answerStack, lastUndo] });
      setRedoAnswerStack(redoAnswerStack.slice(0, redoAnswerStack.length - 1));
    }
  }, [isRedoDisabled, answerStack, redoAnswerStack]);

  // Validation
  const [validation, setValidation] = useState<
    undefined | Puzzle<boolean | undefined>
  >(undefined);
  const validateGrid = useCallback(
    () => setValidation(checkGrid(initial, final, answer)),
    [initial, final, answer]
  );
  const validateCell = useCallback(
    () =>
      selectedCell &&
      setValidation(checkCell(selectedCell, initial, final, answer)),
    [selectedCell, initial, final, answer]
  );
  useEffect(() => {
    setValidation(undefined);
  }, [answer, selectedCell]);

  // Restore and save state
  useEffect(() => {
    let active = true;

    const { localValue, serverValuePromise } = getValue() || {};
    if (localValue) {
      setAnswerStack({
        answerStack: localValue.state.answerStack,
        isRestored: true,
      });
    }
    serverValuePromise.then((serverValue) => {
      if (active) {
        if (
          serverValue &&
          (!localValue?.lastUpdated ||
            (localValue?.lastUpdated &&
              serverValue?.state &&
              serverValue?.updatedAt &&
              serverValue.updatedAt.getTime() > localValue?.lastUpdated))
        ) {
          // Update local state and timer if server state is newer
          setAnswerStack({
            answerStack: serverValue.state.answerStack,
            isRestored: true,
          });
          setTimerNewSession(serverValue.state.timer);
        }
        // TODO Update parties list
        console.info('restored state, TODO Update parties list', serverValue);
      }
    });

    return () => {
      active = false;
    };
  }, [puzzleId, getValue, setTimerNewSession]);
  useEffect(() => {
    let active = true;
    if (!isRestored && answerStack.length > 1) {
      const { serverValuePromise } = saveValue({ answerStack });
      serverValuePromise.then((serverValue) => {
        if (active) {
          // TODO Update parties list
          console.info(
            'answerStack updated, TODO Update parties list',
            serverValue
          );
        }
      });
    }
    return () => {
      active = false;
    };
  }, [puzzleId, answerStack, saveValue, isRestored]);

  // Handle keyboard
  useEffect(() => {
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

  return {
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
    calculateSeconds,
    timer,
  };
}

export { useGameState };
