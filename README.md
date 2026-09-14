# Nutripacks

Customer website + admin backend for a Qatar meal-plan business.

## Current architecture
- Next.js frontend and API routes
- PostgreSQL development database (Supabase)
- Vercel-ready deployment
- QIIB card-only payment adapter placeholder
- SMTP email configuration placeholder
- QHost migration plan included

## Routes
- `/` customer website
- `/admin` admin console
- `/api/health` health check

## Local setup
```bash
cp .env.example .env.local
npm install
npm run dev
```

## Security
Admin credentials are stored only as password hashes in the database. Do not commit secrets or live QIIB credentials.
