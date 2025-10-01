# LAPSloop MVP Implementation Plan

**Version:** 1.0
**Timeline:** 2 weeks (10 working days)
**Approach:** Milestone-based with checkpoints

---

## Overview

This plan implements the **LAPSloop MVP PRD** through 8 milestones. Each milestone is a stable checkpoint where you can commit and pause.

### Implementation Strategy

- **Stack:** Next.js 14, React 18, TypeScript, Tailwind CSS, PostgreSQL, OpenAI API
- **Database:** PostgreSQL (Railway) from day 1
- **Deployment:** Vercel
- **Auth:** None (or simple password)
- **Testing:** Manual testing + build/lint validation
- **Git:** Commit after each milestone

### Reference Documentation System

Following Trustie Website best practices, create these files FIRST:

```
lapsloop/
├── docs/
│   ├── reference/
│   │   ├── data-model.md          ← Create in Milestone 0
│   │   ├── tech-stack.md          ← Create in Milestone 0
│   │   ├── architecture-decisions.md  ← Create in Milestone 0
│   │   └── memory.md              ← Create in Milestone 0
│   ├── best-practices/
│   │   └── effective-llm-usage.md ← Copy from Trustie Website
│   └── PRD.md
├── CLAUDE.md                       ← Update in Milestone 0
└── app/
```

---

## Milestone 0: Project Setup & Documentation (2-3 hours)

**Goal:** Clean project structure with reference docs

### Tasks

- [x] **0.1: Initialize Next.js Project**
  ```bash
  npx create-next-app@latest lapsloop --typescript --tailwind --app --no-src-dir
  cd lapsloop
  git init
  ```
  - Select: TypeScript (yes), ESLint (yes), Tailwind (yes), App Router (yes)
  - Commit: `chore: initialize Next.js project`

- [x] **0.2: Install Dependencies**
  ```bash
  npm install openai zod @prisma/client
  npm install -D prisma
  ```
  - Create `.env.local`:
    ```
    DATABASE_URL="postgresql://..."
    OPENAI_API_KEY="sk-..."
    NEXT_PUBLIC_APP_URL="http://localhost:3000"
    ```
  - Add `.env*.local` to `.gitignore`
  - Commit: `chore: install dependencies`

- [x] **0.3: Initialize Prisma**
  ```bash
  npx prisma init
  ```
  - Update `prisma/schema.prisma` with database URL
  - Commit: `chore: initialize Prisma`

- [x] **0.4: Create Directory Structure**
  ```bash
  mkdir -p docs/{reference,best-practices}
  mkdir -p app/api/surveys
  mkdir -p lib/{ai,db,utils}
  ```
  - Commit: `chore: create directory structure`

- [x] **0.5: Create docs/reference/tech-stack.md**
  ```markdown
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
  ```
  - Commit: `docs: add tech stack reference`

- [x] **0.6: Create docs/reference/data-model.md**
  ```markdown
  # Data Model - LAPSloop MVP

  ## Database: PostgreSQL (Prisma)

  ### Tables

  #### surveys
  - id: String @id @default(uuid())
  - title: String
  - audience: String (textarea content)
  - hypothesis: String (textarea content)
  - questions: Json (array of {text, momTestScore, issues})
  - completionCode: String @unique (e.g., "LAPS-ABC123")
  - createdAt: DateTime @default(now())

  #### responses
  - id: String @id @default(uuid())
  - surveyId: String (foreign key)
  - answers: Json (array of {question, answer})
  - prolificPid: String? (optional)
  - completedAt: DateTime @default(now())

  #### analyses
  - id: String @id @default(uuid())
  - surveyId: String (foreign key, unique)
  - signalStrength: String (enum: "strong", "weak", "none")
  - painFrequency: Int (0-100)
  - painIntensity: String (enum: "high", "medium", "low")
  - keyQuotes: Json (array of strings)
  - currentWorkarounds: Json (array of strings)
  - recommendation: String
  - confidence: String (enum: "high", "medium", "low")
  - reasoning: String
  - createdAt: DateTime @default(now())

  ## Common Patterns
  - All IDs are UUIDs (Prisma @default(uuid()))
  - JSON fields for flexible arrays/objects
  - Dates are DateTime (Prisma @default(now()))
  - Foreign keys use String type (UUID references)
  ```
  - Commit: `docs: add data model reference`

