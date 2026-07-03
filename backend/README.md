# MyIndianStartup Backend

Lightweight Node.js + Express backend for MyIndianStartup.

## What This Backend Handles

- Supabase Auth token verification.
- BusinessVerse and CreatorVerse profile APIs.
- PostVerse feed and one-post-per-24-hours enforcement.
- Cloudflare R2 media uploads.
- Image optimization with `sharp` before storing profile/post images.
- Search APIs for BusinessVerse and CreatorVerse profiles.

## Why Node.js

The frontend is already React/JavaScript, so Node.js keeps the project easy to maintain and deploy. Express is lightweight, predictable, and simple to host on Render, Railway, Fly.io, VPS, or similar platforms.

## Setup

1. Install dependencies:

```bash
cd backend
npm install
```

2. Copy env template:

```bash
cp .env.example .env
```

3. Fill `.env` with Supabase and Cloudflare R2 credentials.

4. Run the Supabase SQL schema from:

```text
backend/database/supabase/schema.sql
```

6. Expose custom schemas in Supabase:

Supabase Dashboard -> Project Settings -> API -> Exposed schemas.

Add:

```text
core, businessverse, creatorverse, postverse, admin
```

7. Start backend:

```bash
npm run dev
```

## Dummy Accounts

After running `schema.sql`, create dummy accounts with:

```bash
npm run seed:dummy
```

Demo login accounts:

- Superadmin: `superadmin.mis@gmail.com` / `SuperAdmin@01`
- Admin: `admin@myindianstartup.test` / `Admin@123`
- BusinessVerse: `business@myindianstartup.test` / `Business@123`
- CreatorVerse: `creator@myindianstartup.test` / `Creator@123`

In the current frontend demo login, admin emails route to `/admin` and `/superadmin`. Once Supabase Auth is connected in the frontend, these same seeded accounts can be used as real auth users.

## Required Credentials

Supabase:

- Project URL
- Publishable/anon key
- Service role key

Cloudflare R2:

- Account ID
- R2 access key ID
- R2 secret access key
- Bucket name
- Public bucket/custom-domain base URL

## Important Media Note

Images are compressed and converted to WebP before upload.

Videos are currently validated and uploaded as-is to keep deployment lightweight. Server-side video transcoding requires FFmpeg and can be heavy on free-tier deployments. For production, use a background worker or Cloudflare Stream if video compression becomes important.
