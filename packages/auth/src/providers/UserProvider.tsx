'use client';
import FetchProvider from './FetchProvider';
import AuthProvider from './AuthProvider';
import React from 'react';

/**
 * UserProvider - Unified auth provider wrapping both FetchProvider and AuthProvider
 *
 * This provider combines fetch state management and authentication logic.
 * Place it near the root of your app, after other data providers but before components.
 */
const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <FetchProvider>
      <AuthProvider>{children}</AuthProvider>
    </FetchProvider>
  );
};

export default UserProvider;
