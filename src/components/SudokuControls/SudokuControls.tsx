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
  return (
    <div className="mt-4 grid grid-cols-4 gap-4 border-t-2 border-t-blue-500 pt-4">
      <button
        onClick={() => validateGrid()}
        className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
      >
        Check Grid
      </button>
      <button
        disabled={isValidateCellDisabled}
        onClick={() => validateCell()}
        className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 disabled:bg-blue-300"
      >
        Check Cell
      </button>
      <button
        disabled={isUndoDisabled}
        onClick={() => undo()}
        className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 disabled:bg-blue-300"
      >
        Undo
      </button>
      <button
        disabled={isRedoDisabled}
        onClick={() => redo()}
        className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 disabled:bg-blue-300"
      >
        Redo
      </button>
    </div>
  );
};

export default SudokuControls;
