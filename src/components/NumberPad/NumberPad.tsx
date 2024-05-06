export const NumberPad = ({
  selectNumber,
}: {
  // eslint-disable-next-line no-unused-vars
  selectNumber: (number: number) => void;
}) => (
  <div className={`grid h-full w-full grid-cols-3 grid-rows-3`}>
    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((value) => {
      return (
        <button
          onClick={() => {
            selectNumber(value);
          }}
          className={`flex h-full w-full items-center justify-center rounded  px-4 py-2 text-2xl text-black hover:bg-blue-700 dark:text-white dark:text-white`}
          key={crypto.randomUUID()}
        >
          {value}
        </button>
      );
    })}
  </div>
);
