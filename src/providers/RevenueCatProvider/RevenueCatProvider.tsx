'use client';
import React, { useContext, useEffect } from 'react';
import { isAndroid, isCapacitor, isIOS } from '@/helpers/capacitor';
import { isElectron } from '@/helpers/electron';
import {
  LOG_LEVEL as CAPACITOR_LOG_LEVEL,
  Purchases as CapacitorPurchases,
} from '@revenuecat/purchases-capacitor';
import {
  Purchases as WebPurchases,
  LogLevel as WebLogLevel,
} from '@revenuecat/purchases-js';
import { UserContext } from '../UserProvider';

interface RevenueCatContextInterface {}

export const RevenueCatContext = React.createContext<
  RevenueCatContextInterface | undefined
>(undefined);

const RevenueCatProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useContext(UserContext) || {};

  useEffect(() => {
    if (user) {
      if (isCapacitor()) {
        // iOS and Android
        (async function () {
          await CapacitorPurchases.setLogLevel({
            level: CAPACITOR_LOG_LEVEL.DEBUG,
          });
          if (isIOS()) {
            await CapacitorPurchases.configure({
              appUserID: user.sub,
              apiKey: 'appl_cSnwNkaTjlVONbHuKzVNTRjQsbT',
            });
          } else if (isAndroid()) {
            await CapacitorPurchases.configure({
              appUserID: user.sub,
              apiKey: 'goog_NrLMlLbrRvQVKxXifUHmJBkSOXr',
            });
          }
        })();
      } else if (isElectron()) {
        // Do nothing
      } else {
        // Web
        (async function () {
          WebPurchases.setLogLevel(WebLogLevel.Debug);
          WebPurchases.configure({
            appUserId: user.sub,
            apiKey: 'rcb_ZoFwJlmCeBHaoVZNPhCiUqLXRAhf',
          });
        })();
      }
    }
  }, [user]);

  return (
    <RevenueCatContext.Provider value={{}}>
      {children}
    </RevenueCatContext.Provider>
  );
};

export default RevenueCatProvider;
