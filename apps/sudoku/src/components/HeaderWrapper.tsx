'use client';

import { useContext } from 'react';
import Header from '@sudoku-web/ui/components/Header';
import { RevenueCatContext } from '@sudoku-web/template/providers/RevenueCatProvider';
import { useOnline } from '@sudoku-web/template/hooks/online';
import { isCapacitor } from '@sudoku-web/auth/services/capacitor';

export default function HeaderWrapper() {
  const { isSubscribed, subscribeModal } = useContext(RevenueCatContext) || {};
  const { isOnline } = useOnline();

  return (
    <Header
      isSubscribed={isSubscribed}
      showSubscribeModal={subscribeModal?.showModalIfRequired}
      isOnline={isOnline}
      isCapacitor={isCapacitor}
    />
  );
}
