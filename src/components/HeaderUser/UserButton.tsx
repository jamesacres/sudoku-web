import { UserProfile } from '@/types/userProfile';
import { Popover, Transition, Dialog } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { UserPanel } from './UserPanel';
import { UserAvatar } from './UserAvatar';

export const UserButton = ({
  user,
  logout,
}: {
  user: UserProfile;
  logout: () => void;
}) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Dialog */}
      <Transition appear show={isMobileOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50 sm:hidden"
          onClose={() => setIsMobileOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel>
                  <UserPanel
                    user={user}
                    logout={logout}
                    onClose={() => setIsMobileOpen(false)}
                    isMobile={true}
                  />
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Desktop Popover */}
      <Popover className="relative" style={{ height: 32 }}>
        {({ close }) => (
          <>
            <Popover.Button
              className="focus:outline-none"
              onClick={(e) => {
                // On mobile, use Dialog instead of Popover
                if (window.innerWidth < 640) {
                  e.preventDefault();
                  setIsMobileOpen(true);
                }
              }}
            >
              <div className="h-8 w-8 cursor-pointer rounded-full ring-2 ring-transparent transition-all hover:ring-gray-300 dark:hover:ring-gray-600">
                <UserAvatar user={user} size={32} />
              </div>
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
              <Popover.Panel className="absolute -right-10 z-50 mt-3 hidden transform sm:block">
                <UserPanel
                  user={user}
                  logout={logout}
                  onClose={close}
                  isMobile={false}
                />
              </Popover.Panel>
            </Transition>
          </>
        )}
      </Popover>
    </>
  );
};
