'use client';
import React, { useContext, useEffect, useState } from 'react';
import { isAndroid, isCapacitor, isIOS } from '@/helpers/capacitor';
import { isElectron } from '@/helpers/electron';
import {
  LOG_LEVEL as CAPACITOR_LOG_LEVEL,
  Purchases as CapacitorPurchases,
  PurchasesPackage as CapacitorPackage,
  CustomerInfo as CapacitorCustomerInfo,
} from '@revenuecat/purchases-capacitor';
import {
  Purchases as WebPurchases,
  LogLevel as WebLogLevel,
  Package as WebPackage,
  CustomerInfo as WebCustomerInfo,
} from '@revenuecat/purchases-js';
import { UserContext } from '../UserProvider';

interface RevenueCatContextInterface {
  isLoading: boolean;
  isSubscribed: boolean;
  packages: (WebPackage | CapacitorPackage)[];
  purchasePackage: (pkg: WebPackage | CapacitorPackage) => Promise<void>;
  restorePurchases: () => Promise<void>;
}

export const RevenueCatContext = React.createContext<
  RevenueCatContextInterface | undefined
>(undefined);

const RevenueCatProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useContext(UserContext) || {};
  const [isLoading, setIsLoading] = useState(true);
  const [packages, setPackages] = useState<(WebPackage | CapacitorPackage)[]>(
    []
  );
  const [customerInfo, setCustomerInfo] = useState<
    WebCustomerInfo | CapacitorCustomerInfo | null
  >(null);

  useEffect(() => {
    if (user) {
      try {
        setIsLoading(true);
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
            const offerings = await CapacitorPurchases.getOfferings();
            setPackages(offerings.all['default'].availablePackages);
            const { customerInfo } = await CapacitorPurchases.getCustomerInfo();
            setCustomerInfo(customerInfo);
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
            const offerings =
              await WebPurchases.getSharedInstance().getOfferings();
            setPackages(offerings.all['default'].availablePackages);
            const info =
              await WebPurchases.getSharedInstance().getCustomerInfo();
            setCustomerInfo(info);
          })();
        }
      } catch (error) {
        console.error('Error fetching customer info:', error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [user]);

  const purchasePackage = async (pkg: WebPackage | CapacitorPackage) => {
    // Keep note of original styles
    const originalHtmlStyle = document
      .querySelector('html')
      ?.getAttribute('style');
    const originalHtmlClass = document
      .querySelector('html')
      ?.getAttribute('class');
    const originalBodyStyle = document
      .querySelector('body')
      ?.getAttribute('style');
    const originalBodyClass = document
      .querySelector('body')
      ?.getAttribute('class');

    try {
      if (isCapacitor()) {
        // iOS and Android
        const { customerInfo } = await CapacitorPurchases.purchasePackage({
          aPackage: pkg as CapacitorPackage,
        });
        setCustomerInfo(customerInfo);
      } else if (isElectron()) {
        // Do nothing
      } else {
        // Web
        const { customerInfo } =
          await WebPurchases.getSharedInstance().purchase({
            rcPackage: pkg as WebPackage,
          });
        setCustomerInfo(customerInfo);
      }
    } catch (error) {
      console.warn(error);
    } finally {
      // Restore html and body class and styles
      if (originalHtmlStyle) {
        document
          .querySelector('html')
          ?.setAttribute('style', originalHtmlStyle);
      }
      if (originalHtmlClass) {
        document
          .querySelector('html')
          ?.setAttribute('class', originalHtmlClass);
      }
      if (originalBodyStyle) {
        document
          .querySelector('body')
          ?.setAttribute('style', originalBodyStyle);
      }
      if (originalBodyClass) {
        document
          .querySelector('body')
          ?.setAttribute('class', originalBodyClass);
      }
    }
  };

  const restorePurchases = async () => {
    try {
      if (isCapacitor()) {
        // iOS and Android
        const { customerInfo } = await CapacitorPurchases.restorePurchases();
        setCustomerInfo(customerInfo);
      }
    } catch (error) {
      console.warn(error);
    }
  };

  const isSubscribed = !!customerInfo?.entitlements.active['default'];

  return (
    <RevenueCatContext.Provider
      value={{
        isLoading,
        isSubscribed,
        packages,
        purchasePackage,
        restorePurchases,
      }}
    >
      {children}
    </RevenueCatContext.Provider>
  );
};

export default RevenueCatProvider;
