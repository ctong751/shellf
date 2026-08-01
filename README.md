# Shellf

Shellf is a small AT Protocol app built with TanStack Start and deployed on
Cloudflare Workers. It currently demonstrates browser-managed OAuth and displays
the signed-in user's Bluesky profile.

## Stack

- [TanStack Start](https://tanstack.com/start)
- [AT Protocol OAuth](https://atproto.com/guides/about-oauth)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- React and TypeScript

## Requirements

- Node.js 22 or newer
- npm
- A Cloudflare account for deployment

## Local development

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:3000`. AT Protocol's localhost OAuth profile requires a
loopback IP, so the development server intentionally binds to `127.0.0.1` rather
than `localhost` or a LAN address.

The browser OAuth client stores sessions and DPoP keys in IndexedDB. Shellf never
receives the user's password.

## Quality checks

```bash
npm run check
npm run build
npm run deploy:dry-run
```

`npm run check` runs formatting, linting, type checking, and tests. Pull requests
and pushes to `main` run the same checks in GitHub Actions.

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

No secrets or Cloudflare storage bindings are required for the current
browser-managed OAuth flow. If Shellf later needs server-side sessions, move OAuth
behind a backend-for-frontend and store session state in an appropriate Cloudflare
binding.

## HTTPS development and private-network previews

AT Protocol client IDs cannot use custom HTTPS ports. If a development app is
served from an HTTPS URL containing a port, deploy the metadata-only preview
Worker and point the app at its public client ID.

Deploy it with the app's exact redirect URI:

```bash
npm run deploy:oauth-preview -- \
  --var OAUTH_REDIRECT_URI:https://your-dev-host.example:3003/
```

Then start the app with the deployed metadata URL:

```bash
VITE_ATPROTO_CLIENT_ID=https://your-worker.workers.dev/oauth-client-metadata.json \
VITE_HMR_HOST=your-dev-host.example \
VITE_HMR_CLIENT_PORT=3003 \
npm run dev -- --port 3004
```

The preview Worker accepts versioned paths such as
`/oauth-client-metadata-v2.json`. Use a new suffix when changing declared scopes
so authorization servers do not reuse metadata cached under an older client ID.
Only the OAuth metadata Worker is public; the application can remain private.

## OAuth permissions

Shellf requests only the base AT Protocol identity scope and the Bluesky AppView
permission required to read the signed-in user's profile:

```text
atproto rpc:app.bsky.actor.getProfile?aud=did:web:api.bsky.app#bsky_appview
```

Keep the `#` literal in metadata and application code. The OAuth client encodes it
once when serializing the authorization request. A regression test protects this
boundary.

## Project structure

```text
src/lib/atproto.client.ts              Browser OAuth and profile loading
src/lib/oauth-metadata.ts              Shared client metadata builder
src/routes/oauth-client-metadata[.]json.ts  Production metadata endpoint
src/oauth-preview-worker.ts            Metadata-only preview Worker
wrangler.jsonc                         Main application Worker
wrangler.oauth.jsonc                   Preview metadata Worker
```

## Contributing and security

See [CONTRIBUTING.md](CONTRIBUTING.md) for the development workflow. Report
vulnerabilities privately as described in [SECURITY.md](SECURITY.md).

## License

Shellf is available under the [MIT License](LICENSE).
