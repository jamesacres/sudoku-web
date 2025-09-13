'use client';
import { UserContext } from '@/providers/UserProvider';
import { useContext, useEffect } from 'react';

export default function Home() {
  const { isInitialised, handleAuthUrl } = useContext(UserContext) || {};

  useEffect(() => {
    if (isInitialised && handleAuthUrl) {
      // exchange code for tokens
      handleAuthUrl();
    } else {
      console.info(
        `auth skipping due to isInitialised ${isInitialised} handleAuthUrl ${handleAuthUrl}`
      );
    }
  }, [isInitialised, handleAuthUrl]);
  return <main />;
}
