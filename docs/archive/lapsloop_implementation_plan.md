# LAPSloop Implementation Plan

**Version:** 1.0  
**Last Updated:** September 30, 2025  
**Status:** Ready for Implementation

---

## Overview

This plan implements the **LAPSloop Product Requirements Document** through 7 distinct phases. Phase 1 is detailed for immediate implementation; Phases 2-7 are summarized for future planning.

### Implementation Strategy

- **Database:** SQLite (Phase 1) → PostgreSQL (Phase 2+)
- **Deployment:** Local development (Phase 1) → Cloud deployment (Phase 3+)
- **Testing:** Unit tests for core functions, manual verification
- **Timeline:** ~2 weeks for Phase 1, then iterative releases
- **Developer:** Solo developer with LLM assistance

### Milestone Checkpoints ✋

This plan includes **pause points** where you can commit, test, and resume later. Each checkpoint is a stable state.

---

## Reference Documentation System

### Create These Files FIRST (Before Phase 1 Implementation)

These reference documents will be read and updated throughout implementation.

#### 📁 Initial Directory Structure
```
lapsloop/
├── docs/
│   ├── reference/
│   │   ├── data-model.md          ← Create in Milestone 0
│   │   ├── tech-stack.md          ← Create in Milestone 0
│   │   ├── architecture-decisions.md  ← Create in Milestone 0
│   │   └── memory.md              ← Create in Milestone 0
│   └── implementation-plan.md     ← This file
├── src/
├── tests/
└── CLAUDE.md                      ← Update in Milestone 0
```

---

# Phase 1: Question Generator + Critic (DETAILED)

**Duration:** 2 weeks  
**Deliverable:** Working Mom Test question generator with AI critique  
**Success Criteria:** Generate 8 questions with >80% Mom Test compliance in <2 minutes

---

## Milestone 0: Project Setup & Documentation Foundation

**Estimated Time:** 2-3 hours  
**Goal:** Create clean project structure and reference documentation

### Tasks

- [ ] **0.1: Initialize Project**
  ```bash
  mkdir lapsloop && cd lapsloop
  git init
  echo "node_modules/" > .gitignore
  echo ".env*" >> .gitignore
  echo "dist/" >> .gitignore
  npm init -y
  ```
  - Update package.json name to "lapsloop"
  - Add description from PRD
  - Commit: "chore: initialize project"

- [ ] **0.2: Create Directory Structure**
  ```bash
  mkdir -p src/{agents,services,models,utils}
  mkdir -p tests/{unit,integration}
  mkdir -p docs/reference
  touch src/server.ts
  ```
  - Commit: "chore: create directory structure"

- [ ] **0.3: Install Core Dependencies**
  ```bash
  npm install express cors openai zod dotenv sqlite3
  npm install -D typescript @types/express @types/cors @types/node tsx
  npm install -D @types/better-sqlite3 better-sqlite3
  ```
  - Create `tsconfig.json` (see tech stack)
  - Create `.env.example` with OPENAI_API_KEY placeholder
  - Commit: "chore: install dependencies and configure TypeScript"

- [ ] **0.4: Create docs/reference/tech-stack.md**
  ```markdown
  # Tech Stack - LAPSloop Phase 1
  
  ## Backend
  - Node.js 18+
  - TypeScript 5.3+
  - Express.js (API server)
  - Better-SQLite3 (database)
  
  ## AI
  - OpenAI API (GPT-4o model)
  - Direct API calls (NO LangChain/LangGraph in Phase 1)
  
  ## Frontend (Phase 1)
  - React 18
  - TypeScript
  - Tailwind CSS
  - Vite (build tool)
  
  ## What We DON'T Use (Phase 1)
  - ❌ LangChain/LangGraph (simple orchestration instead)
  - ❌ PostgreSQL (using SQLite for MVP)
  - ❌ Docker (local development only)
  - ❌ REST framework (plain Express)
  
  ## Development Tools
  - tsx (TypeScript execution)
  - Jest (testing)
  - ESLint (linting)
  ```
  - Commit: "docs: add tech stack reference"

