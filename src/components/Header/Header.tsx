import dynamic from 'next/dynamic';
const HeaderUser = dynamic(() => import('../HeaderUser'), { ssr: false });
const HeaderBack = dynamic(() => import('../HeaderBack'), { ssr: false });
const HeaderOnline = dynamic(() => import('../HeaderOnline'), { ssr: false });

import ThemeControls from '../ThemeControls';

const Header = () => {
  return (
    <>
      <nav className="fixed top-0 left-0 z-50 flex w-screen flex-wrap items-center justify-between border-b border-stone-200 bg-stone-50 px-4 pt-[var(--ion-safe-area-top)] pb-1 dark:border-zinc-600 dark:bg-zinc-900">
        <div className="text-theme-primary dark:text-theme-primary-light mr-4 flex shrink-0 items-center">
          <HeaderBack />
        </div>
        <div className="block flex grow items-center">
          <div className="grow text-center font-medium"></div>
          <div className="flex h-12 items-center">
            <HeaderUser />
            <ThemeControls />
            <HeaderOnline />
          </div>
        </div>
      </nav>
      <div className="pt-[calc(var(--ion-safe-area-top)+4rem)]"></div>
    </>
  );
};

export default Header;
