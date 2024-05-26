import { Notes } from '@/types/notes';
import { SelectNumber } from '@/types/selectNumber';

const SudokuInputNotes = ({
  isSelected,
  notes,
  selectNumber,
}: {
  isSelected: boolean;
  notes: Notes;
  selectNumber: SelectNumber;
}) => {
  return (
    <div className={`grid h-full w-full grid-cols-3 grid-rows-3`}>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((value) => {
        const isChecked = notes[value];
        const colorClass = isChecked
          ? 'dark:text-white text-black'
          : 'text-slate-400';
        const boldClass = isChecked ? 'font-bold' : undefined;
        return isSelected || isChecked ? (
          <div
            onClick={() => selectNumber(value)}
            className={`flex h-full w-full items-center justify-center text-xs md:text-sm ${colorClass} ${boldClass}`}
            key={crypto.randomUUID()}
          >
            {value}
          </div>
        ) : (
          <div key={crypto.randomUUID()}></div>
        );
      })}
    </div>
  );
};

export default SudokuInputNotes;
