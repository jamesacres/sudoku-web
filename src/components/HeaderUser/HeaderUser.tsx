'use client';

import React from 'react';
import { UserContext } from '../UserProvider';

const HeaderUser = () => {
  const { isLoggingIn, loginRedirect, user } =
    React.useContext(UserContext) || {};

  const login = () => {
    if (loginRedirect) {
      loginRedirect();
    }
  };
  return user ? (
    <pre>
      {user.picture ? (
        <img
          src={user.picture}
          alt={user.name || 'user'}
          width={25}
          height={25}
        />
      ) : (
        <></>
      )}
    </pre>
  ) : (
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
