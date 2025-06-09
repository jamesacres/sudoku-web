import {
  CornerUpLeft,
  CornerUpRight,
  Delete,
  Edit,
  Edit2,
  Grid,
  RefreshCw,
  Square,
  Unlock,
} from 'react-feather';
import NumberPad from '../NumberPad';
import Toggle from '../Toggle';
import React, { memo } from 'react';
import { HintBox } from '../HintBox/HintBox';

interface Arguments {
  isInputDisabled: boolean;
  isValidateCellDisabled: boolean;
  validateGrid: () => void;
  validateCell: () => void;
  isUndoDisabled: boolean;
  isRedoDisabled: boolean;
  undo: () => void;
  redo: () => void;
  // eslint-disable-next-line no-unused-vars
  selectNumber: (number: number) => void;
  isNotesMode: boolean;
  setIsNotesMode: (_value: boolean) => void;
  isMiniNotes: boolean;
  setIsMiniNotes: (_value: boolean) => void;
  reset: () => void;
  reveal: () => void;
}

const SudokuControls = ({
  isInputDisabled,
  isValidateCellDisabled,
  validateGrid,
  validateCell,
  isUndoDisabled,
  isRedoDisabled,
  undo,
  redo,
  selectNumber,
  isNotesMode,
  setIsNotesMode,
  isMiniNotes,
  setIsMiniNotes,
  reset,
  reveal,
}: Arguments) => {
  return (
    <div className="mt-1 mb-4 px-2 pt-4 xl:max-w-lg">
      <div className="hidden lg:block">
        <HintBox>
          Keyboard: arrow keys, undo, redo.
          <br />
          Hold shift or press n to toggle notes mode.
          <br />
          Press c to validate cell, g to validate grid.
        </HintBox>
      </div>

      {/* iOS-style control panel */}
      <div className="mt-3 rounded-xl border border-gray-200 bg-white/80 p-3 shadow-lg backdrop-blur-md dark:border-gray-700 dark:bg-zinc-800/80">
        {/* Toggle controls section */}
        <div className="mb-3 flex justify-center gap-4 border-b border-gray-200 pb-3 dark:border-gray-600">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs font-medium text-gray-700 dark:text-gray-300">
              {isNotesMode ? <Edit size={14} /> : <Edit2 size={14} />}
              Notes
            </div>
            <Toggle isEnabled={isNotesMode} setEnabled={setIsNotesMode} />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs font-medium text-gray-700 dark:text-gray-300">
              {isMiniNotes ? <Grid size={14} /> : <Square size={14} />}
              Mini
            </div>
            <Toggle isEnabled={isMiniNotes} setEnabled={setIsMiniNotes} />
          </div>
        </div>

        {/* Main controls layout */}
        <div className="flex flex-col items-center gap-3 lg:flex-row">
          {/* Number pad */}
          <div className="order-1 flex-shrink-0 lg:order-1">
            <NumberPad
              selectNumber={selectNumber}
              isInputDisabled={isInputDisabled}
            />
          </div>

          {/* Action buttons - compact layout for mobile */}
          <div className="order-2 w-full flex-1 lg:order-2 lg:w-auto">
            <div className="grid grid-cols-3 gap-2">
              {/* Row 1: Delete, Undo, and Redo */}
              <button
                disabled={isValidateCellDisabled}
                onClick={() => selectNumber(0)}
                className="flex items-center justify-center gap-1.5 rounded-lg bg-gray-100 px-2 py-2.5 text-sm font-medium text-gray-700 transition-all duration-150 hover:bg-gray-200 active:bg-gray-300 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 dark:bg-zinc-700 dark:text-gray-200 dark:hover:bg-zinc-600 dark:active:bg-zinc-500 dark:disabled:bg-zinc-800"
              >
                <Delete size={15} />
                Delete
              </button>
              <button
                disabled={isUndoDisabled}
                onClick={() => undo()}
                className="flex items-center justify-center gap-1.5 rounded-lg bg-gray-100 px-2 py-2.5 text-sm font-medium text-gray-700 transition-all duration-150 hover:bg-gray-200 active:bg-gray-300 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 dark:bg-zinc-700 dark:text-gray-200 dark:hover:bg-zinc-600 dark:active:bg-zinc-500 dark:disabled:bg-zinc-800"
              >
                <CornerUpLeft size={15} />
                Undo
              </button>
              <button
                disabled={isRedoDisabled}
                onClick={() => redo()}
                className="flex items-center justify-center gap-1.5 rounded-lg bg-gray-100 px-2 py-2.5 text-sm font-medium text-gray-700 transition-all duration-150 hover:bg-gray-200 active:bg-gray-300 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 dark:bg-zinc-700 dark:text-gray-200 dark:hover:bg-zinc-600 dark:active:bg-zinc-500 dark:disabled:bg-zinc-800"
              >
                Redo
                <CornerUpRight size={15} />
              </button>

              {/* Row 2: Reset, Check Cell, and Check Grid */}
              <button
                onClick={() => {
                  window.confirm(
                    'Are you sure you wish to reset the whole grid?'
                  ) && reset();
                }}
                className="flex items-center justify-center gap-1.5 rounded-lg bg-gray-100 px-2 py-2.5 text-sm font-medium text-gray-700 transition-all duration-150 hover:bg-gray-200 active:bg-gray-300 dark:bg-zinc-700 dark:text-gray-200 dark:hover:bg-zinc-600 dark:active:bg-zinc-500"
              >
                <RefreshCw size={15} />
                Reset
              </button>
              <button
                disabled={isValidateCellDisabled}
                onClick={() => validateCell()}
                className="flex items-center justify-center gap-1.5 rounded-lg bg-gray-100 px-2 py-2.5 text-sm font-medium text-gray-700 transition-all duration-150 hover:bg-gray-200 active:bg-gray-300 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 dark:bg-zinc-700 dark:text-gray-200 dark:hover:bg-zinc-600 dark:active:bg-zinc-500 dark:disabled:bg-zinc-800"
              >
                <Square size={15} />
                Cell
              </button>
              <button
                onClick={() => validateGrid()}
                className="flex items-center justify-center gap-1.5 rounded-lg bg-gray-100 px-2 py-2.5 text-sm font-medium text-gray-700 transition-all duration-150 hover:bg-gray-200 active:bg-gray-300 dark:bg-zinc-700 dark:text-gray-200 dark:hover:bg-zinc-600 dark:active:bg-zinc-500"
              >
                <Grid size={15} />
                Grid
              </button>

              {/* Row 3: Reveal - spans full width */}
              <button
                onClick={() => {
                  window.confirm(
                    'Are you sure you wish to reveal the whole grid?'
                  ) && reveal();
                }}
                className="col-span-3 flex items-center justify-center gap-1.5 rounded-lg bg-gray-100 px-2 py-2.5 text-sm font-medium text-gray-700 transition-all duration-150 hover:bg-gray-200 active:bg-gray-300 dark:bg-zinc-700 dark:text-gray-200 dark:hover:bg-zinc-600 dark:active:bg-zinc-500"
              >
                <Unlock size={15} />
                Reveal
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Prevent re-render on timer change
const MemoisedSudokuControls = memo(function MemoisedSudokuControls(
  args: Arguments
) {
  return SudokuControls(args);
});

export default MemoisedSudokuControls;
