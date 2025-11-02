import type { Metadata, Viewport } from 'next';
import './globals.css';
import React from 'react';
import { Providers } from './providers';
import {
  Header,
  ErrorBoundary,
  GlobalErrorHandler,
} from '@sudoku-web/template';
import SudokuPlusModal from '@/components/SudokuPlusModal';

export const metadata: Metadata = {
  title: 'Sudoku Race',
  description:
    'Play and share to race sudoku with friends. Daily challenges & cross-device!',
  icons: [
    {
      url: '/icons/icon-48.webp',
      type: 'image/png',
      sizes: '48x48',
    },
    {
      url: '/icons/icon-72.webp',
      type: 'image/png',
      sizes: '72x72',
    },
    {
      url: '/icons/icon-96.webp',
      type: 'image/png',
      sizes: '96x96',
    },
    {
      url: '/icons/icon-128.webp',
      type: 'image/png',
      sizes: '128x128',
    },
    {
      url: '/icons/icon-192.webp',
      type: 'image/png',
      sizes: '192x192',
    },
    {
      url: '/icons/icon-256.webp',
      type: 'image/png',
      sizes: '256x256',
    },
    {
      url: '/icons/icon-512.webp',
      type: 'image/png',
      sizes: '512x512',
    },
  ],
};

export const viewport: Viewport = {
  viewportFit: 'cover',
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body>
        <GlobalErrorHandler />
        <ErrorBoundary>
          <Providers>
            <Header />
            <div className="mb-24">{children}</div>
            <SudokuPlusModal />
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
