'use client';

import UserProvider from '@/components/UserProvider';
import { ThemeProvider } from 'next-themes';
import { PropsWithChildren } from 'react';

export function Providers({ children }: PropsWithChildren) {
  return (
    <UserProvider>
      <ThemeProvider attribute="class">{children}</ThemeProvider>
    </UserProvider>
  );
}
