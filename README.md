# Portfolio

A personal project portfolio with a built-in admin panel, so the content is
managed through a UI instead of by editing code.

- **Public site** — hero with animated stat counters, live search (`/` to focus),
  sorting, category filters, grid/list toggle, light/dark theme, and a detail
  modal with shareable `?i=<id>` links.
- **Admin panel** (`/admin`) — create, edit, and delete projects, categories,
  tags, and collections; edit the hero, stat counters, and footer copy; manage
  link cards.

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Prisma 7 · Postgres ·
Motion · lucide-react · zod · jose

## Local development

```bash
npm install
cp .env.example .env        # then fill in the values
npx prisma migrate deploy   # create the tables
npm run db:seed             # starter categories, tags, and sample projects
npm run dev
```

Sign in at `/admin/login` with the password you hashed into `ADMIN_PASSWORD_HASH`.

### Environment variables

| Name | Purpose |
| --- | --- |
| `DATABASE_URL` | Pooled Postgres connection used by the app |
| `DIRECT_URL` | Non-pooled connection used by `prisma migrate` |
| `ADMIN_PASSWORD_HASH` | bcrypt hash of the admin password |
| `AUTH_SECRET` | Signing key for the admin session cookie (32+ bytes) |

Generate the two secrets:

```bash
npm run hash-password -- "your-admin-password"
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Deploying to Vercel

1. Push to GitHub.
2. In Vercel, **Add New → Project** and import the repository.
3. Attach a Postgres database. The Neon integration in the Vercel Marketplace
   sets `DATABASE_URL` automatically; add `DIRECT_URL` yourself using the same
   string with `-pooler` removed from the host.
4. Add `ADMIN_PASSWORD_HASH` and `AUTH_SECRET` **before the first deploy** — the
   build runs migrations and needs them.
5. Deploy. `vercel-build` runs `prisma generate && prisma migrate deploy &&
   next build`, so the schema is applied automatically.
6. Seed the starter content once, using the production connection string:

   ```bash
   DATABASE_URL="<production-url>" npm run db:seed
   ```

## Scripts

| Script | Does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run db:push` | Push the schema without a migration (local only) |
| `npm run db:seed` | Seed starter content |
| `npm run db:studio` | Prisma Studio |
| `npm run db:check` | Probe `DATABASE_URL` — connection latency and row count |
| `npm run hash-password -- "pw"` | Print a bcrypt hash for `ADMIN_PASSWORD_HASH` |

## Notes

- `db:seed` only inserts sample projects into an empty library, so re-running it
  never overwrites or duplicates real entries. Taxonomy and settings are
  upserted.
- Blank stat values in **Site content** mean "count live from the database".
- Categories and collections in use by a project cannot be deleted until those
  projects are reassigned.
- Admin mutations are server actions that re-check the session server-side; the
  proxy guard on `/admin` (`src/proxy.ts`) is a first line of defence, not the
  only one.
- In a `.env` file every `$` in the bcrypt hash must be escaped as `\$`, or the
  value is parsed as a variable reference and silently becomes empty. Paste the
  raw hash in the Vercel dashboard, which does no such parsing.
  `npm run hash-password` prints both forms.
