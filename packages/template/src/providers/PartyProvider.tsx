'use client';
import React, { createContext, ReactNode } from 'react';

// PartyProvider - implementation will be completed in future user stories
export const PartyContext = createContext<any>(undefined);

export const PartyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <PartyContext.Provider value={undefined}>{children}</PartyContext.Provider>;
};
