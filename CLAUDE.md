# LAPSloop Project Context for Claude

## Reference Documentation
Read these files at start of each session:
- docs/reference/data-model.md - Database schemas
- docs/reference/tech-stack.md - Technology stack
- docs/reference/memory.md - Current architecture and active work
- docs/reference/architecture-decisions.md - ADRs
- docs/PRD.md - Product requirements

## Project Patterns
- Use Server Actions for data mutations (NOT REST APIs)
- Prisma for database access
- OpenAI direct API calls (no LangChain)
- No authentication system (single admin user)
- PostgreSQL via Railway (NOT SQLite)

## Common Mistakes to Avoid
- Don't add authentication (ADR-003: no auth for MVP)
- Don't create /api routes (use Server Actions instead)
- Don't use SQLite (we use Postgres from day 1)
- Model name is "gpt-4o" not "gpt-4-turbo"

## When Working on Features
1. Start fresh Claude session
2. Update docs/reference/memory.md with feature context
3. Reference memory.md in first message
4. Use TodoWrite for task tracking
5. Small steps: code → test → commit

## Development Workflow
- Run `npm run dev` for local development
- Run `npx prisma studio` to view database
- Run `npx prisma generate` after schema changes
- Run `npx prisma db push` to sync schema to Railway
