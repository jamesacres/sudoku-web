'use client';
import React, { useEffect } from 'react';
import { App, URLOpenListenerEvent } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { StatusBar } from '@capacitor/status-bar';
import { usePathname, useRouter } from 'next/navigation';
import { Browser } from '@capacitor/browser';

interface CapacitorContextInterface {}

export const CapacitorContext = React.createContext<
  CapacitorContextInterface | undefined
>(undefined);

const CapacitorProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let isActive = true;
    App.removeAllListeners().then(() => {
      App.addListener('appUrlOpen', (event: URLOpenListenerEvent) => {
        if (isActive) {
          if (event.url) {
            // For auth and other links
            // Note this is also used for the iOS/Android auth redirect with custom url schemes
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
        }
      });

      App.addListener('backButton', () => {
        if (isActive) {
          if (pathname === '/') {
            App.minimizeApp();
          } else {
            router.back();
          }
        }
      });
    });
    return () => {
      isActive = false;
    };
  }, [router, pathname]);

  return (
    <CapacitorContext.Provider value={{}}>{children}</CapacitorContext.Provider>
  );
};

export default CapacitorProvider;
