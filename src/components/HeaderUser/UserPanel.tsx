import { UserProfile } from '@/types/userProfile';
import { UserAvatar } from './UserAvatar';

export const UserPanel = ({
  user,
  logout,
}: {
  user: UserProfile;
  logout: () => void;
}) => (
  <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black/5">
    <div className="bg-gray-50 p-4">
      <div className="flow-root rounded-md px-2 py-2">
        <div className="float-left mr-4">
          <UserAvatar user={user} size={64} />
        </div>
        <span className="flex items-center">
          <span className="text-sm font-medium text-gray-900">{user.name}</span>
        </span>
        <span className="block text-sm text-gray-500">Sudoku Pro</span>
      </div>
    </div>
    <div className="bg-gray-200 p-4">
      <button
        onClick={() => logout()}
        className="rounded bg-gray-200 px-4 py-2 text-gray-600 outline outline-1 outline-gray-400 hover:bg-gray-300"
      >
        Sign out
      </button>
    </div>
  </div>
);
