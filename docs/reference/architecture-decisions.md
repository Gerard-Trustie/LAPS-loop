# Architecture Decision Records - LAPSloop

## ADR-001: Next.js App Router with Server Actions
**Date:** 2025-09-30
**Status:** Active

**Decision:** Use Next.js App Router with Server Actions for data mutations

**Rationale:**
- Simpler than REST API routes
- Type-safe client-server communication
- Reduces boilerplate

**Consequences:**
- Data mutations in app/actions/
- API routes only for external access (if needed)

---

## ADR-002: PostgreSQL from Day 1 (No SQLite)
**Date:** 2025-09-30
**Status:** Active

**Decision:** Use PostgreSQL via Railway from start

**Rationale:**
- Easier AWS migration later
- No SQLite→Postgres migration needed
- Minimal setup time with Railway
- ~£5/month cost acceptable

**Alternatives Considered:**
- SQLite: Would need migration in 2-4 weeks

---

## ADR-003: No Authentication for MVP
**Date:** 2025-09-30
**Status:** Active (MVP only)

**Decision:** No login/auth system for MVP

**Rationale:**
- Single admin user (you)
- Adds 3-7 days development time
- Zero user value for validation
- Can add later in 1-2 days

**Future:** Add NextAuth + simple password or Cognito after validation

---

## ADR-004: Direct OpenAI API Calls
**Date:** 2025-09-30
**Status:** Active

**Decision:** Direct OpenAI API calls, no LangChain

**Rationale:**
- Workflow is linear (no complex orchestration)
- Easier to debug
- Faster to implement
- Full control over prompts

**Future:** May need LangChain/LangGraph for multi-agent features

---

## ADR-005: Simple Password Protection for External Sharing
**Date:** 2025-09-30
**Status:** Active (MVP only)

**Decision:** Add simple password protection for admin routes only

**Context:** Need to share Vercel deployment with external colleagues

**Rationale:**
- Vercel deployments are public by default (anyone with URL can access)
- Survey data contains sensitive Trustie feature research
- Full auth system adds 3-7 days (too slow for MVP)
- Simple password protection takes 30 minutes
- Good enough for trusted colleagues

**Implementation:**
- Middleware checks for password cookie on admin routes
- Admin routes protected: /, /surveys/*
- Survey form routes public: /survey/[id] (needed for Prolific)
- Password stored in ADMIN_PASSWORD environment variable
- Cookie-based session (7 days expiry)

**Security Level:**
- Protects against casual/accidental access
- NOT secure against determined attackers
- Acceptable for MVP with trusted users
- NOT acceptable for public launch or paying customers

**Future:** Replace with NextAuth + proper user accounts after validation succeeds

**Alternatives Considered:**
- No auth: Too risky for external sharing (URLs leak easily)
- Vercel password protection: Costs $20/month, protects survey forms too
- HTTP Basic Auth: Poor UX, can't customize login page
