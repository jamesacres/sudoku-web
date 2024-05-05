'use client';
import { UserProfile } from '@/types/userProfile';
import { useRouter } from 'next/navigation';
import React from 'react';

interface UserContextInterface {
  user?: UserProfile;
  loginRedirect: () => void;
  isLoggingIn: boolean;
}

export const UserContext = React.createContext<
  UserContextInterface | undefined
>(undefined);

let isExhanging = false;
let isInitialising = false;
const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = React.useState<UserProfile | undefined>(undefined);
  const [isLoggingIn, setIsLoggingIn] = React.useState(false);
  const router = useRouter();

  const iss = 'https://auth.bubblyclouds.com';
  const clientId = 'bubbly-sudoku';

  const loginRedirect = React.useCallback(() => {
    console.info('loginRedirect..');
    setIsLoggingIn(true);
    sessionStorage.setItem('restorePathname', window.location.pathname);

    // TODO store random state
    // TODO store code_challenge

    const state = '3-aF1UZtvFL7iLG-dkFCmcqE.fZ0FAmpvfZB36BUx3d';
    const redirectUri = `${window.location.origin}/auth`;
    const scope = [
      'openid',
      'profile',
      'offline_access',
      'parties.write',
      'members.write',
      'invites.write',
      'sessions.write',
    ];
    const codeChallenge = 'ZqoAqOr3wIoURrtuxBmgcb5svVDDPaaQzEMzkHwT2Uo';
    const codeChallengeMethod = 'S256';
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

    window.location.href = `${iss}/oidc/auth?${params.toString()}`;
  }, []);

  React.useEffect(() => {
    // Really we should unmount service worker and intervals
    // However, tricky to unmount, so to avoid strict mode issues, ensure this only runs once
    if (isInitialising) {
      console.warn('isInitialising, exiting early');
      return;
    }
    isInitialising = true;

    const asyncEffect = async () => {
      const handleUser = (user: UserProfile) => {
        console.info('handleUser', user);
        setUser(user);
        // Indicate that if browser closes, next reopen we can try to recover our session
        localStorage.setItem('recoverSession', 'true');

        // Ping worker fetch /ping endpoint to keep token cache alive
        setInterval(async () => {
          const ping = await fetch('https://api.bubblyclouds.com/workerping');
          if (!ping.ok) {
            // Redirect to login (hopefully automatically recover auth session)
            console.warn('ping is not okay, redirecting to login');
            loginRedirect();
          }
        }, 20000);
      };

      let registration;
      if ('serviceWorker' in navigator) {
        // Worker in public directory, intercepts our requests to inject and cache tokens for us
        await navigator.serviceWorker.register('/user-provider-worker.js');
        registration = await navigator.serviceWorker.ready;

        // Set user after receiving a getUser result from our postMessage
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data.type === 'getUser') {
            const { user } = event.data;
            console.info('user received from getUser event', user);
            if (user) {
              handleUser(user);
            } else {
              if (localStorage.getItem('recoverSession') === 'true') {
                localStorage.setItem('recoverSession', 'false');
                // Redirect to login (hopefully automatically recover auth session)
                console.warn('no user, redirecting to login');
                loginRedirect();
              }
            }
          }
        });
      }
      if (window.location.pathname === '/auth') {
        setIsLoggingIn(true);

        const codeExchange = async () => {
          try {
            if (!isExhanging) {
              isExhanging = true;
              const query = new URLSearchParams(window.location.search);
              const code = query.get('code') || '';
              const state = query.get('state') || '';
              // TODO check state matches expected value
              console.info(state);
              // TODO send code_verifier
              // TODO exchange code for tokens
              const params = new URLSearchParams();
              params.set('grant_type', 'authorization_code');
              params.set('client_id', clientId);
              const codeVerifier =
                'aG4FaELR91anIPjYX7sm0pf8A48ZabVAZynZ0JfE7hI';
              params.set('code_verifier', codeVerifier);
              params.set('code', code);
              const response = await fetch(`${iss}/oidc/token`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: params.toString(),
              });
              if (response.ok) {
                // Modified response from public/user-provider-worker.js
                const { user } = await response.json();
                console.info('user received from code exchange', user);
                if (user) {
                  handleUser(user);
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
          router.push(
            restorePathname && restorePathname !== '/auth'
              ? restorePathname
              : '/'
          );
        };
        await codeExchange();
      } else {
        // Request the worker sends us a user result
        registration?.active?.postMessage('getUser');
      }
    };
    asyncEffect();
  }, [loginRedirect, router]);

  return (
    <UserContext.Provider value={{ isLoggingIn, loginRedirect, user }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
