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
            className="mr-4 mt-0 mt-4 block inline-block text-teal-200 hover:text-white"
          >
            Puzzles
          </a>
        </div>
        <ThemeSwitch />
        <div>
          <a
            href="https://auth.bubblyclouds.com/oidc/auth?state=3-aF1UZtvFL7iLG-dkFCmcqE.fZ0FAmpvfZB36BUx3d&redirect_uri=http://localhost:3000/cb&client_id=bubbly-sudoku&response_type=code&scope=openid profile&code_challenge=ZqoAqOr3wIoURrtuxBmgcb5svVDDPaaQzEMzkHwT2Uo&code_challenge_method=S256&resource=https://bubbly-sudoku.com"
            className="mt-4 inline-block rounded border border-white px-4 py-2 text-sm leading-none text-white hover:border-transparent hover:bg-white hover:text-teal-500 lg:mt-0"
          >
            Sign in
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Header;
