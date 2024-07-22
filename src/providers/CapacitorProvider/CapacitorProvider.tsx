'use client';
import React, { useEffect } from 'react';
import { App, URLOpenListenerEvent } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { StatusBar } from '@capacitor/status-bar';
import { useRouter } from 'next/navigation';

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
        const url = new URL(event.url);
        url.protocol = window.location.protocol;
        url.host = window.location.host;
        url.port = window.location.port;
        router.push(url.toString());
      }
    });
  }, [router]);

  return (
    <CapacitorContext.Provider value={{}}>{children}</CapacitorContext.Provider>
  );
};

export default CapacitorProvider;
