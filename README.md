# SubVault

A private subscription account inventory and sales workspace in brown and beige. React, Vite, Tailwind, Supabase Auth/Postgres, and Render static hosting.

## Local development

```sh
npm install
cp environment.example .env
npm run dev
```

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` to your separate Supabase project's URL and public publishable key. Never use a service-role key in the frontend.

## Database setup

Run `schema.sql` once in the separate SubVault project's SQL editor. It creates only `subvault_vaults` and `subvault_save`. Reads require authentication and are restricted to the row's owner using RLS. The RPC takes ownership from `auth.uid()`, validates the revision, and atomically saves inventory. An expired sold account remains in revenue calculations.

Credentials are stored in the authenticated user's JSONB vault. No account passwords are persisted in browser localStorage. Supabase persists the login session locally. The database administrator can access stored credentials; this implementation does not provide end-to-end encryption.

## Authentication

The sign-in page supports email magic links and existing email/password users. In Supabase Authentication → URL Configuration set Site URL to the deployed Render URL and add that URL and `http://localhost:5173` to Redirect URLs. Email delivery uses the project's configured Auth email service; configure custom SMTP for reliable production delivery. Each authenticated user gets a separate empty vault. No demo credentials are seeded.

## Deploy to Render

Create a separate static site from this repository. Build command: `npm ci && npm run build`. Publish directory: `dist`. Add both environment variables from `environment.example`. Add a rewrite from `/*` to `/index.html`. `render.yaml` contains the equivalent Blueprint definition. Do not upload `.env`, database passwords, or service-role keys.

## Data contracts

Service:
```json
{"id":"uuid","name":"Service name","emoji":"📦"}
```
Account:
```json
{"id":"uuid","serviceId":"uuid","status":"fresh","email":"login ID","password":"credential","purchaseDate":"2026-11-17","durationDays":30,"expiryDate":"2026-12-17","notes":"","platform":"","listedAt":null,"customerName":null,"soldPrice":null,"soldAt":null}
```
Status: `fresh | listed | sold`. Selling prices are USD gross revenue. Returning an account to Fresh or Listed clears its sale metadata. Expiry does not remove revenue. Accounts are sorted by expiry. A vault contains `services`, `accounts`, and `recentPlatforms` arrays.

## Persistence API

The app uses Supabase directly rather than a custom REST server:

- Load: `GET /rest/v1/subvault_vaults?select=payload,revision` with authenticated JWT; RLS restricts ownership.
- Atomic create/update: `POST /rest/v1/rpc/subvault_save` with `{vault_payload, expected_revision}`. Returns new revision. Includes bulk inventory updates.
- Supabase Auth manages sign-in and sessions.

A future server can map `GET/POST /api/services`, `GET/POST/PUT/DELETE /api/accounts`, and `POST /api/accounts/bulk` onto the same data contracts. Those custom endpoints are not implemented here.

## Validation

`npm run build`, `npm run lint`, `npm test`. Browser workflow checks should include creating a service, adding an account, Fresh → Sold, refunds, bulk import, analytics, and reload persistence. Never use real account credentials in automated tests. Concurrent writes fail with a visible conflict rather than silently overwriting another device. Failed saves retain data in memory, offer a backup download, and block sign-out until resolved. Wait for “All changes saved” before closing.
