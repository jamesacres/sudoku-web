import SudokuInput from '../SudokuInput';

const SudokuBox = () => {
  return (
    <div className="grid aspect-square grid-cols-3 grid-rows-3 border">
      {Array.from(Array(3)).map(() => (
        <div key={crypto.randomUUID()}>
          {Array.from(Array(3)).map((_, i) => (
            <SudokuInput key={crypto.randomUUID()} value={i} />
          ))}
        </div>
      ))}
    </div>
  );
};

export default SudokuBox;
