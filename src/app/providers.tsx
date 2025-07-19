'use client';

import FetchProvider from '@/providers/FetchProvider';
import CapacitorProvider from '@/providers/CapacitorProvider';
import UserProvider from '@/providers/UserProvider';
import PartiesProvider from '@/providers/PartiesProvider';
import { ThemeProvider } from 'next-themes';
import { PropsWithChildren } from 'react';
import GlobalStateProvider from '@/providers/GlobalStateProvider';
import { ThemeColorProvider } from '@/providers/ThemeColorProvider';
import RevenueCatProvider from '@/providers/RevenueCatProvider';
import { SudokuPlusModalProvider } from '@/providers/SudokuPlusModalProvider';

export function Providers({ children }: PropsWithChildren) {
  return (
    <GlobalStateProvider>
      <FetchProvider>
        <CapacitorProvider>
          <UserProvider>
            <RevenueCatProvider>
              <PartiesProvider>
                <ThemeProvider attribute="class">
                  <ThemeColorProvider>
                    <SudokuPlusModalProvider>
                      {children}
                    </SudokuPlusModalProvider>
                  </ThemeColorProvider>
                </ThemeProvider>
              </PartiesProvider>
            </RevenueCatProvider>
          </UserProvider>
        </CapacitorProvider>
      </FetchProvider>
    </GlobalStateProvider>
  );
}
