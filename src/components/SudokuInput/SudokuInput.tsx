const SudokuInput = ({ value }: { value?: number }) => {
  return (
    <div className="flex h-full w-full items-center justify-center border text-center text-3xl text-black dark:text-white">
      {value}
    </div>
  );
};

export default SudokuInput;
