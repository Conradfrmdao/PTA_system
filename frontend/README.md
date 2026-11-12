# PTA System Web

Next.js frontend for the Pivosoft Technology Academy management platform.

## Local setup

1. Copy `.env.example` to `.env.local`.
2. Install dependencies with `pnpm install`.
3. Start the app with `pnpm dev`.

The frontend runs at `http://localhost:3000` and consumes the API configured through `NEXT_PUBLIC_API_URL`.

## Quality checks

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```
