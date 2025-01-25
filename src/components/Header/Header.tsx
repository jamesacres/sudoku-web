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
      <nav className="pt-safe fixed top-0 left-0 z-50 flex w-screen flex-wrap items-center justify-between bg-zinc-200 px-6 pb-2 drop-shadow-md dark:bg-zinc-700">
        <div className="mr-6 flex shrink-0 items-center dark:text-white">
          <HeaderBack />
        </div>
        <div className="block flex grow items-center">
          <div className="grow"></div>
          <div className="flex h-10 items-center">
            <HeaderUser />
            <ThemeSwitch />
            <HeaderOnline />
          </div>
        </div>
      </nav>
      <div className="mt-30">
        <HeaderUserHintBox />
      </div>
    </>
  );
};

export default Header;
