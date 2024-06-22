'use client';

import CapacitorProvider from '@/components/CapacitorProvider';
import UserProvider from '@/components/UserProvider';
import { ThemeProvider } from 'next-themes';
import { PropsWithChildren } from 'react';

export function Providers({ children }: PropsWithChildren) {
  return (
    <CapacitorProvider>
      <UserProvider>
        <ThemeProvider attribute="class">{children}</ThemeProvider>
      </UserProvider>
    </CapacitorProvider>
  );
}
