'use client';

import { Puzzle } from '@/types/puzzle';
import { Notes, ToggleNote } from '@/types/notes';
import { useCallback, useEffect, useState } from 'react';
import {
  calculateBoxId,
  calculateCellId,
  calculateNextCellId,
  splitCellId,
} from '@/helpers/calculateId';
import { SelectNumber, SetAnswer } from '@/types/state';
import { StateType, useLocalStorage } from './localStorage';
import { checkCell, checkGrid } from '@/helpers/checkAnswer';

function useGameState({
  final,
  initial,
  puzzleId,
}: {
  final: Puzzle;
  initial: Puzzle;
  puzzleId: string;
}) {
  const { getValue, saveValue } = useLocalStorage({
    id: puzzleId,
    type: StateType.PUZZLE,
  });
  const [isNotesMode, setIsNotesMode] = useState<boolean>(false);
  const [selectedCell, setSelectedCell] = useState<null | string>(null);
  const [answerStack, setAnswerStack] = useState<Puzzle[]>([
    structuredClone(initial),
  ]);
  const [redoAnswerStack, setRedoAnswerStack] = useState<Puzzle[]>([]);

  // Answers
  const answer = answerStack[answerStack.length - 1];
  const pushAnswer = useCallback(
    (nextAnswer: Puzzle) => {
      setAnswerStack([...answerStack, nextAnswer]);
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
      setAnswerStack(answerStack.slice(0, answerStack.length - 1));
    }
  }, [isUndoDisabled, answerStack, redoAnswerStack]);
  const isRedoDisabled = !redoAnswerStack.length;
  const redo = useCallback(() => {
    if (!isRedoDisabled) {
      const lastUndo = redoAnswerStack[redoAnswerStack.length - 1];
      setAnswerStack([...answerStack, lastUndo]);
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
    const { state: savedState } = getValue<Puzzle[]>() || {};
    if (savedState) {
      setAnswerStack(savedState);
    }
  }, [puzzleId, getValue]);
  useEffect(() => {
    if (answerStack.length > 1) {
      saveValue(answerStack);
    }
  }, [puzzleId, answerStack, saveValue]);

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
  };
}

export { useGameState };
