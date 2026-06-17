# MyIndianStartup

MyIndianStartup is a business and creator collaboration platform built with:

- React + CRACO frontend in `frontend/`
- Express backend in `backend/`
- Supabase for auth and data
- Cloudflare R2 for media storage

## Repository Structure

- `frontend/` - React application
- `backend/` - Express API
- `vercel.json` - production deployment config for combined Vercel hosting
- `PRODUCTION_DEPLOYMENT.md` - deployment checklist and environment setup

## Local Run

### Frontend

```bash
cd frontend
npm install
npm start
```

### Backend

```bash
cd backend
npm install
npm run dev
```

## Production Deploy

Use the repository root for deployment and follow:

- [PRODUCTION_DEPLOYMENT.md](D:/MyIndianStartup/PRODUCTION_DEPLOYMENT.md)

## Important Notes

- Keep `SUPABASE_SERVICE_ROLE_KEY` only in backend/server environment variables
- Do not commit `.env` files
- In combined Vercel deployment, leave `REACT_APP_API_URL` empty so the frontend uses the same deployed origin
