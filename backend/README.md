# PTA System API

NestJS API for the Pivosoft Technology Academy management platform.

## Local setup

1. Copy `.env.example` to `.env` and update the PostgreSQL connection string.
2. Install dependencies with `pnpm install`.
3. Run `pnpm prisma:migrate` and `pnpm prisma:seed`.
4. Start the API with `pnpm start:dev`.

The API is served from `http://localhost:4000/api/v1`. See [docs/api.md](docs/api.md) for the living contract.

## Quality checks

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```