- [ ] **0.5: Create docs/reference/data-model.md**
  ```markdown
  # Data Model - LAPSloop Phase 1
  
  ## Database: SQLite
  
  ### Tables
  
  #### research_projects
  - id: TEXT PRIMARY KEY (UUID)
  - user_id: TEXT (for future auth)
  - name: TEXT
  - audience: TEXT (target audience description)
  - problem_hypothesis: TEXT
  - status: TEXT ('draft', 'listening', 'analysing', 'completed')
  - created_at: TEXT (ISO 8601)
  - updated_at: TEXT (ISO 8601)
  
  #### questions
  - id: TEXT PRIMARY KEY (UUID)
  - project_id: TEXT (foreign key to research_projects.id)
  - text: TEXT (the question)
  - mom_test_score: REAL (0.0 to 1.0)
  - version: INTEGER (for iteration tracking)
  - created_at: TEXT (ISO 8601)
  
  #### question_issues
  - id: TEXT PRIMARY KEY (UUID)
  - question_id: TEXT (foreign key to questions.id)
  - issue_type: TEXT ('hypothetical', 'leading', 'vague')
  - description: TEXT
  - created_at: TEXT (ISO 8601)
  
  #### question_suggestions
  - id: TEXT PRIMARY KEY (UUID)
  - question_id: TEXT (foreign key to questions.id)
  - suggestion: TEXT
  - created_at: TEXT (ISO 8601)
  
  #### critiques
  - id: TEXT PRIMARY KEY (UUID)
  - project_id: TEXT (foreign key to research_projects.id)
  - overall_score: REAL (0.0 to 1.0)
  - recommendations: TEXT (JSON array)
  - created_at: TEXT (ISO 8601)
  
  ## Common Mistakes to Avoid
  - Table names are lowercase with underscores
  - All IDs are UUIDs as TEXT (not INTEGER)
  - Dates are ISO 8601 strings (not timestamps)
  - JSON data stored as TEXT (parse on retrieval)
  ```
  - Commit: "docs: add data model reference"

- [ ] **0.6: Create docs/reference/architecture-decisions.md**
  ```markdown
  # Architecture Decision Records - LAPSloop
  
  ## ADR-001: Use SQLite for Phase 1 MVP
  **Date:** 2025-09-30  
  **Status:** Active (Phase 1 only)
  
  **Context:** Need database for storing questions and project data
  
  **Decision:** Use SQLite with better-sqlite3
  
  **Rationale:**
  - Zero setup time (no Docker/cloud needed)
  - Perfect for single-user local development
  - Easy to migrate to PostgreSQL in Phase 2
  - Synchronous API simplifies code
  
  **Consequences:**
  - Must migrate to PostgreSQL before multi-user deployment
  - No concurrent write support (fine for single user)
  - Migration plan needed for Phase 2
  
  ---
  
  ## ADR-002: Direct OpenAI API Calls (No LangChain)
  **Date:** 2025-09-30  
  **Status:** Active
  
  **Context:** Need to orchestrate AI agents for question generation and critique
  
  **Decision:** Use direct OpenAI API calls with simple TypeScript orchestration
  
  **Rationale:**
  - Workflow is linear and predictable
  - Frequent human-in-the-loop decision points
  - Learning TypeScript is priority (no framework overhead)
  - Need to ship fast (< 2 weeks)
  - Easy to understand and debug
  
  **Alternatives Considered:**
  - LangChain: Too much abstraction, harder debugging
  - LangGraph: Overkill for sequential workflow
  
  **Consequences:**
  - May need LangGraph in Phase 5+ for multi-agent features
  - Will create our own BaseAgent abstraction as needed
  - Full control over prompts and error handling
  
  ---
  
  ## ADR-003: Milestone-Based Implementation
  **Date:** 2025-09-30  
  **Status:** Active
  
  **Context:** Solo developer learning TypeScript, working with LLM assistant
  
  **Decision:** Break Phase 1 into 7 milestones with clear pause points
  
  **Rationale:**
  - Can commit and pause at any milestone
  - Each milestone is independently testable
  - Reduces context drift in LLM conversations
  - Easier to debug (know what changed)
  
  **Consequences:**
  - More commits (good for learning)
  - Clear rollback points if something breaks
  - Can resume work after days/weeks
  ```
  - Commit: "docs: add architecture decisions"

- [ ] **0.7: Create docs/reference/memory.md**
  ```markdown
  # Project Memory - LAPSloop
  
  ## Current Phase: Phase 1 - Question Generator + Critic
  
  ## Architecture Decisions (Reference ADRs)
  - Database: SQLite (ADR-001)
  - AI Orchestration: Direct API calls (ADR-002)
  - Implementation: Milestone-based (ADR-003)
  
  ## Current Working State
  **Status:** Setting up project foundation  
  **Last Milestone Completed:** None (just starting)  
  **Next Milestone:** Milestone 1 - Database Setup
  
  ## Tables in Use
  - research_projects (stores audience + problem hypothesis)
  - questions (stores generated questions)
  - question_issues (stores detected problems)
  - question_suggestions (stores improvement suggestions)
  - critiques (stores overall analysis)
  
  ## Common Patterns
  - All database operations are synchronous (better-sqlite3)
  - All IDs are UUIDs generated with crypto.randomUUID()
  - All dates are ISO 8601 strings
  - JSON data stored as TEXT, parsed on retrieval
  
  ## Current Pitfalls to Avoid
  - Don't use async/await for database operations (better-sqlite3 is sync)
  - Don't forget to JSON.parse() when reading JSON columns
  - Always use parameterized queries (never string interpolation)
  - Table names are lowercase_underscore, not camelCase
  
  ## OpenAI API Usage Patterns
  - Model: gpt-4o (specified in all calls)
  - Temperature: 0.7 for generation, 0.3 for critique
  - Always include system message with role context
  - Always wrap in try/catch with specific error messages
  ```
  - Commit: "docs: add project memory"

