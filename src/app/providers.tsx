'use client';

import FetchProvider from '@/providers/FetchProvider';
import CapacitorProvider from '@/providers/CapacitorProvider';
import UserProvider from '@/providers/UserProvider';
import { ThemeProvider } from 'next-themes';
import { PropsWithChildren } from 'react';
import GlobalStateProvider from '@/providers/GlobalStateProvider';
import { ThemeColorProvider } from '@/providers/ThemeColorProvider';

export function Providers({ children }: PropsWithChildren) {
  return (
    <GlobalStateProvider>
      <FetchProvider>
        <CapacitorProvider>
          <UserProvider>
            <ThemeProvider attribute="class">
              <ThemeColorProvider>{children}</ThemeColorProvider>
            </ThemeProvider>
          </UserProvider>
        </CapacitorProvider>
      </FetchProvider>
    </GlobalStateProvider>
  );
}
