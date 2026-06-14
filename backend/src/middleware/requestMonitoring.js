import { supabaseAdmin } from '../lib/supabase.js';

const getIpAddress = (req) => {
  const forwardedFor = req.headers['x-forwarded-for'];
  if (typeof forwardedFor === 'string' && forwardedFor.length) {
    return forwardedFor.split(',')[0].trim();
  }

  return req.ip?.replace('::ffff:', '') || null;
};

export const requestMonitoring = (req, res, next) => {
  const startedAt = Date.now();

  res.on('finish', () => {
    if (!req.path.startsWith('/api') && !req.path.startsWith('/health')) return;
    if (req.path === '/api/analytics/track') return;

    const durationMs = Date.now() - startedAt;

    supabaseAdmin
      .schema('admin')
      .from('api_request_logs')
      .insert({
        method: req.method,
        path: req.originalUrl.split('?')[0],
        status_code: res.statusCode,
        duration_ms: durationMs,
        user_id: req.user?.id || null,
        ip_address: getIpAddress(req),
        user_agent: req.headers['user-agent'] || null
      })
      .then(({ error }) => {
        if (error && process.env.NODE_ENV !== 'production') {
          console.warn('Could not record API request log:', error.message);
        }
      });

    if (res.statusCode >= 500) {
      supabaseAdmin
        .schema('admin')
        .from('notifications')
        .insert({
          title: 'API Error Detected',
          body: `${req.method} ${req.originalUrl.split('?')[0]} returned ${res.statusCode}`,
          notification_type: 'api_error',
          metadata: {
            method: req.method,
            path: req.originalUrl.split('?')[0],
            statusCode: res.statusCode,
            durationMs
          }
        })
        .then(({ error }) => {
          if (error && process.env.NODE_ENV !== 'production') {
            console.warn('Could not create API error notification:', error.message);
          }
        });
    }
  });

  next();
};

export { getIpAddress };
