import {
  ChevronDown,
  ChevronUp,
  CornerUpLeft,
  CornerUpRight,
  Delete,
  Edit,
  Edit2,
  Eye,
  Grid,
  RefreshCw,
  Square,
  Unlock,
} from 'react-feather';
import NumberPad from '../NumberPad';
import Toggle from '../Toggle';
import React, { memo, useState } from 'react';
import { HintBox } from '../HintBox/HintBox';

interface Arguments {
  isInputDisabled: boolean;
  isValidateCellDisabled: boolean;
  isDeleteDisabled: boolean;
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
  isZoomMode: boolean;
  setIsZoomMode: (_value: boolean) => void;
  reset: () => void;
  reveal: () => void;
  onAdvancedToggle?: (_expanded: boolean) => void;
}

const SudokuControls = ({
  isInputDisabled,
  isValidateCellDisabled,
  isDeleteDisabled,
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
  isZoomMode,
  setIsZoomMode,
  reset,
  reveal,
  onAdvancedToggle,
}: Arguments) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleAdvancedToggle = () => {
    const newState = !showAdvanced;
    setShowAdvanced(newState);
    onAdvancedToggle?.(newState);
  };

  return (
    <div className="mt-0 mb-4 px-2 pt-2 lg:mb-16 xl:max-w-lg">
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
      <div className="mt-3 rounded-xl bg-white/60 p-3 shadow-lg backdrop-blur-md dark:bg-zinc-900/60">
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
                disabled={isDeleteDisabled}
                onClick={() => selectNumber(0)}
                className="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-gray-100 px-2 py-2.5 text-sm font-medium text-gray-700 transition-all duration-150 hover:bg-gray-200 active:bg-gray-300 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 dark:bg-zinc-700 dark:text-gray-200 dark:hover:bg-zinc-600 dark:active:bg-zinc-500 dark:disabled:bg-zinc-800"
              >
                <Delete size={15} />
                Delete
              </button>
              <button
                disabled={isUndoDisabled}
                onClick={() => undo()}
                className="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-gray-100 px-2 py-2.5 text-sm font-medium text-gray-700 transition-all duration-150 hover:bg-gray-200 active:bg-gray-300 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 dark:bg-zinc-700 dark:text-gray-200 dark:hover:bg-zinc-600 dark:active:bg-zinc-500 dark:disabled:bg-zinc-800"
              >
                <CornerUpLeft size={15} />
                Undo
              </button>
              <button
                disabled={isRedoDisabled}
                onClick={() => redo()}
                className="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-gray-100 px-2 py-2.5 text-sm font-medium text-gray-700 transition-all duration-150 hover:bg-gray-200 active:bg-gray-300 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 dark:bg-zinc-700 dark:text-gray-200 dark:hover:bg-zinc-600 dark:active:bg-zinc-500 dark:disabled:bg-zinc-800"
              >
                Redo
                <CornerUpRight size={15} />
              </button>
            </div>

            {/* Advanced controls toggle */}
            <div className="mt-2 lg:hidden">
              <button
                onClick={handleAdvancedToggle}
                className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-gray-50 px-2 py-2 text-xs font-medium text-gray-600 transition-all duration-150 hover:bg-gray-100 dark:bg-zinc-800 dark:text-gray-400 dark:hover:bg-zinc-700"
              >
                {showAdvanced ? (
                  <ChevronUp size={14} />
                ) : (
                  <ChevronDown size={14} />
                )}
                {showAdvanced ? 'Hide' : 'More'} Options
              </button>
            </div>

            {/* Collapsible advanced controls */}
            <div
              className={`mt-2 overflow-hidden transition-all duration-300 ease-in-out lg:block ${
                showAdvanced
                  ? 'max-h-96 opacity-100'
                  : 'max-h-0 opacity-0 lg:max-h-96 lg:opacity-100'
              }`}
            >
              <div className="mb-2 grid grid-cols-3 gap-2">
                {/* Check Cell, Check Grid, Zoom Mode */}
                <button
                  disabled={isValidateCellDisabled}
                  onClick={() => validateCell()}
                  className="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-gray-100 px-2 py-2.5 text-sm font-medium text-gray-700 transition-all duration-150 hover:bg-gray-200 active:bg-gray-300 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 dark:bg-zinc-700 dark:text-gray-200 dark:hover:bg-zinc-600 dark:active:bg-zinc-500 dark:disabled:bg-zinc-800"
                >
                  <Square size={15} />
                  Cell
                </button>
                <button
                  onClick={() => validateGrid()}
                  className="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-gray-100 px-2 py-2.5 text-sm font-medium text-gray-700 transition-all duration-150 hover:bg-gray-200 active:bg-gray-300 dark:bg-zinc-700 dark:text-gray-200 dark:hover:bg-zinc-600 dark:active:bg-zinc-500"
                >
                  <Grid size={15} />
                  Grid
                </button>
                <button
                  disabled={!isZoomMode && isInputDisabled}
                  onClick={() => setIsZoomMode(!isZoomMode)}
                  className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-lg px-2 py-2.5 text-sm font-medium transition-all duration-150 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 dark:disabled:bg-zinc-800 ${
                    isZoomMode
                      ? 'bg-theme-primary hover:bg-theme-primary-dark active:bg-theme-primary-darker dark:bg-theme-primary-light dark:hover:bg-theme-primary dark:active:bg-theme-primary-dark text-white dark:text-gray-900'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300 dark:bg-zinc-700 dark:text-gray-200 dark:hover:bg-zinc-600 dark:active:bg-zinc-500'
                  }`}
                >
                  <Eye size={15} />
                  Zoom
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    window.confirm(
                      'Are you sure you wish to reset the whole grid?'
                    ) && reset();
                  }}
                  className="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-gray-100 px-2 py-2.5 text-sm font-medium text-gray-700 transition-all duration-150 hover:bg-gray-200 active:bg-gray-300 dark:bg-zinc-700 dark:text-gray-200 dark:hover:bg-zinc-600 dark:active:bg-zinc-500"
                >
                  <RefreshCw size={15} />
                  Reset
                </button>
                <button
                  onClick={() => {
                    window.confirm(
                      'Are you sure you wish to reveal the whole grid?'
                    ) && reveal();
                  }}
                  className="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-gray-100 px-2 py-2.5 text-sm font-medium text-gray-700 transition-all duration-150 hover:bg-gray-200 active:bg-gray-300 dark:bg-zinc-700 dark:text-gray-200 dark:hover:bg-zinc-600 dark:active:bg-zinc-500"
                >
                  <Unlock size={15} />
                  Reveal
                </button>
              </div>
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
