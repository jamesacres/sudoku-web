export const NumberPad = ({
  selectNumber,
  isInputDisabled,
}: {
  // eslint-disable-next-line no-unused-vars
  selectNumber: (number: number) => void;
  isInputDisabled: boolean;
}) => (
  <div
    className={`mb-0 grid h-full w-full grid-cols-9 lg:grid-cols-3 lg:grid-rows-3`}
  >
    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((value) => {
      return (
        <button
          disabled={isInputDisabled}
          onClick={() => {
            selectNumber(value);
          }}
          className={`flex h-full w-full items-center justify-center rounded px-4 py-2 text-2xl text-black enabled:hover:bg-neutral-300 disabled:opacity-50 dark:text-white enabled:dark:hover:bg-neutral-500`}
          key={crypto.randomUUID()}
        >
          {value}
        </button>
      );
    })}
  </div>
);
