const SudokuControls = ({
  isValidateCellDisabled,
  validateGrid,
  validateCell,
}: {
  isValidateCellDisabled: boolean;
  validateGrid: () => void;
  validateCell: () => void;
}) => {
  return (
    <div className="mt-4 border-t-2 border-t-pink-500 pt-4">
      <button
        onClick={() => validateGrid()}
        className="rounded bg-pink-500 px-4 py-2 font-bold text-white hover:bg-pink-700"
      >
        Check Grid
      </button>
      <button
        disabled={isValidateCellDisabled}
        onClick={() => validateCell()}
        className="ml-4 rounded bg-pink-500 px-4 py-2 font-bold text-white hover:bg-pink-700 disabled:bg-pink-300"
      >
        Check Cell
      </button>
    </div>
  );
};

export default SudokuControls;