- [ ] **0.8: Update CLAUDE.md**
  - Add reference to docs/reference/ files
  - Add project patterns section
  - Add common mistakes section
  - Commit: "docs: update CLAUDE.md with reference system"

**✋ CHECKPOINT: Project Setup Complete**
- Run: `npm run build` (should compile TypeScript)
- Run: `git status` (should be clean)
- All reference docs created and committed

---

## Milestone 1: Database Setup & Models

**Estimated Time:** 2-3 hours  
**Goal:** Working database with schema and basic models  
**Reference:** docs/reference/data-model.md

### Tasks

- [ ] **1.1: Create Database Schema**
  - Create `src/db/schema.sql` with all table definitions
  - Reference: docs/reference/data-model.md for exact schema
  - Include indexes for common queries (project_id, created_at)
  - Commit: "db: create database schema"

- [ ] **1.2: Create Database Client**
  - Create `src/db/client.ts`
  - Initialize better-sqlite3 connection
  - Create singleton pattern for database instance
  - Add method to run schema.sql on first start
  - Commit: "db: create database client"

- [ ] **1.3: Create Model Types**
  - Create `src/models/types.ts`
  - Define TypeScript interfaces for all tables
  - Match exactly with data-model.md schema
  ```typescript
  export interface ResearchProject {
    id: string;
    user_id: string | null;
    name: string;
    audience: string;
    problem_hypothesis: string;
    status: 'draft' | 'listening' | 'analysing' | 'completed';
    created_at: string;
    updated_at: string;
  }
  
  export interface Question {
    id: string;
    project_id: string;
    text: string;
    mom_test_score: number;
    version: number;
    created_at: string;
  }
  
  // ... other interfaces
  ```
  - Commit: "models: add TypeScript interfaces"

- [ ] **1.4: Create Repository Layer**
  - Create `src/models/ResearchProjectRepository.ts`
  - Implement CRUD operations (create, findById, update, delete)
  - All methods synchronous (better-sqlite3)
  - Use parameterized queries (never string interpolation)
  - Commit: "models: add ResearchProject repository"

- [ ] **1.5: Create Question Repository**
  - Create `src/models/QuestionRepository.ts`
  - Implement: create, findByProjectId, update, updateScore
  - Include methods for bulk insert (createMany)
  - Commit: "models: add Question repository"

- [ ] **1.6: Write Repository Tests**
  - Create `tests/unit/repositories.test.ts`
  - Test CRUD operations for ResearchProject
  - Test CRUD operations for Questions
  - Use in-memory SQLite database for tests
  - Commit: "tests: add repository unit tests"

- [ ] **1.7: Verify Database Setup**
  - Create `src/db/seed.ts` for test data
  - Insert sample project and questions
  - Query and verify data
  - Run: `tsx src/db/seed.ts`
  - Commit: "db: add seed script for testing"

**✋ CHECKPOINT: Database Layer Complete**
- Run: `npm test` (repository tests pass)
- Verify: Can create project and questions in SQLite
- Commit: Clean working state

---

## Milestone 2: Mom Test Prompt Engineering

**Estimated Time:** 3-4 hours  
**Goal:** Perfect the AI prompts for question generation and critique  
**Reference:** docs/reference/memory.md for patterns

### Tasks

- [ ] **2.1: Create Prompt Templates**
  - Create `src/prompts/templates.ts`
  - Define QUESTION_GENERATION_PROMPT template
  - Define CRITIQUE_PROMPT template
  - Use clear variable placeholders: {audience}, {problemHypothesis}
  - Include Mom Test principles explicitly in prompts
  - Commit: "prompts: add generation and critique templates"

- [ ] **2.2: Create Prompt Builder Utility**
  - Create `src/utils/promptBuilder.ts`
  - Function: buildQuestionPrompt(audience, problem)
  - Function: buildCritiquePrompt(questions)
  - Handle string escaping and formatting
  - Commit: "utils: add prompt builder"

- [ ] **2.3: Test Prompts Manually (OpenAI Playground)**
  - Copy QUESTION_GENERATION_PROMPT to OpenAI Playground
  - Test with sample audience/problem from Trustie use case
  - Verify output is valid JSON array of questions
  - Test CRITIQUE_PROMPT with sample questions
  - Document results in docs/reference/memory.md
  - Commit: "docs: document prompt testing results"

- [ ] **2.4: Create Response Parser**
  - Create `src/utils/responseParser.ts`
  - Function: parseQuestionArray(response: string)
  - Handle JSON parsing errors gracefully
  - Fallback: extract questions from malformed responses
  - Commit: "utils: add response parser"

