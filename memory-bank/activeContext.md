# Active Context: StudyNexus

## Current Focus
**Phase:** Phase 3 - Polish & Advanced Features
**Active Task:** Deployment prep (free tier) + mobile-first UX polish
**Goal:** Keep the current UX, but ensure the app looks/feels great on phones and is ready to deploy on a free stack (Vercel + Render) with a persistent DB option.

## Recent Changes (Dec 28, 2025)

### Social / Discovery (Task 3.5) ✅ (mostly complete)
- Public/private flashcards (private by default)
- Explore page for public originals + search suggestions (users/subjects/tags)
- Copy-to-library for public flashcards
- Likes: like/unlike, counts, and “most liked” ordering
- Public profiles at `/u/:username` + profile photo upload (≤5MB) + Settings page

### Performance Work (Task 3.6) ✅ (in progress)
- Route-level code splitting via `React.lazy` + `Suspense`
- Explore ordering moved server-side (sort by likes count)
- Image loading improvements (consistent `loading="lazy"` + `decoding="async"`)

### Mobile-first UX polish ✅
- Touch-friendly actions (no hover-only controls)
- Mobile spacing/typography tuned across major pages
- Better responsive layouts for forms, filters, and study views

### Deployment scaffolding ✅
- Added Vercel SPA rewrite config and client/server `.env.example`
- Added Render blueprint (`render.yaml`) + deploy guide (`DEPLOYMENT.md`)
- Server: CORS allowlist supports comma-separated `CLIENT_URL`
- Server: optional Turso/libSQL adapter path for persistent free DB

## Next Steps
- Deploy: create Vercel project (client) + Render web service (server)
- Configure env vars (JWT, CLIENT_URL allowlist, DATABASE_URL/Turso token, optional Cloudinary)
- Run DB migrations in production (`prisma migrate deploy`) and smoke test core flows

## Notes / Constraints
- Windows: Prisma can intermittently hit `EPERM` if the query engine DLL is locked; stopping Node processes before Prisma commands usually resolves it.
- Cloudinary uploads require env vars; when missing, uploads fall back to local `/uploads` served by the API.
- Free hosting caveat: SQLite files are usually ephemeral; use Turso/libSQL (or another managed DB) for persistence.
- Prisma driver adapters are version-sensitive: `@prisma/adapter-libsql` must match Prisma major (v5.x here). The working wiring is `createClient({ url, authToken })` + `new PrismaLibSQL(client)`.
