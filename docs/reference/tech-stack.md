# Tech Stack - LAPSloop MVP

## Frontend/Backend
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Server Components + Server Actions (NOT REST APIs where possible)

## Database
- PostgreSQL (Railway)
- Prisma ORM

## AI
- OpenAI API (GPT-4o model)
- Direct API calls (no LangChain)

## Deployment
- Vercel (frontend + API routes)
- Railway (database)

## What We DON'T Use (MVP)
- ❌ NextAuth/authentication (no auth for MVP)
- ❌ S3/file storage (no files)
- ❌ Docker (local development)
- ❌ LangChain/LangGraph (simple orchestration)
