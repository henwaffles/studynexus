# Deploy StudyNexus for Free (Vercel + Render)

This repo is a monorepo:
- `client/` = React + Vite frontend (static site)
- `server/` = Express + Prisma backend (API)

A completely free deployment is possible with:
- **Vercel** (frontend)
- **Render** (backend)
- **Turso (libSQL)** (database, free tier) — *recommended for persistence*
- **Cloudinary** (images, free tier) — *recommended if you use image uploads*

If you skip Turso/Cloudinary, many free hosts will have **non-persistent disks** and you may lose data/images on restarts.

---

## 0) Prerequisites

- Your code pushed to GitHub
- Accounts (free): Vercel, Render
- Recommended (free): Turso, Cloudinary

---

## 1) Deploy the backend (Render)

### Create Render Web Service

1. Render Dashboard → **New** → **Web Service**
2. Connect your GitHub repo
3. Configure:
   - **Root Directory:** `server`
   - **Environment:** Node
  - **Build Command:** `npm ci && npm run prisma:generate`
   - **Start Command:** `npm start`

### Render Environment Variables

Set these in Render → Service → **Environment**:

Required:
- `NODE_ENV` = `production`
- `JWT_SECRET` = a long random string
- `CLIENT_URL` = `https://YOUR-VERCEL-DOMAIN.vercel.app`
- `DATABASE_URL` = `file:./dev.db` (required by Prisma schema validation)

Recommended for Turso (persistent DB at runtime):
- `TURSO_DATABASE_URL` = `libsql://...`
- `TURSO_AUTH_TOKEN` = Turso auth token

Recommended for Cloudinary (so image uploads persist):
- `CLOUDINARY_URL` = Cloudinary URL (or set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` if your code expects those)

Notes:
- Render sets `PORT` automatically; the server reads `process.env.PORT`.

### Database choices

**Recommended (persistent): Turso**
- Turso gives you a `libsql://...` URL and an auth token.
- Prisma schema validation for a SQLite datasource requires `DATABASE_URL` to start with `file:`.
- Set:
  - `DATABASE_URL=file:./dev.db`
  - `TURSO_DATABASE_URL=libsql://...`
  - `TURSO_AUTH_TOKEN=...`

**Not recommended for production (can reset): local SQLite file on Render**
- `DATABASE_URL=file:./dev.db`

### Applying migrations when using Turso

Because Prisma migrations are validated against a SQLite `file:` URL in this repo, running `prisma migrate deploy` in Render builds can fail if you try to set `DATABASE_URL` to a `libsql://...` URL.

Recommended approach:
1. Deploy the API first (with the env vars above)
2. Apply migrations to Turso from your machine using Turso's SQL shell, using the SQL files in `server/prisma/migrations/*/migration.sql` in order.

Install Turso CLI (Windows):
- Turso CLI is installed via WSL on Windows.
- In PowerShell: `wsl --install` (if needed), then `wsl`
- In WSL: `curl -sSfL https://get.tur.so/install.sh | bash`
- Reopen WSL and run: `turso auth login`

One-command migration helper scripts (recommended):
- WSL/Linux/macOS: `./server/scripts/applyTursoMigrations.sh studynexus`
- Windows PowerShell (if `turso` is on PATH): `powershell -ExecutionPolicy Bypass -File server\scripts\applyTursoMigrations.ps1 -Db studynexus`

Windows quick option (no WSL, no Turso CLI):
- You can apply migrations directly from Node using libSQL.
- In PowerShell:
  - `cd server`
  - `node scripts/applyTursoMigrationsWithLibsql.js --url "libsql://..." --token "YOUR_TURSO_AUTH_TOKEN"`

On Windows PowerShell, the pattern is:
- `Get-Content server\prisma\migrations\<migration_folder>\migration.sql | turso db shell <your-db-name>`

After deploy, your API base URL will look like:
- `https://YOUR-RENDER-SERVICE.onrender.com/api`

---

## 2) Deploy the frontend (Vercel)

1. Vercel Dashboard → **New Project** → Import your repo
2. Configure:
   - **Root Directory:** `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

### Vercel Environment Variables

Set in Vercel → Project → **Settings** → **Environment Variables**:

- `VITE_API_URL` = `https://YOUR-RENDER-SERVICE.onrender.com/api`

Deploy.

---

## 3) Post-deploy smoke checks

- Open your Vercel site
- Try:
  - Register / Login
  - Create a flashcard
  - Explore tab loads public flashcards
  - Like/unlike works

Backend check:
- `GET https://YOUR-RENDER-SERVICE.onrender.com/api/health`

---

## 4) Common issues

### CORS error
Make sure Render `CLIENT_URL` matches your Vercel domain exactly.

### First load slow
Render free services can “sleep” when idle; first request after inactivity can be slow.

### SPA routes 404 on refresh
This is handled by `client/vercel.json` (added) so React Router routes work.
