import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import React from 'react';
import { Providers } from './providers';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { StatusBar } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

if (Capacitor.getPlatform() === 'android') {
  setTimeout(() => {
    StatusBar.setOverlaysWebView({ overlay: true });
    StatusBar.setBackgroundColor({ color: '#00000000' });
  }, 100);
}

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Sudoku',
  description: 'Play Sudoku',
};

export const viewport: Viewport = {
  viewportFit: 'cover',
  width: 'device-device-width',
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
      <body className={inter.className}>
        <Providers>
          <Header />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
