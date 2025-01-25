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
    <div className="mt-4 mb-8 pt-4 pr-2 pl-0 xl:max-w-lg">
      <div className="hidden lg:block">
        <HintBox>
          Keyboard: arrow keys, undo, redo, n to toggle notes mode,
          <br />c to validate cell, g to validate grid.
        </HintBox>
      </div>
      <div className="flex gap-4">
        <div className="grow"></div>
        <div className="flex items-center justify-start text-sm">
          <button
            className="mr-2 ml-2 cursor-pointer disabled:cursor-not-allowed"
            onClick={() => setIsNotesMode(!isNotesMode)}
          >
            {isNotesMode ? (
              <Edit className="float-left mr-2" size={16} />
            ) : (
              <Edit2 className="float-left mr-2" size={16} />
            )}
            Notes
          </button>
          <div>
            <Toggle isEnabled={isNotesMode} setEnabled={setIsNotesMode} />
          </div>
        </div>
        <div className="flex items-center justify-start text-sm">
          <button
            className="mr-2 ml-2 cursor-pointer disabled:cursor-not-allowed"
            onClick={() => setIsMiniNotes(!isMiniNotes)}
          >
            {isMiniNotes ? (
              <Grid className="float-left mr-2" size={16} />
            ) : (
              <Square className="float-left mr-2" size={16} />
            )}
            Mini Notes
          </button>
          <div>
            <Toggle isEnabled={isMiniNotes} setEnabled={setIsMiniNotes} />
          </div>
        </div>
        <div className="grow"></div>
      </div>
      <div className="flex flex-col items-center justify-center lg:flex-row">
        <div className="mx-auto mt-2" style={{ minWidth: 120 }}>
          <div className="square">
            <NumberPad
              selectNumber={selectNumber}
              isInputDisabled={isInputDisabled}
            />
          </div>
        </div>
        <div className="mt-2 flex flex-col flex-row flex-wrap text-center">
          <div
            className="mr-2 inline-flex flex-nowrap items-center"
            role="group"
            aria-label="Button group"
          >
            <button
              disabled={isValidateCellDisabled}
              onClick={() => selectNumber(0)}
              className="mt-2 cursor-pointer rounded-l-lg bg-neutral-500 px-4 py-2 text-white hover:bg-neutral-700 disabled:cursor-not-allowed disabled:bg-neutral-300"
            >
              <Delete className="float-left mr-2" />
              Delete
            </button>
            <button
              onClick={() => {
                window.confirm(
                  'Are you sure you wish to reset the whole grid?'
                ) && reset();
              }}
              className="mt-2 cursor-pointer rounded-r-lg bg-neutral-500 px-4 py-2 text-white hover:bg-neutral-700 disabled:cursor-not-allowed disabled:bg-neutral-300"
            >
              <RefreshCw className="float-left mr-2" />
              Reset
            </button>
          </div>
          <div
            className="mr-2 inline-flex min-w-52 flex-nowrap items-center"
            role="group"
            aria-label="Button group"
          >
            <button
              disabled={isUndoDisabled}
              onClick={() => undo()}
              className="mt-2 cursor-pointer rounded-l-lg bg-neutral-500 px-4 py-2 text-white hover:bg-neutral-700 disabled:cursor-not-allowed disabled:bg-neutral-300"
            >
              <CornerUpLeft className="float-left mr-2" />
              Undo
            </button>
            <button
              disabled={isRedoDisabled}
              onClick={() => redo()}
              className="mt-2 cursor-pointer rounded-r-lg bg-neutral-500 px-4 py-2 text-white hover:bg-neutral-700 disabled:cursor-not-allowed disabled:bg-neutral-300"
            >
              Redo
              <CornerUpRight className="float-right ml-2" />
            </button>
          </div>
          <div
            className="inline-flex items-center"
            role="group"
            aria-label="Button group"
          >
            <button
              disabled={isValidateCellDisabled}
              onClick={() => validateCell()}
              className="mt-2 cursor-pointer rounded-l-lg bg-neutral-500 px-4 py-2 text-white hover:bg-neutral-700 disabled:cursor-not-allowed disabled:bg-neutral-300"
            >
              <Square className="float-left mr-2" />
            </button>
            <div className="mt-2 cursor-default bg-neutral-500 px-4 py-2 text-white">
              Check
            </div>
            <button
              onClick={() => validateGrid()}
              className="mt-2 cursor-pointer rounded-r-lg bg-neutral-500 px-4 py-2 text-white hover:bg-neutral-700 disabled:cursor-not-allowed"
            >
              <Grid className="float-right ml-2" />
            </button>
          </div>
          <div
            className="mr-2 inline-flex flex-nowrap items-center"
            role="group"
            aria-label="Button group"
          >
            <button
              onClick={() => {
                window.confirm(
                  'Are you sure you wish to reveal the whole grid?'
                ) && reveal();
              }}
              className="mt-2 cursor-pointer rounded-lg bg-neutral-500 px-4 py-2 text-white hover:bg-neutral-700 disabled:cursor-not-allowed disabled:bg-neutral-300"
            >
              <Unlock className="float-left mr-2" />
              Reveal
            </button>
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
