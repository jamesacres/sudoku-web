import HeaderUser from '../HeaderUser';
import ThemeSwitch from '../ThemeSwitch';

const Header = () => {
  return (
    <nav className="flex flex-wrap items-center justify-between bg-teal-500 p-6">
      <div className="mr-6 flex flex-shrink-0 items-center text-white">
        <span className="text-xl font-semibold tracking-tight">Sudoku</span>
      </div>
      <div className="block flex w-auto w-full flex-grow items-center">
        <div className="flex-grow text-sm">
          <a
            href="/"
            className="mr-4 mt-0 block inline-block text-teal-200 hover:text-white"
          >
            Puzzles
          </a>
        </div>
        <HeaderUser />
        <ThemeSwitch />
      </div>
    </nav>
  );
};

export default Header;
