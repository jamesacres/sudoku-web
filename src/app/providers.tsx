'use client';

import FetchProvider from '@/providers/FetchProvider';
import CapacitorProvider from '@/providers/CapacitorProvider';
import UserProvider from '@/providers/UserProvider';
import PartiesProvider from '@/providers/PartiesProvider';
import { BookProvider } from '@/providers/BookProvider/BookProvider';
import { SessionsProvider } from '@/providers/SessionsProvider/SessionsProvider';
import { ThemeProvider } from 'next-themes';
import { PropsWithChildren } from 'react';
import GlobalStateProvider from '@/providers/GlobalStateProvider';
import { ThemeColorProvider } from '@/providers/ThemeColorProvider';
import RevenueCatProvider from '@/providers/RevenueCatProvider';

export function Providers({ children }: PropsWithChildren) {
  return (
    <GlobalStateProvider>
      <FetchProvider>
        <CapacitorProvider>
          <UserProvider>
            <RevenueCatProvider>
              <PartiesProvider>
                <SessionsProvider>
                  <BookProvider>
                    <ThemeProvider attribute="class">
                      <ThemeColorProvider>{children}</ThemeColorProvider>
                    </ThemeProvider>
                  </BookProvider>
                </SessionsProvider>
              </PartiesProvider>
            </RevenueCatProvider>
          </UserProvider>
        </CapacitorProvider>
      </FetchProvider>
    </GlobalStateProvider>
  );
}
