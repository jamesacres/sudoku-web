'use client';
import { UserProfile } from '@/types/userProfile';
import React, { Dispatch, SetStateAction, useState } from 'react';

export interface State {
  accessToken: string | null;
  accessExpiry: Date | null;
  refreshToken: string | null;
  refreshExpiry: Date | null;
  user: UserProfile | null;
  userExpiry: Date | null;
}

export const FetchContext = React.createContext<
  [State, Dispatch<SetStateAction<State>>] | undefined
>(undefined);

const FetchProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const value = useState<State>({
    accessToken: null,
    accessExpiry: null,
    refreshToken: null,
    refreshExpiry: null,
    user: null,
    userExpiry: null,
  });
  return (
    <FetchContext.Provider value={value}>{children}</FetchContext.Provider>
  );
};

export default FetchProvider;
