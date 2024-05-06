import { UserProfile } from '@/types/userProfile';
import { Popover, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { UserPanel } from './UserPanel';
import { UserAvatar } from './UserAvatar';

export const UserButton = ({
  user,
  logout,
}: {
  user: UserProfile;
  logout: () => void;
}) => {
  return (
    <Popover className="relative" style={{ height: 32 }}>
      <Popover.Button className="mr-2 cursor-pointer rounded-full ring-white hover:ring-1">
        <UserAvatar user={user} size={32} />
      </Popover.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1"
      >
        <Popover.Panel className="absolute -right-10 z-10 mt-3 w-screen max-w-xs transform px-4">
          <UserPanel user={user} logout={logout} />
        </Popover.Panel>
      </Transition>
    </Popover>
  );
};
