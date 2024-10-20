import {
  CornerUpLeft,
  CornerUpRight,
  Delete,
  Edit,
  Edit2,
  Grid,
  Square,
  X,
} from 'react-feather';
import NumberPad from '../NumberPad';
import NotesToggle from '../NotesToggle';
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
}: Arguments) => {
  return (
    <div className="mb-8 mt-4 pl-0 pr-2 pt-4">
      <div className="hidden lg:block">
        <HintBox>
          Keyboard: arrow keys, undo, redo, n to toggle notes mode.
        </HintBox>
      </div>
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
          <NotesToggle isEnabled={isNotesMode} setEnabled={setIsNotesMode} />
        </div>
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
        <div className="flex flex-row flex-wrap text-center lg:flex-col">
          <div
            className="mr-2 inline-flex flex-nowrap items-center"
            role="group"
            aria-label="Button group"
          >
            <button
              disabled={isValidateCellDisabled}
              onClick={() => selectNumber(0)}
              className="mt-2 inline-flex rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-blue-300"
            >
              <Delete className="float-left mr-2" />
              Delete
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
              className="mt-2 rounded-l-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-blue-300"
            >
              <CornerUpLeft className="float-left mr-2" />
              Undo
            </button>
            <button
              disabled={isRedoDisabled}
              onClick={() => redo()}
              className="mt-2 rounded-r-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-blue-300"
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
              className="mt-2 rounded-l-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-blue-300"
            >
              <Square className="float-left mr-2" />
            </button>
            <div className="mt-2 cursor-default bg-blue-500 px-4 py-2 text-white">
              Check
            </div>
            <button
              onClick={() => validateGrid()}
              className="mt-2 rounded-r-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-700"
            >
              <Grid className="float-right ml-2" />
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
