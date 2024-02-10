import { Puzzle } from '@/data/puzzles/puzzles';
import SudokuBox from '../SudokuBox';

const Sudoku = ({ puzzle }: { puzzle: Puzzle }) => {
  return (
    <div className="container mx-auto max-w-screen-md">
      <div className="grid grid-cols-3">
        {Array.from(Array(3)).map(() => (
          <div key={crypto.randomUUID()}>
            {Array.from(Array(3)).map(() => (
              <SudokuBox key={crypto.randomUUID()} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sudoku;
