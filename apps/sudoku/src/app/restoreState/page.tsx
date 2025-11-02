'use client';
import { UserContext } from '@sudoku-web/template';
import { useContext, useEffect } from 'react';

export default function Home() {
  const { isInitialised, handleRestoreState } = useContext(UserContext) || {};

  useEffect(() => {
    if ('electronAPI' in window && isInitialised && handleRestoreState) {
      // restore state
      handleRestoreState();
    }
  }, [isInitialised, handleRestoreState]);
  return <main />;
}