- [ ] **2.5: Create Mom Test Scorer**
  - Create `src/utils/momTestScorer.ts`
  - Function: calculateInitialScore(questionText: string)
  - Score based on keyword analysis (tell me, last time, etc.)
  - Return score 0.0-1.0
  - Commit: "utils: add Mom Test scorer"

- [ ] **2.6: Write Scorer Tests**
  - Create `tests/unit/momTestScorer.test.ts`
  - Test good questions (should score >0.7)
  - Test bad questions (should score <0.5)
  - Test edge cases (empty, very long)
  - Commit: "tests: add Mom Test scorer tests"

**✋ CHECKPOINT: Prompts Ready**
- Prompts tested in OpenAI Playground
- Parser handles malformed responses
- Scorer correctly identifies good vs bad questions

---

## Milestone 3: Question Generator Agent

**Estimated Time:** 3-4 hours  
**Goal:** Working AI agent that generates Mom Test questions  
**Reference:** docs/reference/architecture-decisions.md (ADR-002)

### Tasks

- [ ] **3.1: Create Base Agent Class**
  - Create `src/agents/BaseAgent.ts`
  - Protected method: `complete(prompt, options)`
  - Centralized OpenAI API call with error handling
  - Logging for cost tracking (log token usage)
  - Retry logic for transient failures (max 3 retries)
  - Commit: "agents: create base agent class"

- [ ] **3.2: Create Question Generator Agent**
  - Create `src/agents/QuestionGeneratorAgent.ts`
  - Extends BaseAgent
  - Method: `generate(audience, problemHypothesis): Promise<Question[]>`
  - Use prompts from templates.ts
  - Parse response with responseParser
  - Calculate initial scores with momTestScorer
  - Commit: "agents: create question generator agent"

- [ ] **3.3: Add Error Handling**
  - Wrap OpenAI calls in try/catch
  - Create custom error classes: `AIGenerationError`, `ParseError`
  - Log errors with context (prompt, response)
  - Commit: "agents: add error handling to generator"

- [ ] **3.4: Write Generator Tests**
  - Create `tests/unit/questionGenerator.test.ts`
  - Mock OpenAI API responses
  - Test successful generation (8 questions returned)
  - Test parse error handling
  - Test API error handling
  - Commit: "tests: add question generator tests"

- [ ] **3.5: Create Generator Service**
  - Create `src/services/QuestionGeneratorService.ts`
  - Orchestrates: DB → Agent → DB
  - Method: `generateForProject(projectId): Promise<Question[]>`
  - Saves generated questions to database
  - Returns questions with IDs
  - Commit: "services: create question generator service"

- [ ] **3.6: Manual Testing**
  - Create `src/scripts/testGenerator.ts`
  - Load sample project from database
  - Generate questions
  - Print results with scores
  - Run: `tsx src/scripts/testGenerator.ts`
  - Verify: 8 questions generated, scores calculated
  - Commit: "scripts: add generator test script"

**✋ CHECKPOINT: Generator Works**
- Can generate 8 questions from audience/problem
- Questions stored in database
- Scores calculated correctly
- Update docs/reference/memory.md with any learnings

---

## Milestone 4: Critic Agent

**Estimated Time:** 3-4 hours  
**Goal:** AI agent that critiques questions for Mom Test compliance  
**Reference:** docs/reference/data-model.md for critique storage

### Tasks

- [ ] **4.1: Create Critique Response Parser**
  - Create `src/utils/critiqueParser.ts`
  - Parse JSON response from critique prompt
  - Extract: issues, suggestions, scores per question
  - Handle malformed JSON gracefully
  - Commit: "utils: add critique parser"

- [ ] **4.2: Create Critic Agent**
  - Create `src/agents/SurveyCriticAgent.ts`
  - Extends BaseAgent
  - Method: `critique(questions): Promise<CritiqueResult>`
  - Use lower temperature (0.3) for consistency
  - Parse response with critiqueParser
  - Commit: "agents: create survey critic agent"

- [ ] **4.3: Create Critique Models**
  - Add to `src/models/types.ts`:
  ```typescript
  export interface CritiqueResult {
    overall_score: number;
    questions: QuestionWithFeedback[];
    recommendations: string[];
  }
  
  export interface QuestionWithFeedback extends Question {
    issues: string[];
    suggestions: string[];
  }
  ```
  - Update QuestionRepository with updateFeedback method
  - Commit: "models: add critique result types"

- [ ] **4.4: Create Critique Service**
  - Create `src/services/CritiqueService.ts`
  - Method: `critiqueProject(projectId): Promise<CritiqueResult>`
  - Load questions from database
  - Call critic agent
  - Save issues and suggestions to database
  - Save critique record
  - Commit: "services: create critique service"

