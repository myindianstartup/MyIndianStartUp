const rawApiUrl = (process.env.REACT_APP_API_URL || '').trim().replace(/\/$/, '');
const localHosts = ['localhost', '127.0.0.1', '::1'];
const isLocalHost = (host) => localHosts.includes(String(host || '').toLowerCase());
const isLocalBrowser = typeof window !== 'undefined' && isLocalHost(window.location.hostname);
const browserOrigin = typeof window !== 'undefined' ? window.location.origin : '';

const isConfiguredApiLocal = (() => {
  if (!rawApiUrl) return false;
  try {
    return isLocalHost(new URL(rawApiUrl).hostname);
  } catch {
    return false;
  }
})();

export const API_URL = isLocalBrowser
  ? (isConfiguredApiLocal ? rawApiUrl : 'http://localhost:5000')
  : (rawApiUrl || browserOrigin);

export const apiRequest = async (path, { token, method = 'GET', body, headers = {} } = {}) => {
  if (!API_URL) {
    const error = new Error('Backend API URL is not available. Please refresh the page or check the deployment settings.');
    error.status = 0;
    error.code = 'API_URL_MISSING';
    throw error;
  }

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers
      },
      body: body ? JSON.stringify(body) : undefined
    });
  } catch (cause) {
    const error = new Error(
      isLocalBrowser
        ? 'Could not connect to the local backend server. Please make sure the backend is running on port 5000.'
        : 'Could not connect to the backend service. Please try again.'
    );
    error.status = 0;
    error.code = 'NETWORK_ERROR';
    error.cause = cause;
    throw error;
  }

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : await response.text();

  if (!response.ok) {
    const message = typeof payload === 'object' && payload?.error ? payload.error : 'Request failed';
    const error = new Error(message);
    error.status = response.status;
    error.code = typeof payload === 'object' ? payload?.code : undefined;
    error.redirectTo = typeof payload === 'object' ? payload?.redirectTo : undefined;
    error.payload = payload;
    throw error;
  }

  return payload;
};
