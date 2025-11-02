import { ReactNode } from 'react';
import dynamic from 'next/dynamic';
const HeaderBack = dynamic(() => import('../HeaderBack'), { ssr: false });

import ThemeControls from '../ThemeControls';

interface HeaderProps {
  leftContent?: ReactNode;
  rightContent?: ReactNode;
  centerContent?: ReactNode;
  showThemeControls?: boolean;
}

const Header = ({
  leftContent,
  rightContent,
  centerContent,
  showThemeControls = true,
}: HeaderProps) => {
  return (
    <>
      <nav className="fixed top-0 left-0 z-50 flex w-screen flex-wrap items-center justify-between border-b border-stone-200 bg-stone-50 px-4 pt-[var(--ion-safe-area-top)] pb-1 dark:border-zinc-600 dark:bg-zinc-900">
        <div className="text-theme-primary dark:text-theme-primary-light mr-4 flex shrink-0 items-center">
          {leftContent || <HeaderBack />}
        </div>
        <div className="block flex grow items-center">
          <div className="grow text-center font-medium">{centerContent}</div>
          <div className="flex h-12 items-center">
            {rightContent || (
              <>
                {showThemeControls && <ThemeControls />}
              </>
            )}
          </div>
        </div>
      </nav>
      <div className="pt-[calc(var(--ion-safe-area-top)+3.25rem)]"></div>
    </>
  );
};

export default Header;