- [x] **0.7: Create docs/reference/architecture-decisions.md**
  ```markdown
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
  ```
  - Commit: `docs: add architecture decisions`

- [x] **0.8: Create docs/reference/memory.md**
  ```markdown
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
  **Status:** Project setup
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
  ```
  - Commit: `docs: add project memory`

- [x] **0.9: Copy Best Practices from Trustie Website**
  - Copy effective-llm-usage.md from Trustie Website to docs/best-practices/
  - Path: `/Users/gerard/GitHub/Trustie Website/trustie-website/docs/best-practices/effective-llm-usage.md`
  - If path doesn't exist, skip this task (not critical for MVP)
  - Commit: `docs: add LLM best practices` (if copied)

- [x] **0.10: Create/Update CLAUDE.md**
  ```markdown
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
  ```
  - Commit: `docs: update CLAUDE.md`

**✋ CHECKPOINT: Setup Complete**
- All reference docs created
- Dependencies installed
- CLAUDE.md configured
- Ready for database setup

---

## Milestone 1: Database Schema & Prisma (1-2 hours)

**Goal:** Working database with Prisma schema

### Tasks

- [x] **1.1: Create Prisma Schema**
  - Edit `prisma/schema.prisma` with surveys, responses, analyses tables
  - Reference: docs/reference/data-model.md for exact schema
  - Commit: `db: create Prisma schema`

- [x] **1.2: Create Prisma Client Singleton**
  - Create `lib/db/prisma.ts`:
  ```typescript
  import { PrismaClient } from '@prisma/client'

  const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
  }

  export const prisma = globalForPrisma.prisma ?? new PrismaClient()

  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
  ```
  - Commit: `db: add Prisma client singleton`

- [x] **1.3: Push Schema to Railway**
  ```bash
  npx prisma db push
  ```
  - Verify tables created in Railway dashboard
  - Commit: `db: push initial schema`

- [x] **1.4: Generate Prisma Client**
  ```bash
  npx prisma generate
  ```
  - Commit: `db: generate Prisma client`

- [x] **1.5: Create TypeScript Types**
  - Create `lib/types.ts` with interfaces matching Prisma models
  - Add helper types (SurveyWithResponses, etc.)
  - Commit: `types: add TypeScript interfaces`

- [x] **1.6: Test Database Connection**
  - Create `scripts/test-db.ts`:
  ```typescript
  import { prisma } from '@/lib/db/prisma'

  async function main() {
    const count = await prisma.survey.count()
    console.log('Database connected. Survey count:', count)
  }

  main()
  ```
  - Run: `npx tsx scripts/test-db.ts`
  - Commit: `scripts: add database test`

**✋ CHECKPOINT: Database Working**
- Prisma schema pushed to Railway
- Can query database successfully
- TypeScript types defined

---

## Milestone 2: OpenAI Integration & Prompts (2-3 hours)

**Goal:** Working OpenAI integration with prompts

### Tasks

- [x] **2.1: Create OpenAI Client**
  - Create `lib/ai/openai.ts`:
  ```typescript
  import OpenAI from 'openai'

  export const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  })
  ```
  - Commit: `ai: create OpenAI client`

- [x] **2.2: Create Prompt Templates**
  - Create `lib/ai/prompts.ts` with:
    - `QUESTION_GENERATOR_PROMPT`
    - `QUESTION_CRITIC_PROMPT`
    - `PAIN_ANALYZER_PROMPT`
  - Reference PRD for exact prompts
  - Commit: `ai: add prompt templates`

