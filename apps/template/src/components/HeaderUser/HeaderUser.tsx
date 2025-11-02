'use client';

import React from 'react';
import { UserContext } from '../../providers/UserProvider';
import { UserButton } from './UserButton';
import { useOnline } from '../../hooks/online';

const HeaderUser = () => {
  const { isLoggingIn, loginRedirect, logout, user } =
    React.useContext(UserContext) || {};
  const { isOnline } = useOnline();

  return user && logout ? (
    <UserButton user={user} logout={logout} />
  ) : (
    isOnline && (
      <button
        disabled={isLoggingIn}
        onClick={() => loginRedirect && loginRedirect({ userInitiated: true })}
        className={`${isLoggingIn ? 'cursor-wait' : ''} bg-theme-primary disabled:bg-theme-primary-lighter mx-1 inline-block rounded-full px-4 py-1.5 text-sm font-medium text-white transition-opacity active:opacity-70`}
      >
        Sign in
      </button>
    )
  );
};

export default HeaderUser;
