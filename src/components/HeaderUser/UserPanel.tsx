import { UserProfile } from '@/types/userProfile';
import { UserAvatar } from './UserAvatar';

export const UserPanel = ({
  user,
  logout,
}: {
  user: UserProfile;
  logout: () => void;
}) => (
  <div className="overflow-hidden rounded-lg ring-1 shadow-lg ring-black/5">
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
      <div className="block flex grow items-center text-gray-600">
        <button
          onClick={() => logout()}
          className="rounded-sm bg-gray-200 px-4 py-2 outline outline-1 outline-gray-400 hover:bg-gray-300"
        >
          Sign out
        </button>
        <div className="grow"></div>
        <a
          href="https://bubblyclouds.com/privacy"
          target="_blank"
          className="mr-2 hover:underline"
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
);
