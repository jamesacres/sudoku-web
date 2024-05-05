// Service worker contains our access and refresh tokens, they never leave the worker
// Inspired by https://github.com/elie29/jwt-token-storage/blob/service-worker/frontend/service-worker.js
// Closure to protect all variables
((_) => {
  const jwtDecode = (token) =>
    JSON.parse(
      decodeURIComponent(
        atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )
    );
  const apiUrls = ['https://api.bubblyclouds.com'];
  const authUrls = ['https://auth.bubblyclouds.com'];
  const pingUrl = 'https://api.bubblyclouds.com/workerping';
  const tokenUrls = ['/oidc/token'];
  const isApiUrl = (destURL) => apiUrls.includes(destURL.origin);
  const isTokenUrl = (destURL) =>
    authUrls.includes(destURL.origin) && tokenUrls.includes(destURL.pathname);
  const isPingUrl = (destURL) => destURL.toString() === pingUrl;

  // These tokens never leave the worker
  let state;
  const resetState = () => {
    state = {
      accessToken: null,
      accessExpiry: null,
      refreshToken: null,
      refreshExpiry: null,
      user: null,
      userExpiry: null,
    };
  };
  resetState();

  const hasValidUser = () =>
    state.user &&
    state.userExpiry &&
    state.refreshToken &&
    state.refreshExpiry &&
    new Date(state.userExpiry).getTime() > new Date().getTime() &&
    new Date(state.refreshExpiry).getTime() > new Date().getTime();

  // Listen to calls to postMessage
  addEventListener('message', (event) => {
    if (event.data === 'getUser') {
      console.info('user-provider-worker getUser event received');
      if (hasValidUser()) {
        console.info('user-provider-worker getUser event responding..');
        event.source.postMessage({
          user: state.user,
          type: 'getUser',
        });
      } else {
        console.warn('user-provider-worker no user, or expired');
        event.source.postMessage({
          user: undefined,
          type: 'getUser',
        });
      }
    }
    return;
  });

  // Intercept all fetch requests
  self.addEventListener('fetch', (event) => {
    if (canHandle(event)) {
      event.respondWith(handleFetch(event));
    }
  });

  const canHandle = (event) => {
    if (!event?.request?.url) {
      return false;
    }
    const destURL = new URL(event.request.url);
    return isApiUrl(destURL) || isTokenUrl(destURL) || isPingUrl(destURL);
  };

  const handleFetch = async (event) => {
    console.info('user-provider-worker handleFetch');

    const destURL = new URL(event.request.url);
    const headers = new Headers(event.request.headers);

    if (isPingUrl(destURL)) {
      console.info('user-provider-worker handleFetch pingUrl');
      return new Response(undefined, { status: hasValidUser() ? 200 : 401 });
    } else if (isApiUrl(destURL)) {
      console.info('user-provider-worker handleFetch apiUrl');
      // Automatically send auth header to API URLs
      if (state.accessToken) {
        // TODO check if accessToken has expired, if it has refresh it
        // TODO confirm if that gets intercepted..
        headers.append('Authorization', `Bearer ${state.accessToken}`);
      }
      const authReq = new Request(event.request, { headers });
      const response = await fetch(authReq);
      if (response.status === 401) {
        resetState();
      }
      return response;
    } else if (isTokenUrl(destURL)) {
      console.info('user-provider-worker handleFetch tokenUrl');
      // Automatically cache access and refresh tokens and user
      // catch response and set token
      const authReq = new Request(event.request, { headers });
      const response = await fetch(authReq);
      if (response.ok) {
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

        state = {
          accessExpiry,
          accessToken,
          refreshExpiry,
          refreshToken,
          user,
          userExpiry,
        };

        // Send modified response with only the user profile
        return new Response(JSON.stringify({ user: state.user }), {
          headers: response.headers,
          status: response.status,
          statusText: response.statusText,
        });
      }
      return response;
    }
  };

  self.addEventListener('install', (event) => {
    event.waitUntil(self.skipWaiting());
    console.log('user-provider-worker installed!');
  });

  self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
    console.log('user-provider-worker ready!');
  });
})();