- [x] **2.3: Create Question Generator**
  - Create `lib/ai/generateQuestions.ts`:
  ```typescript
  export async function generateQuestions(
    audience: string,
    hypothesis: string
  ): Promise<Question[]>
  ```
  - Uses openai.chat.completions.create()
  - Parses JSON response
  - Returns array of questions with scores
  - Commit: `ai: implement question generator`

- [x] **2.4: Create Question Critic**
  - Create `lib/ai/critiqueQuestions.ts`:
  ```typescript
  export async function critiqueQuestions(
    questions: Question[]
  ): Promise<QuestionWithFeedback[]>
  ```
  - Analyzes each question
  - Returns scores and issues
  - Commit: `ai: implement question critic`

- [x] **2.5: Create Pain Analyzer**
  - Create `lib/ai/analyzePain.ts`:
  ```typescript
  export async function analyzePainSignals(
    responses: Response[]
  ): Promise<Analysis>
  ```
  - Analyzes 50+ responses
  - Returns signal strength, frequency, quotes
  - Commit: `ai: implement pain analyzer`

- [x] **2.6: Test AI Functions**
  - Create `scripts/test-ai.ts`
  - Test question generation with sample data
  - Test critique with sample questions
  - Verify output format matches expectations
  - Run: `npx tsx scripts/test-ai.ts`
  - Commit: `scripts: test AI functions`

**✋ CHECKPOINT: AI Integration Working**
- Can generate questions via OpenAI
- Can critique questions
- Pain analyzer implemented
- Tested with sample data

---

## Milestone 3: Server Actions (2 hours)

**Goal:** Server Actions for all data mutations

### Tasks

- [x] **3.1: Create Survey Actions**
  - Create `app/actions/surveys.ts`:
  ```typescript
  'use server'
  export async function createSurvey(data: CreateSurveyInput)
  export async function getSurveys()
  export async function getSurveyById(id: string)
  ```
  - Commit: `actions: add survey actions`

- [x] **3.2: Create Response Actions**
  - Create `app/actions/responses.ts`:
  ```typescript
  'use server'
  export async function submitResponse(surveyId: string, answers: Answer[])
  export async function getResponses(surveyId: string)
  export async function exportResponsesCSV(surveyId: string)
  ```
  - Commit: `actions: add response actions`

- [x] **3.3: Create Analysis Actions**
  - Create `app/actions/analysis.ts`:
  ```typescript
  'use server'
  export async function analyzeSurvey(surveyId: string)
  export async function getAnalysis(surveyId: string)
  ```
  - Calls `analyzePainSignals()` from lib/ai/
  - Saves to database
  - Commit: `actions: add analysis actions`

- [x] **3.4: Add Zod Validation**
  - Install zod: `npm install zod`
  - Create `lib/validation/schemas.ts`
  - Add validation schemas for all inputs
  - Use in Server Actions
  - Commit: `validation: add Zod schemas`

**✋ CHECKPOINT: Server Actions Complete**
- All data operations have Server Actions
- Zod validation on inputs
- Ready for frontend integration

---

## Milestone 4: Admin Dashboard & Survey Creation (3-4 hours)

**Goal:** Working UI for survey creation

### Tasks

- [x] **4.1: Create Dashboard Page**
  - Create `app/page.tsx` (homepage)
  - Shows list of surveys
  - "Create New Survey" button
  - Commit: `ui: add dashboard page`

- [x] **4.2: Create Survey Creation Form**
  - Create `app/surveys/new/page.tsx`
  - Form fields: title, audience, hypothesis
  - "Generate Questions" button
  - Commit: `ui: add survey creation form`

- [x] **4.3: Question Review Component**
  - Create `components/QuestionReview.tsx`
  - Shows generated questions with scores
  - Edit button for each question
  - "Regenerate This Question" button
  - "Create Survey" button
  - Commit: `ui: add question review component`