- [ ] **4.5: Write Critic Tests**
  - Create `tests/unit/critic.test.ts`
  - Mock OpenAI responses
  - Test successful critique
  - Test issue detection
  - Test score calculation
  - Commit: "tests: add critic agent tests"

- [ ] **4.6: Manual End-to-End Test**
  - Create `src/scripts/testFullFlow.ts`
  - Create project → Generate questions → Critique questions
  - Print full results with issues/suggestions
  - Run: `tsx src/scripts/testFullFlow.ts`
  - Verify: Questions have issues/suggestions, overall score calculated
  - Commit: "scripts: add full flow test"

**✋ CHECKPOINT: Critic Works**
- Can critique generated questions
- Issues and suggestions stored correctly
- Overall score calculated
- Full LAPS "Listen" phase working locally

---

## Milestone 5: REST API Layer

**Estimated Time:** 2-3 hours  
**Goal:** HTTP API endpoints for frontend integration  
**Reference:** docs/reference/tech-stack.md

### Tasks

- [ ] **5.1: Create API Request/Response Types**
  - Create `src/api/types.ts`
  - Define request/response interfaces for each endpoint
  - Use Zod schemas for validation
  - Commit: "api: add request/response types"

- [ ] **5.2: Create Health Check Endpoint**
  - Update `src/server.ts`
  - Add GET /api/health endpoint
  - Return: status, timestamp, database connection status
  - Test: `curl localhost:3001/api/health`
  - Commit: "api: add health check endpoint"

- [ ] **5.3: Create Generate Questions Endpoint**
  - Add POST /api/generate-questions to server.ts
  - Validate request body with Zod
  - Call QuestionGeneratorService
  - Return: questions with metadata
  - Handle errors with appropriate HTTP status codes
  - Commit: "api: add generate questions endpoint"

- [ ] **5.4: Create Critique Endpoint**
  - Add POST /api/critique-questions to server.ts
  - Validate request body
  - Call CritiqueService
  - Return: critique result with updated questions
  - Commit: "api: add critique endpoint"

- [ ] **5.5: Add CORS and Error Handling**
  - Configure CORS for localhost:3000 (React dev server)
  - Add global error handler middleware
  - Log errors with context
  - Return consistent error format
  - Commit: "api: add CORS and error handling"

- [ ] **5.6: Write API Integration Tests**
  - Create `tests/integration/api.test.ts`
  - Test all endpoints with real database
  - Test error cases (invalid input, missing fields)
  - Test success cases
  - Run: `npm test`
  - Commit: "tests: add API integration tests"

- [ ] **5.7: Test API with curl/Postman**
  - Start server: `npm run dev`
  - Test generate endpoint with sample data
  - Test critique endpoint
  - Verify responses match expected format
  - Document any issues in docs/reference/memory.md

**✋ CHECKPOINT: API Working**
- All endpoints return correct responses
- Error handling works
- CORS configured
- Ready for frontend integration

---

## Milestone 6: React Frontend

**Estimated Time:** 4-5 hours  
**Goal:** Working UI for question generation and critique  
**Reference:** Existing artifact for UI design

### Tasks

- [ ] **6.1: Initialize React Project**
  ```bash
  npm create vite@latest frontend -- --template react-ts
  cd frontend
  npm install
  npm install lucide-react
  ```
  - Configure Tailwind CSS
  - Update vite.config.ts to proxy API calls
  - Commit: "frontend: initialize React project"

- [ ] **6.2: Create API Client**
  - Create `frontend/src/api/client.ts`
  - Functions: generateQuestions(), critiqueQuestions()
  - Handle fetch errors
  - Type-safe with TypeScript interfaces
  - Commit: "frontend: add API client"

- [ ] **6.3: Create Question Generator Component**
  - Copy from artifact: MomTestGenerator component
  - Update API calls to use real client
  - Add loading states
  - Add error states
  - Commit: "frontend: add question generator component"

- [ ] **6.4: Create Question Display Component**
  - Component: QuestionList
  - Props: questions, showScores, showFeedback
  - Display Mom Test score with color coding
  - Display issues and suggestions
  - Commit: "frontend: add question display component"

- [ ] **6.5: Connect Components**
  - Update App.tsx with full workflow
  - Audience input → Generate → Display → Critique → Display improved
  - Add progress indicator
  - Add export functionality
  - Commit: "frontend: connect workflow"

- [ ] **6.6: Add Error Handling UI**
  - Display API errors to user
  - Add retry buttons
  - Handle network errors gracefully
  - Commit: "frontend: add error handling"

- [ ] **6.7: Manual UI Testing**
  - Start backend: `npm run dev` (in root)
  - Start frontend: `npm run dev` (in frontend/)
  - Test full flow: input → generate → critique
  - Test error cases (invalid input, API down)
  - Verify responsive design (mobile/desktop)

