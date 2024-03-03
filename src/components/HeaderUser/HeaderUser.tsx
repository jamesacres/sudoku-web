'use client';

import React from 'react';

const HeaderUser = () => {
  const [isLoggingIn, setIsLoggingIn] = React.useState(false);
  const login = () => {
    setIsLoggingIn(true);
    window.location.href =
      'https://auth.bubblyclouds.com/oidc/auth?state=3-aF1UZtvFL7iLG-dkFCmcqE.fZ0FAmpvfZB36BUx3d&redirect_uri=http://localhost:3000/cb&client_id=bubbly-sudoku&response_type=code&scope=openid profile&code_challenge=ZqoAqOr3wIoURrtuxBmgcb5svVDDPaaQzEMzkHwT2Uo&code_challenge_method=S256&resource=https://bubbly-sudoku.com';
  };
  return (
    <button
      disabled={isLoggingIn}
      onClick={() => login()}
      className={`${isLoggingIn ? 'cursor-wait' : ''} mr-4 mt-0 inline-block rounded border border-white px-4 py-2 text-sm leading-none text-white hover:border-transparent hover:bg-white hover:text-teal-500`}
    >
      Sign in
    </button>
  );
};

export default HeaderUser;
