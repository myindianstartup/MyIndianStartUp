import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { API_URL } from '@/lib/apiClient';
import { useAuth } from '@/contexts/AuthContext';

const getSessionId = () => {
  const key = 'myindianstartup_session_id';
  let sessionId = window.sessionStorage.getItem(key);
  if (!sessionId) {
    sessionId = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
    window.sessionStorage.setItem(key, sessionId);
  }
  return sessionId;
};

const detectDevice = () => {
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
};

const detectBrowser = () => {
  const ua = navigator.userAgent;
  if (ua.includes('Edg')) return 'Edge';
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Safari')) return 'Safari';
  return 'Other';
};

const sendEvent = (payload, token) => {
  const body = JSON.stringify(payload);
  if (!token && navigator.sendBeacon) {
    const blob = new Blob([body], { type: 'application/json' });
    navigator.sendBeacon(`${API_URL}/api/analytics/track`, blob);
    return;
  }

  fetch(`${API_URL}/api/analytics/track`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body,
    keepalive: true
  }).catch(() => {});
};

const AnalyticsTracker = () => {
  const location = useLocation();
  const { token } = useAuth();
  const previousRef = useRef({ route: null, startedAt: Date.now() });

  useEffect(() => {
    const now = Date.now();
    const previous = previousRef.current;
    const route = `${location.pathname}${location.search}`;

    if (previous.route) {
      sendEvent({
        eventName: 'page_duration',
        route: previous.route,
        sessionId: getSessionId(),
        durationSeconds: Math.max(1, Math.round((now - previous.startedAt) / 1000)),
        bounce: false
      }, token);
    }

    sendEvent({
      eventName: 'page_view',
      route,
      referrer: document.referrer || null,
      deviceType: detectDevice(),
      browser: detectBrowser(),
      sessionId: getSessionId(),
      metadata: {
        title: document.title
      }
    }, token);

    previousRef.current = { route, startedAt: now };
  }, [location.pathname, location.search, token]);

  useEffect(() => () => {
    const previous = previousRef.current;
    if (!previous.route) return;

    sendEvent({
      eventName: 'page_duration',
      route: previous.route,
      sessionId: getSessionId(),
      durationSeconds: Math.max(1, Math.round((Date.now() - previous.startedAt) / 1000)),
      bounce: false
    }, token);
  }, [token]);

  return null;
};

export default AnalyticsTracker;
