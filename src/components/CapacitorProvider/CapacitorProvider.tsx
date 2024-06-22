'use client';
import React from 'react';
import { Capacitor } from '@capacitor/core';
import { StatusBar } from '@capacitor/status-bar';

interface CapacitorContextInterface {}

export const CapacitorContext = React.createContext<
  CapacitorContextInterface | undefined
>(undefined);

const CapacitorProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  if (Capacitor.getPlatform() === 'android') {
    setTimeout(() => {
      StatusBar.setOverlaysWebView({ overlay: false });
      StatusBar.setBackgroundColor({ color: '#000000' });
    }, 100);
  }
  return (
    <CapacitorContext.Provider value={{}}>{children}</CapacitorContext.Provider>
  );
};

export default CapacitorProvider;
