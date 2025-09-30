
  Implement LAPSloop MVP following MVP-implementation-plan.md.

  **Context:**
  - Read docs/PRD.md to understand the product goal
  - Read MVP-implementation-plan.md for implementation steps
  - This is a 2-week MVP to validate: Can AI predict feature success?

  **Workflow:**
  1. Start with Milestone 0 (Project Setup & Documentation)
  2. Before each milestone:
     - Read docs/reference/memory.md for current context
     - Use TodoWrite to create a task list for the milestone
  3. During each milestone:
     - Implement one task at a time
     - Test after each task (run build/lint where applicable)
     - Commit after each task with the specified commit message
  4. After each milestone:
     - Update docs/reference/memory.md with learnings
     - Verify checkpoint criteria are met
     - Commit before moving to next milestone

  **Important reminders:**
  - PostgreSQL (Railway), NOT SQLite (ADR-002)
  - Server Actions, NOT REST APIs (ADR-001)
  - OpenAI model: "gpt-4o" (not gpt-4-turbo)
  - Simple password for admin routes only (ADR-005)
  - Survey forms (/survey/*) stay public

  **Reference documentation:**
  All reference docs will be created in Milestone 0. Read them before proceeding to Milestone 1.

  Start with Milestone 0 now.

  ---
  ⚡ Alternative Prompt (Minimal)
