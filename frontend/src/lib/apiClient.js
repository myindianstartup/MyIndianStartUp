const rawApiUrl = (process.env.REACT_APP_API_URL || '').trim().replace(/\/$/, '');
const isLocalBrowser = typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname);
const browserOrigin = typeof window !== 'undefined' ? window.location.origin : '';

export const API_URL = rawApiUrl || (isLocalBrowser ? 'http://localhost:5000' : browserOrigin);

export const apiRequest = async (path, { token, method = 'GET', body, headers = {} } = {}) => {
  if (!API_URL) {
    const error = new Error('Backend API URL is not available. Please refresh the page or check the deployment settings.');
    error.status = 0;
    error.code = 'API_URL_MISSING';
    throw error;
  }

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers
    },
    body: body ? JSON.stringify(body) : undefined
  });

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
