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
        className={`${isLoggingIn ? 'cursor-wait' : ''} mr-4 mt-0 inline-block rounded bg-neutral-500 px-4 py-2 text-white hover:bg-neutral-700 disabled:bg-neutral-300`}
      >
        Sign in
      </button>
    )
  );
};

export default HeaderUser;
