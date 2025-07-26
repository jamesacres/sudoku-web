'use client';
import { getCapacitorState, isCapacitor } from '@/helpers/capacitor';
import { isElectron, openBrowser } from '@/helpers/electron';
import { pkce } from '@/helpers/pkce';
import { UserProfile } from '@/types/userProfile';
import { useRouter } from 'next/navigation';
import { useFetch } from '@/hooks/fetch';
import React from 'react';
import { Browser } from '@capacitor/browser';

interface UserContextInterface {
  user?: UserProfile;
  loginRedirect: (config: { userInitiated: boolean }) => Promise<void>;
  isLoggingIn: boolean;
  isInitialised: boolean;
  logout: () => void;
  handleAuthUrl: () => void;
  handleRestoreState: () => void;
}

export const UserContext = React.createContext<
  UserContextInterface | undefined
>(undefined);

const buildRedirectUri = () => {
  if (isElectron()) {
    // Deep link
    const scheme = 'com.bubblyclouds.sudoku';
    return `${scheme}://-/auth.html`;
  } else if (isCapacitor()) {
    // iOS/Android needs custom URL scheme to be able to redirect from our browser back
    const scheme = 'com.bubblyclouds.sudoku';
    return `${scheme}://-/auth`;
  }
  return `${window.location.origin}/auth`;
};

let isExhanging = false;
let isInitialising = false;
const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = React.useState<UserProfile | undefined>(undefined);
  const { fetch, getUser, logout, restoreState } = useFetch();
  const [isLoggingIn, setIsLoggingIn] = React.useState(false);
  const [isInitialised, setIsInitialised] = React.useState(false);
  const router = useRouter();

  const iss = 'https://auth.bubblyclouds.com';
  const clientId =
    isElectron() || isCapacitor() ? 'bubbly-sudoku-native' : 'bubbly-sudoku';

  const loginRedirect = React.useCallback(
    async ({ userInitiated }: { userInitiated: boolean }) => {
      console.info('loginRedirect..');
      setIsLoggingIn(true);
      sessionStorage.setItem(
        'restorePathname',
        `${window.location.pathname}${window.location.search}`
      );

      const state = window.crypto.randomUUID();
      sessionStorage.setItem('state', state);

      const { codeChallenge, codeVerifier, codeChallengeMethod } = await pkce();
      sessionStorage.setItem('code_verifier', codeVerifier);

      const redirectUri = buildRedirectUri();
      const scope = [
        'openid',
        'profile',
        'offline_access',
        'parties.write',
        'members.write',
        'invites.write',
        'sessions.write',
      ];
      const resource = 'https://api.bubblyclouds.com';

      const params = new URLSearchParams();
      params.set('state', state);
      params.set('redirect_uri', redirectUri);
      params.set('client_id', clientId);
      params.set('response_type', 'code');
      params.set('scope', scope.join(' '));
      params.set('code_challenge', codeChallenge);
      params.set('code_challenge_method', codeChallengeMethod);
      params.set('resource', resource);
      if (userInitiated) {
        params.set('prompt', 'consent');
      }

      const url = `${iss}/oidc/auth?${params.toString()}`;
      if (isElectron()) {
        await openBrowser(url);
      } else if (isCapacitor()) {
        await Browser.open({ url, windowName: '_self' });
      } else {
        window.location.href = url;
      }

      // Remove is logging in after 10 seconds in case of error
      setTimeout(() => {
        setIsLoggingIn(false);
      }, 10000);
    },
    [clientId]
  );

  const handleUser = React.useCallback(
    async (user?: UserProfile, isRestoreState: boolean = false) => {
      console.info('user received', user);
      if (user) {
        console.info('handleUser', user);
        setUser(user);
        if (!isElectron()) {
          // Indicate that if browser closes, next reopen we can try to recover our session
          localStorage.setItem('recoverSession', 'true');
        }
      } else if (!isRestoreState) {
        if (isCapacitor()) {
          try {
            const capacitorState = await getCapacitorState();
            if (capacitorState) {
              const user = await restoreState(capacitorState);
              if (user) {
                await handleUser(user, true);
                return;
              }
            }
          } catch (e) {
            console.warn(e);
          }
        }
        if (
          localStorage.getItem('recoverSession') === 'true' &&
          window.navigator.onLine // only when we're online
        ) {
          localStorage.setItem('recoverSession', 'false');
          // Redirect to login (hopefully automatically recover auth session)
          console.warn('no user, redirecting to login');
          await loginRedirect({ userInitiated: false });
        }
      }
    },
    [loginRedirect, restoreState]
  );

  const handleAuthUrl = React.useCallback(async () => {
    console.info('handleAuthUrl');
    setIsLoggingIn(true);

    const codeExchange = async () => {
      try {
        if (!isExhanging) {
          isExhanging = true;
          const query = new URLSearchParams(window.location.search);
          const code = query.get('code') || '';
          const state = query.get('state') || '';
          const redirectUri = buildRedirectUri();

          const codeVerifier = sessionStorage.getItem('code_verifier');
          if (state === sessionStorage.getItem('state') && codeVerifier) {
            const params = new URLSearchParams();
            params.set('grant_type', 'authorization_code');
            params.set('client_id', clientId);
            params.set('code_verifier', codeVerifier);
            params.set('code', code);
            params.set('redirect_uri', redirectUri);
            const response = await fetch(
              new Request(`${iss}/oidc/token`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: params.toString(),
              })
            );
            if (response.ok) {
              // Modified response from public/user-provider-worker.js
              const { user } = await response.json();
              console.info('user received from code exchange', user);
              if (user) {
                await handleUser(user);
              }
            }
          }
        }
      } catch (e) {
        console.error(e);
      }

      setIsLoggingIn(false);
      isExhanging = false;

      // Navigate back to previous location
      const restorePathname = sessionStorage.getItem('restorePathname');
      router.replace(
        restorePathname && restorePathname !== '/auth' ? restorePathname : '/'
      );
    };
    await codeExchange();
  }, [clientId, router, handleUser, fetch]);

  const handleRestoreState = React.useCallback(async () => {
    console.info('restoreState');
    // Request the worker restores the persisted state from electron
    const query = new URLSearchParams(window.location.search);
    const encryptedState = query.get('state') || '';
    const state = await (window as any).electronAPI.decrypt(encryptedState);
    await handleUser(await restoreState(state));
    // Redirect to root of app
    router.replace('/');
  }, [router, restoreState, handleUser]);

  React.useEffect(() => {
    // Really we should unmount service worker and intervals
    // However, tricky to unmount, so to avoid strict mode issues, ensure this only runs once
    if (isInitialising) {
      console.warn('isInitialising, exiting early');
      return;
    }
    isInitialising = true;

    const asyncEffect = async () => {
      if (
        !['/auth', '/restoreState'].includes(
          window.location.pathname.replace('.html', '')
        )
      ) {
        // Request the worker sends us a user result
        handleUser(getUser());
      }

      setIsInitialised(true);
    };
    asyncEffect();
  }, [getUser, handleUser]);

  const handleLogout = async () => {
    console.warn('handleLogout');
    localStorage.setItem('recoverSession', 'false');
    setUser(undefined);
    await logout();
  };

  return (
    <UserContext.Provider
      value={{
        isInitialised,
        isLoggingIn,
        loginRedirect,
        user,
        handleAuthUrl,
        handleRestoreState,
        logout: handleLogout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
