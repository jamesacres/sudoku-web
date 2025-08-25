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
import {
  GameState,
  GameStateMetadata,
  SelectNumber,
  ServerState,
  SetAnswer,
} from '@/types/state';
import { useLocalStorage } from './localStorage';
import { useServerStorage } from './serverStorage';
import { checkCell, checkGrid } from '@/helpers/checkAnswer';
import { StateType } from '@/types/StateType';
import { useTimer } from './timer';
import { calculateSeconds } from '@/helpers/calculateSeconds';
import { Parties, ServerStateResult, Session } from '@/types/serverTypes';
import { UserContext } from '@/providers/UserProvider';
import { RevenueCatContext } from '@/providers/RevenueCatProvider/RevenueCatProvider';
import {
  canUseUndo,
  canUseCheckGrid,
  incrementUndoCount,
  incrementCheckGridCount,
} from '@/utils/dailyActionCounter';
import { SubscriptionContext } from '@/types/subscriptionContext';
import { useDocumentVisibility } from './documentVisibility';
import { useSessions } from '@/providers/SessionsProvider/SessionsProvider';
import { useParties } from './useParties';

function useGameState({
  final,
  initial,
  puzzleId,
  metadata,
}: {
  final: Puzzle<number>;
  initial: Puzzle<number>;
  puzzleId: string;
  metadata: Partial<GameStateMetadata>;
}) {
  const { user } = useContext(UserContext) || {};
  const { subscribeModal, isSubscribed } = useContext(RevenueCatContext) || {};
  const isDocumentVisible = useDocumentVisibility();

  const { timer, setTimerNewSession, stopTimer, setPauseTimer, isPaused } =
    useTimer({
      puzzleId,
    });

  // Reference to timer value to use without triggering re-renders
  const timerRef = useRef(timer);

  // Track last saveValue call to prevent race conditions and unnecessary polling
  const lastSaveTimeRef = useRef<number>(0);
  const pollingIgnoreCounterRef = useRef<number>(0);

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
  const { parties } = useParties();
  const { getSessionParties, patchFriendSessions } = useSessions();

  const [isNotesMode, setIsNotesMode] = useState<boolean>(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [isZoomMode, setIsZoomMode] = useState(false);
  const [{ answerStack, isRestored, isDisabled, completed }, setAnswerStack] =
    useState<{
      answerStack: Puzzle[];
      isRestored?: boolean;
      isDisabled?: boolean; // disable until heard from server
      completed?: GameState['completed'];
    }>({ answerStack: [structuredClone(initial)], isDisabled: true });
  const [redoAnswerStack, setRedoAnswerStack] = useState<Puzzle[]>([]);
  const [sessionParties, setSessionPartiesLocal] = useState<
    Parties<Session<ServerState>>
  >(() => {
    const initialSessionParties = getSessionParties(
      parties,
      `sudoku-${puzzleId}`
    );
    console.info('initialSessionParties', initialSessionParties);
    return initialSessionParties;
  });
  const setSessionParties = useCallback(
    (sessionParties: Parties<Session<ServerState>>) => {
      setSessionPartiesLocal(sessionParties);
      const partySessions = Object.values(sessionParties);
      const userSessions: { [userId: string]: Session<ServerState> } = {};
      for (const partySession of partySessions) {
        if (partySession?.memberSessions) {
          Object.assign(userSessions, partySession.memberSessions);
        }
      }
      patchFriendSessions(`sudoku-${puzzleId}`, userSessions);
    },
    [patchFriendSessions, puzzleId]
  );
  const hasSessionParties = Object.keys(sessionParties).length;

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

  const shrinkAnswerStack = useCallback((answerStack: Puzzle[]): Puzzle[] => {
    // Only store the last 3 guesses on the server
    return answerStack.slice(-3);
  }, []);

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
    [saveLocalValue, saveServerValue, timerRef, shrinkAnswerStack]
  );
  const handleServerResponse = useCallback(
    (
      active: boolean,
      serverValue: ServerStateResult<GameState> | undefined
    ) => {
      if (
        active &&
        serverValue?.parties &&
        Object.keys(serverValue.parties).length
      ) {
        setSessionParties(serverValue.parties);
      }
    },
    [setSessionParties]
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
    const performReveal = () => {
      pushAnswer(structuredClone(final));
    };

    if (subscribeModal) {
      subscribeModal.showModalIfRequired(
        performReveal,
        () => {},
        SubscriptionContext.REVEAL
      );
    } else {
      performReveal();
    }
  }, [pushAnswer, final, subscribeModal]);

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
      if (number !== 0 && (isNotesMode || forceNotes)) {
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

  const selectedCellHasNotes = useCallback(() => {
    if (selectedCell) {
      const { box, cell } = splitCellId(selectedCell);
      const result = answer[box.x][box.y][cell.x][cell.y];
      if (typeof result === 'object' && result !== null) {
        return Object.values(result).some((note) => note === true);
      }
    }
    return false;
  }, [answer, selectedCell]);

  // Undo and Redo
  // Don't undo initial state
  const isUndoDisabled = answerStack.length < 2;
  const undo = useCallback(() => {
    if (!isUndoDisabled) {
      const performUndo = () => {
        const lastAnswer = answerStack[answerStack.length - 1];
        setRedoAnswerStack([...redoAnswerStack, lastAnswer]);
        setAnswerStack({
          answerStack: answerStack.slice(0, answerStack.length - 1),
        });
        // Increment daily counter only for non-subscribers
        if (!isSubscribed) {
          incrementUndoCount();
        }
      };

      // Check if user has free uses left or is subscribed
      if (isSubscribed || canUseUndo()) {
        performUndo();
      } else if (subscribeModal) {
        subscribeModal.showModalIfRequired(
          performUndo,
          () => {},
          SubscriptionContext.UNDO
        );
      }
    }
  }, [
    isUndoDisabled,
    answerStack,
    redoAnswerStack,
    subscribeModal,
    isSubscribed,
  ]);
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
  const validateGrid = useCallback(() => {
    const performValidateGrid = () => {
      validation
        ? setValidation(undefined)
        : setValidation(checkGrid(initial, final, answer).validation);
      // Increment daily counter only for non-subscribers
      if (!isSubscribed) {
        incrementCheckGridCount();
      }
    };

    // Check if user has free uses left or is subscribed
    if (isSubscribed || canUseCheckGrid()) {
      performValidateGrid();
    } else if (subscribeModal) {
      subscribeModal.showModalIfRequired(
        performValidateGrid,
        () => {},
        SubscriptionContext.CHECK_GRID
      );
    }
  }, [initial, final, answer, validation, subscribeModal, isSubscribed]);
  const validateCell = useCallback(() => {
    const performValidateCell = () => {
      selectedCell &&
        (validation
          ? setValidation(undefined)
          : setValidation(checkCell(selectedCell, initial, final, answer)));
    };

    performValidateCell();
  }, [validation, selectedCell, initial, final, answer]);
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
            // Track saveValue call timestamp and increment ignore counter
            lastSaveTimeRef.current = Date.now();
            pollingIgnoreCounterRef.current += 1;
            saveValue(localValue.state).serverValuePromise.then((result) =>
              handleServerResponse(active, result)
            );
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
  }, [
    user,
    puzzleId,
    getValue,
    setTimerNewSession,
    saveValue,
    setSessionParties,
    handleServerResponse,
  ]);

  useEffect(() => {
    let active = true;
    let intervalId: ReturnType<typeof setInterval>;

    const pollGetValue = () => {
      const now = Date.now();
      const timeSinceLastSave = now - lastSaveTimeRef.current;

      // Only poll if more than 1 minute has passed since last saveValue call
      if (
        !isPaused &&
        isDocumentVisible &&
        active &&
        timeSinceLastSave >= 60000
      ) {
        console.info('polling stale session parties..');
        const currentIgnoreCounter = pollingIgnoreCounterRef.current;
        const { serverValuePromise } = getValue() || {};

        serverValuePromise?.then((serverValue) => {
          // Ignore response if a saveValue call happened after this polling request
          if (
            !isPaused &&
            active &&
            pollingIgnoreCounterRef.current === currentIgnoreCounter
          ) {
            if (
              serverValue?.parties &&
              Object.keys(serverValue.parties).length
            ) {
              setSessionParties(serverValue.parties);
            }
          }
        });
      } else {
        console.info('skipping poll');
      }
    };

    if (active && !isPaused && isDocumentVisible && hasSessionParties) {
      // Poll every minute if we have at least one party in the session
      console.info('setting up polling..');
      intervalId = setInterval(pollGetValue, 60000);
    } else {
      console.info('not setting up polling, no need');
    }

    return () => {
      active = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [
    getValue,
    setSessionParties,
    isPaused,
    isDocumentVisible,
    hasSessionParties,
  ]);

  useEffect(() => {
    let active = true;
    if (!isDisabled && !isRestored && answerStack.length > 0) {
      let isCorrect;
      if (!completed && selectedCell) {
        const currentAnswer = answerStack[answerStack.length - 1];
        const previousAnswer = answerStack[answerStack.length - 2];
        const { box, cell } = splitCellId(selectedCell);
        const enteredValue = currentAnswer[box.x][box.y][cell.x][cell.y];
        const previousValue =
          !!previousAnswer && previousAnswer[box.x][box.y][cell.x][cell.y];
        if (enteredValue !== previousValue) {
          const correctValue = final[box.x][box.y][cell.x][cell.y];
          const initialValue = initial[box.x][box.y][cell.x][cell.y];
          isCorrect =
            initialValue !== enteredValue && enteredValue === correctValue;
        }
      }
      const isFirstLoad = answerStack.length === 1 && !selectedCell;
      if (isFirstLoad) {
        console.info('isFirstLoad');
      }
      if (isCorrect || completed || isFirstLoad) {
        // Track saveValue call timestamp and increment ignore counter
        lastSaveTimeRef.current = Date.now();
        pollingIgnoreCounterRef.current += 1;

        const { serverValuePromise } = saveValue({
          answerStack,
          initial,
          final,
          completed,
          metadata,
        });
        serverValuePromise.then((result) =>
          handleServerResponse(active, result)
        );
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
    metadata,
    setSessionParties,
    handleServerResponse,
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

  const [isPolling, setIsPolling] = useState(false);
  const refreshSessionParties = useCallback(async () => {
    setIsPolling(true);
    try {
      const { serverValuePromise } = getValue() || {};
      const serverValue = await serverValuePromise;
      if (serverValue?.parties && Object.keys(serverValue?.parties).length) {
        setSessionParties(serverValue.parties);
      }
    } finally {
      setIsPolling(false);
    }
  }, [getValue, setSessionParties]);

  return {
    answer,
    answerStack,
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
    isPolling,
    sessionParties,
    showSidebar,
    setShowSidebar,
    isZoomMode,
    setIsZoomMode,
  };
}

export { useGameState };
