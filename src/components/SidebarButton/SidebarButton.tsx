import { memo, MouseEventHandler } from 'react';
import { Sidebar } from 'react-feather';

const MemoisedSidebarButton = memo(function MemoisedSidebarButton({
  friendsOnClick,
}: {
  friendsOnClick: MouseEventHandler<T>;
}) {
  return (
    <button
      onClick={friendsOnClick}
      className="text-theme-primary dark:text-theme-primary-light cursor-pointer rounded-lg"
    >
      <Sidebar className="float-left mr-2" />
      Friends
    </button>
  );
});

export default MemoisedSidebarButton;
