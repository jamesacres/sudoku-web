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
    <div className="mb-8 mt-4 pl-0 pr-2 pt-4">
      <div className="hidden lg:block">
        <HintBox>
          Keyboard: arrow keys, undo, redo, n to toggle notes mode.
        </HintBox>
      </div>
      <div className="flex gap-4">
        <div className="flex-grow"></div>
        <div className="flex items-center justify-center text-sm">
          <button
            className="ml-2 mr-2"
            onClick={() => setIsNotesMode(!isNotesMode)}
          >
            {isNotesMode ? (
              <Edit className="float-left mr-2" />
            ) : (
              <Edit2 className="float-left mr-2" />
            )}
            Notes Mode {isNotesMode ? 'On' : 'Off'}
          </button>
          <div>
            <Toggle isEnabled={isNotesMode} setEnabled={setIsNotesMode} />
          </div>
        </div>
        <div className="flex items-center justify-center text-sm">
          <button
            className="ml-2 mr-2"
            onClick={() => setIsMiniNotes(!isMiniNotes)}
          >
            {isMiniNotes ? (
              <Grid className="float-left mr-2" />
            ) : (
              <Square className="float-left mr-2" />
            )}
            Mini Notes {isMiniNotes ? 'On' : 'Off'}
          </button>
          <div>
            <Toggle isEnabled={isMiniNotes} setEnabled={setIsMiniNotes} />
          </div>
        </div>
        <div className="flex-grow"></div>
      </div>
      <div className="m-4 flex flex-col items-center justify-center lg:flex-row">
        <div className="mx-auto mt-2" style={{ minWidth: 120 }}>
          <div className="square">
            <NumberPad
              selectNumber={selectNumber}
              isInputDisabled={isInputDisabled}
            />
          </div>
        </div>
        <div className="flex flex-row flex-col flex-wrap text-center">
          <div
            className="mr-2 inline-flex flex-nowrap items-center"
            role="group"
            aria-label="Button group"
          >
            <button
              disabled={isValidateCellDisabled}
              onClick={() => selectNumber(0)}
              className="mt-2 rounded-l-lg bg-neutral-500 px-4 py-2 text-white hover:bg-neutral-700 disabled:bg-neutral-300"
            >
              <Delete className="float-left mr-2" />
              Delete
            </button>
            <button
              onClick={() => {
                window.confirm('Are you sure you wish to reset?') && reset();
              }}
              className="mt-2 rounded-r-lg bg-neutral-500 px-4 py-2 text-white hover:bg-neutral-700 disabled:bg-neutral-300"
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
              className="mt-2 rounded-l-lg bg-neutral-500 px-4 py-2 text-white hover:bg-neutral-700 disabled:bg-neutral-300"
            >
              <CornerUpLeft className="float-left mr-2" />
              Undo
            </button>
            <button
              disabled={isRedoDisabled}
              onClick={() => redo()}
              className="mt-2 rounded-r-lg bg-neutral-500 px-4 py-2 text-white hover:bg-neutral-700 disabled:bg-neutral-300"
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
              className="mt-2 rounded-l-lg bg-neutral-500 px-4 py-2 text-white hover:bg-neutral-700 disabled:bg-neutral-300"
            >
              <Square className="float-left mr-2" />
            </button>
            <div className="mt-2 cursor-default bg-neutral-500 px-4 py-2 text-white">
              Check
            </div>
            <button
              onClick={() => validateGrid()}
              className="mt-2 rounded-r-lg bg-neutral-500 px-4 py-2 text-white hover:bg-neutral-700"
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
                window.confirm('Are you sure you wish to reveal?') && reveal();
              }}
              className="mt-2 rounded-lg bg-neutral-500 px-4 py-2 text-white hover:bg-neutral-700 disabled:bg-neutral-300"
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