**✋ CHECKPOINT: Frontend Working**
- Can generate questions through UI
- Can critique questions
- Errors displayed appropriately
- UI is responsive

---

## Milestone 7: Documentation & Polish

**Estimated Time:** 2-3 hours  
**Goal:** Complete documentation and prepare for Trustie validation

### Tasks

- [ ] **7.1: Update docs/reference/memory.md**
  - Document Phase 1 completion
  - Add lessons learned
  - Update common pitfalls
  - List any architectural changes made during implementation
  - Commit: "docs: update memory with Phase 1 learnings"

- [ ] **7.2: Create User Documentation**
  - Create `README.md` in project root
  - Getting started guide
  - API documentation
  - Environment setup
  - Common issues and troubleshooting
  - Commit: "docs: add user README"

- [ ] **7.3: Create Developer Documentation**
  - Create `CONTRIBUTING.md`
  - Architecture overview
  - How to add new agents
  - How to modify prompts
  - Testing strategy
  - Commit: "docs: add developer guide"

- [ ] **7.4: Add Cost Tracking**
  - Create `src/utils/costTracker.ts`
  - Log token usage per API call
  - Calculate approximate costs
  - Display in /api/health response
  - Commit: "feat: add cost tracking"

- [ ] **7.5: Create Demo Script**
  - Create `DEMO.md` with step-by-step demo flow
  - Include sample audience/problem for Trustie
  - Expected results and screenshots
  - Commit: "docs: add demo script"

- [ ] **7.6: Run Full Test Suite**
  ```bash
  npm run lint
  npm run build
  npm test
  ```
  - All tests pass
  - No TypeScript errors
  - No linting errors
  - Commit: "chore: final cleanup before Phase 1 completion"

- [ ] **7.7: Create Phase 1 Completion Report**
  - Document in docs/reference/memory.md:
    - Total development time
    - OpenAI API costs incurred
    - Features implemented vs planned
    - Known issues and limitations
    - Recommendations for Phase 2
  - Commit: "docs: Phase 1 completion report"

**✋ CHECKPOINT: Phase 1 Complete**
- All documentation updated
- All tests passing
- Ready for Trustie feature validation
- Can be deployed or handed off

---

## Phase 1 Success Criteria Checklist

Before moving to Phase 2, verify:

- [ ] **Functional Requirements**
  - [ ] Can generate 8 Mom Test questions in <2 minutes
  - [ ] Questions scored for Mom Test compliance (>80% target)
  - [ ] AI critic identifies bias and suggests improvements
  - [ ] Questions can be exported (JSON/CSV)

- [ ] **Quality Requirements**
  - [ ] All unit tests pass
  - [ ] All integration tests pass
  - [ ] TypeScript compiles with no errors
  - [ ] ESLint shows no errors

- [ ] **Documentation Requirements**
  - [ ] README.md complete with setup instructions
  - [ ] All reference docs (data-model, tech-stack, etc.) updated
  - [ ] API documentation complete
  - [ ] Demo script created

- [ ] **Validation Requirements**
  - [ ] Successfully validated 1 Trustie feature (Money Moods recommended)
  - [ ] Generated questions reviewed by human for quality
  - [ ] Identified at least 1 improvement to prompts/scoring

- [ ] **Cost Tracking**
  - [ ] Total OpenAI API costs < $10 for Phase 1 development
  - [ ] Cost per question generation session documented
  - [ ] Cost tracking integrated into application

---

# Phases 2-7: High-Level Summaries

These phases build on Phase 1. Detailed implementation plans will be created when starting each phase.

---

## Phase 2: Survey Builder + Response Collection (Weeks 3-4)

**Goal:** Create and deploy surveys, collect responses

**Major Components to Add:**

### 2.1: Database Schema Additions
- Add tables: `surveys`, `survey_questions`, `responses`, `response_answers`
- Migrate from SQLite to PostgreSQL
- Add database migrations system

### 2.2: Survey Builder
- Multiple question types (open-ended, scale, multiple choice, yes/no)
- Conditional logic (show question X if answer to Y is Z)
- Question reordering and editing
- Preview mode

### 2.3: Survey Renderer
- Mobile-responsive survey UI
- Progress indicator
- Save and resume functionality
- Thank you page customization

### 2.4: Response Collection
- Anonymous response tracking (no auth yet)
- Response quality scoring (length, completion time)
- Real-time response monitoring dashboard
- Export responses (CSV, JSON)

### 2.5: Manual Prolific Integration
- Generate Prolific study configuration
- Copy/paste URL workflow
- Completion code generation
- Response matching with Prolific participant IDs

**Reference Docs to Update:**
- data-model.md (new tables)
- architecture-decisions.md (SQLite → PostgreSQL migration)
- memory.md (survey builder patterns)

