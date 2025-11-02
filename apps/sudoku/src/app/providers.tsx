'use client';

import { FetchProvider, CapacitorProvider, UserProvider, GlobalStateProvider, ThemeColorProvider, RevenueCatProvider } from '@sudoku-web/template';
import PartiesProvider from '@/providers/PartiesProvider';
import { BookProvider } from '@/providers/BookProvider/BookProvider';
import { SessionsProvider } from '@/providers/SessionsProvider/SessionsProvider';
import { ThemeProvider } from 'next-themes';
import { PropsWithChildren } from 'react';

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
