import dynamic from 'next/dynamic';
const HeaderUser = dynamic(() => import('../HeaderUser'), { ssr: false });
const HeaderBack = dynamic(() => import('../HeaderBack'), { ssr: false });
const HeaderOnline = dynamic(() => import('../HeaderOnline'), { ssr: false });
const HeaderUserHintBox = dynamic(() => import('../HeaderUserHintBox'), {
  ssr: false,
});

import ThemeSwitch from '../ThemeSwitch';

const Header = () => {
  return (
    <>
      <nav className="fixed top-0 left-0 z-50 flex w-screen flex-wrap items-center justify-between border-b border-zinc-200 bg-white px-4 pt-[env(safe-area-inset-top)] pb-2 dark:border-zinc-600 dark:bg-zinc-900">
        <div className="mr-4 flex shrink-0 items-center text-blue-600 dark:text-blue-400">
          <HeaderBack />
        </div>
        <div className="block flex grow items-center">
          <div className="grow text-center font-medium">
            <span className="text-lg">Sudoku</span>
          </div>
          <div className="flex h-12 items-center space-x-2">
            <HeaderUser />
            <ThemeSwitch />
            <HeaderOnline />
          </div>
        </div>
      </nav>
      <div className="pt-[calc(env(safe-area-inset-top)+3rem)]">
        <HeaderUserHintBox />
      </div>
    </>
  );
};

export default Header;
