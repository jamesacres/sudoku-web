import { isCapacitor, saveCapacitorState } from '@/helpers/capacitor';
import { isElectron, saveElectronState } from '@/helpers/electron';
import { FetchContext, State } from '@/providers/FetchProvider';
import { UserProfile } from '@/types/userProfile';
import { useCallback, useContext } from 'react';

const jwtDecode = (token: string) =>
  JSON.parse(
    decodeURIComponent(
      atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
  );
const iss = 'https://auth.bubblyclouds.com';
const clientId = isElectron() ? 'bubbly-sudoku-native' : 'bubbly-sudoku';
const apiUrls = ['https://api.bubblyclouds.com'];
const authUrls = ['https://auth.bubblyclouds.com'];
const tokenUrls = ['/oidc/token'];
const isApiUrl = (destURL: URL) => apiUrls.includes(destURL.origin);
const isTokenUrl = (destURL: URL) =>
  authUrls.includes(destURL.origin) && tokenUrls.includes(destURL.pathname);

let isRefreshing = false;

function useFetch() {
  const [state, setState] = useContext(FetchContext)!;

  const saveState = useCallback(
    async (newState: State, isRestoreState: boolean = false) => {
      console.info('useFetch saveState');
      setState(newState);
      if (!isRestoreState) {
        if (isElectron()) {
          console.info('useFetch electron saveState');
          try {
            await saveElectronState(newState);
          } catch (e) {
            console.warn(e);
          }
        } else if (isCapacitor()) {
          console.info('useFetch capacitor saveState');
          try {
            await saveCapacitorState(newState);
          } catch (e) {
            console.warn(e);
          }
        }
      }
    },
    [setState]
  );

  const resetState = useCallback(async () => {
    console.info('useFetch resetState');
    await saveState({
      accessToken: null,
      accessExpiry: null,
      refreshToken: null,
      refreshExpiry: null,
      user: null,
      userExpiry: null,
    });
  }, [saveState]);

  const handleTokenSuccess = useCallback(
    async (response: Response): Promise<State> => {
      console.info('useFetch handleTokenSuccess');
      const data = await response.json();
      const {
        expires_in,
        id_token,
        access_token: accessToken,
        refresh_token: refreshToken,
      } = data;

      const accessExpiry = new Date();
      accessExpiry.setTime(accessExpiry.getTime() + expires_in * 1000);

      const refreshExpiry = new Date();
      // Refresh tokens don't rotate forever, we expect them to last 14 days
      refreshExpiry.setTime(refreshExpiry.getTime() + 14 * 86400 * 1000);

      const user = jwtDecode(id_token);
      // Same expiry as the first refresh token
      const userExpiry = new Date(refreshExpiry);

      const newState = {
        accessExpiry,
        accessToken,
        refreshExpiry,
        refreshToken,
        user,
        userExpiry,
      };
      await saveState(newState);
      return newState;
    },
    [saveState]
  );

  const checkRefresh = useCallback(async () => {
    if (isRefreshing) {
      console.warn('skipping checkRefresh as already checking');
      return { inProgress: true };
    }
    isRefreshing = true;

    try {
      // If accessToken is close to expiry, refresh it
      const fifteenMinsMs = 900000;
      if (
        state.refreshToken &&
        state.accessExpiry &&
        new Date(state.accessExpiry).getTime() <=
          new Date().getTime() + fifteenMinsMs
      ) {
        console.info('useFetch refreshing token..');
        const params = new URLSearchParams();
        params.set('grant_type', 'refresh_token');
        params.set('client_id', clientId);
        params.set('refresh_token', state.refreshToken);
        const refreshResponse = await fetch(`${iss}/oidc/token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params.toString(),
        });
        if (refreshResponse.ok) {
          await handleTokenSuccess(refreshResponse);
        } else {
          console.error(
            'useFetch failed to refresh token',
            refreshResponse.status
          );
        }
      } else {
        console.info('useFetch no need to refresh token');
      }
    } catch (e) {
      console.error(e);
    }

    isRefreshing = false;
  }, [handleTokenSuccess, state]);

  const hasValidUser = useCallback(
    () =>
      state.user &&
      state.userExpiry &&
      state.refreshToken &&
      state.refreshExpiry &&
      new Date(state.userExpiry).getTime() > new Date().getTime() &&
      new Date(state.refreshExpiry).getTime() > new Date().getTime(),
    [state]
  );

  const getUser = useCallback((): UserProfile | undefined => {
    console.info('useFetch getUser event received');
    if (hasValidUser()) {
      return state.user!;
    }
    return undefined;
  }, [hasValidUser, state]);

  const logout = useCallback(async () => {
    console.info('useFetch logout');
    await resetState();
  }, [resetState]);

  const restoreState = useCallback(
    async (stateString: string): Promise<UserProfile | undefined> => {
      console.info('useFetch restoreState');
      const newState = JSON.parse(stateString);
      await saveState(newState, true);
      return newState.user;
    },
    [saveState]
  );

  const handleFetch = useCallback(
    async (request: Request): Promise<Response> => {
      console.info('useFetch handleFetch');

      const destURL = new URL(request.url);
      const headers = new Headers(request.headers);

      if (isApiUrl(destURL)) {
        console.info('useFetch handleFetch apiUrl');
        // Automatically send auth header to API URLs
        if (state.accessToken) {
          const { inProgress } = (await checkRefresh()) || {};
          if (inProgress) {
            console.warn('Skipping API call as refresh in progress');
            return new Response(null, { status: 401 });
          }
          headers.append('Authorization', `Bearer ${state.accessToken}`);
        } else {
          console.warn(
            'Resetting state as no access token, and skipping API call'
          );
          await resetState();
          return new Response(null, { status: 401 });
        }
        const authReq = new Request(request, { headers });
        const response = await fetch(authReq);
        if (response.status === 401) {
          console.warn('Resetting state as received 401');
          await resetState();
        }
        return response;
      } else if (isTokenUrl(destURL)) {
        console.info('useFetch handleFetch tokenUrl');
        // Automatically cache access and refresh tokens and user
        // catch response and set token
        const authReq = new Request(request, { headers });
        const response = await fetch(authReq);
        if (response.ok) {
          const newState = await handleTokenSuccess(response);

          // Send modified response with only the user profile
          return new Response(JSON.stringify({ user: newState.user }), {
            headers: response.headers,
            status: response.status,
            statusText: response.statusText,
          });
        }
        return response;
      }
      return fetch(request);
    },
    [checkRefresh, handleTokenSuccess, resetState, state]
  );

  return {
    getUser,
    logout,
    restoreState,
    fetch: handleFetch,
  };
}

export { useFetch };