**Phase 2 Success Criteria:**
- Can create survey with 10 questions in <10 minutes
- Mobile completion rate >80%
- Successfully collect 50 responses via Prolific

---

## Phase 3: Pain Signal Analysis (Weeks 5-6)

**Goal:** Automatically detect strong/weak/no signal from responses

**Major Components to Add:**

### 3.1: NLP Analysis Service
- Sentiment analysis on open-ended responses
- Keyword extraction (pain words, emotional words)
- Theme clustering (group similar responses)
- Frustration scoring

### 3.2: Statistical Analysis Service
- Pain frequency calculation (% of users with pain)
- Sample size adequacy testing
- Confidence interval calculation
- Effect size calculation (Cohen's d)

### 3.3: Pain Signal Classifier
- Strong Signal: >70% frequency, high intensity, clear patterns
- Weak Signal: 40-70% frequency, medium intensity
- No Signal: <40% frequency, low intensity
- Recommendation engine (more sampling, pivot hypothesis, proceed)

### 3.4: Analysis Dashboard
- Visual representation of pain signals
- Sentiment heatmaps
- Response quote gallery (most impactful quotes)
- Statistical confidence indicators

### 3.5: Automated Recommendations
- "Collect 20 more responses to reach 95% confidence"
- "Strong signal detected - proceed to quantification"
- "No signal found - consider pivoting problem hypothesis"

**Reference Docs to Update:**
- architecture-decisions.md (NLP service choice)
- memory.md (statistical thresholds, pain classification)
- tech-stack.md (add NLP libraries)

**Phase 3 Success Criteria:**
- Correctly identifies strong signal in validation tests (>85% accuracy)
- Statistical confidence clearly communicated
- Provides actionable next steps

---

## Phase 4: Prolific API Integration (Weeks 7-8)

**Goal:** Automated audience targeting and survey deployment

**Major Components to Add:**

### 4.1: Prolific API Client
- Study creation and management
- Participant screening configuration
- Budget and cost estimation
- Study status monitoring

### 4.2: Audience Targeting Builder
- Natural language → Prolific filters
- Demographics (age, location, language)
- Custom screening questions
- Sample size calculator

### 4.3: Cost Optimizer
- Hourly rate compliance (minimum £6.50/hour)
- Survey length estimation
- Cost per response calculation
- Budget warnings

### 4.4: Automated Study Management
- Auto-approve quality responses
- Auto-reject low-quality responses (too fast, incomplete)
- Webhook handling for submissions
- Real-time progress tracking

### 4.5: Quality Control
- Attention check questions
- Response time analysis
- Duplicate detection
- Bot detection

**Reference Docs to Update:**
- data-model.md (Prolific study metadata)
- architecture-decisions.md (Prolific as primary panel)
- memory.md (quality thresholds)

**Phase 4 Success Criteria:**
- Can deploy study to Prolific in <3 clicks
- Accurate cost estimates (±10%)
- Automatic quality filtering catches >90% of bad responses

---

## Phase 5: Reach & Impact Surveyor + RICE Calculator (Weeks 9-10)

**Goal:** Quantify pain and prioritize solutions

**Major Components to Add:**

### 5.1: Second Survey Generator
- AI generates quantification questions from pain signal
- Frequency questions (daily, weekly, monthly, rarely)
- Severity questions (time cost, money cost, emotional cost)
- Willingness to pay indicators
- Current solution assessment

### 5.2: Market Sizing Calculator
- Reach: # of users affected per time period
- TAM/SAM/SOM calculations
- Segment analysis (power users vs casual users)
- Growth projections

### 5.3: RICE Score Calculator
- Reach: Users per quarter
- Impact: Massive (3), High (2), Medium (1), Low (0.5)
- Confidence: High (100%), Medium (80%), Low (50%)
- Effort: Person-months estimate
- Automated scoring and ranking

### 5.4: Solution Ideation Agent
- AI generates 3-5 solution approaches per pain point
- User stories for each solution
- Success metrics definition
- Technical feasibility estimates

### 5.5: Prioritization Dashboard
- RICE score rankings
- Effort vs Impact matrix visualization
- Feature roadmap generator
- Confidence intervals on estimates

**Reference Docs to Update:**
- data-model.md (features, rice_scores tables)
- memory.md (RICE calculation formulas)
- architecture-decisions.md (prioritization methodology)

**Phase 5 Success Criteria:**
- Generates accurate RICE scores from survey data
- Recommendations align with post-launch feature performance
- Can prioritize 10+ feature ideas objectively

---

## Phase 6: Solution Mockup Generator (Weeks 11-13)

**Goal:** Generate UI mockups and validate solutions

**Major Components to Add:**

### 6.1: Design System Integration
- Trustie design tokens (colors, typography, spacing)
- Component library (buttons, cards, forms)
- Layout patterns (mobile, desktop, responsive)

### 6.2: Mockup Generation Agent
- AI generates low-fidelity wireframes
- Multiple solution variations (3-5 per feature)
- A/B test variations
- Interactive prototype generation

### 6.3: Mockup Display & Editing
- Mockup viewer with annotations
- Simple editing tools (move, resize, recolor)
- Version control for mockups
- Export to Figma/PNG

### 6.4: Preference Testing Survey
- Side-by-side mockup comparisons
- Problem-solution fit questions (1-10 scale)
- Intent to use questions
- Missing feature requests

### 6.5: Solution Validation Dashboard
- Preference scores by mockup
- Heatmaps of user attention
- Feature request clustering
- Final recommendation: which solution to build

**Reference Docs to Update:**
- tech-stack.md (mockup generation library)
- architecture-decisions.md (mockup fidelity level)
- memory.md (Trustie design system)

**Phase 6 Success Criteria:**
- Generates testable mockups in <5 minutes
- Mockups aligned with Trustie design system
- Clear preference data from validation surveys

---

## Phase 7: PRD Generator & Dev Handoff (Weeks 14-16)

**Goal:** Automated developer-ready specifications

**Major Components to Add:**

### 7.1: PRD Generation Agent
- AI generates comprehensive PRD from validated feature
- Problem statement (from pain signal)
- User stories with acceptance criteria
- Success metrics and KPIs
- Edge cases and constraints

### 7.2: Instrumentation Specification
- Analytics events to track (naming conventions)
- A/B test configuration
- Feature flags setup
- User feedback collection points

### 7.3: Technical Specification Generator
- API endpoints needed
- Database schema changes
- Frontend components required
- Third-party integrations
- Estimated effort (person-hours)

### 7.4: Ticket Generation
- Jira/Linear API integration
- Auto-create tickets from PRD
- Link tickets to parent epic
- Assign priorities and estimates
- Add acceptance criteria to tickets

### 7.5: Analytics Framework Setup
- Generate analytics tracking code
- Create dashboard templates
- Define success metrics
- Schedule post-launch review dates

### 7.6: Continuous Validation
- Post-launch feature adoption tracking
- Pain point resolution measurement
- LAPSloop accuracy scoring (did it work?)
- Feedback loop to improve future predictions

**Reference Docs to Update:**
- data-model.md (PRDs, instrumentation tables)
- architecture-decisions.md (dev handoff workflow)
- memory.md (PRD templates, success metric definitions)

**Phase 7 Success Criteria:**
- PRDs ready for development without clarification
- Clear success metrics defined for every feature
- Analytics implementation guide included
- Developers report PRDs are "actually useful"

---

## Beyond Phase 7: Future Enhancements

### Authentication & Multi-User (Phase 8)
- User accounts and authentication
- Team collaboration features
- Role-based access control
- Project sharing

### Advanced Analytics (Phase 9)
- Predictive models for feature success
- Cohort analysis
- Funnel tracking
- Retention analysis

### AI Improvements (Phase 10)
- Multi-agent debates for critique
- Autonomous research cycles
- Custom model fine-tuning
- Continuous learning from outcomes

### Enterprise Features (Phase 11)
- SSO integration
- Custom Prolific audiences
- White-label surveys
- API for programmatic access

### Mobile App (Phase 12)
- Native iOS/Android apps
- On-the-go research
- Push notifications for completions
- Offline mode

---

## Notes on Future Phases

**Migration Points:**
- Phase 2: SQLite → PostgreSQL
- Phase 4: Manual → Automated Prolific
- Phase 10: Simple orchestration → Multi-agent system

**Documentation Updates:**
Each phase will require updating:
- data-model.md (new tables/schemas)
- architecture-decisions.md (new ADRs)
- memory.md (current working context)
- tech-stack.md (new technologies added)

**LLM Implementation Strategy:**
- Each phase should have a detailed plan like Phase 1
- Milestone checkpoints every 2-3 hours of work
- Reference docs updated at each checkpoint
- Fresh LLM session per milestone (avoid context drift)

---

## Final Phase 1 Notes

**Before Starting Phase 1:**
1. Ensure OpenAI API key is ready
2. Node.js 18+ installed
3. Git configured
4. Code editor setup (VS Code recommended)

**During Phase 1:**
- Commit after each milestone
- Update docs/reference/memory.md with learnings
- Test thoroughly before moving to next milestone
- Don't hesitate to pause at checkpoints

**After Phase 1:**
- Validate with real Trustie use case (Money Moods recommended)
- Document costs incurred
- Identify improvements to prompts
- Decide if ready for Phase 2

**Getting Help:**
- Reference docs/best-practices/effective-llm-usage.md
- Start fresh LLM session if stuck
- Update CLAUDE.md with new patterns discovered

---

*This plan is designed for LLM-assisted implementation with frequent checkpoints and clear references to documentation. Good luck!*