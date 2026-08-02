# Contributing to Shellf

Thanks for helping improve Shellf.

## Development

1. Install Node.js 22 or newer and Docker.
2. Run `npm install`.
3. Copy `.env.example` to `.env` and fill in values.
4. Run `npm run dev` to start Postgres, apply migrations, and start the app.
5. Open `http://127.0.0.1:3000`.

Postgres stays running when the app stops. Run `npm run db:down` when you no
longer need it. Use `npm run dev:app` to start only the app process.

Before opening a pull request, run:

```bash
npm run check
npm run build
npm run deploy:dry-run
```

Generated files such as `src/routeTree.gen.ts` and the Wrangler type declarations
are committed. Regenerate Cloudflare types with `npm run cf-typegen` after changing
bindings.

## Pull requests

Keep changes focused, explain the user-facing effect, and include tests for OAuth
metadata or authorization changes. Never commit `.env` files, credentials, account
IDs, or private hostnames.

For security issues, follow [SECURITY.md](SECURITY.md) instead of opening a public
issue.
