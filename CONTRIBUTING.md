# Contributing to Shellf

Thanks for helping improve Shellf.

## Development

1. Install Node.js 22 or newer.
2. Run `npm install`.
3. Start the app with `npm run dev`.
4. Open `http://127.0.0.1:3000`.

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
