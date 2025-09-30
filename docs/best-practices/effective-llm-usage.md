# Effective LLM Usage: Best Practices for Claude Code

## Overview

This guide documents lessons learned and best practices for working effectively with Claude Code and other LLM coding assistants. These practices help mitigate common issues like context drift, forgotten design decisions, and circular debugging loops.

---

## Core Principles

### 1. **Fight Context Pollution with Fresh Sessions**
Long conversations inevitably lead to context drift where the LLM "forgets" earlier decisions. The solution is **starting fresh sessions for new features** rather than trying to maintain one long conversation.

### 2. **Documentation Over Memory**
LLMs have limited and imperfect memory within a session. Create **persistent reference documents** that can be read at the start of each session rather than relying on context memory.

### 3. **Small Steps, Frequent Validation**
Implement in tiny increments with testing and commits after each step. This catches issues before they compound and makes rollback easy.

---

## Best Practices

### Starting a New Feature

#### ✅ DO: Start Fresh
- Open a **new Claude Code session** for each significant feature
- Reference your architecture docs in the **first message**
- Keep the session focused on **one feature only**

#### ❌ DON'T: Continue Long Conversations
- Don't add new features to a conversation with 50+ messages
- Don't try to debug complex issues in a polluted context
- Don't switch between multiple features in one session

---

### Crafting Effective Initial Prompts

The first message in a session sets the context. Spend time making it precise.

#### ❌ Vague Prompt:
```
"Add user favorites"
```

#### ✅ Explicit Prompt:
```
"Add user favorites using Server Actions (we use Server Actions, not REST APIs).
Store in DynamoDB table 'UserFavorites' with PK=userId, SK=itemId.
Reference data-model.md for schema."
```

**Template for First Messages:**
```
Implement [specific feature].

Architecture context:
- We use [technology/pattern] (NOT [alternative])
- Store data in [specific table/location]
- Reference [relevant-doc.md] for [schema/patterns/contracts]

Use TodoWrite to create a plan before starting.
```

---

## Reference Documentation System

Create these persistent docs in your repo (link them in CLAUDE.md for automatic inclusion):

### Essential Reference Documents

#### 1. **data-model.md** - Database Schemas
```markdown
# Data Model

## Tables

### Preregistrations
- PK: "USER#{timestamp}"
- SK: phoneNumber
- Attributes: email, name, referralSource, createdAt
- Note: Capital 'P', lowercase 'r' - common typo source

### UserFavorites
- PK: userId
- SK: itemId
- Attributes: itemType, createdAt
```

#### 2. **api-contracts.md** - Server Actions & APIs
```markdown
# API Contracts

## Server Actions (We Use These)

### addToFavorites
- Location: src/actions/favorites.ts
- Input: { userId: string, itemId: string, itemType: string }
- Returns: { success: boolean, error?: string }

## We DO NOT Use REST APIs
- No /api routes in this project
- All data operations through Server Actions
```

#### 3. **architecture-decisions.md** - ADRs
```markdown
# Architecture Decision Records

## ADR-001: Use Server Actions Instead of REST APIs
**Date:** 2025-01-15
**Status:** Active

**Context:** Need to fetch data from Next.js frontend

**Decision:** Use Next.js Server Actions exclusively

**Rationale:**
- Simpler than maintaining REST API routes
- Built-in type safety
- Direct database access without API layer

**Alternatives Considered:**
- REST API routes (/api/*) - Rejected: unnecessary complexity
- tRPC - Rejected: overkill for this project size

**Consequences:**
- All data operations in src/actions/
- Client components call Server Actions directly
- No API documentation needed
```

#### 4. **tech-stack.md** - Technology Decisions
```markdown
# Tech Stack

## Frontend
- Next.js 15 with App Router
- React 19
- TypeScript
- Server Actions (NOT REST APIs)

## Database
- DynamoDB
- Table pattern: PK/SK design
- Pay-per-request billing

## Cross-Service Data Sharing
- Method: DynamoDB table 'SharedContext'
- Pattern: Write to shared table, read from other service
- Note: Not common pattern - document thoroughly
```

#### 5. **memory.md** - Active Feature Context
```markdown
# Project Memory

## Current Architecture Decisions
- **Data Layer**: Server Actions + DynamoDB (NO REST APIs)
- **Cross-Service Sharing**: DynamoDB table 'SharedContext'
- **Tables**: Preregistrations, SideHustles, UserFavorites
- **Auth Pattern**: AWS Cognito with Amplify

## Current Feature: [Update this per feature]
Working on: User favorites system
Tables involved: UserFavorites
Key decisions: Using optimistic UI updates

## Common Pitfalls (Learn from mistakes)
- Table name is 'Preregistrations' (capital P, lowercase r)
- We don't use /api routes - always Server Actions
- Table 'SharedContext' not 'shared_context'
- Import DynamoDB client from '@/lib/dynamodb' not aws-sdk directly
```

---

## CLAUDE.md Configuration

### Add to Your CLAUDE.md

