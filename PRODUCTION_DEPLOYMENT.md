# Production Deployment

This project is now configured to deploy frontend and backend together on Vercel.

## Vercel Project Settings

- Project root: repository root, not `frontend`.
- Build configuration: use the included root `vercel.json`.
- Frontend output: `frontend/build`.
- Backend API entry: `backend/api/index.js`.

## Required Environment Variables

Add these variables in Vercel Project Settings -> Environment Variables:

```text
NODE_ENV=production
FRONTEND_ORIGIN=https://my-indian-start-up-six.vercel.app
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
R2_ACCOUNT_ID=...
R2_ENDPOINT=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET=...
R2_PUBLIC_BASE_URL=...
MAX_IMAGE_MB=5
MAX_VIDEO_MB=50
REACT_APP_SUPABASE_URL=...
REACT_APP_SUPABASE_ANON_KEY=...
```

`REACT_APP_API_URL` is optional when frontend and backend are deployed together on Vercel. The frontend will call the same production origin, for example:

```text
https://my-indian-start-up-six.vercel.app/api/members/me
```

If the backend is deployed separately, set:

```text
REACT_APP_API_URL=https://your-backend-domain.com
```

## Quick Checks After Deploy

Open these URLs:

```text
https://my-indian-start-up-six.vercel.app/health
https://my-indian-start-up-six.vercel.app/api/members/me
```

Expected results:

- `/health` returns JSON with `ok: true`.
- `/api/members/me` returns `401 Unauthorized` when logged out, not `404 Route not found`.
