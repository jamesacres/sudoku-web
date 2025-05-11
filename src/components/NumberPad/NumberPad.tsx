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
          className={`enabled:hover:bg-theme-primary-lighter dark:enabled:hover:bg-theme-primary-dark flex h-full w-full cursor-pointer items-center justify-center rounded-sm px-4 py-2 text-2xl text-black enabled:hover:text-white disabled:cursor-not-allowed disabled:opacity-50 dark:text-white`}
          key={crypto.randomUUID()}
        >
          {value}
        </button>
      );
    })}
  </div>
);
