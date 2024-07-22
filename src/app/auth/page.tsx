'use client';
import { UserContext } from '@/providers/UserProvider';
import { useContext, useEffect } from 'react';

export default function Home() {
  const { isInitialised, handleAuthUrl } = useContext(UserContext) || {};

  useEffect(() => {
    if (isInitialised && handleAuthUrl) {
      // exchange code for tokens
      handleAuthUrl();
    }
  }, [isInitialised, handleAuthUrl]);
  return <main />;
}
