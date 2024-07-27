'use client';

import FetchProvider from '@/providers/FetchProvider';
import CapacitorProvider from '@/providers/CapacitorProvider';
import UserProvider from '@/providers/UserProvider';
import { ThemeProvider } from 'next-themes';
import { PropsWithChildren } from 'react';

export function Providers({ children }: PropsWithChildren) {
  return (
    <FetchProvider>
      <CapacitorProvider>
        <UserProvider>
          <ThemeProvider attribute="class">{children}</ThemeProvider>
        </UserProvider>
      </CapacitorProvider>
    </FetchProvider>
  );
}
