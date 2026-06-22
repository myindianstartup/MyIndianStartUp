# Production Deployment

This repository is configured to deploy the frontend and backend together on Vercel from the repository root.

## Recommended Hosting Setup

- Frontend: Vercel
- Backend API: same Vercel project via `backend/api/index.js`
- Database/Auth: Supabase
- Media storage: Cloudflare R2
- Production domain: `https://myindianstartup.com`

## Vercel Project Settings

- Import the repository root, not `frontend`
- Framework preset: Other / auto-detected
- Build configuration: use the included root `vercel.json`
- Frontend static build source: `frontend/package.json`
- Frontend output directory: `build`
- Backend API entry: `backend/api/index.js`

## Required Vercel Environment Variables

Add these variables in Vercel Project Settings -> Environment Variables:

```text
NODE_ENV=production
FRONTEND_ORIGIN=https://myindianstartup.com,https://www.myindianstartup.com
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-supabase-publishable-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
R2_ACCOUNT_ID=your-cloudflare-account-id
R2_ENDPOINT=https://your-cloudflare-account-id.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your-r2-access-key-id
R2_SECRET_ACCESS_KEY=your-r2-secret-access-key
R2_BUCKET=myindianstartup-media
R2_PUBLIC_BASE_URL=https://your-public-r2-domain.example.com
MAX_IMAGE_MB=5
MAX_VIDEO_MB=50
REACT_APP_SUPABASE_URL=https://your-project-ref.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-supabase-publishable-anon-key
REACT_APP_SITE_URL=https://myindianstartup.com
```

## Important Frontend API Note

When frontend and backend are deployed together with this root `vercel.json`, `REACT_APP_API_URL` should be left empty in Vercel.

The frontend will automatically use the same production origin, for example:

```text
https://myindianstartup.com/api/members/me
```

Only set `REACT_APP_API_URL` if you later move the backend to another host.

## Supabase Production Settings

Set these values in Supabase Authentication:

### Site URL

```text
https://myindianstartup.com
```

### Redirect URLs

```text
https://myindianstartup.com
https://www.myindianstartup.com
https://myindianstartup.com/login
https://www.myindianstartup.com/login
https://myindianstartup.com/post-verse
https://www.myindianstartup.com/post-verse
https://myindianstartup.com/reset-password
https://www.myindianstartup.com/reset-password
```

If Google sign-in is enabled, add these JavaScript origins in Google Cloud Console:

```text
https://myindianstartup.com
https://www.myindianstartup.com
```

Use the exact redirect URI shown inside the Supabase Google provider page.

## Deploy Steps

1. Push latest code to GitHub.
2. Import this repository into Vercel.
3. Add all environment variables above.
4. Deploy the project.
5. Add both domains in Vercel:
   - `myindianstartup.com`
   - `www.myindianstartup.com`
6. Update DNS records exactly as Vercel instructs.
7. Wait for SSL and DNS to finish.

## Quick Checks After Deploy

Open these URLs:

```text
https://myindianstartup.com/health
https://myindianstartup.com/api/members/me
https://myindianstartup.com/login
https://myindianstartup.com/signup
```

Expected results:

- `/health` returns JSON with `ok: true`
- `/api/members/me` returns `401 Unauthorized` when logged out, not `404 Route not found`
- `/login` and `/signup` open normally

## Final Smoke Test

After deployment, test:

1. Home page
2. Email signup
3. Email login
4. Google login
5. Profile save
6. Image upload
7. Pricing page
8. Membership activation
9. VerseFeed
10. SearchVerse
11. Admin login
12. Superadmin login
13. Mobile layout
