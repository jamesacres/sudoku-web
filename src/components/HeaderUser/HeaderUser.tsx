'use client';

import React from 'react';
import { UserContext } from '../../providers/UserProvider';
import { UserButton } from './UserButton';
import { useOnline } from '@/hooks/online';

const HeaderUser = () => {
  const { isLoggingIn, loginRedirect, logout, user } =
    React.useContext(UserContext) || {};
  const { isOnline } = useOnline();

  const login = () => {
    if (loginRedirect) {
      loginRedirect();
    }
  };
  return user && logout ? (
    <UserButton user={user} logout={logout} />
  ) : (
    isOnline && (
      <button
        disabled={isLoggingIn}
        onClick={() => login()}
        className={`${isLoggingIn ? 'cursor-wait' : ''} mr-4 mt-0 inline-block rounded border border-white px-4 py-2 text-sm leading-none text-white hover:border-transparent hover:bg-white hover:text-blue-500`}
      >
        Sign in
      </button>
    )
  );
};

export default HeaderUser;
