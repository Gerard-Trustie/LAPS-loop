# Repository Guidelines

## Project Structure & Module Organization
- `app/` hosts the Next.js App Router pages, layouts, and server actions (see `app/actions/*` for data mutations and AI workflows).
- `components/` stores reusable UI built with Tailwind CSS; keep new shared elements here.
- `lib/` contains domain logic (`lib/ai`, `lib/db`, `lib/utils`, `lib/validation`) and should stay framework-agnostic.
- `prisma/` defines the data model and migration history; update `schema.prisma` before running database changes.
- `scripts/` provides local verification utilities such as `test-ai.ts` and `test-db.ts`; `docs/` captures product specs referenced during implementation.

## Build, Test, and Development Commands
- `npm run dev` — start the Next.js dev server with hot reload at `http://localhost:3000`.
- `npm run build` — create an optimized production build; run before deployment or major refactors.
- `npm run start` — serve the production build locally for smoke checks.
- `npm run lint` — execute the ESLint suite configured by `eslint-config-next`.
- `npx tsx scripts/test-ai.ts` — exercise AI question generation/critique; expect an average score ≥ 80.
- `npx tsx scripts/test-db.ts` — validate Prisma connectivity and schema alignment with your `.env.local`.

## Coding Style & Naming Conventions
- Use TypeScript with ES2020 modules, two-space indentation, and prefer async/await over promise chains.
- Components stay in PascalCase files (e.g., `ResponseList.tsx`); hooks and helpers use camelCase.
- Tailwind utility classes drive layout; add shared styles to `app/globals.css` sparingly.
- Keep business logic in `lib/*` and call it from server actions or route handlers to preserve separation of concerns.

## Testing Guidelines
- Include lint and the relevant `scripts/test-*.ts` command outputs in every PR description.
- Add focused unit helpers in `app/actions/test-helpers.ts` and mirror their naming when creating new fixtures.
- Favor deterministic fixtures so AI-related checks remain reproducible; document any non-deterministic behaviour in the PR.

## Commit & Pull Request Guidelines
- Follow the existing pattern: `<type>: <description>` (`feat`, `fix`, `chore`, `test`, `ui`, etc.) and keep scope under 72 characters; optional milestone tags like `[M7]` sit before the type.
- Group related changes per commit and reference issues with `#id` when applicable.
- PRs should include a concise summary, testing evidence, configuration notes (env vars, migrations), and UI screenshots for visible changes.

## Security & Configuration Tips
- Store secrets in `.env.local`; required keys include `OPENAI_API_KEY`, `DATABASE_URL`, and `NEXT_PUBLIC_APP_URL` for link generation.
- Run `npx prisma migrate dev` after schema changes and review generated SQL before applying in shared environments.
- Never commit `.env*` files or raw survey data; redact any sensitive payloads in logs and discussions.
