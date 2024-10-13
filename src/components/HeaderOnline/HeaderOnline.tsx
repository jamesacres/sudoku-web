'use client';

import { useOnline } from '@/hooks/online';
import React from 'react';
import { Wifi, WifiOff } from 'react-feather';

const HeaderOnline = () => {
  const { isOnline, forceOffline } = useOnline();

  return (
    <button
      onClick={() => {
        forceOffline(isOnline);
      }}
      className="ml-2 h-8 w-8 cursor-pointer rounded-full ring-white hover:ring-1"
    >
      {isOnline ? (
        <Wifi height={32} className="m-auto" />
      ) : (
        <WifiOff height={32} className="m-auto" />
      )}
    </button>
  );
};

export default HeaderOnline;
