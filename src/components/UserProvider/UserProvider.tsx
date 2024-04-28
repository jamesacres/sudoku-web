'use client';
import { JwtPayload, jwtDecode } from 'jwt-decode';
import React from 'react';

interface UserProfile extends JwtPayload {
  sub: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
}

interface UserContextInterface {
  user: UserProfile;
  loginRedirect: () => void;
  isLoggingIn: boolean;
}

export const UserContext = React.createContext<
  UserContextInterface | undefined
>(undefined);

let isExhanging = false;
const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = React.useState<UserProfile | undefined>(undefined);
  const [isLoggingIn, setIsLoggingIn] = React.useState(false);

  const iss = 'https://auth.bubblyclouds.com';
  const clientId = 'bubbly-sudoku';

  React.useEffect(() => {
    const asyncEffect = async () => {
      if ('serviceWorker' in navigator) {
        // Worker in public directory, intercepts our requests to inject and cache tokens for us
        await navigator.serviceWorker.register('/user-provider-worker.js');
        await navigator.serviceWorker.ready;
        // TODO new tab currently loses user in sessionStorage - restore it from worker
        // TODO if worker has no tokens, ensure we don't restore user
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
                const json = await response.json();
                if (json.id_token) {
                  const user: UserProfile = jwtDecode(json.id_token);
                  sessionStorage.setItem('user', JSON.stringify(user));
                  const userExpiry = new Date();
                  userExpiry.setTime(userExpiry.getTime() + 14 * 86400 * 1000);
                  sessionStorage.setItem(
                    'userExpiry',
                    userExpiry.toISOString()
                  );
                  setUser(user);
                  // TODO navigate back to previous
                }
              }
            }
          } catch (e) {
            console.error(e);
          }
          setIsLoggingIn(false);
          isExhanging = false;
        };
        codeExchange();
      } else {
        // Set user if not expired
        const userJson = sessionStorage.getItem('user');
        const userExpiry = sessionStorage.getItem('userExpiry');
        if (
          userJson &&
          userJson.startsWith('{') &&
          userExpiry &&
          new Date(userExpiry).getTime() > new Date().getTime()
        ) {
          setUser(JSON.parse(userJson));
        }
      }
    };
    asyncEffect();
  }, []);

  const loginRedirect = React.useCallback(() => {
    setIsLoggingIn(true);

    // TODO store current path to redirect back to
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

  return (
    <UserContext.Provider value={{ isLoggingIn, loginRedirect, user }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
