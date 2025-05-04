import { Children, ReactNode } from 'react';

const Footer = ({ children }: { children: ReactNode }) => {
  return (
    <nav className="fixed bottom-0 left-0 m-auto mt-3 h-20 w-screen items-center justify-between border-t border-zinc-400 bg-zinc-100 px-6 pb-[env(safe-area-inset-bottom)] text-sm text-black dark:border-zinc-500 dark:bg-zinc-800 dark:text-white">
      <div
        className={`mx-auto grid h-full max-w-lg grid-cols-${Children.count(children)} font-medium`}
      >
        {children}
      </div>
    </nav>
  );
};

export default Footer;
