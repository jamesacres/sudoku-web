'use client';
import React, { useEffect } from 'react';
import { App, URLOpenListenerEvent } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { StatusBar } from '@capacitor/status-bar';
import { useRouter } from 'next/navigation';
import { Browser } from '@capacitor/browser';

interface CapacitorContextInterface {}

export const CapacitorContext = React.createContext<
  CapacitorContextInterface | undefined
>(undefined);

const CapacitorProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const router = useRouter();

  if (Capacitor.getPlatform() === 'android') {
    setTimeout(() => {
      StatusBar.setOverlaysWebView({ overlay: false });
      StatusBar.setBackgroundColor({ color: '#000000' });
    }, 100);
  }

  useEffect(() => {
    App.addListener('appUrlOpen', (event: URLOpenListenerEvent) => {
      if (event.url) {
        // For auth and other links
        // Note this is also used for the iOS auth redirect with custom url schemes
        // com.bubblyclouds.sudoku://-/auth
        // capacitor://localhost/auth
        // In addition to https://sudoku.bubblyclouds.com/auth
        const url = new URL(event.url);
        url.protocol = window.location.protocol;
        url.host = window.location.host;
        url.port = window.location.port;
        router.push(url.toString());
        // Close browser if open, e.g. on auth page
        Browser.close();
      }
    });
  }, [router]);

  return (
    <CapacitorContext.Provider value={{}}>{children}</CapacitorContext.Provider>
  );
};

export default CapacitorProvider;
