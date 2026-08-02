# Shellf

Shellf is a small AT Protocol app built with TanStack Start and deployed on
Cloudflare Workers. OAuth runs server-side: the Worker holds the DPoP-bound
tokens in Postgres and the browser holds only an opaque session cookie. The
app currently displays the signed-in user's Bluesky profile.

## Stack

- [TanStack Start](https://tanstack.com/start)
- [AT Protocol OAuth](https://atproto.com/guides/about-oauth) via
  `@atproto/oauth-client-node`
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- PostgreSQL with [Drizzle ORM](https://orm.drizzle.team/)
- React and TypeScript

## Requirements

- Node.js 22 or newer
- npm
- Docker (for the local Postgres instance)
- A Cloudflare account for deployment

## Local development

```bash
npm install
cp .env.example .env   # then fill in values
npm run dev            # start Postgres, apply migrations, and start the app
```

Open `http://127.0.0.1:3000`. AT Protocol's loopback OAuth profile requires a
loopback IP in the redirect URI (RFC 8252), so the development server
intentionally binds to `127.0.0.1` rather than `localhost` or a LAN address.
On loopback origins the app uses AT Protocol's unregistered `http://localhost`
development client, so no public metadata is needed for local sign-in.

Postgres stays running across app restarts. Stop it with `npm run db:down`. To
start only the app process, such as when using an external database, run
`npm run dev:app`.

## Database

Vanilla Postgres only — no vendor extensions or serverless drivers, so hosting
stays a connection-string swap. Schema lives in `src/db/schema.ts`; migrations
in `drizzle/`.

```bash
npm run db:up          # start Postgres and wait until it is healthy
npm run db:generate    # create a migration from schema changes
npm run db:migrate     # apply pending migrations
npm run db:studio      # browse data
npm run db:down        # stop the container
```

Current tables are auth-only: `users`, `sessions` (cookie sessions, hashed
tokens), and `oauth_states` / `oauth_sessions` (the OAuth client's state and
token stores).

## Auth flow

1. `startSignIn` (server function) resolves the handle, makes a pushed
   authorization request, and returns the authorization URL.
2. The PDS redirects back to `/oauth/callback`, which exchanges the code,
   upserts the user, and sets an HttpOnly `shellf_session` cookie.
3. `getViewer` loads the viewer from the session cookie for SSR; `signOut`
   revokes tokens and destroys the session.

Two workerd-specific workarounds live in `src/lib/oauth-client.server.ts`
(workerd rejects `redirect: 'error'` in fetch and Request): a fetch wrapper
that emulates it via `redirect: 'manual'`, and a custom DID-document resolver.

## Quality checks

```bash
npm run check
npm run build
npm run deploy:dry-run
```

`npm run check` runs formatting, linting, type checking, and tests. Pull
requests and pushes to `main` run the same checks in GitHub Actions. Checks do
not require the database.

## Cloudflare deployment

Authenticate Wrangler, review the Worker name in `wrangler.jsonc`, and deploy:

```bash
npx wrangler login
npm run deploy:dry-run
npm run deploy
```

The production client ID is the deployed origin plus
`/oauth-client-metadata.json`. A TanStack server route generates that document
from the incoming origin, so it works with either a `workers.dev` hostname or a
custom domain.

Deployed sign-in requires a `DATABASE_URL` secret pointing at a Postgres
instance reachable from Workers. Production database hosting is deliberately
undecided; until it exists, deploys serve the landing page but sign-in will
fail.

## OAuth permissions

Shellf requests only the base AT Protocol identity scope and the Bluesky
AppView permission required to read the signed-in user's profile:

```text
atproto rpc:app.bsky.actor.getProfile?aud=did:web:api.bsky.app#bsky_appview
```

Keep the `#` literal in metadata and application code. The OAuth client encodes
it once when serializing the authorization request. A regression test protects
this boundary.

## Project structure

```text
src/lib/oauth-client.server.ts         Server OAuth client + Drizzle stores
src/lib/session.server.ts              Cookie session helpers
src/lib/auth.ts                        Server functions (sign-in, viewer, sign-out)
src/lib/oauth-metadata.ts              Shared client metadata builder
src/routes/oauth.callback.ts           OAuth callback route
src/routes/oauth-client-metadata[.]json.ts  Production metadata endpoint
src/db/                                Drizzle client and schema
drizzle/                               SQL migrations
wrangler.jsonc                         Main application Worker
```

## Contributing and security

See [CONTRIBUTING.md](CONTRIBUTING.md) for the development workflow. Report
vulnerabilities privately as described in [SECURITY.md](SECURITY.md).

## License

Shellf is available under the [MIT License](LICENSE).
