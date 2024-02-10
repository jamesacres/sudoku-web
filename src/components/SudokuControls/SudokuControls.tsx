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
    <div className="mt-4 grid grid-cols-4 gap-4 border-t-2 border-t-pink-500 pt-4">
      <button
        onClick={() => validateGrid()}
        className="rounded bg-pink-500 px-4 py-2 font-bold text-white hover:bg-pink-700"
      >
        Check Grid
      </button>
      <button
        disabled={isValidateCellDisabled}
        onClick={() => validateCell()}
        className="rounded bg-pink-500 px-4 py-2 font-bold text-white hover:bg-pink-700 disabled:bg-pink-300"
      >
        Check Cell
      </button>
      <button
        disabled={isUndoDisabled}
        onClick={() => undo()}
        className="rounded bg-pink-500 px-4 py-2 font-bold text-white hover:bg-pink-700 disabled:bg-pink-300"
      >
        Undo
      </button>
      <button
        disabled={isRedoDisabled}
        onClick={() => redo()}
        className="rounded bg-pink-500 px-4 py-2 font-bold text-white hover:bg-pink-700 disabled:bg-pink-300"
      >
        Redo
      </button>
    </div>
  );
};

export default SudokuControls;