- [x] **4.4: Survey Created Success Page**
  - Create `app/surveys/[id]/created/page.tsx`
  - Shows survey URL
  - Shows completion code
  - Copy buttons
  - Link to survey detail page
  - Commit: `ui: add survey success page`

- [x] **4.5: Survey Detail Page**
  - Create `app/surveys/[id]/page.tsx`
  - Shows survey info
  - Shows response count
  - "Export CSV" button
  - "Analyze Pain Signals" button (if ≥30 responses)
  - Shows analysis results (if exists)
  - Commit: `ui: add survey detail page`

- [x] **4.6: Connect Form to Server Actions**
  - Wire up form submission
  - Add loading states
  - Add error handling
  - Test end-to-end flow
  - Commit: `ui: connect survey creation flow`

**✋ CHECKPOINT: Admin UI Working**
- Can create surveys through UI
- Questions generate and display
- Can navigate to survey details

---

## Milestone 5: Public Survey Form (2 hours)

**Goal:** Working survey form for participants

### Tasks

- [x] **5.1: Create Survey Form Page**
  - Create `app/survey/[id]/page.tsx`
  - Fetch survey by ID
  - Display title and questions
  - Text areas for answers (min 50 chars)
  - Submit button
  - Commit: `ui: add public survey form`

- [x] **5.2: Create Completion Page**
  - Create `app/survey/[id]/complete/page.tsx`
  - Shows "Thank you" message
  - Shows completion code (large, copyable)
  - Instructions to return to Prolific
  - Commit: `ui: add completion page`

- [x] **5.3: Add Answer Validation**
  - Validate min 50 characters per answer
  - Show character count
  - Disable submit until all valid
  - Commit: `ui: add answer validation`

- [x] **5.4: Connect to Response Actions**
  - Wire up form submission
  - Call submitResponse() Server Action
  - Redirect to completion page
  - Commit: `ui: connect survey submission`

- [x] **5.5: Test on Mobile**
  - Test responsive design
  - Test form submission
  - Test character count
  - Fix any mobile issues
  - Commit: `ui: mobile responsive fixes`

**✋ CHECKPOINT: Survey Form Working**
- Participants can access survey
- Can submit responses
- Completion code displays
- Works on mobile

---

## Milestone 6: Response Viewing & Export (1-2 hours)

**Goal:** Admin can view and export responses

### Tasks

- [x] **6.1: Add Response List Component**
  - Create `components/ResponseList.tsx`
  - Shows responses with timestamps
  - Expandable to see answers
  - Commit: `ui: add response list component`

- [x] **6.2: Add to Survey Detail Page**
  - Show response count
  - "View Responses" toggle
  - Integrate ResponseList component
  - Commit: `ui: integrate response list`

- [x] **6.3: Implement CSV Export**
  - Update exportResponsesCSV() action
  - Generate CSV with proper headers
  - Trigger download from browser
  - Commit: `feat: implement CSV export`

- [x] **6.4: Test Export**
  - Create test responses
  - Export to CSV
  - Open in Excel/Google Sheets
  - Verify format is correct
  - Commit: `test: verify CSV export`

**✋ CHECKPOINT: Response Management Working**
- Can view responses in dashboard
- Can export to CSV
- CSV format is correct

---

## Milestone 7: Pain Analysis UI (2 hours)

**Goal:** Display pain analysis results beautifully

### Tasks

- [ ] **7.1: Create Analysis Results Component**
  - Create `components/AnalysisResults.tsx`
  - Signal strength badge (color-coded)
  - Pain frequency percentage
  - Pain intensity indicator
  - Key quotes section
  - Current workarounds list
  - Recommendation box
  - Confidence indicator
  - Reasoning text
  - Commit: `ui: add analysis results component`

