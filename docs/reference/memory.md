# Project Memory - LAPSloop

## Current Phase
MVP - Week 1-2: Building core features

## Architecture Context (Reference ADRs)
- Next.js App Router + Server Actions (ADR-001)
- PostgreSQL via Railway (ADR-002)
- No full auth system (ADR-003)
- Direct OpenAI API calls (ADR-004)
- Simple password protection for admin routes (ADR-005)

## Current Working State
**Status:** Milestone 0 - Project setup completed
**Last Milestone:** Milestone 0 (setup)
**Next Milestone:** Milestone 1 (database setup)

## Tables in Use
- surveys (title, audience, hypothesis, questions, completion_code)
- responses (survey_id, answers, prolific_pid)
- analyses (survey_id, signal_strength, pain_frequency, key_quotes, etc.)

## Common Patterns
- Server Actions in app/actions/ for mutations
- OpenAI client in lib/ai/openai.ts
- Prisma client singleton in lib/db/prisma.ts
- AI prompts in lib/ai/prompts.ts

## Current Pitfalls to Avoid
- Don't add full auth system (just simple password for MVP)
- Simple password protects admin routes ONLY, survey forms stay public
- Don't use REST API routes (use Server Actions)
- Remember: Railway Postgres, not SQLite
- OpenAI model is "gpt-4o" (not gpt-4-turbo)
- Password stored in ADMIN_PASSWORD env var (add to Vercel settings)

## OpenAI Usage Patterns
- Model: "gpt-4o"
- Question generation: temp 0.7
- Question critique: temp 0.3
- Pain analysis: temp 0.3
- Always wrap in try/catch
- Log token usage for cost tracking
