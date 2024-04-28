// Service worker contains our access and refresh tokens, they never leave the worker
// Inspired by https://github.com/elie29/jwt-token-storage/blob/service-worker/frontend/service-worker.js
// Closure to protect all variables
((_) => {
  const apiUrls = ['https://api.bubblyclouds.com'];
  const authUrls = ['https://auth.bubblyclouds.com'];
  const tokenUrls = ['/oidc/token'];
  const isApiUrl = (destURL) => apiUrls.includes(destURL.origin);
  const isTokenUrl = (destURL) =>
    authUrls.includes(destURL.origin) && tokenUrls.includes(destURL.pathname);

  // These tokens never leave the worker
  let accessToken = null;
  let accessExpiry = null;
  let refreshToken = null;
  let refreshExpiry = null;

  // Intercept all fetch requests
  self.addEventListener('fetch', (event) => {
    if (canHandle(event)) {
      event.respondWith(handleFetch(event));
    }
  });

  self.addEventListener('install', (event) => {
    event.waitUntil(self.skipWaiting());
    console.log('user-provider-worker installed!');
  });

  self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
    console.log('user-provider-worker ready!');
  });

  const canHandle = (event) => {
    if (!event?.request?.url) {
      return false;
    }
    const destURL = new URL(event.request.url);
    return isApiUrl(destURL) || isTokenUrl(destURL);
  };

  const handleFetch = async (event) => {
    console.info('user-provider-worker handleFetch');

    const destURL = new URL(event.request.url);
    const headers = new Headers(event.request.headers);

    if (isApiUrl(destURL)) {
      // Automatically send auth header to API URLs
      console.info('accessToken', accessToken);
      if (accessToken) {
        // TODO check if accessToken has expired, if it has refresh it
        // TODO confirm if that gets intercepted..
        headers.append('Authorization', `Bearer ${accessToken}`);
      }
      const authReq = new Request(event.request, { headers });
      return fetch(authReq);
    }

    if (isTokenUrl(destURL)) {
      // Automatically cache access and refresh tokens
      // catch response and set token
      const authReq = new Request(event.request, { headers });
      const response = await fetch(authReq);
      if (response.ok) {
        const data = await response.json();
        const { access_token, refresh_token, expires_in, ...body } = data;

        accessToken = access_token;
        accessExpiry = new Date();
        accessExpiry.setTime(accessExpiry.getTime() + expires_in * 1000);

        refreshToken = refresh_token;
        refreshExpiry = new Date();
        refreshExpiry.setTime(refreshExpiry.getTime() + 14 * 86400 * 1000);

        // Send response without access and refresh tokens
        // (usually just the id_token, scope, token_type)
        return new Response(JSON.stringify(body), {
          headers: response.headers,
          status: response.status,
          statusText: response.statusText,
        });
      }
      return response;
    }
  };
})();