- [ ] **7.2: Add to Survey Detail Page**
  - Show "Analyze Pain Signals" button when ≥30 responses
  - Show loading state during analysis (30-60s)
  - Display AnalysisResults when complete
  - Commit: `ui: integrate analysis results`

- [ ] **7.3: Add Loading States**
  - Spinner during analysis
  - Progress indicator
  - Disable button during processing
  - Commit: `ui: add analysis loading states`

- [ ] **7.4: Style Results Beautifully**
  - Color code signal strength:
    - Strong: green
    - Weak: yellow
    - None: red
  - Format quotes nicely
  - Make recommendation prominent
  - Commit: `ui: style analysis results`

**✋ CHECKPOINT: Analysis UI Complete**
- Pain analysis displays beautifully
- Loading states work
- Results are readable and actionable

---

## Milestone 8: Polish & Deploy (2.5-3.5 hours)

**Goal:** Production-ready deployment with basic security

### Tasks

- [ ] **8.1: Add Error Handling**
  - Error boundaries
  - Toast notifications for errors
  - Graceful API failure handling
  - Commit: `feat: add error handling`

- [ ] **8.2: Add Loading States**
  - Skeleton loaders
  - Button loading states
  - Page transition indicators
  - Commit: `ui: add loading states`

- [ ] **8.3: Add Simple Password Protection**
  - Create `middleware.ts`:
    ```typescript
    import { NextResponse } from 'next/server'
    import type { NextRequest } from 'next/server'

    export function middleware(request: NextRequest) {
      // Public routes (no password needed)
      if (request.nextUrl.pathname.startsWith('/survey/')) {
        return NextResponse.next()
      }

      // Admin routes (password required)
      const password = request.cookies.get('admin_password')?.value

      if (password !== process.env.ADMIN_PASSWORD) {
        return NextResponse.redirect(new URL('/login', request.url))
      }

      return NextResponse.next()
    }

    export const config = {
      matcher: ['/', '/surveys/:path*']
    }
    ```
  - Create `app/login/page.tsx`:
    - Simple password form
    - Redirect to dashboard on success
  - Create `app/api/auth/login/route.ts`:
    - Validate password against ADMIN_PASSWORD env var
    - Set httpOnly cookie on success (7 days expiry)
  - Add to `.env.local`: `ADMIN_PASSWORD="your-secret-password"`
  - Create `.env.example` with placeholder: `ADMIN_PASSWORD="changeme"`
  - Test: Admin routes require password, survey form (/survey/[id]) is public
  - Commit: `feat: add simple password protection`

- [ ] **8.4: Update README.md**
  ```markdown
  # LAPSloop MVP

  ## Setup
  1. Clone repo
  2. Install dependencies: `npm install`
  3. Set up environment variables (see .env.example)
  4. Push database schema: `npx prisma db push`
  5. Run dev server: `npm run dev`

  ## Environment Variables
  - DATABASE_URL: PostgreSQL connection string (Railway)
  - OPENAI_API_KEY: OpenAI API key
  - NEXT_PUBLIC_APP_URL: App URL (http://localhost:3000 for dev)
  - ADMIN_PASSWORD: Password for admin dashboard (optional for local, required for Vercel)

  ## Usage
  1. Create survey at /surveys/new
  2. Post survey URL to Prolific
  3. View responses at /surveys/[id]
  4. Analyze pain signals when ≥30 responses

  ## Sharing with Colleagues
  The admin dashboard (/, /surveys/*) is password-protected.
  Share the password separately via Slack DM or secure channel.
  Survey links (/survey/[id]) are public and don't require a password.
  ```
  - Commit: `docs: update README`

- [ ] **8.5: Deploy to Vercel**
  - Connect GitHub repo to Vercel
  - Add environment variables (including ADMIN_PASSWORD)
  - Deploy
  - Test production deployment
  - Commit: `deploy: initial Vercel deployment`

