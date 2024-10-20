import { Children, ReactNode } from 'react';

const Footer = ({ children }: { children: ReactNode }) => {
  return (
    <nav className="fixed bottom-0 left-0 m-auto mt-3 h-20 w-screen items-center justify-between bg-zinc-200 px-6 text-sm text-black dark:bg-zinc-700 dark:text-white">
      <div
        className={`mx-auto grid h-full max-w-lg grid-cols-${Children.count(children)} font-medium`}
      >
        {children}
      </div>
    </nav>
  );
};

export default Footer;
