import dynamic from 'next/dynamic';
import { HeaderUserDependencies } from '@sudoku-web/auth/components/HeaderUser';

const HeaderUser = dynamic(
  () => import('@sudoku-web/auth/components/HeaderUser'),
  { ssr: false }
);
const HeaderBack = dynamic(() => import('./HeaderBack'), { ssr: false });
const HeaderOnline = dynamic(() => import('./HeaderOnline'), { ssr: false });

import ThemeControls from './ThemeControls';

interface HeaderProps extends HeaderUserDependencies {
  isOnline?: boolean;
  isCapacitor?: () => boolean;
}

const Header = ({
  isSubscribed,
  showSubscribeModal,
  deleteAccount,
  isOnline,
  isCapacitor,
}: HeaderProps) => {
  return (
    <>
      <nav className="fixed top-0 left-0 z-50 flex w-screen flex-wrap items-center justify-between border-b border-stone-200 bg-stone-50 px-4 pt-[var(--ion-safe-area-top)] pb-1 dark:border-zinc-600 dark:bg-zinc-900">
        <div className="text-theme-primary dark:text-theme-primary-light mr-4 flex shrink-0 items-center">
          <HeaderBack />
        </div>
        <div className="block flex grow items-center">
          <div className="grow text-center font-medium"></div>
          <div className="flex h-12 items-center">
            <HeaderUser
              isSubscribed={isSubscribed}
              showSubscribeModal={showSubscribeModal}
              deleteAccount={deleteAccount}
            />
            <ThemeControls isCapacitor={isCapacitor} />
            <HeaderOnline isOnline={isOnline} />
          </div>
        </div>
      </nav>
      <div className="pt-[calc(var(--ion-safe-area-top)+3.25rem)]"></div>
    </>
  );
};

export default Header;