- [ ] **8.6: Test Production**
  - Test password protection (admin routes require login)
  - Verify survey form is public (no password)
  - Create test survey
  - Submit test responses
  - Run pain analysis
  - Verify everything works
  - Document any issues in docs/reference/memory.md

- [ ] **8.7: Update memory.md**
  - Document MVP completion
  - Add lessons learned
  - Note any deviations from plan
  - List known issues/limitations
  - Commit: `docs: MVP completion notes`

**✋ CHECKPOINT: MVP Complete**
- Deployed to production (Vercel)
- Password protection enabled for admin routes
- Survey forms remain public
- All core features working
- Documentation complete
- Ready to share with colleagues
- Ready for Trustie validation

---

## Post-MVP: First Validation

### Week 3: Money Moods Feature Validation

- [ ] Create survey for Money Moods feature
- [ ] Post to Prolific (budget: ~£75 for 50 responses)
- [ ] Collect 50 responses
- [ ] Run pain analysis
- [ ] Compare AI analysis to manual human analysis
- [ ] Document accuracy in docs/reference/memory.md

**Success Criteria:**
- AI analysis matches human judgment (>80% agreement)
- AI identifies 2-3 insights humans missed
- Process takes <1 week total

### Month 2-3: Predictive Validation

- [ ] Ship 1 "strong signal" feature identified by LAPSloop
- [ ] Track feature adoption at 30 days
- [ ] Verify: Strong signal → >60% adoption

**Success Criteria:**
- AI correctly predicted feature would succeed
- Adoption exceeds 60% within 30 days

---

## Success Metrics

### Week 2 (MVP Complete)
- ✅ Generate 8 questions in <2 minutes
- ✅ Questions score >80% Mom Test compliance
- ✅ Survey works on mobile
- ✅ Pain analysis runs in <60 seconds
- ✅ Can export responses to CSV
- ✅ Deployed to production (Vercel)

### Week 4 (First Validation)
- ✅ 50 Prolific responses collected
- ✅ AI analysis matches human analysis (>80%)
- ✅ AI provides novel insights

### Month 3 (Predictive Test)
- ✅ "Strong signal" feature has >60% adoption
- ✅ Prediction was accurate

---

## Reference During Implementation

### Every Milestone
- [ ] Read docs/reference/memory.md before starting
- [ ] Update memory.md with progress/learnings
- [ ] Test thoroughly before committing
- [ ] Run `npm run build && npm run lint` before commit
- [ ] Commit with clear message

### When Stuck
1. Stop (don't debug in circles)
2. Commit current work
3. Start fresh Claude session
4. Reference specific ADRs and docs
5. Provide minimal, precise context

### Common Pitfalls (Update as discovered)
- Remember: Postgres not SQLite
- Remember: Server Actions not REST APIs
- Remember: "gpt-4o" not "gpt-4-turbo"
- Remember: Simple password for admin only (don't add full auth)
- Remember: Survey forms (/survey/*) must stay public (no password)
- Remember: Add ADMIN_PASSWORD to Vercel environment variables

---

## Implementation Notes

**Development Environment:**
- Node.js 18+
- Railway account (PostgreSQL)
- OpenAI API key
- Vercel account (deployment)

**Estimated Costs:**
- Railway Postgres: £5/month
- OpenAI API (testing): ~£2-5
- Vercel: Free tier
- Prolific (validation): ~£75 for 50 responses

**Total MVP Cost: ~£15-20 + £75 Prolific**

**Sharing with External Colleagues:**
- Admin dashboard (/, /surveys/*) is password-protected
- Share ADMIN_PASSWORD via Slack DM or secure channel (not email)
- Survey forms (/survey/[id]) remain public (no password needed)
- Good enough for MVP/validation phase with trusted users
- Replace with proper auth before public launch or paying customers

---

*This plan follows Trustie Website best practices: milestone-based, reference-driven, fresh-session-friendly.*