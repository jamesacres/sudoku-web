import dynamic from 'next/dynamic';
const HeaderUser = dynamic(() => import('../HeaderUser'), { ssr: false });
const HeaderBack = dynamic(() => import('../HeaderBack'), { ssr: false });

import ThemeSwitch from '../ThemeSwitch';

const Header = () => {
  return (
    <nav className="pt-safe fixed left-0 top-0 flex w-screen flex-wrap items-center justify-between bg-zinc-100 px-6 pb-2 dark:bg-zinc-800">
      <div className="mr-6 flex flex-shrink-0 items-center dark:text-white">
        <HeaderBack />
      </div>
      <div className="block flex flex-grow items-center">
        <div className="flex-grow"></div>
        <div className="flex h-10 items-center">
          <HeaderUser />
          <ThemeSwitch />
        </div>
      </div>
    </nav>
  );
};

export default Header;
