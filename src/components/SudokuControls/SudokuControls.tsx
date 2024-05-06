import { CornerUpLeft, CornerUpRight, Grid, Square } from 'react-feather';

const SudokuControls = ({
  isValidateCellDisabled,
  validateGrid,
  validateCell,
  isUndoDisabled,
  isRedoDisabled,
  undo,
  redo,
}: {
  isValidateCellDisabled: boolean;
  validateGrid: () => void;
  validateCell: () => void;
  isUndoDisabled: boolean;
  isRedoDisabled: boolean;
  undo: () => void;
  redo: () => void;
}) => {
  // TODO add icons
  return (
    <div className="mb-8 mt-4 border-t-2 border-t-blue-500 pl-2 pr-2 pt-4 sm:flex-row">
      <button
        onClick={() => validateGrid()}
        className="mr-2 mt-2 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-700"
      >
        <Grid className="float-left mr-2" />
        Check Grid
      </button>
      <button
        disabled={isValidateCellDisabled}
        onClick={() => validateCell()}
        className="mr-2 mt-2 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-blue-300"
      >
        <Square className="float-left mr-2" />
        Check Cell
      </button>
      <button
        disabled={isUndoDisabled}
        onClick={() => undo()}
        className="mr-2 mt-2 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-blue-300"
      >
        <CornerUpLeft className="float-left mr-2" />
        Undo
      </button>
      <button
        disabled={isRedoDisabled}
        onClick={() => redo()}
        className="mr-2 mt-2 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-blue-300"
      >
        <CornerUpRight className="float-left mr-2" />
        Redo
      </button>
    </div>
  );
};

export default SudokuControls;
