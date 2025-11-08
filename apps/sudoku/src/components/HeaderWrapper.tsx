'use client';

import { useContext } from 'react';
import Header from '@sudoku-web/ui/components/Header';
import { RevenueCatContext } from '@sudoku-web/template/providers/RevenueCatProvider';

export default function HeaderWrapper() {
  const { isSubscribed, subscribeModal } = useContext(RevenueCatContext) || {};

  return (
    <Header
      isSubscribed={isSubscribed}
      showSubscribeModal={subscribeModal?.showModalIfRequired}
    />
  );
}
