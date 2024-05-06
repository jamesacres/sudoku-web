'use client';

import React from 'react';
import { UserContext } from '../UserProvider';
import Image from 'next/image';

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
        <Image
          src={user.picture}
          alt={user.name || 'user'}
          width={32}
          height={32}
          className="mr-2 cursor-pointer rounded-full ring-white hover:ring-1"
        />
      ) : (
        <></>
      )}
    </pre>
  ) : (
    <button
      disabled={isLoggingIn}
      onClick={() => login()}
      className={`${isLoggingIn ? 'cursor-wait' : ''} mr-4 mt-0 inline-block rounded border border-white px-4 py-2 text-sm leading-none text-white hover:border-transparent hover:bg-white hover:text-blue-500`}
    >
      Sign in
    </button>
  );
};

export default HeaderUser;
