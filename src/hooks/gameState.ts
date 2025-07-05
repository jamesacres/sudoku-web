'use client';

import { Puzzle } from '@/types/puzzle';
import { Notes, ToggleNote } from '@/types/notes';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  calculateBoxId,
  calculateCellId,
  calculateNextCellId,
  splitCellId,
} from '@/helpers/calculateId';
import { GameState, SelectNumber, ServerState, SetAnswer } from '@/types/state';
import { useLocalStorage } from './localStorage';
import { useServerStorage } from './serverStorage';
import { checkCell, checkGrid } from '@/helpers/checkAnswer';
import { StateType } from '@/types/StateType';
import { useTimer } from './timer';
import { calculateSeconds } from '@/helpers/calculateSeconds';
import { Parties, ServerStateResult, Session } from '@/types/serverTypes';
import { UserContext } from '@/providers/UserProvider';

function useGameState({
  final,
  initial,
  puzzleId,
}: {
  final: Puzzle<number>;
  initial: Puzzle<number>;
  puzzleId: string;
}) {
  const { user, loginRedirect } = useContext(UserContext) || {};

  const { timer, setTimerNewSession, stopTimer, setPauseTimer } = useTimer({
    puzzleId,
  });

  // Reference to timer value to use without triggering re-renders
  const timerRef = useRef(timer);
  useEffect(() => {
    timerRef.current = timer;
  }, [timer]);

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
  const [isMiniNotes, setIsMiniNotes] = useState<boolean>(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [{ answerStack, isRestored, isDisabled, completed }, setAnswerStack] =
    useState<{
      answerStack: Puzzle[];
      isRestored?: boolean;
      isDisabled?: boolean; // disable until heard from server
      completed?: GameState['completed'];
    }>({ answerStack: [structuredClone(initial)], isDisabled: true });
  const [redoAnswerStack, setRedoAnswerStack] = useState<Puzzle[]>([]);
  const [sessionParties, setSessionParties] = useState<
    Parties<Session<ServerState>>
  >({});

  const [selectedCell, setSelectedCellState] = useState<null | string>(null);
  const setSelectedCell = useCallback(
    (selectedCell: string | null) => {
      if (!completed) {
        setSelectedCellState(selectedCell);
      }
    },
    [completed]
  );

  const getValue = useCallback((): {
    localValue: { lastUpdated: number; state: GameState } | undefined;
    serverValuePromise: Promise<ServerStateResult<ServerState> | undefined>;
  } => {
    let localValue = getLocalValue<GameState>();
    const serverValuePromise = getServerValue<ServerState>();
    return { localValue, serverValuePromise };
  }, [getLocalValue, getServerValue]);

  const shrinkAnswerStack = (answerStack: Puzzle[]): Puzzle[] => {
    // Only store the last 3 guesses on the server
    return answerStack.slice(-3);
  };

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
        answerStack: shrinkAnswerStack(state.answerStack),
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
      let completed: GameState['completed'] = undefined;
      if (
        timerRef.current?.inProgress.lastInteraction &&
        checkGrid(initial, final, nextAnswer).isComplete
      ) {
        stopTimer();
        completed = {
          at: timerRef.current.inProgress.lastInteraction,
          seconds: calculateSeconds(timerRef.current),
        };
        setSelectedCell(null);
      }
      setAnswerStack({
        answerStack: [...answerStack, nextAnswer],
        completed,
      });
      setRedoAnswerStack([]);
    },
    [answerStack, initial, final, stopTimer, setSelectedCell]
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

  const reset = useCallback(() => {
    setRedoAnswerStack([]);
    setAnswerStack({ answerStack: [structuredClone(initial)] });
    setTimerNewSession(null);
  }, [initial, setTimerNewSession]);

  const reveal = useCallback(() => {
    pushAnswer(structuredClone(final));
  }, [pushAnswer, final]);

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
    (number: number, forceNotes?: boolean) => {
      if (isNotesMode || forceNotes) {
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
    () =>
      validation
        ? setValidation(undefined)
        : setValidation(checkGrid(initial, final, answer).validation),
    [initial, final, answer, validation]
  );
  const validateCell = useCallback(
    () =>
      selectedCell &&
      (validation
        ? setValidation(undefined)
        : setValidation(checkCell(selectedCell, initial, final, answer))),
    [validation, selectedCell, initial, final, answer]
  );
  useEffect(() => {
    setValidation(undefined);
  }, [answer, selectedCell]);

  // Restore and save state
  useEffect(() => {
    let active = true;

    const { localValue, serverValuePromise } = getValue() || {};
    if (localValue) {
      // If not logged in, force sign in to resume
      // This will become a premium feature
      if (!user && loginRedirect) {
        loginRedirect();
        return;
      }

      setAnswerStack({
        answerStack: localValue.state.answerStack,
        isRestored: true,
        isDisabled: true, // disable until heard from server
        completed: localValue.state.completed,
      });
    }
    serverValuePromise.then((serverValue) => {
      if (active) {
        if (serverValue?.parties && Object.keys(serverValue?.parties).length) {
          setSessionParties(serverValue.parties);
        }
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
            completed: serverValue.state.completed,
          });
          if (!serverValue.state.completed) {
            setTimerNewSession(serverValue.state.timer);
          }
        } else {
          if (
            localValue?.state &&
            localValue?.lastUpdated &&
            (serverValue?.updatedAt?.getTime() || 0) <
              Math.floor(localValue.lastUpdated / 1000) * 1000
          ) {
            // Server value is behind local! Update the server!
            console.warn(
              'Server behind local, updating server',
              serverValue?.updatedAt?.getTime() || 0,
              Math.floor(localValue.lastUpdated / 1000) * 1000
            );
            saveValue(localValue.state);
          }
          // Remove disabled flag, heard from server but ignored it
          setAnswerStack((current) => {
            return { ...current, isDisabled: undefined };
          });
        }
      }
    });

    return () => {
      active = false;
    };
  }, [loginRedirect, user, puzzleId, getValue, setTimerNewSession, saveValue]);
  useEffect(() => {
    let active = true;
    if (!isDisabled && !isRestored && answerStack.length > 0 && selectedCell) {
      const currentAnswer = answerStack[answerStack.length - 1];
      const previousAnswer = answerStack[answerStack.length - 2];
      const { box, cell } = splitCellId(selectedCell);
      const enteredValue = currentAnswer[box.x][box.y][cell.x][cell.y];
      const previousValue =
        !!previousAnswer && previousAnswer[box.x][box.y][cell.x][cell.y];
      if (enteredValue !== previousValue) {
        const correctValue = final[box.x][box.y][cell.x][cell.y];
        const initialValue = initial[box.x][box.y][cell.x][cell.y];
        const isCorrect =
          initialValue !== enteredValue && enteredValue === correctValue;

        if (isCorrect || completed) {
          const { serverValuePromise } = saveValue({
            answerStack,
            initial,
            final,
            completed,
          });
          serverValuePromise.then((serverValue) => {
            if (
              active &&
              serverValue?.parties &&
              Object.keys(serverValue.parties).length
            ) {
              setSessionParties(serverValue.parties);
            }
          });
        }
      }
    }
    return () => {
      active = false;
    };
  }, [
    puzzleId,
    answerStack,
    saveValue,
    isRestored,
    initial,
    final,
    isDisabled,
    completed,
    selectedCell,
  ]);

  // Handle keyboard
  useEffect(() => {
    const ignoreKeyboard = (e: KeyboardEvent) => {
      const insideForm = /^(?:input|textarea|select|button)$/i.test(
        (<any>e.target)?.tagName
      );
      return completed || showSidebar || insideForm;
    };
    const keyupHandler = (e: KeyboardEvent) => {
      if (ignoreKeyboard(e)) {
        return;
      }
      if (e.key === 'Shift') {
        // Release shift to disable notes
        setIsNotesMode(false);
        e.preventDefault();
      }
    };
    const keydownHandler = (e: KeyboardEvent) => {
      if (ignoreKeyboard(e)) {
        return;
      }
      if (e.key === 'Shift') {
        // Hold shift to enable notes
        setIsNotesMode(true);
        e.preventDefault();
      }
      if (e.key === 'n') {
        setIsNotesMode(!isNotesMode);
        e.preventDefault();
      } else if (e.key === 'z') {
        undo();
        e.preventDefault();
      } else if (e.key === 'y') {
        redo();
        e.preventDefault();
      } else if (e.key === 'g') {
        validateGrid();
        e.preventDefault();
      } else if (e.key === 'c') {
        validateCell();
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
      } else if (/Digit[1-9]/.test(e.code)) {
        // Handle number when shift key pressed
        selectNumber(Number(e.code.replace('Digit', '')));
        e.preventDefault();
      }
      if (nextCell) {
        setSelectedCell(nextCell);
      }
    };
    window.addEventListener('keydown', keydownHandler);
    window.addEventListener('keyup', keyupHandler);
    return () => {
      window.removeEventListener('keydown', keydownHandler);
      window.removeEventListener('keyup', keyupHandler);
    };
  }, [
    isNotesMode,
    redo,
    selectedCell,
    selectNumber,
    setAnswer,
    setIsNotesMode,
    undo,
    setSelectedCell,
    completed,
    validateCell,
    validateGrid,
    showSidebar,
  ]);

  const refreshSessionParties = async () => {
    const { serverValuePromise } = getValue() || {};
    const serverValue = await serverValuePromise;
    if (serverValue?.parties && Object.keys(serverValue?.parties).length) {
      setSessionParties(serverValue.parties);
    }
  };

  return {
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
  };
}

export { useGameState };
