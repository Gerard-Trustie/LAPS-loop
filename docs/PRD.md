# LAPSloop MVP - Product Requirements Document

**Version:** 1.0 MVP
**Last Updated:** September 30, 2025
**Status:** Ready for Development
**Timeline:** 2 weeks

---

## Executive Summary

LAPSloop MVP validates one core hypothesis: **Can AI reliably identify pain signals from survey responses that predict feature success?**

This is the ONE thing that matters. Everything else (fancy UI, mockups, PRD generation) is automation around this insight.

---

## The MVP Scope

### What We're Building

**3 Core Components:**

1. **Question Generator + Critic**
   - Input: Target audience + problem hypothesis
   - Output: 8 Mom Test-compliant questions (>80% score)
   - AI critiques questions, suggests improvements
   - User can manually edit questions

2. **Simple Survey Platform**
   - Public URL where users answer questions
   - Open-ended text boxes (min 50 chars)
   - Survey completion page with code
   - Admin dashboard to view responses

3. **Pain Signal Analyzer**
   - Analyzes 50+ responses using AI
   - Classifies: Strong/Weak/None signal
   - Outputs: pain frequency, intensity, key quotes, recommendations

---

## What We're NOT Building

- ❌ User authentication (single admin user)
- ❌ TypeForm/Google Forms integration (we ARE the survey)
- ❌ Prolific API integration (manual URL posting)
- ❌ RICE scoring
- ❌ UI mockup generation
- ❌ PRD generation
- ❌ Multi-user accounts
- ❌ File storage/S3

---

## User Flows

### Flow 1: Create Survey (Admin)
1. Admin visits dashboard
2. Enters survey title, audience, problem hypothesis
3. Clicks "Generate Questions"
4. AI generates 8 questions + shows Mom Test scores
5. Admin can manually edit or regenerate individual questions
6. Admin clicks "Create Survey"
7. System shows survey URL + completion code
8. Admin posts URL to Prolific manually

### Flow 2: Take Survey (Participant)
1. Participant clicks survey URL
2. Sees survey title + 8 questions
3. Types answers (min 50 chars each)
4. Clicks Submit
5. Sees completion code to enter in Prolific

### Flow 3: Analyze Pain Signals (Admin)
1. Admin views survey detail page
2. Sees response count
3. When ≥30 responses, clicks "Analyze Pain Signals"
4. AI analyzes responses (30-60 seconds)
5. Shows results: Signal Strength, Pain Frequency, Key Quotes, Recommendation

---

## Technical Architecture

### Stack
- **Frontend/Backend:** Next.js 14 (React 18, TypeScript, Tailwind CSS)
- **Database:** PostgreSQL (Railway)
- **AI:** OpenAI GPT-4o
- **Deployment:** Vercel
- **Auth:** None (hardcoded admin, or simple password)

### Key Pages
- `/` - Dashboard (survey list)
- `/surveys/new` - Create survey form
- `/surveys/[id]` - Survey detail + responses + analysis
- `/survey/[id]` - Public survey form
- `/survey/[id]/complete` - Completion page with code

### Database Tables
```sql
surveys (id, title, audience, hypothesis, questions, completion_code, created_at)
responses (id, survey_id, answers, prolific_pid, completed_at)
analyses (id, survey_id, signal_strength, pain_frequency, key_quotes, recommendations, created_at)
```

---

## Success Criteria

### Week 2 (MVP Complete)
- ✅ Generate 8 questions in <2 minutes
- ✅ Questions score >80% Mom Test compliance
- ✅ Survey works on mobile
- ✅ Pain analysis runs in <60 seconds

### Week 4 (First Validation)
- ✅ 50 Prolific responses for Money Moods feature
- ✅ AI analysis matches human judgment (>80% agreement)
- ✅ AI identifies 2-3 insights humans didn't notice

### Month 3 (Predictive Accuracy)
- ✅ "Strong signal" feature has >60% adoption
- ✅ "Weak signal" feature has <40% adoption
- ✅ AI correctly predicted feature success

---

## AI Prompts (Core Logic)

### Question Generator
- Generates 8 Mom Test questions
- Temperature: 0.7
- Focus: past behavior, specific stories, emotional reactions

### Question Critic
- Scores each question 0-100
- Identifies issues: leading, hypothetical, vague
- Temperature: 0.3 (consistency)

### Pain Analyzer
- Analyzes 50+ responses
- Calculates pain frequency (% mentioning pain)
- Measures intensity (emotional language)
- Identifies workarounds
- Classification: Strong (>60% frequency + high intensity), Weak (30-60%), None (<30%)

---

## Cost Structure

**Fixed (Monthly):**
- Vercel hosting: Free tier
- Railway Postgres: £5
- **Total: ~£5/month**

**Variable (Per Research Project):**
- Question generation: £0.05
- Pain analysis (50 responses): £0.50
- **Total: ~£0.55/project**

**Prolific costs:** Pass-through to customer (not our cost)

---

## The Validation Plan

### Week 1-2: Build MVP
- Follow implementation plan
- Test internally with 5 team members
- Success: 4/5 say "better than I'd write"

### Week 3-4: First Real Test
- Survey for Trustie Money Moods feature
- 50 Prolific responses
- Compare AI analysis to human analysis
- Success: 80% agreement

### Month 2-3: Predictive Test
- Ship 1 "strong signal" feature
- Track adoption at 30 days
- Success: >60% adoption

### Month 4: First Paid Customer
- Only if Month 3 validation passes
- £200/month beta customer
- Run full cycle for their feature
- Success: Their feature succeeds

---

## Kill Criteria

**Stop building if:**
- Week 2: <3/5 internal users approve questions
- Week 4: Humans disagree with AI >50% of time
- Month 3: Predictions are wrong or random
- Month 4: Beta customer's feature fails after "strong signal"

---

## Open Questions

1. Is 50 responses enough for reliable detection?
2. How do we filter low-quality Prolific responses?
3. Does AI work better for simple vs complex features?
4. How long after launch should we measure adoption? (30/60/90 days?)

---

## Next Steps (After MVP Complete)

**Only if validation succeeds:**
- Add user authentication
- Automate Prolific integration (API)
- Add RICE scoring
- Build mockup generator
- Add PRD generation

**Don't build these until the core hypothesis is proven.**

---

*This PRD focuses ruthlessly on validating the ONE thing that matters: Can AI predict feature success?*