```markdown
## Reference Documentation
Read these files at the start of each session:
- docs/reference/data-model.md - Database schemas and table names
- docs/reference/tech-stack.md - Technologies we use (and don't use)
- docs/reference/memory.md - Current architecture and active decisions

## Project Patterns
- We use Server Actions exclusively (NOT REST APIs)
- Cross-service data sharing uses DynamoDB table 'SharedContext'
- All tables use PK/SK pattern (see data-model.md)
- DynamoDB client imported from '@/lib/dynamodb'

## Common Mistakes to Avoid
- Don't look for /api routes - we use Server Actions
- Don't forget table name is 'Preregistrations' not 'PreRegistrations'
- Don't implement REST endpoints - use Server Actions
- Don't rename architectural patterns without checking ADRs

## MCP Servers Available
- mcp__playwright__: Use for browser automation and testing
- mcp__ide__: Use for diagnostics and workspace inspection
- [Add your other MCPs here]

## Tool Preferences
- Prefer mcp__playwright__browser_navigate for browser testing
- Use mcp__ide__getDiagnostics before marking bugs fixed
- [Add preferences for your specific MCPs]
```

---

## Task Management

### Use Both TodoWrite AND Markdown Checklists

**TodoWrite (Claude's internal tool):**
- For live session tracking
- Shows progress during implementation
- Helps Claude stay organized within a session

**Markdown Checklist in Repo:**
- For cross-session persistence
- Survives conversation changes
- Documents what was actually done

**Example: implementation-plan.md**
```markdown
# Feature: User Favorites Implementation

## Plan
- [x] Create DynamoDB table schema
- [x] Implement Server Action addToFavorites
- [x] Add UI toggle button
- [ ] Add loading states
- [ ] Add error handling
- [ ] Write tests

## Architecture Decisions
- Using Server Actions (ADR-001)
- Storing in UserFavorites table with PK=userId, SK=itemId
- Optimistic UI updates with revalidation

## Testing Checklist
- [ ] User can add favorite
- [ ] User can remove favorite
- [ ] Favorites persist across sessions
- [ ] Error handling shows appropriate messages
```

---

## Implementation Workflow

### The Small-Step Process

**For Each Feature:**

1. **Preparation (Before Claude)**
   ```bash
   # Clean workspace
   git status
   git commit -m "Current work" # if needed

   # Update memory.md with feature context
   # List relevant tables, decisions, constraints
   ```

2. **Initial Prompt (To Claude)**
   ```
   Implement [feature]. See memory.md for architecture.
   Reference data-model.md for schemas.
   Use TodoWrite to create a plan before starting.
   ```

3. **For Each Step**
   ```
   Claude implements one small change
   ↓
   Run tests: npm run build && npm run lint
   ↓
   Manual verification: Does it actually work?
   ↓
   Commit: git commit -m "feat: specific change"
   ↓
   Next step
   ```

4. **Verification Checklist Before Completion**
   ```bash
   npm run build           # Must pass
   npm run lint            # Must pass
   git status              # Review all changes
   # Manually test the feature
   # Check for console errors
   # Test error cases
   ```

5. **After Completion**
   - Update ADRs if architectural decisions were made
   - Update memory.md for next feature
   - Commit final state

---

## When Things Go Wrong

### Signs of Context Drift
- Claude looks for things you decided NOT to use (e.g., REST APIs when you use Server Actions)
- Claude forgets table names or gets them wrong
- Claude re-solves problems you already solved differently
- Claude makes contradictory design decisions
- Debugging loops: fix A breaks B, fix B breaks A

### Recovery Strategy

**❌ DON'T: Keep debugging in polluted context**
- You'll waste time going in circles
- Claude will make increasingly confused decisions
- Each "fix" may contradict the previous one

**✅ DO: Stop and reset**

1. **Stop immediately**
   ```bash
   # Save current state
   git add .
   git commit -m "WIP: debugging [issue]"
   # or
   git stash
   ```

2. **Start fresh session**
   ```
   Review [specific file].

   The bug is: [specific observable behavior]

   Architecture context:
   - We use [pattern] (see ADR-001)
   - Table name is [exact name]
   - [Other relevant constraints]

   Fix it using this approach.
   ```

3. **Provide minimal, precise context**
   - Reference specific files
   - State exact table/function names
   - Link to relevant ADRs
   - Describe expected vs actual behavior

---

## Working with Imprecise Requirements

As a beginner, you may not always know exactly what you want. That's normal! Here's how to handle it:

### Iterative Refinement Process

1. **Share Your General Goal**
   ```
   "I want users to save things they like"
   ```

2. **Ask Claude for Options**
   ```
   "What are 3 different ways to implement this?
   Consider our current tech stack (see tech-stack.md).
   List trade-offs for each."
   ```

3. **Make Decision & Document It**
   ```markdown
   # In architecture-decisions.md

   ## ADR-002: User Favorites Storage
   **Options Considered:**
   1. Local storage - Simple but not synced
   2. Cookies - Limited size
   3. DynamoDB - Persistent, scalable (CHOSEN)

   **Decision:** DynamoDB table 'UserFavorites'
   **Rationale:** Need cross-device sync, unlimited storage
   ```

4. **Reference Decision Going Forward**
   ```
   "Implement user favorites using decision from ADR-002"
   ```

### Follow-Up Questions Pattern

When you need to refine:

**❌ Vague:**
```
"I don't think that's quite right, try something else"
```

**✅ Specific:**
```
"The button should be in the card header, not the footer.
Move it above the title."
```

or

```
"I actually want [X] behavior instead of [Y].
Should we update ADR-002 or is this a different decision?"
```

---

## Advanced: MCP Server Integration

### Common MCP Servers for Development

**Playwright MCP (Browser Testing):**
```markdown
## When to Use
- Testing user-facing features
- Verifying responsive design
- Checking interactive elements

## Example Usage
"Use mcp__playwright to navigate to localhost:3000/favorites
and verify the favorite button appears after login"
```

**IDE MCP (Diagnostics):**
```markdown
## When to Use
- Before marking bugs as fixed
- After major refactoring
- When TypeScript errors appear

## Example Usage
"Use mcp__ide__getDiagnostics to check for TypeScript errors
before we commit"
```

### Configuring Claude to Use MCPs

Add to CLAUDE.md:
```markdown
## MCP Server Usage Priority

### For Testing Features
1. First: Use mcp__playwright for browser-based verification
2. Then: Manual testing by developer
3. Finally: Automated test suite

### For Code Quality
1. Use mcp__ide__getDiagnostics before completing any task
2. Must show zero errors before marking complete

### [Add your other MCPs and when to use them]
```

---

## Templates for Common Scenarios

### Template: Starting a New Feature

```markdown
## To Claude:

Implement [feature name].

**Architecture Context:**
- Data layer: [Server Actions/REST/GraphQL]
- Storage: [DynamoDB table name]
- Auth: [pattern]
- Reference: data-model.md, ADR-[number]

**Requirements:**
1. [Specific requirement]
2. [Specific requirement]
3. [Specific requirement]

**Constraints:**
- Must use [pattern]
- Must NOT use [anti-pattern]
- Performance: [any requirements]

Create a plan using TodoWrite before starting.
Implement one step at a time.
Run build + lint after each step.
```

### Template: Fixing a Bug

```markdown
## To Claude:

Fix bug in [file name].

**Bug Description:**
- Expected: [behavior]
- Actual: [behavior]
- How to reproduce: [steps]

**Architecture Context:**
- This file uses [pattern]
- It connects to [table/service]
- Reference: [relevant doc]

**Constraints:**
- Don't change [architectural decision]
- Must maintain [requirement]

Fix the bug, test it, then run build + lint.
```

### Template: Refactoring

```markdown
## To Claude:

Refactor [component/function] to [goal].

**Current State:**
- [Description of current implementation]
- Issues: [what's wrong]

**Desired State:**
- [Description of desired implementation]
- Benefits: [why refactor]

**Constraints:**
- Must maintain existing API/behavior
- Must not break [dependent code]
- Keep [architectural decision] from ADR-[number]

Create step-by-step plan.
Test after each step.
Verify with build + lint.
```

---

## Measuring Success

### You're Using Claude Effectively When:

✅ Claude rarely "forgets" architectural decisions
✅ You can resume work after days/weeks by starting fresh with docs
✅ Debugging doesn't turn into loops
✅ Claude suggests approaches consistent with your stack
✅ You can confidently commit after each step
✅ New developers (or Claude) can understand decisions via ADRs

### Warning Signs You Need Better Practices:

⚠️ Claude suggests technologies you don't use
⚠️ Same bug gets "fixed" multiple times
⚠️ Claude gets table/file names wrong repeatedly
⚠️ You're afraid to commit because you're not sure what changed
⚠️ Sessions devolve into "try this" then "try that" cycles
⚠️ You can't explain why you made a decision last week

---

## Quick Reference

### Essential Files to Create
- `docs/reference/data-model.md` - Database schemas
- `docs/reference/tech-stack.md` - Technology choices
- `docs/reference/api-contracts.md` - Server Actions/APIs
- `docs/reference/architecture-decisions.md` - ADRs
- `docs/reference/memory.md` - Active context

### Every Feature Checklist
- [ ] Start fresh Claude session
- [ ] Update memory.md with feature context
- [ ] Write explicit initial prompt referencing docs
- [ ] Ask Claude to use TodoWrite for plan
- [ ] Implement one small step at a time
- [ ] Test after each step
- [ ] Commit after each step
- [ ] Verify with build + lint before completion
- [ ] Update ADRs if architectural decisions made

### When Stuck
1. Stop (don't keep debugging in circles)
2. Commit or stash current work
3. Start fresh session with precise, minimal context
4. Reference specific files and ADRs

### Update Your CLAUDE.md
- Add reference doc links
- List project patterns
- Document common mistakes
- Configure MCP server usage
- Add tool preferences

---

## Learning More

As you gain experience, you'll discover patterns specific to your projects. Document them!

Add to this file:
- Mistakes you've made and how to avoid them
- Effective prompt patterns for your domain
- Project-specific conventions
- Team workflow integrations

This is a living document. Update it as you learn.

---

*Last Updated: 2025-09-30*
*Lessons from: trustie-website project development*