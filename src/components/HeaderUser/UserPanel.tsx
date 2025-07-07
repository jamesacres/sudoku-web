import { UserProfile } from '@/types/userProfile';
import { useState } from 'react';
import { UserAvatar } from './UserAvatar';
import { useServerStorage } from '@/hooks/serverStorage';
import { DeleteAccountDialog } from './DeleteAccountDialog';

export const UserPanel = ({
  user,
  logout,
}: {
  user: UserProfile;
  logout: () => void;
}) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { deleteAccount } = useServerStorage();

  const handleDeleteAccount = async () => {
    const success = await deleteAccount();
    if (success) {
      logout();
    } else {
      alert('Failed to delete account. Please try again later.');
    }
  };

  return (
    <>
      <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black/5">
        <div className="bg-gray-50 p-4">
          <div className="flow-root rounded-md px-2 py-2">
            <div className="float-left mr-4">
              <UserAvatar user={user} size={64} />
            </div>
            <span className="flex items-center">
              <span className="text-sm font-medium text-gray-900">
                {user.name}
              </span>
            </span>
            <span className="block text-sm text-gray-500">Sudoku Pro</span>
          </div>
        </div>
        <div className="bg-gray-200 p-4">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between text-gray-600">
              <div>
                <button
                  onClick={() => logout()}
                  className="rounded-sm bg-gray-200 px-4 py-2 outline outline-1 outline-gray-400 hover:bg-gray-300"
                >
                  Sign out
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <a
                  href="https://bubblyclouds.com/privacy"
                  target="_blank"
                  className="hover:underline"
                >
                  Privacy
                </a>
                <a
                  href="https://bubblyclouds.com/terms"
                  target="_blank"
                  className="hover:underline"
                >
                  Terms
                </a>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-gray-300 pt-3">
              <button
                onClick={() => setIsDeleteDialogOpen(true)}
                className="text-sm text-red-600 hover:text-red-800 hover:underline"
              >
                Delete account
              </button>
            </div>
          </div>
        </div>
        <div className="m-auto flex flex-wrap items-center justify-between bg-white bg-zinc-700 p-2 text-sm text-white">
          <div className="mr-6 flex shrink-0 items-center">
            <span className="tracking-tight">
              Powered by{' '}
              <a
                href="https://bubblyclouds.com/"
                target="_blank"
                className="hover:underline"
              >
                Bubbly Clouds
              </a>
            </span>
          </div>
        </div>
      </div>

      <DeleteAccountDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteAccount}
      />
    </>
  );
};
