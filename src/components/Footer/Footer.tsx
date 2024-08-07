const Footer = () => {
  return (
    <nav className="pb-safe container m-auto mt-3 flex flex-wrap items-center justify-between p-6 text-sm text-black dark:text-white">
      <div className="mr-6 flex flex-shrink-0 items-center">
        <span className="tracking-tight">
          Powered by{' '}
          <a
            href="https://bubblyclouds.com/"
            target="_blank"
            className="hover:underline"
          >
            Bubbly Clouds
          </a>
        </span>
      </div>
      <div className="block flex flex-grow items-center">
        <div className="flex-grow"></div>
        <a
          href="https://bubblyclouds.com/privacy"
          target="_blank"
          className="mr-2 hover:underline"
        >
          Privacy
        </a>
        <a
          href="https://bubblyclouds.com/terms"
          target="_blank"
          className="hover:underline"
        >
          Terms
        </a>
      </div>
    </nav>
  );
};

export default Footer;
