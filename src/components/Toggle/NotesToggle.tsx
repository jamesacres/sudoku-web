import { Switch } from '@headlessui/react';

export const Toggle = ({
  isEnabled,
  setEnabled,
}: {
  isEnabled: boolean;
  setEnabled: (_value: boolean) => void;
}) => {
  return (
    <Switch
      data-checked={isEnabled ? isEnabled : undefined}
      checked={isEnabled}
      onChange={setEnabled}
      className="group relative flex h-7 w-12 cursor-pointer rounded-full bg-red-700 p-1 transition-colors duration-200 ease-in-out focus:outline-hidden data-checked:bg-lime-500 data-focus:outline-1 data-focus:outline-white"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none inline-block size-5 translate-x-0 rounded-full bg-white ring-0 shadow-lg transition duration-200 ease-in-out group-data-checked:translate-x-5"
      />
    </Switch>
  );
};
