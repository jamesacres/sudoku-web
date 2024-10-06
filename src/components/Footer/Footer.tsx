import Link from 'next/link';

const Footer = () => {
  return (
    <nav className="pb-safe fixed bottom-0 left-0 m-auto mt-3 flex w-screen flex-wrap items-center justify-between bg-zinc-200 px-6 pt-6 text-sm text-black dark:bg-zinc-700 dark:text-white">
      <div className="block flex flex-grow items-center">
        <div className="flex-grow text-sm">
          <Link href="/" className="mr-4 mt-0 block inline-block">
            Puzzles
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Footer;
