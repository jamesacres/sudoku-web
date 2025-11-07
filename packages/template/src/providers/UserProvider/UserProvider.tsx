'use client';
import { FetchProvider, AuthProvider } from '@sudoku-web/auth';
import React from 'react';

// Re-export for backward compatibility
export { UserContext } from '@sudoku-web/auth';
export type { UserContextInterface } from '@sudoku-web/auth';

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
      <AuthProvider>
        {children}
      </AuthProvider>
    </FetchProvider>
  );
};

export default UserProvider;
